import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer, errorHandler, parseCorsOrigins, parseTrustProxy } from "./index";

vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("createServer", () => {
  const app = createServer();

  it("answers the ping endpoint", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "ping" });
  });

  it("serves the demo endpoint with the shared response shape", async () => {
    const res = await request(app).get("/api/demo");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello from Express server" });
  });

  it("returns JSON 404s for unknown API routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("sets security headers and hides the framework", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("rejects malformed JSON bodies with a 400", async () => {
    const res = await request(app)
      .post("/api/ask-icas")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  describe("photo-to-video input validation", () => {
    it("requires at least one image", async () => {
      const res = await request(app).post("/api/photo-to-video/process-video").send({});
      expect(res.status).toBe(400);
    });

    it.each([["../../etc/passwd"], ["videos/../../server/config.ts"], ["/etc/passwd"], [42]])(
      "rejects unsafe image name %j",
      async (name) => {
        const res = await request(app)
          .post("/api/photo-to-video/process-video")
          .send({ imageFiles: ["ok.png", name] });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Invalid image file name" });
      },
    );

    it("returns 404 for unknown jobs", async () => {
      const res = await request(app).get("/api/photo-to-video/status/unknown-job");
      expect(res.status).toBe(404);
    });
  });

  it("reports Ask ICAS as unavailable when no OpenRouter key is configured", async () => {
    const res = await request(app).post("/api/ask-icas").send({ question: "What is ICAS?" });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not configured/i);
  });

  it("reports the transfer assistant as unavailable when no OpenRouter key is configured", async () => {
    const res = await request(app)
      .post("/api/transfer/assistant")
      .send({ question: "Which universities can I transfer to?" });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not configured/i);
  });

  it("validates alumni search input", async () => {
    const res = await request(app).post("/api/alumni/search-linkedin").send({ name: "" });
    expect(res.status).toBe(400);
  });

  it("returns a mock LinkedIn profile for a valid alumni search", async () => {
    const res = await request(app).post("/api/alumni/search-linkedin").send({ name: "Asha Rao" });
    expect(res.status).toBe(200);
    expect(res.body.linkedinUrl).toBe("https://linkedin.com/in/asha-rao");
  });
});

describe("rate limiting", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("throttles mutating requests but never GETs", async () => {
    vi.stubEnv("RATE_LIMIT_MAX", "2");
    vi.resetModules();
    const { createServer: createLimitedServer } = await import("./index");
    const app = createLimitedServer();

    const post = () => request(app).post("/api/alumni/search-linkedin").send({ name: "A" });
    expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(200);
    const limited = await post();
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/too many requests/i);

    for (let i = 0; i < 5; i++) {
      expect((await request(app).get("/api/ping")).status).toBe(200);
    }
  });
});

describe("errorHandler", () => {
  function appThatThrows(err: unknown) {
    const app = express();
    app.get("/boom", () => {
      throw err;
    });
    app.use(errorHandler);
    return app;
  }

  it("hides internal error details behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    const res = await request(appThatThrows(new Error("db password is hunter2"))).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });

  it("maps upload errors to 400 with their message", async () => {
    const err = Object.assign(new Error("File too large"), { name: "MulterError" });
    const res = await request(appThatThrows(err)).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "File too large" });
  });

  it("respects an explicit status on the error", async () => {
    const err = Object.assign(new Error("Payload too large"), { status: 413 });
    const res = await request(appThatThrows(err)).get("/boom");
    expect(res.status).toBe(413);
  });
});

describe("config parsing", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("parses CORS origins", () => {
    expect(parseCorsOrigins(undefined)).toBe(true);
    expect(parseCorsOrigins("*")).toBe(true);
    expect(parseCorsOrigins("https://a.example, https://b.example")).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
  });

  it("parses the trust proxy setting", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NETLIFY", "");
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy("true")).toBe(true);
    expect(parseTrustProxy("false")).toBe(false);
    expect(parseTrustProxy("2")).toBe(2);
    expect(parseTrustProxy("loopback")).toBe("loopback");
    vi.stubEnv("VERCEL", "1");
    expect(parseTrustProxy(undefined)).toBe(1);
  });
});
