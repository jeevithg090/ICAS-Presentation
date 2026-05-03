import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Existing API keys
  huggingFaceToken: process.env.HUGGING_FACE_TOKEN || "",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  
  // New API keys for Alumni Automation
  serpApiKey: process.env.SERP_API_KEY || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  hubspotApiKey: process.env.HUBSPOT_API_KEY || "",
  phantomBusterApiKey: process.env.PHANTOMBUSTER_API_KEY || "",
  phantomBusterPhantomId: process.env.PHANTOMBUSTER_PHANTOM_ID || "",
  
  // Sarvam AI API key for speech-to-text
  sarvamApiKey: process.env.SARVAM_API_KEY || "",

  // Google AI API key for Gemini
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  
  // File upload configuration
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  
  // AI model configuration
  videoModel: process.env.VIDEO_MODEL || "stabilityai/stable-video-diffusion-img2vid-xt",
  audioModel: process.env.AUDIO_MODEL || "t0WUmKMVeMLJiTULHrF7", // Custom advertising voice
  
  // Available advertising voices from ElevenLabs
  advertisingVoices: {
    custom: "t0WUmKMVeMLJiTULHrF7", // Custom advertising voice
    adam: "pNInz6obpgDQGcFmaJgB", // Professional male voice - great for advertising
    rachel: "21m00Tcm4TlvDq8ikWAM", // Professional female voice
    sam: "yoZ06aMxZJJ28mfd3POQ", // Casual male voice
    bella: "EXAVITQu4vr4xnSDxMaL" // Casual female voice
  },
  
  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests per window
}; 