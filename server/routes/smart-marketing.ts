import { Request, Response } from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImage, mixImages, testConnection } from '../lib/gemini-nano-banana.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { resolveUploadUrl } from '../lib/safe-path';

// Extend Request type to include file property from multer
interface MulterRequest extends Request {
  file?: any;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.googleApiKey || "");

// Gemini image generation configuration
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-exp';

// Test Gemini API key
console.log('Gemini API Key configured:', config.googleApiKey ? 'Yes' : 'No');

// OpenRouter API configuration
const OPENROUTER_API_KEY = config.openRouterApiKey;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reference-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ref-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// ICAS Features context from the markdown file
const ICAS_CONTEXT = `
ICAS Manipal (International Centre for Applied Sciences) is a prestigious institution offering International Transfer Programs in Engineering. Here are the key features:

PROGRAM OVERVIEW:
- Established in 1994
- Credit transfer program allowing students to begin engineering education in India and complete it abroad
- Students spend first 2 years at ICAS Manipal, then transfer to international universities
- Aeronautical/Aviation students can transfer after 1 year
- B.Sc. Applied Science option available for non-transfer students

KEY FEATURES:
- Global exposure and international recognition
- Seamless credit transfer to over 100 partner universities
- Cost-effective education (up to 40% savings)
- Flexibility to change branch/stream
- Specializations: Aeronautical, Chemical, Civil, Computer Science, Electrical & Electronics, Mechanical, Mechatronics

PARTNER UNIVERSITIES:
- USA, UK, Australia, Canada, Malaysia, France, Germany, and more
- Extensive articulation agreements ensuring credit acceptance
- Credits earned at Manipal are equivalent to international university credits

CAREER OPPORTUNITIES:
- Global job placements at companies like Oracle, Tesla, Volvo, Allianz
- Paid internships abroad
- Scholarship opportunities
- Successful alumni network with over 1,900 transfers

CAMPUS FACILITIES:
- State-of-the-art Innovation Centre
- Well-furnished laboratories
- World-class sports facilities (Marena complex)
- Extensive libraries with digital and print resources
- Comfortable student housing with anti-ragging measures

STUDENT LIFE:
- Diverse student clubs (e.g., Enigma)
- Regular interaction with international faculty
- Curriculum Conclave Meetings
- Annual Day & Awards Ceremony
- Annual Sports Meet
- Comprehensive orientation program

ACADEMIC EXCELLENCE:
- Institution of Eminence status
- Curriculum aligned with international standards
- Teaching methodologies mirror top universities abroad
- Evaluation systems consistent with foreign universities
`;

