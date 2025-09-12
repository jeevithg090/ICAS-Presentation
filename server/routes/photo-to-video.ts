import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { spawn } from 'child_process';
import { config } from '../config';

// Extend Express Request type to include files
interface MulterRequest extends Request {
  files?: multer.File[];
  file?: multer.File;
}

// API Keys
const HUGGING_FACE_TOKEN = config.huggingFaceToken;
const OPENROUTER_API_KEY = config.openRouterApiKey || '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';
const ELEVENLABS_API_KEY = config.elevenLabsApiKey;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Store for tracking video processing jobs
interface VideoJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  videoPath?: string;
  error?: string;
  progress?: number;
}

interface AudioJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  audioPath?: string;
  script?: string;
  error?: string;
  progress?: number;
}

const videoJobs: Map<string, VideoJob> = new Map();
const audioJobs: Map<string, AudioJob> = new Map();

// Video processing function with multiple fallback methods
async function processVideo(jobId: string, imageFiles: string[], duration: number, useTransitions: boolean = true, videoQuality: '720p' | '1080p' = '720p', useAI: boolean = true) {
  try {
    const job = videoJobs.get(jobId);
    if (!job) return;

    // Update progress step by step
    videoJobs.set(jobId, { ...job, progress: 10 });
    
    // Validate image files exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const validFiles = imageFiles.filter(filename => {
      const imagePath = path.join(uploadsDir, filename);
      return fs.existsSync(imagePath);
    });
    
    if (validFiles.length === 0) {
      throw new Error('No valid image files found');
    }
    
    videoJobs.set(jobId, { ...job, progress: 25 });

    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    
    const outputPath = path.join(videosDir, `${jobId}.mp4`);
    
    // Simulate progress during processing
    videoJobs.set(jobId, { ...job, progress: 50 });
    
    // Choose processing method based on user preference
    if (useAI) {
      // Try Hugging Face AI first (if available), then fall back to traditional methods
      try {
        await createVideoWithHuggingFace(validFiles, outputPath, jobId);
        console.log('Video created successfully with Hugging Face AI');
      } catch (hfError) {
        console.log('Hugging Face AI not available, falling back to traditional methods:', hfError.message);
        try {
          await createVideoWithEditly(validFiles, outputPath, duration, useTransitions, videoQuality);
          console.log('Video created successfully with Editly');
        } catch (editlyError) {
          console.log('Editly not available, falling back to FFmpeg:', editlyError.message);
          try {
            await createVideoWithFFmpeg(validFiles, outputPath, duration);
            console.log('Video created successfully with FFmpeg');
          } catch (ffmpegError) {
            console.log('Primary FFmpeg method failed, trying fallback method:', ffmpegError.message);
            await createSimpleVideo(validFiles, outputPath, duration);
            console.log('Video created successfully with fallback method');
          }
        }
      }
    } else {
      // Use traditional methods only
      try {
        await createVideoWithEditly(validFiles, outputPath, duration, useTransitions, videoQuality);
        console.log('Video created successfully with Editly');
      } catch (editlyError) {
        console.log('Editly not available, falling back to FFmpeg:', editlyError.message);
        try {
          await createVideoWithFFmpeg(validFiles, outputPath, duration);
          console.log('Video created successfully with FFmpeg');
        } catch (ffmpegError) {
          console.log('Primary FFmpeg method failed, trying fallback method:', ffmpegError.message);
          await createSimpleVideo(validFiles, outputPath, duration);
          console.log('Video created successfully with fallback method');
        }
      }
    }
    
    videoJobs.set(jobId, { ...job, progress: 90 });
    
    // Final check
    if (fs.existsSync(outputPath)) {
      videoJobs.set(jobId, {
        id: jobId,
        status: 'completed',
        videoPath: outputPath,
        progress: 100
      });
    } else {
      throw new Error('Video file was not created successfully');
    }

    } catch (error) {
      console.error('Video processing failed:', error);
      
      // Check if the error is due to missing FFmpeg
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('command not found') || errorMessage.includes('FFmpeg')) {
        videoJobs.set(jobId, {
          id: jobId,
          status: 'failed',
          error: 'FFmpeg not found. Please install FFmpeg: On macOS run "brew install ffmpeg", on Windows download from https://ffmpeg.org, on Linux run "sudo apt install ffmpeg"'
        });
      } else {
        videoJobs.set(jobId, {
          id: jobId,
          status: 'failed',
          error: errorMessage
        });
      }
    }
}

