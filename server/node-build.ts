import path from "path";
import express from "express";
import { createServer } from "./index";

const app = createServer();
const port = Number(process.env.PORT) || 3000;

// Serve the built SPA (dist/spa) next to the API.
const distPath = path.join(import.meta.dirname, "../spa");
app.use(express.static(distPath, { index: false }));

// SPA fallback: any non-API GET request returns index.html so client-side
// routes work on refresh. Registered as plain middleware to stay independent
// of Express 5 path-to-regexp wildcard syntax.
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

const server = app.listen(port, () => {
  console.log(`ICAS server running on http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