// Generate post content using OpenRouter
export const handleGeneratePost = async (req: Request, res: Response) => {
  try {
    const { postType, postTypeName, customMessage, referenceImages } = req.body;

    if (!postType || !postTypeName) {
      return res.status(400).json({ 
        error: 'Post type and name are required' 
      });
    }

    // Create a comprehensive prompt for OpenRouter
    const prompt = `
You are a marketing expert for ICAS Manipal, an International Centre for Applied Sciences. Your task is to create an engaging social media post for ${postTypeName.toLowerCase()} content.

CONTEXT ABOUT ICAS MANIPAL:
${ICAS_CONTEXT}

POST TYPE: ${postTypeName}
CUSTOM MESSAGE: ${customMessage || 'None provided'}

REFERENCE IMAGES TO CONSIDER:
${referenceImages.map(img => `- ${img.name} (${img.category}): ${img.description}`).join('\n')}

REQUIREMENTS:
1. Create a compelling, engaging social media post (2-4 sentences)
2. Include relevant hashtags (5-8 hashtags)
3. Make it suitable for platforms like Instagram, Facebook, LinkedIn
4. Focus on the specific post type and any custom message provided
5. Highlight ICAS Manipal's unique value propositions
6. Use a professional yet engaging tone
7. Include a call-to-action if appropriate

Please provide the post content in this exact format:
POST:
[Your post content here]

HASHTAGS:
[Your hashtags here, separated by spaces]

IMAGE PROMPT:
[Create a detailed Instagram-style image generation prompt for an AI image generator. The image should be:
- Instagram post format (1080x1080 square or 1080x1350 portrait)
- Professional marketing style with modern design
- Include text overlay with key message from the post
- Use ICAS Manipal brand colors (blue, white, professional tones)
- High-quality, engaging visual that would perform well on Instagram
- Include visual elements that represent the post type (engineering, international education, campus life, etc.)
- Professional photography style with clean composition
- Text should be readable and well-integrated into the design
- Include elements like: modern typography, gradient backgrounds, professional icons, or relevant imagery
- Style should be: modern, clean, professional, aspirational, and Instagram-worthy]
`;

    // Try multiple OpenRouter models as fallbacks
    const models = [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'meta-llama/llama-3.1-8b-instruct',
      'google/gemini-pro'
    ];

    let response;
    let lastError;

    for (const model of models) {
      try {
        const openRouterResponse = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a professional marketing expert specializing in educational institution marketing. You create engaging, professional social media content.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://icas-manipal.com',
              'X-Title': 'ICAS Smart Marketing Tool'
            }
          }
        );

        response = openRouterResponse;
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        console.log(`Failed with model ${model}:`, error.message);
        continue; // Try next model
      }
    }

    if (!response) {
      throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
    }

    const content = response.data.choices[0].message.content;
    
    // Parse the response to extract post, hashtags, and image prompt
    const postMatch = content.match(/POST:\s*([\s\S]*?)(?=HASHTAGS:|$)/i);
    const hashtagsMatch = content.match(/HASHTAGS:\s*([\s\S]*?)(?=IMAGE PROMPT:|$)/i);
    const imagePromptMatch = content.match(/IMAGE PROMPT:\s*([\s\S]*?)$/i);

    const post = postMatch ? postMatch[1].trim() : content;
    const hashtags = hashtagsMatch ? hashtagsMatch[1].trim() : '';
    const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

    // Combine post and hashtags
    const fullPost = hashtags ? `${post}\n\n${hashtags}` : post;

    res.json({
      success: true,
      post: fullPost,
      imagePrompt: imagePrompt || 'A professional marketing image for ICAS Manipal',
      model: response.data.model
    });

  } catch (error: any) {
    console.error('Post generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate post content',
      details: error.message 
    });
  }
};