// Hugging Face AI video creation function
async function createVideoWithHuggingFace(imageFiles: string[], outputPath: string, jobId: string) {
  try {
    console.log(`Generating AI video for job ${jobId} with ${imageFiles.length} images using Hugging Face`);
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Use the first image as the keyframe for AI video generation
    const keyframePath = path.join(uploadsDir, imageFiles[0]);
    
    if (!fs.existsSync(keyframePath)) {
      throw new Error('Keyframe image not found');
    }
    
    // Read the keyframe image and convert to base64
    const imageBuffer = fs.readFileSync(keyframePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Hugging Face API call for video generation
    // Note: Using a different approach since the model might not be available
    // For now, we'll skip AI generation and use traditional methods
    throw new Error('Hugging Face video generation temporarily disabled - using traditional methods');
    
    console.log(`AI video generated successfully for job ${jobId}`);
    return outputPath;
    
  } catch (error) {
    console.error('Error generating video with Hugging Face:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 503) {
        throw new Error('Hugging Face model is loading, please try again in a few minutes');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid Hugging Face API key');
      } else if (error.response?.status === 429) {
        throw new Error('Hugging Face API rate limit exceeded');
      }
    }
    
    throw new Error(`Failed to generate AI video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Editly video creation function (enhanced capabilities)
async function createVideoWithEditly(imageFiles: string[], outputPath: string, duration: number, useTransitions: boolean = true, videoQuality: '720p' | '1080p' = '720p') {
  // Dynamic import of editly (since it might not be installed)
  let editly: any;
  try {
    // @ts-ignore - editly is optional dependency
    const editlyModule = await import('editly');
    // Handle both CommonJS and ES module exports
    editly = (editlyModule as any).default || editlyModule;
  } catch (error) {
    throw new Error('Editly library not installed');
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Determine video dimensions based on quality
  const dimensions = videoQuality === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };

  // Create editly configuration
  const editSpec = {
    outPath: outputPath,
    width: dimensions.width,
    height: dimensions.height,
    fps: 30,
    clips: imageFiles.map((filename, index) => {
      const imagePath = path.join(uploadsDir, filename);
      return {
        duration: duration,
        layers: [
          {
            type: 'image',
            path: imagePath,
            resizeMode: 'contain', // Keep aspect ratio with letterboxing
          }
        ],
        // Add a nice transition between clips (except for the last one)
        transition: useTransitions && index < imageFiles.length - 1 ? {
          duration: 0.5,
          name: 'fade' // Use a simple fade transition
        } : undefined
      };
    }),
    defaults: {
      layer: {
        fontPath: undefined // Use system font
      }
    }
  };

  // Execute editly
  await editly(editSpec);
  return outputPath;
}

// FFmpeg video creation function
async function createVideoWithFFmpeg(imageFiles: string[], outputPath: string, duration: number) {
  
  return new Promise(async (resolve, reject) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure all image files exist
    const validFiles = imageFiles.filter(filename => {
      const imagePath = path.join(uploadsDir, filename);
      return fs.existsSync(imagePath);
    });
    
    if (validFiles.length === 0) {
      reject(new Error('No valid image files found'));
      return;
    }
    
    // Method 1: Try using FFmpeg with input patterns (simpler approach)
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Copy and convert files to sequential pattern for FFmpeg
    const paddedFiles: string[] = [];
    
    try {
      for (let index = 0; index < validFiles.length; index++) {
        const filename = validFiles[index];
        const sourcePath = path.join(uploadsDir, filename);
        const paddedName = `img${String(index).padStart(3, '0')}.png`; // Use PNG for better compatibility
        const destPath = path.join(tempDir, paddedName);
        
        // Convert image to PNG using FFmpeg to ensure compatibility
        const convertArgs = [
          '-y',
          '-i', sourcePath,
          '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
          '-f', 'image2',
          destPath
        ];
        
        await new Promise<void>((convertResolve, convertReject) => {
          const convertProcess = spawn('ffmpeg', convertArgs);
          
          convertProcess.on('close', (code) => {
            if (code === 0) {
              paddedFiles.push(destPath);
              convertResolve();
            } else {
              // If conversion fails, try direct copy
              try {
                fs.copyFileSync(sourcePath, destPath);
                paddedFiles.push(destPath);
                convertResolve();
              } catch (copyError) {
                convertReject(new Error(`Failed to process image ${filename}`));
              }
            }
          });
          
          convertProcess.on('error', (error) => {
            // If FFmpeg fails, try direct copy
            try {
              fs.copyFileSync(sourcePath, destPath);
              paddedFiles.push(destPath);
              convertResolve();
            } catch (copyError) {
              convertReject(new Error(`Failed to process image ${filename}`));
            }
          });
        });
      }
    } catch (error) {
      reject(new Error('Failed to prepare image files'));
      return;
    }

    // Create FFmpeg command for slideshow
    const ffmpegArgs = [
      '-y', // Overwrite output file
      '-framerate', `${1/duration}`, // Frame rate based on duration
      '-pattern_type', 'glob',
      '-i', path.join(tempDir, 'img*.png'), // Use PNG files
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-fps_mode', 'cfr', // Use constant frame rate mode
      '-r', '30', // Output frame rate
      outputPath
    ];

    console.log('FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stderrOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      stderrOutput += output;
      console.log(`FFmpeg: ${output}`);
    });

    ffmpeg.on('close', (code) => {
      // Clean up temp files
      try {
        paddedFiles.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }
      
      if (code === 0) {
        console.log('FFmpeg completed successfully');
        resolve(outputPath);
      } else {
        console.error('FFmpeg failed with code:', code);
        console.error('FFmpeg stderr:', stderrOutput);
        reject(new Error(`FFmpeg process exited with code ${code}. Error: ${stderrOutput}`));
      }
    });

    ffmpeg.on('error', (error) => {
      // Clean up temp files
      try {
        paddedFiles.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }
      
      console.error('FFmpeg error:', error);
      reject(new Error(`FFmpeg error: ${error.message}. Make sure FFmpeg is installed and available in PATH.`));
    });
  });
}

// Fallback video creation method using a different FFmpeg approach
async function createSimpleVideo(imageFiles: string[], outputPath: string, duration: number) {
  return new Promise(async (resolve, reject) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Create a simple concat demuxer file
    const fileListPath = path.join(process.cwd(), 'uploads', `temp-filelist-${uuidv4()}.txt`);
    
    const validFiles = imageFiles.filter(filename => {
      const imagePath = path.join(uploadsDir, filename);
      return fs.existsSync(imagePath);
    });
    
    if (validFiles.length === 0) {
      reject(new Error('No valid image files found'));
      return;
    }
    
    // Create proper concat file format with converted images
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const convertedFiles: string[] = [];
    
    try {
      // Convert each image to PNG for better compatibility
      for (let index = 0; index < validFiles.length; index++) {
        const filename = validFiles[index];
        const sourcePath = path.join(uploadsDir, filename);
        const convertedName = `converted_${index}.png`;
        const convertedPath = path.join(tempDir, convertedName);
        
        // Convert image using FFmpeg
        const convertArgs = [
          '-y',
          '-i', sourcePath,
          '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
          '-f', 'image2',
          convertedPath
        ];
        
        await new Promise<void>((convertResolve, convertReject) => {
          const convertProcess = spawn('ffmpeg', convertArgs);
          
          convertProcess.on('close', (code) => {
            if (code === 0) {
              convertedFiles.push(convertedPath);
              convertResolve();
            } else {
              // If conversion fails, try direct copy
              try {
                fs.copyFileSync(sourcePath, convertedPath);
                convertedFiles.push(convertedPath);
                convertResolve();
              } catch (copyError) {
                convertReject(new Error(`Failed to process image ${filename}`));
              }
            }
          });
          
          convertProcess.on('error', (error) => {
            // If FFmpeg fails, try direct copy
            try {
              fs.copyFileSync(sourcePath, convertedPath);
              convertedFiles.push(convertedPath);
              convertResolve();
            } catch (copyError) {
              convertReject(new Error(`Failed to process image ${filename}`));
            }
          });
        });
      }
      
      const fileListContent = convertedFiles.map(imagePath => {
        return `file '${imagePath}'\nduration ${duration}`;
      }).join('\n') + `\nfile '${convertedFiles[convertedFiles.length - 1]}'`;
      
      fs.writeFileSync(fileListPath, fileListContent);
      console.log('Created file list:', fileListContent);
    } catch (err) {
      reject(new Error('Failed to create file list'));
      return;
    }

    const ffmpegArgs = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', fileListPath,
      '-fps_mode', 'cfr', // Use constant frame rate mode
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264',
      '-r', '30',
      outputPath
    ];

    console.log('Fallback FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stderrOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      stderrOutput += output;
      console.log(`Fallback FFmpeg: ${output}`);
    });

    ffmpeg.on('close', (code) => {
      // Clean up temp files
      try {
        if (fs.existsSync(fileListPath)) {
          fs.unlinkSync(fileListPath);
        }
        // Clean up converted image files
        convertedFiles.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }
      
      if (code === 0) {
        console.log('Fallback FFmpeg completed successfully');
        resolve(outputPath);
      } else {
        console.error('Fallback FFmpeg failed with code:', code);
        reject(new Error(`All video creation methods failed. Please ensure FFmpeg is properly installed.`));
      }
    });

    ffmpeg.on('error', (error) => {
      // Clean up temp files
      try {
        if (fs.existsSync(fileListPath)) {
          fs.unlinkSync(fileListPath);
        }
        // Clean up converted image files
        convertedFiles.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }
      
      reject(new Error(`All video creation methods failed. FFmpeg error: ${error.message}`));
    });
  });
}

// Mix background music with video
async function mixBackgroundMusic(jobId: string, videoPath: string, musicPath: string) {
  try {
    const job = videoJobs.get(jobId);
    if (!job) return;
    
    videoJobs.set(jobId, { ...job, progress: 10 });
    
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const outputPath = path.join(videosDir, `${jobId}.mp4`);
    
    return new Promise((resolve, reject) => {
      // FFmpeg command to mix video with background music
      const ffmpegArgs = [
        '-y', // Overwrite output file
        '-i', videoPath, // Input video
        '-i', musicPath, // Input music
        '-filter_complex',
        '[1:a]volume=0.3[music];[0:a][music]amix=inputs=2:duration=shortest[audio]', // Mix audio with lower music volume
        '-map', '0:v', // Use video from first input
        '-map', '[audio]', // Use mixed audio
        '-c:v', 'copy', // Copy video codec (no re-encoding)
        '-c:a', 'aac', // Encode audio as AAC
        '-shortest', // Match duration to shortest input
        outputPath
      ];
      
      console.log('Background music FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
      
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderrOutput = '';
      
      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        stderrOutput += output;
        console.log(`Background music FFmpeg: ${output}`);
        
        // Update progress based on FFmpeg output
        const progressMatch = output.match(/time=(\d+):(\d+):(\d+)/);
        if (progressMatch) {
          const currentJob = videoJobs.get(jobId);
          if (currentJob) {
            videoJobs.set(jobId, { ...currentJob, progress: 50 });
          }
        }
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log('Background music mixing completed successfully');
          videoJobs.set(jobId, {
            id: jobId,
            status: 'completed',
            videoPath: outputPath,
            progress: 100
          });
          resolve(outputPath);
        } else {
          console.error('Background music mixing failed with code:', code);
          console.error('FFmpeg stderr:', stderrOutput);
          reject(new Error(`Background music mixing failed: ${stderrOutput}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        console.error('Background music mixing error:', error);
        reject(new Error(`Background music mixing error: ${error.message}`));
      });
    });
  } catch (error) {
    console.error('Background music mixing failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    videoJobs.set(jobId, {
      id: jobId,
      status: 'failed',
      error: errorMessage
    });
    throw error;
  }
}

