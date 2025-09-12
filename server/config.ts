import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Existing API keys
  huggingFaceToken: process.env.HUGGING_FACE_TOKEN || "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",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "sk_6f1aa4d6e0efdac06adf1fde91026ca9ad736ffb9a5620da",
  
  // New API keys for Alumni Automation
  serpApiKey: process.env.SERP_API_KEY || "7f27008676856577a9c21d70d5e36e64e972d78e6ea7133ea5629ae825216c",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "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",
  hubspotApiKey: process.env.HUBSPOT_API_KEY || "na2-bdd9-3664-43fa-968d-e37c45107224",
  phantomBusterApiKey: process.env.PHANTOMBUSTER_API_KEY || "2DcVm9VXgRBXAby7E8fYaaLyhOp0szJ34ALbzXgKRWs",
  phantomBusterPhantomId: process.env.PHANTOMBUSTER_PHANTOM_ID || "YOUR_PHANTOM_ID",
  
  // Sarvam AI API key for speech-to-text
  sarvamApiKey: process.env.SARVAM_API_KEY || "sk_ejen7r4c_F8FubugBhGW93lfrp0rvmP4L",
  
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