// Generate image using Gemini Nano Banana (2.5 Flash Image Preview)
export const handleGenerateImage = async (req: Request, res: Response) => {
  try {
    const { prompt, referenceImages = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Image prompt is required' 
      });
    }

    console.log('Generating image with Gemini...');
    console.log('Reference images received:', referenceImages);

    // Convert reference image URLs to file paths
    // Only files inside the uploads directory may be used as references.
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const referenceImagePaths = (Array.isArray(referenceImages) ? referenceImages : [])
      .map((imgUrl: unknown) => resolveUploadUrl(uploadsRoot, imgUrl))
      .filter((imgPath): imgPath is string => {
      if (!imgPath) return false;
      // Only include images that actually exist
      const exists = fs.existsSync(imgPath);
      console.log(`Checking if image exists: ${imgPath} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      if (!exists) {
        console.warn(`Reference image not found: ${imgPath}`);
      }
      return exists;
    });

    console.log('Final reference image paths to use:', referenceImagePaths);
    console.log(`Total reference images to incorporate: ${referenceImagePaths.length}`);

    // Create a clean, Instagram-worthy prompt focused on visual appeal
    const enhancedPrompt = `
Create a stunning, professional Instagram post for ICAS Manipal (International Centre for Applied Sciences) based on this description:

${prompt}

DESIGN REQUIREMENTS:
- Format: 1080x1080 square (Instagram-optimized)
- Style: Modern, clean, and visually striking Instagram post
- Focus: Beautiful visual design with minimal text overlay
- Brand Colors: Use ICAS Manipal brand colors (deep blue #1e40af, white, professional gradients)
- Visual Impact: Create an eye-catching, shareable social media image

TEXT OVERLAY GUIDELINES:
- Include ONLY a short, impactful headline (maximum 3-5 words)
- Use large, bold, modern typography with excellent contrast
- Position text strategically without overwhelming the visual
- Examples: "Global Engineering", "Study Abroad", "Future Ready", "World Class Education"
- Avoid long sentences or paragraphs on the image

REFERENCE IMAGE INTEGRATION:
${referenceImagePaths.length > 0 ? 
  `- Incorporate visual elements from the provided reference image(s)
- If logos are present, display them prominently but elegantly
- Use reference colors and style elements to maintain brand consistency
- Blend reference elements seamlessly with the overall design` : 
  '- Create original, professional design based on the description'
}

VISUAL STYLE:
- High-quality, professional photography or illustration style
- Clean composition with proper visual hierarchy
- Modern design elements (gradients, shadows, geometric shapes)
- Elements representing engineering, technology, and global education
- Appealing to international students and parents
- Instagram-worthy aesthetic that encourages engagement

IMPORTANT: Focus on creating a beautiful, visually striking image that tells the story through visuals rather than text. The image should be so compelling that it works perfectly for Instagram without needing extensive text overlays.
`;

    console.log('Enhanced prompt:', enhancedPrompt);

    // Use Gemini Nano Banana for image generation
    const result = await generateImage({
      prompt: enhancedPrompt,
      referenceImages: referenceImagePaths,
      outputDir: 'uploads/generated',
      fileName: `marketing_${Date.now()}`
    });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        imagePath: result.imagePath,
        prompt: enhancedPrompt,
        model: result.model,
        note: `Image generated successfully using Gemini Nano Banana (2.5 Flash Image Preview)${referenceImagePaths.length > 0 ? ` with ${referenceImagePaths.length} reference image(s) incorporated` : ''}`,
        referenceImagesUsed: referenceImagePaths.length,
        promptAnalysis: {
          keyElements: prompt.toLowerCase().split(' ').filter(word => 
            ['blue', 'sky', 'university', 'landmarks', 'global', 'connectivity', 'engineering', 
             'professional', 'sophisticated', 'aspirational', 'international', 'education'].includes(word)
          ).slice(0, 5),
          suggestedStyle: 'Professional Marketing',
          colorScheme: 'Brand-appropriate'
        }
      });
    } else {
      // Fallback to placeholder if generation fails
      const fallbackImage = `https://via.placeholder.com/1080x1080/4F46E5/FFFFFF?text=ICAS+Marketing+Image`;
      
      res.json({
        success: true,
        imageUrl: fallbackImage,
        prompt: enhancedPrompt,
        note: `Image generation failed: ${result.error}. Using fallback image.`,
        warning: 'Gemini Nano Banana image generation encountered an issue. Please try again or contact support.',
        error: result.error
      });
    }

  } catch (error: any) {
    console.error('Image generation error:', error);
    
    // Final fallback to a branded placeholder
    const fallbackImage = `https://via.placeholder.com/1080x1080/4F46E5/FFFFFF?text=ICAS+Marketing+Image`;
    
    res.json({
      success: true,
      imageUrl: fallbackImage,
      prompt: req.body.prompt || 'Marketing image generation',
      note: 'Image generation failed. Using fallback image.',
      error: error.message
    });
  }
};

// Mix multiple images using Gemini Nano Banana
export const handleMixImages = async (req: Request, res: Response) => {
  try {
    const { prompt, images } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Mix prompt is required' 
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image is required for mixing' 
      });
    }

    if (images.length > 5) {
      return res.status(400).json({ 
        error: 'Maximum 5 images can be mixed at once' 
      });
    }

    // Enhance the prompt with ICAS context
    const enhancedPrompt = `
Mix and blend these images for ICAS Manipal marketing purposes according to this description:

${prompt}

REQUIREMENTS:
- Create a professional marketing composition
- Maintain ICAS Manipal branding elements
- Ensure high-quality, professional output
- Blend images harmoniously
- Focus on international education and engineering themes
- Use professional color schemes and composition
`;

    console.log('Mixing images with Gemini Nano Banana...');
    console.log('Enhanced prompt:', enhancedPrompt);
    console.log('Number of images to mix:', images.length);

    // Use Gemini Nano Banana for image mixing
    const result = await mixImages({
      prompt: enhancedPrompt,
      images: images,
      outputDir: 'uploads/mixed',
      fileName: `mixed_${Date.now()}`
    });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        imagePath: result.imagePath,
        prompt: enhancedPrompt,
        model: result.model,
        note: 'Images mixed successfully using Gemini Nano Banana (2.5 Flash Image Preview)',
        imagesProcessed: images.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        prompt: enhancedPrompt,
        note: 'Image mixing failed. Please check your images and try again.'
      });
    }

  } catch (error: any) {
    console.error('Image mixing error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      note: 'Image mixing failed due to an unexpected error.'
    });
  }
};

