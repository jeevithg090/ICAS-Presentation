import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeFilename } from '../lib/safe-path';

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const logosDir = path.join(process.cwd(), 'logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${sanitizeFilename(file.originalname, 'logo')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Store for tracking content generation jobs
interface ContentJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  postType: string;
  festival?: string;
  customText?: string;
  logo?: string;
  aspectRatios: string[];
  model: string;
  generatedImages?: string[];
  error?: string;
  progress?: number;
}

const contentJobs: Map<string, ContentJob> = new Map();

// Generate content endpoint
export const handleContentGeneration = async (req: Request, res: Response) => {
  try {
    const { 
      postType, 
      festival, 
      customText, 
      logo, 
      aspectRatios, 
      model 
    } = req.body;

    if (!postType || !aspectRatios || aspectRatios.length === 0) {
      return res.status(400).json({ 
        error: 'Post type and aspect ratios are required' 
      });
    }

    const jobId = uuidv4();
    
    // Create content generation job
    const contentJob: ContentJob = {
      id: jobId,
      status: 'processing',
      postType,
      festival,
      customText,
      logo,
      aspectRatios,
      model,
      progress: 0
    };

    contentJobs.set(jobId, contentJob);

    // Simulate content generation
    setTimeout(() => {
      const job = contentJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.progress = 100;
        
        // Generate mock image URLs based on aspect ratios
        job.generatedImages = aspectRatios.map((ratio, index) => {
          const [width, height] = ratio.split(':').map(Number);
          const actualWidth = width * 100;
          const actualHeight = height * 100;
          return `https://via.placeholder.com/${actualWidth}x${actualHeight}/4F46E5/FFFFFF?text=${postType}+${ratio}+${index + 1}`;
        });
        
        contentJobs.set(jobId, job);
      }
    }, 3000); // Simulate 3 second generation

    res.json({ 
      message: 'Content generation started',
      jobId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload logo endpoint
export const handleLogoUpload = async (req: MulterRequest, res: Response) => {
  try {
    upload.single('logo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No logo uploaded' });
      }

      const logoInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        url: `/logos/${req.file.filename}`
      };

      res.json({ 
        message: 'Logo uploaded successfully',
        logo: logoInfo
      });
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get job status endpoint
export const handleJobStatus = async (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    
    const contentJob = contentJobs.get(jobId);
    if (!contentJob) {
      return res.status(404).json({ error: 'Content job not found' });
    }
    
    return res.json(contentJob);
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available festivals endpoint
export const handleGetFestivals = async (req: Request, res: Response) => {
  try {
    const festivals = [
      { id: 'diwali', name: 'Diwali', description: 'Festival of Lights', date: 'November 2024' },
      { id: 'holi', name: 'Holi', description: 'Festival of Colors', date: 'March 2025' },
      { id: 'eid', name: 'Eid al-Fitr', description: 'End of Ramadan', date: 'April 2025' },
      { id: 'christmas', name: 'Christmas', description: 'Christian celebration', date: 'December 2024' },
      { id: 'newyear', name: 'New Year', description: 'New Year celebration', date: 'January 2025' },
      { id: 'republic', name: 'Republic Day', description: 'Indian Republic Day', date: 'January 26, 2025' },
      { id: 'independence', name: 'Independence Day', description: 'Indian Independence Day', date: 'August 15, 2025' },
      { id: 'gandhi', name: 'Gandhi Jayanti', description: 'Mahatma Gandhi Birthday', date: 'October 2, 2025' }
    ];

    res.json({ festivals });
  } catch (error) {
    console.error('Get festivals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available aspect ratios endpoint
export const handleGetAspectRatios = async (req: Request, res: Response) => {
  try {
    const aspectRatios = [
      { id: '1:1', name: 'Square (1:1)', width: 1080, height: 1080, description: 'Instagram posts, Facebook posts' },
      { id: '16:9', name: 'Landscape (16:9)', width: 1920, height: 1080, description: 'YouTube thumbnails, presentations' },
      { id: '9:16', name: 'Portrait (9:16)', width: 1080, height: 1920, description: 'Instagram stories, TikTok' },
      { id: '4:5', name: 'Portrait (4:5)', width: 1080, height: 1350, description: 'Instagram posts, Facebook posts' },
      { id: '3:2', name: 'Landscape (3:2)', width: 1620, height: 1080, description: 'Print materials, brochures' },
      { id: '2:3', name: 'Portrait (2:3)', width: 1080, height: 1620, description: 'Print materials, flyers' }
    ];

    res.json({ aspectRatios });
  } catch (error) {
    console.error('Get aspect ratios error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available models endpoint
export const handleGetModels = async (req: Request, res: Response) => {
  try {
    const models = [
      { id: 'local', name: 'Local Canvas', description: 'Simple text overlay on templates', type: 'local' },
      { id: 'ai', name: 'AI Generated', description: 'AI-powered image creation', type: 'ai' },
      { id: 'template', name: 'Template Based', description: 'Pre-designed templates with customization', type: 'template' }
    ];

    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download generated content endpoint
export const handleContentDownload = async (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    const { imageIndex } = req.query;
    
    const contentJob = contentJobs.get(jobId);
    if (!contentJob || contentJob.status !== 'completed') {
      return res.status(400).json({ error: 'Content not ready for download' });
    }

    if (!contentJob.generatedImages || contentJob.generatedImages.length === 0) {
      return res.status(400).json({ error: 'No images generated' });
    }

    const index = imageIndex ? parseInt(imageIndex as string) : 0;
    if (index < 0 || index >= contentJob.generatedImages.length) {
      return res.status(400).json({ error: 'Invalid image index' });
    }

    const imageUrl = contentJob.generatedImages[index];

    res.json({ 
      message: 'Content ready for download',
      downloadUrl: imageUrl,
      jobId,
      imageIndex: index
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 