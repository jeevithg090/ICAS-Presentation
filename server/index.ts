import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { ErrorRequestHandler } from "express";
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

function parseCorsOrigins(value: string | undefined): cors.CorsOptions["origin"] {
  if (!value || value.trim() === "" || value.trim() === "*") return true;
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createServer() {
  const app = express();

  app.disable("x-powered-by");

  // Security headers. CSP is left to the hosting layer because the SPA loads
  // Firebase and Google Fonts from third-party origins.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "same-site" },
    }),
  );
  app.use(cors({ origin: parseCorsOrigins(process.env.CORS_ORIGIN) }));
  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Serve generated media (videos, audio, reference images)
  app.use(
    "/uploads",
    express.static("uploads", { dotfiles: "deny", index: false, fallthrough: true }),
  );

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
  app.use("/api/alumni", alumniRoutes);

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

  // Unknown API routes return JSON instead of falling through to the SPA
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}

/**
 * Last-resort error handler: maps upload/body-parser errors to 4xx and hides
 * internal details from clients.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  const status =
    typeof err?.status === "number"
      ? err.status
      : err?.name === "MulterError"
        ? 400
        : 500;

  if (status >= 500) console.error("Unhandled server error:", err);

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err?.message || "Bad request",
  });
};