// Test Gemini Nano Banana connection
export const handleTestConnection = async (req: Request, res: Response) => {
  try {
    console.log('Testing Gemini Nano Banana connection...');
    
    const result = await testConnection();
    
    res.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Connection test error:', error);
    
    res.status(500).json({
      success: false,
      message: `Connection test failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Test image generation with specific reference images
export const handleTestImageGeneration = async (req: Request, res: Response) => {
  try {
    const { referenceImages = [] } = req.body;
    
    console.log('Testing image generation with reference images:', referenceImages);
    
    // Convert reference image URLs to file paths
    // Only files inside the uploads directory may be used as references.
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const referenceImagePaths = (Array.isArray(referenceImages) ? referenceImages : [])
      .map((imgUrl: unknown) => resolveUploadUrl(uploadsRoot, imgUrl))
      .filter((imgPath): imgPath is string => {
      if (!imgPath) return false;
      const exists = fs.existsSync(imgPath);
      console.log(`Checking if test image exists: ${imgPath} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      return exists;
    });
    
    const testPrompt = `
Create a simple test image that prominently displays any logos from the provided reference images.

REFERENCE IMAGES TO USE:
${referenceImagePaths.length > 0 ? 
  `You have ${referenceImagePaths.length} reference image(s). If any contain logos, display them prominently in the center of the image.` : 
  'No reference images provided.'
}

REQUIREMENTS:
- Simple, clean design
- If logos are present in reference images, display them prominently
- Use a white or light background
- Add text "Logo Test" at the bottom
- 1080x1080 square format
`;

    const result = await generateImage({
      prompt: testPrompt,
      referenceImages: referenceImagePaths,
      outputDir: 'uploads/generated',
      fileName: `logo_test_${Date.now()}`
    });
    
    res.json({
      success: result.success,
      imageUrl: result.imageUrl,
      referenceImagesProcessed: referenceImagePaths.length,
      message: result.success ? 'Test image generated successfully' : 'Test image generation failed',
      error: result.error
    });
    
  } catch (error: any) {
    console.error('Test image generation error:', error);
    
    res.status(500).json({
      success: false,
      message: `Test image generation failed: ${error.message}`,
      error: error.message
    });
  }
};

