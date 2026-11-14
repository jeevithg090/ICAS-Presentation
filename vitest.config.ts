import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    environment: "node",
    include: ["{client,server,shared}/**/*.test.{ts,tsx}"],
    // Keep tests independent of any developer .env file.
    env: {
      OPENROUTER_API_KEY: "",
      GOOGLE_API_KEY: "",
      SERP_API_KEY: "",
      HUBSPOT_API_KEY: "",
    },
  },
});