// Mix AI-generated audio with video
async function mixAIAudioWithVideo(jobId: string, videoPath: string, audioPath: string) {
  try {
    const job = videoJobs.get(jobId);
    if (!job) return;
    
    videoJobs.set(jobId, { ...job, progress: 10 });
    
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const outputPath = path.join(videosDir, `${jobId}.mp4`);
    
    return new Promise((resolve, reject) => {
      // FFmpeg command to replace video audio with AI-generated audio
      const ffmpegArgs = [
        '-y', // Overwrite output file
        '-i', videoPath, // Input video
        '-i', audioPath, // Input AI audio
        '-c:v', 'copy', // Copy video codec (no re-encoding)
        '-c:a', 'aac', // Encode audio as AAC
        '-map', '0:v', // Use video from first input
        '-map', '1:a', // Use audio from second input
        '-shortest', // Match duration to shortest input
        outputPath
      ];
      
      console.log('AI audio mixing FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
      
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderrOutput = '';
      
      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        stderrOutput += output;
        console.log(`AI audio mixing FFmpeg: ${output}`);
        
        // Update progress
        const currentJob = videoJobs.get(jobId);
        if (currentJob) {
          videoJobs.set(jobId, { ...currentJob, progress: 50 });
        }
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log('AI audio mixing completed successfully');
          videoJobs.set(jobId, {
            id: jobId,
            status: 'completed',
            videoPath: outputPath,
            progress: 100
          });
          resolve(outputPath);
        } else {
          console.error('AI audio mixing failed with code:', code);
          console.error('FFmpeg stderr:', stderrOutput);
          reject(new Error(`AI audio mixing failed: ${stderrOutput}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        console.error('AI audio mixing error:', error);
        reject(new Error(`AI audio mixing error: ${error.message}`));
      });
    });
  } catch (error) {
    console.error('AI audio mixing failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    videoJobs.set(jobId, {
      id: jobId,
      status: 'failed',
      error: errorMessage
    });
    throw error;
  }
}

// Generate script using OpenRouter API
async function generateScriptWithOpenRouter(videoDescription: string): Promise<string> {
  try {
    const prompt = `Create a natural, engaging script for a slideshow video narration based on this description: "${videoDescription}"

Requirements:
- Write in a warm, conversational tone
- Keep it concise but engaging (aim for 30-60 seconds of narration)
- Make it suitable for a slideshow of images
- Focus on storytelling and emotional connection
- Don't include any stage directions or technical notes
- Write only the spoken narration text

Script:`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.2-3b-instruct:free', // Using a free model
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Photo to Video Converter'
      }
    });

    const script = response.data.choices[0]?.message?.content?.trim();
    if (!script) {
      throw new Error('No script generated from OpenRouter');
    }

    console.log('Generated script:', script);
    return script;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      throw new Error(`OpenRouter API error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw new Error('Failed to generate script with OpenRouter');
  }
}

// Rate limiting for ElevenLabs API
const elevenLabsRateLimit = {
  lastRequest: 0,
  minInterval: 2000, // Minimum 2 seconds between requests
  maxRetries: 3,
  activeRequests: 0,
  maxConcurrentRequests: 1 // Only allow 1 concurrent request to avoid rate limits
};

// Generate audio using ElevenLabs API with rate limiting and retry logic
async function generateAudioWithElevenLabs(audioJobId: string, script: string, duration?: number, retryCount: number = 0) {
  try {
    const job = audioJobs.get(audioJobId);
    if (!job) return;
    
    audioJobs.set(audioJobId, { ...job, progress: 10 });
    
    // Check concurrent request limit
    if (elevenLabsRateLimit.activeRequests >= elevenLabsRateLimit.maxConcurrentRequests) {
      const waitTime = 5000; // Wait 5 seconds if too many concurrent requests
      console.log(`Too many concurrent requests. Waiting ${waitTime}ms`);
      audioJobs.set(audioJobId, {
        ...job,
        status: 'processing',
        progress: 15,
        error: 'Waiting for other requests to complete...'
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    elevenLabsRateLimit.activeRequests++;
    
    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - elevenLabsRateLimit.lastRequest;
    if (timeSinceLastRequest < elevenLabsRateLimit.minInterval) {
      const waitTime = elevenLabsRateLimit.minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    elevenLabsRateLimit.lastRequest = Date.now();
    
    // Use the custom advertising voice from ElevenLabs
    const voiceId = config.advertisingVoices.custom; // Custom advertising voice
    
    // If duration is provided, adjust script to match video duration
    let adjustedScript = script;
    if (duration && duration > 0) {
      // Calculate target word count based on duration (150 words per minute)
      const targetWords = Math.floor((duration * 150) / 60);
      const currentWords = script.split(' ').length;
      
      if (currentWords > targetWords) {
        // Truncate script if it's too long
        const words = script.split(' ');
        adjustedScript = words.slice(0, targetWords).join(' ');
        console.log(`Script truncated from ${currentWords} to ${targetWords} words to match ${duration}s duration`);
      } else if (currentWords < targetWords * 0.8) {
        // Extend script if it's too short (less than 80% of target)
        const wordsToAdd = targetWords - currentWords;
        const extension = ` This is additional content to match the video duration. `.repeat(Math.ceil(wordsToAdd / 8));
        adjustedScript = script + extension;
        console.log(`Script extended from ${currentWords} to approximately ${targetWords} words to match ${duration}s duration`);
      }
    }
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: adjustedScript,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.7, // Higher stability for professional advertising
          similarity_boost: 0.8, // Higher similarity for consistent voice quality
          style: 0.2, // Slight style boost for engaging advertising tone
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );
    
    audioJobs.set(audioJobId, { ...job, progress: 70 });
    
    // Save the audio file
    const audioDir = path.join(process.cwd(), 'uploads', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const audioPath = path.join(audioDir, `${audioJobId}.mp3`);
    fs.writeFileSync(audioPath, response.data);
    
    console.log('Audio generated successfully:', audioPath);
    
    audioJobs.set(audioJobId, {
      id: audioJobId,
      status: 'completed',
      audioPath,
      script,
      progress: 100
    });
    
    // Decrement active requests counter
    elevenLabsRateLimit.activeRequests = Math.max(0, elevenLabsRateLimit.activeRequests - 1);
    
    return audioPath;
  } catch (error) {
    console.error('ElevenLabs audio generation failed:', error);
    
    // Handle 429 rate limit errors with retry logic
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      if (retryCount < elevenLabsRateLimit.maxRetries) {
        const retryDelay = Math.pow(2, retryCount) * 2000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limit hit. Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${elevenLabsRateLimit.maxRetries})`);
        
        audioJobs.set(audioJobId, {
          ...audioJobs.get(audioJobId)!,
          status: 'processing',
          progress: 20,
          error: `Rate limit reached. Retrying in ${Math.ceil(retryDelay/1000)} seconds...`
        });
        
        // Decrement counter before retry
        elevenLabsRateLimit.activeRequests = Math.max(0, elevenLabsRateLimit.activeRequests - 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return generateAudioWithElevenLabs(audioJobId, script, duration, retryCount + 1);
      } else {
        const errorMessage = 'ElevenLabs API rate limit exceeded. Please wait a few minutes before trying again.';
        audioJobs.set(audioJobId, {
          id: audioJobId,
          status: 'failed',
          error: errorMessage,
          script
        });
        // Decrement counter on final failure
        elevenLabsRateLimit.activeRequests = Math.max(0, elevenLabsRateLimit.activeRequests - 1);
        throw new Error(errorMessage);
      }
    }
    
    // Handle other errors
    let errorMessage = 'Failed to generate audio';
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('ElevenLabs response data:', error.response.data);
      if (error.response.status === 401) {
        errorMessage = 'ElevenLabs API key is invalid or expired';
      } else if (error.response.status === 403) {
        errorMessage = 'ElevenLabs API access forbidden. Check your subscription';
      } else if (error.response.status >= 500) {
        errorMessage = 'ElevenLabs service is temporarily unavailable. Please try again later';
      } else {
        errorMessage = `ElevenLabs API error: ${error.response.status} ${error.response.statusText}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    audioJobs.set(audioJobId, {
      id: audioJobId,
      status: 'failed',
      error: errorMessage,
      script
    });
    
    // Decrement counter on error
    elevenLabsRateLimit.activeRequests = Math.max(0, elevenLabsRateLimit.activeRequests - 1);
    
    throw new Error(errorMessage);
  }
}

// Fallback function for mock audio generation
async function generateMockAudio(jobId: string): Promise<string> {
  try {
    console.log(`Generating mock audio for job ${jobId} (fallback)`);
    
    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'uploads', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // Create a mock MP3 file (simple header)
    const mockAudioPath = path.join(audioDir, `${jobId}.mp3`);
    const mockAudioContent = Buffer.from([
      0xFF, 0xFB, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    fs.writeFileSync(mockAudioPath, mockAudioContent);
    
    return `/uploads/audio/${jobId}.mp3`;
  } catch (error) {
    console.error('Error generating mock audio:', error);
    throw new Error('Failed to generate audio');
  }
}

// Upload images endpoint
export const handleImageUpload = async (req: MulterRequest, res: Response) => {
  try {
    upload.array('images', 20)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = (req.files as multer.File[]).map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));

      res.json({ 
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create video endpoint
export const handleVideoProcessing = async (req: Request, res: Response) => {
  try {
    const { imageFiles, duration = 2, useTransitions = true, videoQuality = '720p', useAI = true } = req.body;
    
    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const jobId = uuidv4();
    videoJobs.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 0
    });

    // Start video processing in background
    processVideo(jobId, imageFiles, duration, useTransitions, videoQuality, useAI).catch(error => {
      console.error('Video processing error:', error);
      videoJobs.set(jobId, {
        id: jobId,
        status: 'failed',
        error: error.message
      });
    });

    res.json({
      jobId,
      message: 'Video processing started'
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Failed to start video processing' });
  }
};

// Generate script using OpenRouter
export const handleGenerateScript = async (req: Request, res: Response) => {
  try {
    const { videoDescription, videoJobId } = req.body;
    
    if (!videoDescription) {
      return res.status(400).json({ error: 'Video description is required' });
    }
    
    if (!videoJobId) {
      return res.status(400).json({ error: 'Video job ID is required' });
    }
    
    const videoJob = videoJobs.get(videoJobId);
    if (!videoJob || videoJob.status !== 'completed') {
      return res.status(400).json({ error: 'Original video not found or not ready' });
    }
    
    const script = await generateScriptWithOpenRouter(videoDescription);
    
    res.json({
      script,
      message: 'Script generated successfully'
    });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
};

// Generate audio using ElevenLabs
export const handleGenerateAudio = async (req: Request, res: Response) => {
  try {
    const { script, videoJobId, duration } = req.body;
    
    if (!script) {
      return res.status(400).json({ error: 'Script is required' });
    }
    
    if (!videoJobId) {
      return res.status(400).json({ error: 'Video job ID is required' });
    }
    
    const audioJobId = uuidv4();
    audioJobs.set(audioJobId, {
      id: audioJobId,
      status: 'processing',
      script,
      progress: 0
    });
    
    // Generate audio in background with duration parameter
    generateAudioWithElevenLabs(audioJobId, script, duration).catch(error => {
      console.error('Audio generation error:', error);
      audioJobs.set(audioJobId, {
        id: audioJobId,
        status: 'failed',
        error: error.message,
        script
      });
    });
    
    res.json({
      audioJobId,
      message: 'Audio generation started'
    });
  } catch (error) {
    console.error('Generate audio error:', error);
    res.status(500).json({ error: 'Failed to start audio generation' });
  }
};

// Get audio job status
export const handleAudioStatus = async (req: Request, res: Response) => {
  try {
    const { audioJobId } = req.params;
    const job = audioJobs.get(audioJobId);

    if (!job) {
      return res.status(404).json({ error: 'Audio job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Audio status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add background music to video
export const handleAddBackgroundMusic = async (req: MulterRequest, res: Response) => {
  try {
    const { videoJobId } = req.body;
    const musicFile = req.file;
    
    if (!musicFile) {
      return res.status(400).json({ error: 'No music file provided' });
    }
    
    if (!videoJobId) {
      return res.status(400).json({ error: 'Video job ID is required' });
    }
    
    const videoJob = videoJobs.get(videoJobId);
    if (!videoJob || videoJob.status !== 'completed' || !videoJob.videoPath) {
      return res.status(400).json({ error: 'Original video not found or not ready' });
    }
    
    const finalJobId = uuidv4();
    videoJobs.set(finalJobId, {
      id: finalJobId,
      status: 'processing',
      progress: 0
    });
    
    // Process background music mixing in background
    mixBackgroundMusic(finalJobId, videoJob.videoPath, musicFile.path).catch(error => {
      console.error('Background music mixing error:', error);
      videoJobs.set(finalJobId, {
        id: finalJobId,
        status: 'failed',
        error: error.message
      });
    });
    
    res.json({
      jobId: finalJobId,
      message: 'Background music processing started'
    });
  } catch (error) {
    console.error('Add background music error:', error);
    res.status(500).json({ error: 'Failed to start background music processing' });
  }
};

// Mix AI-generated audio with video
export const handleMixAIAudio = async (req: Request, res: Response) => {
  try {
    const { audioJobId, videoJobId } = req.body;
    
    if (!audioJobId || !videoJobId) {
      return res.status(400).json({ error: 'Both audio and video job IDs are required' });
    }
    
    const audioJob = audioJobs.get(audioJobId);
    const videoJob = videoJobs.get(videoJobId);
    
    if (!audioJob || audioJob.status !== 'completed' || !audioJob.audioPath) {
      return res.status(400).json({ error: 'Audio not found or not ready' });
    }
    
    if (!videoJob || videoJob.status !== 'completed' || !videoJob.videoPath) {
      return res.status(400).json({ error: 'Video not found or not ready' });
    }
    
    const finalJobId = uuidv4();
    videoJobs.set(finalJobId, {
      id: finalJobId,
      status: 'processing',
      progress: 0
    });
    
    // Mix AI audio with video in background
    mixAIAudioWithVideo(finalJobId, videoJob.videoPath, audioJob.audioPath).catch(error => {
      console.error('AI audio mixing error:', error);
      videoJobs.set(finalJobId, {
        id: finalJobId,
        status: 'failed',
        error: error.message
      });
    });
    
    res.json({
      jobId: finalJobId,
      message: 'AI audio mixing started'
    });
  } catch (error) {
    console.error('Mix AI audio error:', error);
    res.status(500).json({ error: 'Failed to start AI audio mixing' });
  }
};

// Get video processing status
export const handleJobStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = videoJobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Preview video endpoint
export const handleVideoStream = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = videoJobs.get(jobId);

    if (!job || job.status !== 'completed' || !job.videoPath) {
      return res.status(404).json({ error: 'Video not found or not ready' });
    }

    if (!fs.existsSync(job.videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Set appropriate headers for video streaming
    const stat = fs.statSync(job.videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(job.videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(job.videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get video preview thumbnail
export const handleVideoPreview = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const videoJob = videoJobs.get(jobId);
    if (!videoJob || videoJob.status !== 'completed') {
      return res.status(400).json({ error: 'Video not ready for preview' });
    }

    // For now, we'll return a placeholder since we don't generate preview thumbnails
    // In a real implementation, you could generate a thumbnail from the first frame
    res.status(404).json({ error: 'Preview not available' });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download video endpoint
export const handleVideoDownload = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = videoJobs.get(jobId);

    if (!job || job.status !== 'completed' || !job.videoPath) {
      return res.status(404).json({ error: 'Video not found or not ready' });
    }

    if (!fs.existsSync(job.videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    res.download(job.videoPath, `video-${jobId}.mp4`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 

// Stream audio endpoint for generated narration
export const handleAudioStream = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const audioJob = audioJobs.get(jobId);
    if (!audioJob || audioJob.status !== 'completed' || !audioJob.audioPath) {
      return res.status(400).json({ error: 'Audio not ready for streaming' });
    }

    if (!fs.existsSync(audioJob.audioPath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    const stat = fs.statSync(audioJob.audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(audioJob.audioPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(audioJob.audioPath).pipe(res);
    }
  } catch (error) {
    console.error('Audio streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 