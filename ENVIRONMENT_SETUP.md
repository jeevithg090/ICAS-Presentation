# Environment Setup Guide

This guide explains how to set up environment variables for the ICAS platform.

## Required Environment Variables

### Hugging Face API Token
The platform uses Hugging Face's AI models for photo-to-video generation. You need to set up your Hugging Face token:

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to your profile settings
4. Navigate to "Access Tokens"
5. Create a new token with appropriate permissions
6. Copy the token

**Token:** `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`

### ElevenLabs API Token
The platform uses ElevenLabs for AI-powered voice generation and narration. You need to set up your ElevenLabs token:

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create an account or sign in
3. Go to your profile settings
4. Navigate to "API Keys"
5. Create a new API key
6. Copy the key

**Token:** `sk_934ff060c3f818fee95b23a838f20e3c98ca469c850b0d01`

### Setting Environment Variables

#### Option 1: Create a .env file (Recommended for development)
Create a `.env` file in the root directory:

```bash
# Hugging Face API Token
HUGGING_FACE_TOKEN=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

# ElevenLabs API Token
ELEVENLABS_API_KEY=sk_934ff060c3f818fee95b23a838f20e3c98ca469c850b0d01

# Server Configuration
PORT=3000
NODE_ENV=development

# Other API Keys (if needed)
# OPENROUTER_API_KEY=your_openrouter_key_here
# GOOGLE_API_KEY=your_google_key_here

# Alumni Automation API Keys
# SERP_API_KEY=your_serp_api_key_here
# HUBSPOT_API_KEY=your_hubspot_api_key_here
```

#### Option 2: Set environment variables in your shell
```bash
export HUGGING_FACE_TOKEN=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
export ELEVENLABS_API_KEY=sk_934ff060c3f818fee95b23a838f20e3c98ca469c850b0d01
export PORT=3000
export NODE_ENV=development
```

#### Option 3: Use the config file (Current implementation)
The platform currently uses a centralized config file at `server/config.ts` that includes both API tokens as fallbacks.

## Features Enabled

With both API tokens configured, you'll have access to:

- **AI-Powered Photo-to-Video Conversion**: Transform static images into dynamic videos with smooth transitions
- **Professional Voice Narration**: Generate high-quality AI voiceovers using ElevenLabs technology
- **Custom Scripts**: Write your own narration or let AI generate contextual content
- **Video Preview**: Preview generated videos before downloading
- **Audio Preview**: Listen to generated voice narration before finalizing
- **Streaming Video & Audio**: Stream content directly in the browser
- **Advanced AI Processing**: Use state-of-the-art models for both video and audio generation
- **Alumni Automation**: Automated LinkedIn profile search, AI message generation, and HubSpot integration for alumni outreach

## Supported Models

### Video Generation (Hugging Face)
- `stabilityai/stable-video-diffusion-img2vid-xt` - For image-to-video generation
- `damo-vilab/text-to-video-ms-1.7b` - For text-to-video generation

### Voice Generation (ElevenLabs)
- **Rachel Voice**: Professional female voice (ID: 21m00Tcm4TlvDq8ikWAM)
- **Adam Voice**: Professional male voice (ID: pNInz6obpgDQGcFmaJgB)
- **Sam Voice**: Casual male voice (ID: yoZ06aMxZJJ28mfd3POQ)
- **Bella Voice**: Casual female voice (ID: EXAVITQu4vr4xnSDxMaL)

### Alumni Automation
- **SerpAPI**: LinkedIn profile search and professional information extraction
- **OpenRouter**: AI-powered message generation using free LLM models
- **HubSpot**: Contact management and messaging automation

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- For production, use proper secret management systems
- Rotate your API tokens regularly
- Both Hugging Face and ElevenLabs have rate limits; monitor your usage

## Troubleshooting

If you encounter issues:

### Hugging Face Issues
1. **Token Invalid**: Ensure your Hugging Face token is correct and has proper permissions
2. **API Rate Limits**: Hugging Face has rate limits; check your usage in the dashboard
3. **Model Loading**: Some models may take time to load on first use

### ElevenLabs Issues
1. **Token Invalid**: Ensure your ElevenLabs API key is correct
2. **Rate Limits**: ElevenLabs has usage limits; check your dashboard
3. **Voice Model**: Ensure the voice model ID is correct
4. **Text Length**: Very long scripts may exceed limits

### General Issues
1. **File Permissions**: Ensure the `uploads/` directory has proper write permissions
2. **Network Issues**: Check your internet connection for API calls
3. **Memory Issues**: Large video processing may require more server memory

### Alumni Automation Issues
1. **SerpAPI Rate Limits**: SerpAPI has usage limits; check your dashboard for remaining searches
2. **OpenRouter API**: Ensure your OpenRouter API key is valid and has sufficient credits
3. **HubSpot Integration**: Verify HubSpot API key and contact permissions
4. **LinkedIn Search**: Some profiles may be private or not indexed by search engines

## Next Steps

After setting up the environment variables:

1. Restart your development server
2. Navigate to `/administration/photo-to-video`
3. Upload some images and test the video generation
4. Test the AI voice narration feature
5. Check the browser console and server logs for any errors

For Alumni Automation:
6. Navigate to `/admin` and scroll to the Alumni Automation section
7. Enter an alumni name to test the LinkedIn search
8. Verify AI message generation works correctly
9. Test HubSpot integration (requires valid API key)

## API Usage Examples

### Generate Video
```bash
POST /api/photo-to-video/process-video
{
  "files": [{"filename": "image1.jpg", "path": "/path/to/image1.jpg"}]
}
```

### Generate Voice Narration
```bash
POST /api/photo-to-video/process-audio
{
  "jobId": "video-job-id",
  "script": "Optional custom narration script"
}
```

### Stream Generated Content
```bash
GET /api/photo-to-video/stream/{jobId}  # Video streaming
GET /api/photo-to-video/audio/{jobId}   # Audio streaming
```

### Alumni Automation

#### Search LinkedIn Profile
```bash
POST /api/alumni/search-linkedin
{
  "name": "John Smith"
}
```

#### Generate AI Message
```bash
POST /api/alumni/generate-message
{
  "name": "John Smith",
  "profile": {
    "company": "Tech Corp",
    "title": "Software Engineer"
  },
  "customMessage": "Optional custom prompt"
}
```

#### Send via HubSpot
```bash
POST /api/alumni/send-hubspot
{
  "name": "John Smith",
  "profile": {
    "company": "Tech Corp",
    "title": "Software Engineer"
  },
  "message": "Generated or custom message"
}
```

#### Get Automation Status
```bash
GET /api/alumni/status
``` 