// Get available post types
export const handleGetPostTypes = async (req: Request, res: Response) => {
  try {
    const postTypes = [
      {
        id: 'admission-open',
        name: 'Admission Open',
        description: 'Announce new admission cycles and application deadlines',
        examples: [
          'Admissions Open for 2025-26 Academic Year',
          'Early Bird Applications Closing Soon',
          'Limited Seats Available - Apply Now'
        ]
      },
      {
        id: 'features-highlight',
        name: 'ICAS Features',
        description: 'Showcase the unique features and benefits of ICAS',
        examples: [
          'Global Engineering Education at Affordable Cost',
          '100+ Partner Universities Worldwide',
          'Credit Transfer to Top International Institutions'
        ]
      },
      {
        id: 'advertising',
        name: 'Advertising',
        description: 'Create promotional content for campaigns and events',
        examples: [
          'Special Offers and Discounts',
          'Event Promotions',
          'Brand Awareness Campaigns'
        ]
      },
      {
        id: 'student-success',
        name: 'Student Success',
        description: 'Highlight alumni achievements and success stories',
        examples: [
          'Alumni Working at Tesla, Oracle, Volvo',
          'Successful Credit Transfer Stories',
          'Global Career Opportunities'
        ]
      },
      {
        id: 'campus-life',
        name: 'Campus Life',
        description: 'Showcase vibrant campus culture and facilities',
        examples: [
          'State-of-the-art Innovation Centre',
          'World-class Sports Facilities',
          'Diverse Student Clubs and Activities'
        ]
      },
      {
        id: 'international-partnerships',
        name: 'International Partnerships',
        description: 'Highlight global university partnerships',
        examples: [
          'Partnerships with Top US Universities',
          'UK University Transfer Programs',
          'Australian and Canadian Opportunities'
        ]
      }
    ];

    res.json({ postTypes });
  } catch (error) {
    console.error('Get post types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available reference images
export const handleGetReferenceImages = async (req: Request, res: Response) => {
  try {
    const defaultImages = [
      {
        id: 'icas-logo',
        name: 'ICAS Logo',
        description: 'Official ICAS Manipal logo',
        url: '/placeholder.svg',
        category: 'logo'
      },
      {
        id: 'manipal-logo',
        name: 'MAHE Logo',
        description: 'Manipal Academy of Higher Education logo',
        url: '/placeholder.svg',
        category: 'logo'
      },
      {
        id: 'us-university',
        name: 'US University',
        description: 'Representative US university logo',
        url: '/placeholder.svg',
        category: 'university'
      },
      {
        id: 'uk-university',
        name: 'UK University',
        description: 'Representative UK university logo',
        url: '/placeholder.svg',
        category: 'university'
      },
      {
        id: 'students-group',
        name: 'Students Group',
        description: 'Diverse group of international students',
        url: '/placeholder.svg',
        category: 'students'
      },
      {
        id: 'campus-building',
        name: 'Campus Building',
        description: 'Modern ICAS campus building',
        url: '/placeholder.svg',
        category: 'campus'
      }
    ];

    // Get uploaded reference images
    const uploadedImages = await getUploadedReferenceImages();
    
    const allImages = [...defaultImages, ...uploadedImages];


    res.json({ referenceImages: allImages });
  } catch (error) {
    console.error('Get reference images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload reference image
export const handleUploadReferenceImage = async (req: MulterRequest, res: Response) => {
  try {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err.message || 'File upload failed' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded' 
        });
      }

      const { name, description, category } = req.body;

      if (!name || !category) {
        // Clean up uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'Name and category are required' 
        });
      }

      const imageData = {
        id: `uploaded-${Date.now()}`,
        name: name.trim(),
        description: description?.trim() || 'Uploaded reference image',
        url: `/uploads/reference-images/${req.file.filename}`,
        category: category,
        uploaded: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      };


      // Save image metadata to a JSON file for persistence
      await saveImageMetadata(imageData);

      res.json({
        success: true,
        image: imageData,
        message: 'Reference image uploaded successfully'
      });
    });
  } catch (error: any) {
    console.error('Upload reference image error:', error);
    res.status(500).json({ 
      error: 'Failed to upload reference image',
      details: error.message 
    });
  }
};

// Helper function to get uploaded reference images
async function getUploadedReferenceImages() {
  try {
    const metadataFile = 'uploads/reference-images/metadata.json';
    
    if (!fs.existsSync(metadataFile)) {
      return [];
    }

    const data = fs.readFileSync(metadataFile, 'utf8');
    const images = JSON.parse(data);
    
    // Filter out images that no longer exist on disk
    const existingImages = images.filter((img: any) => {
      const imagePath = `uploads/reference-images/${img.filename}`;
      return fs.existsSync(imagePath);
    });

    // Update metadata file if any images were removed
    if (existingImages.length !== images.length) {
      fs.writeFileSync(metadataFile, JSON.stringify(existingImages, null, 2));
    }

    return existingImages;
  } catch (error) {
    console.error('Error reading uploaded images metadata:', error);
    return [];
  }
}

// Helper function to save image metadata
async function saveImageMetadata(imageData: any) {
  try {
    const metadataFile = 'uploads/reference-images/metadata.json';
    const uploadDir = 'uploads/reference-images';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let images = [];
    if (fs.existsSync(metadataFile)) {
      const data = fs.readFileSync(metadataFile, 'utf8');
      images = JSON.parse(data);
    }

    images.push(imageData);
    fs.writeFileSync(metadataFile, JSON.stringify(images, null, 2));
  } catch (error) {
    console.error('Error saving image metadata:', error);
    throw error;
  }
}

