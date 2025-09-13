import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize Gemini AI with the provided API key
const genAI = new GoogleGenerativeAI('AIzaSyBqz-nflEro5PJzaz4VvCYa1SjLeVqG02g');

// Gemini model configuration - try multiple models for image generation
const IMAGE_GENERATION_MODELS = [
  'gemini-2.5-flash-image-preview', // Primary model for image generation
  'gemini-1.5-pro', // Fallback model
  'gemini-1.5-flash' // Secondary fallback
];

const DEFAULT_MODEL = 'gemini-2.5-flash-image-preview';

export interface ImageGenerationOptions {
  prompt: string;
  referenceImages?: string[]; // Base64 encoded images or file paths
  outputDir?: string;
  fileName?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;
  error?: string;
  prompt?: string;
  model?: string;
}

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate an image using Gemini with retry logic
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { prompt, referenceImages = [], outputDir = 'uploads/generated', fileName } = options;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  // Ensure output directory exists
  const fullOutputDir = path.join(process.cwd(), outputDir);
  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }

  // Generate unique filename if not provided
  const uniqueFileName = fileName || `generated_${uuidv4()}`;
  const outputPath = path.join(fullOutputDir, `${uniqueFileName}.png`);

  // Prepare the content parts
  const parts: any[] = [
    {
      text: prompt
    }
  ];

  // Add reference images if provided
  console.log(`Processing ${referenceImages.length} reference images for Gemini`);
  for (const imageRef of referenceImages) {
    try {
      console.log(`Processing reference image: ${imageRef}`);
      let imageData: string;
      let mimeType: string;

      if (imageRef.startsWith('data:')) {
        // Base64 encoded image
        console.log('Processing as base64 encoded image');
        const [header, data] = imageRef.split(',');
        imageData = data;
        mimeType = header.split(';')[0].split(':')[1];
      } else if (fs.existsSync(imageRef)) {
        // File path
        console.log('Processing as file path - image exists');
        const fileBuffer = fs.readFileSync(imageRef);
        imageData = fileBuffer.toString('base64');
        mimeType = getMimeType(imageRef);
        console.log(`Image processed successfully - MIME type: ${mimeType}, Size: ${fileBuffer.length} bytes`);
      } else {
        console.warn(`Image reference not found: ${imageRef}`);
        continue;
      }

      parts.push({
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      });
      console.log(`Successfully added reference image to Gemini request`);
    } catch (error) {
      console.warn(`Failed to process reference image ${imageRef}:`, error);
    }
  }
  
  console.log(`Total parts being sent to Gemini: ${parts.length} (1 text + ${parts.length - 1} images)`);

  // Try multiple models with retry logic
  for (const modelName of IMAGE_GENERATION_MODELS) {
    console.log(`Trying model: ${modelName}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} - Generating image with ${modelName}...`);
        
        // Get the model
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Generate content
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: parts
          }]
        });

        const response = await result.response;

        // Check if we got an image in the response
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          const content = response.candidates[0].content;
          
          if (content.parts && content.parts.length > 0) {
            for (const part of content.parts) {
              if (part.inlineData && part.inlineData.data) {
                // Save the generated image
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                fs.writeFileSync(outputPath, imageBuffer);
                
                // Return relative URL for web access
                const relativeUrl = `/${outputDir}/${uniqueFileName}.png`;
                
                console.log(`Image generated successfully with ${modelName} on attempt ${attempt}`);
                return {
                  success: true,
                  imagePath: outputPath,
                  imageUrl: relativeUrl,
                  prompt: prompt,
                  model: modelName
                };
              }
            }
          }
        }

        // If no image was generated, try next attempt
        console.log(`No image generated with ${modelName}, trying next attempt...`);
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`Waiting ${Math.round(delay)}ms before retry...`);
          await sleep(delay);
        }

      } catch (error: any) {
        console.error(`Attempt ${attempt}/${maxRetries} failed with ${modelName}:`, error.message);
        
        // If this is the last attempt for this model, try next model
        if (attempt === maxRetries) {
          console.log(`All attempts failed for ${modelName}, trying next model...`);
          break;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`Waiting ${Math.round(delay)}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  // This should never be reached, but just in case
  return {
    success: false,
    error: 'Maximum retry attempts exceeded',
    prompt: options.prompt,
    model: DEFAULT_MODEL
  };
}

/**
 * Mix multiple images with a custom prompt using Gemini with retry logic
 */
export async function mixImages(options: {
  prompt: string;
  images: string[]; // Array of base64 encoded images or file paths
  outputDir?: string;
  fileName?: string;
}): Promise<ImageGenerationResult> {
  const { prompt, images, outputDir = 'uploads/mixed', fileName } = options;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  if (images.length === 0) {
    return {
      success: false,
      error: 'At least one image is required for mixing'
    };
  }

  if (images.length > 5) {
    return {
      success: false,
      error: 'Maximum 5 images can be mixed at once'
    };
  }

  // Ensure output directory exists
  const fullOutputDir = path.join(process.cwd(), outputDir);
  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }

  // Generate unique filename if not provided
  const uniqueFileName = fileName || `mixed_${uuidv4()}`;
  const outputPath = path.join(fullOutputDir, `${uniqueFileName}.png`);

  // Get the model
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

  // Prepare the content parts
  const parts: any[] = [
    {
      text: `Mix and blend these images according to the following prompt: ${prompt}`
    }
  ];

  // Add all images
  for (const imageRef of images) {
    try {
      let imageData: string;
      let mimeType: string;

      if (imageRef.startsWith('data:')) {
        // Base64 encoded image
        const [header, data] = imageRef.split(',');
        imageData = data;
        mimeType = header.split(';')[0].split(':')[1];
      } else if (fs.existsSync(imageRef)) {
        // File path
        const fileBuffer = fs.readFileSync(imageRef);
        imageData = fileBuffer.toString('base64');
        mimeType = getMimeType(imageRef);
      } else {
        console.warn(`Image reference not found: ${imageRef}`);
        continue;
      }

      parts.push({
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      });
    } catch (error) {
      console.warn(`Failed to process image ${imageRef}:`, error);
    }
  }

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} - Mixing images with Gemini...`);
      
      // Generate content
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: parts
        }]
      });

      const response = await result.response;

      // Check if we got an image in the response
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        
        if (content.parts && content.parts.length > 0) {
          for (const part of content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // Save the generated image
              const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
              fs.writeFileSync(outputPath, imageBuffer);
              
              // Return relative URL for web access
              const relativeUrl = `/${outputDir}/${uniqueFileName}.png`;
              
              console.log(`Image mixing successful on attempt ${attempt}`);
              return {
                success: true,
                imagePath: outputPath,
                imageUrl: relativeUrl,
                prompt: prompt,
                model: DEFAULT_MODEL
              };
            }
          }
        }
      }

      // If no image was generated, return error
      return {
        success: false,
        error: 'No image was generated in the response',
        prompt: prompt,
        model: DEFAULT_MODEL
      };

    } catch (error: any) {
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // If this is the last attempt, return the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error.message || 'Unknown error occurred during image mixing',
          prompt: options.prompt,
          model: DEFAULT_MODEL
        };
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Waiting ${Math.round(delay)}ms before retry...`);
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  return {
    success: false,
    error: 'Maximum retry attempts exceeded',
    prompt: options.prompt,
    model: DEFAULT_MODEL
  };
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[ext] ?? 'image/jpeg';
}

/**
 * Test the Gemini API connection
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await generateImage({
      prompt: 'Generate a simple test image of a blue circle on white background',
      fileName: 'test_connection'
    });

    if (result.success) {
      return {
        success: true,
        message: `Gemini API connection successful using ${result.model}`
      };
    } else {
      return {
        success: false,
        message: `API connection failed: ${result.error}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `API connection failed: ${error.message}`
    };
  }
}
