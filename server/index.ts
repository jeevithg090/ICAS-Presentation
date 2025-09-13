import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleTransferAssistant } from "./routes/transfer-assistant";
import { handleAskICAS } from "./routes/ask-icas";
import { 
  handleImageUpload, 
  handleVideoProcessing, 
  handleGenerateScript,
  handleGenerateAudio,
  handleAudioStatus,
  handleAddBackgroundMusic,
  handleMixAIAudio,
  handleJobStatus, 
  handleVideoDownload,
  handleVideoStream,
  handleVideoPreview,
  handleAudioStream
} from "./routes/photo-to-video";
import {
  handleContentGeneration,
  handleLogoUpload,
  handleGetFestivals,
  handleGetAspectRatios,
  handleGetModels,
  handleContentDownload
} from "./routes/marketing-tool";

import {
  handleGeneratePost,
  handleGenerateImage,
  handleMixImages,
  handleTestConnection,
  handleTestImageGeneration,
  handleGetPostTypes,
  handleGetReferenceImages,
  handleUploadReferenceImage,
  handleUpdateReferenceImage,
  handleDeleteReferenceImage
} from "./routes/smart-marketing";

import alumniRoutes from "./routes/alumni";
import { handleDelegateSummary } from "./routes/delegate-summary";
import {
  getAccounts,
  addAccount,
  removeAccount,
  getRecentPosts,
  refreshAccountData,
  getAnalyticsSummary,
  getEngagementTrends
} from "./routes/social-media-analytics";

import {
  draftEmail,
  searchWithMCP,
  healthCheck
} from "./routes/outreach";

import {
  generateContent,
  optimizeContent,
  searchContentIdeas,
  healthCheck as contentHealthCheck
} from "./routes/content-management";

export function createServer() {
  console.log('Creating server...');
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static('uploads'));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/transfer/assistant", handleTransferAssistant);
  app.post("/api/ask-icas", handleAskICAS);

  // Photo to Video API routes
  app.post("/api/photo-to-video/upload", handleImageUpload);
  app.post("/api/photo-to-video/process-video", handleVideoProcessing);
  app.post("/api/photo-to-video/generate-script", handleGenerateScript);
  app.post("/api/photo-to-video/generate-audio", handleGenerateAudio);
  app.post("/api/photo-to-video/add-background-music", handleAddBackgroundMusic);
  app.post("/api/photo-to-video/mix-ai-audio", handleMixAIAudio);
  app.get("/api/photo-to-video/audio-status/:audioJobId", handleAudioStatus);
  app.get("/api/photo-to-video/status/:jobId", handleJobStatus);
  app.get("/api/photo-to-video/download/:jobId", handleVideoDownload);
  app.get("/api/photo-to-video/stream/:jobId", handleVideoStream);
  app.get("/api/photo-to-video/preview/:jobId", handleVideoPreview);
  app.get("/api/photo-to-video/audio/:jobId", handleAudioStream);

  // Marketing Tool API routes
  app.post("/api/marketing-tool/generate", handleContentGeneration);
  app.post("/api/marketing-tool/upload-logo", handleLogoUpload);
  app.get("/api/marketing-tool/festivals", handleGetFestivals);
  app.get("/api/marketing-tool/aspect-ratios", handleGetAspectRatios);
  app.get("/api/marketing-tool/models", handleGetModels);
  app.get("/api/marketing-tool/status/:jobId", handleJobStatus);
  app.get("/api/marketing-tool/download/:jobId", handleContentDownload);

  // Smart Marketing API routes
  app.post("/api/smart-marketing/generate-post", handleGeneratePost);
  app.post("/api/smart-marketing/generate-image", handleGenerateImage);
  app.post("/api/smart-marketing/mix-images", handleMixImages);
  app.get("/api/smart-marketing/test-connection", handleTestConnection);
  app.post("/api/smart-marketing/test-image-generation", handleTestImageGeneration);
  app.get("/api/smart-marketing/post-types", handleGetPostTypes);
  app.get("/api/smart-marketing/reference-images", handleGetReferenceImages);
  app.post("/api/smart-marketing/upload-reference-image", handleUploadReferenceImage);
  app.put("/api/smart-marketing/reference-images/:imageId", handleUpdateReferenceImage);
  app.delete("/api/smart-marketing/reference-images/:imageId", handleDeleteReferenceImage);

  // Alumni Automation API routes
  console.log('Adding alumni routes...');
  app.use("/api/alumni", alumniRoutes);
  console.log('Alumni routes added successfully');

  // Delegate Summary API route - handle raw binary data
  app.post("/api/delegate/summary", express.raw({ type: 'audio/*', limit: '50mb' }), handleDelegateSummary);

  // Social Media Analytics API routes
  app.get("/api/social-media/accounts", getAccounts);
  app.post("/api/social-media/accounts", addAccount);
  app.delete("/api/social-media/accounts/:accountId", removeAccount);
  app.get("/api/social-media/posts", getRecentPosts);
  app.post("/api/social-media/accounts/:accountId/refresh", refreshAccountData);
  app.get("/api/social-media/analytics", getAnalyticsSummary);
  app.get("/api/social-media/trends", getEngagementTrends);

  // Outreach Management API routes
  app.post("/api/outreach/draft-email", draftEmail);
  app.post("/api/outreach/search", searchWithMCP);
  app.get("/api/outreach/health", healthCheck);

  // Content Management API routes
  app.post("/api/content/generate", generateContent);
  app.post("/api/content/optimize", optimizeContent);
  app.post("/api/content/search-ideas", searchContentIdeas);
  app.get("/api/content/health", contentHealthCheck);

  return app;
}

// Start the server if this file is run directly or via tsx
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.ts')) {
  console.log('Starting server...');
  const app = createServer();
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`🚀 ICAS Server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
  });
}