// Update reference image
export const handleUpdateReferenceImage = async (req: MulterRequest, res: Response) => {
  try {
    const imageId = String(req.params.imageId);
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err.message || 'File upload failed' 
        });
      }

      if (!imageId) {
        return res.status(400).json({ 
          error: 'Image ID is required' 
        });
      }

      const { name, description, category } = req.body;

      if (!name || !category) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          error: 'Name and category are required' 
        });
      }

      // Check if this is a default image (starts with known default IDs)
      const defaultImageIds = ['icas-logo', 'manipal-logo', 'us-university', 'uk-university', 'students-group', 'campus-building'];
      const isDefaultImage = defaultImageIds.includes(imageId);

      if (isDefaultImage) {
        // For default images, create a new uploaded image to replace it
        if (!req.file) {
          return res.status(400).json({ 
            error: 'A new image file is required to replace default images' 
          });
        }

        const newImageData = {
          id: `uploaded-${Date.now()}`,
          name: name.trim(),
          description: description?.trim() || 'Replaced default image',
          url: `/uploads/reference-images/${req.file.filename}`,
          category: category,
          uploaded: true,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date().toISOString(),
          replacedDefaultId: imageId
        };


        // Save the new image metadata
        await saveImageMetadata(newImageData);

        res.json({
          success: true,
          image: newImageData,
          message: 'Default image replaced successfully with custom image'
        });
        return;
      }

      // For uploaded images, update existing
      const uploadedImages = await getUploadedReferenceImages();
      const imageToUpdate = uploadedImages.find((img: any) => img.id === imageId);

      if (!imageToUpdate) {
        // Clean up uploaded file if image not found
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ 
          error: 'Image not found' 
        });
      }

      // Delete the old image file if it exists and we're replacing it
      if (req.file && imageToUpdate.filename) {
        const oldImagePath = `uploads/reference-images/${imageToUpdate.filename}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update image data
      const updatedImageData = {
        ...imageToUpdate,
        name: name.trim(),
        description: description?.trim() || imageToUpdate.description,
        category: category,
        filename: req.file ? req.file.filename : imageToUpdate.filename,
        originalName: req.file ? req.file.originalname : imageToUpdate.originalName,
        size: req.file ? req.file.size : imageToUpdate.size,
        url: req.file ? `/uploads/reference-images/${req.file.filename}` : imageToUpdate.url,
        updatedAt: new Date().toISOString()
      };

      // Update metadata
      const updatedImages = uploadedImages.map((img: any) => 
        img.id === imageId ? updatedImageData : img
      );
      
      const metadataFile = 'uploads/reference-images/metadata.json';
      fs.writeFileSync(metadataFile, JSON.stringify(updatedImages, null, 2));

      res.json({
        success: true,
        image: updatedImageData,
        message: 'Reference image updated successfully'
      });
    });
  } catch (error: any) {
    console.error('Update reference image error:', error);
    res.status(500).json({ 
      error: 'Failed to update reference image',
      details: error.message 
    });
  }
};

// Delete uploaded reference image
export const handleDeleteReferenceImage = async (req: Request, res: Response) => {
  try {
    const imageId = String(req.params.imageId);

    if (!imageId) {
      return res.status(400).json({ 
        error: 'Image ID is required' 
      });
    }

    // Get uploaded images metadata
    const uploadedImages = await getUploadedReferenceImages();
    const imageToDelete = uploadedImages.find((img: any) => img.id === imageId);

    if (!imageToDelete) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    // Delete the image file
    const imagePath = `uploads/reference-images/${imageToDelete.filename}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove from metadata
    const updatedImages = uploadedImages.filter((img: any) => img.id !== imageId);
    const metadataFile = 'uploads/reference-images/metadata.json';
    fs.writeFileSync(metadataFile, JSON.stringify(updatedImages, null, 2));

    res.json({
      success: true,
      message: 'Reference image deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete reference image error:', error);
    res.status(500).json({ 
      error: 'Failed to delete reference image',
      details: error.message 
    });
  }
}; 