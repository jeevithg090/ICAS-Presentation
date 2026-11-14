import path from "path";
import { describe, expect, it } from "vitest";
import { resolveInside, resolveUploadUrl, sanitizeFilename } from "./safe-path";

const base = path.resolve("/srv/app/uploads");

describe("resolveInside", () => {
  it("resolves plain and nested relative paths inside the base directory", () => {
    expect(resolveInside(base, "photo.png")).toBe(path.join(base, "photo.png"));
    expect(resolveInside(base, "videos/clip.mp4")).toBe(path.join(base, "videos", "clip.mp4"));
  });

  it.each([
    ["parent traversal", "../secret.txt"],
    ["nested traversal", "videos/../../etc/passwd"],
    ["absolute path", "/etc/passwd"],
    ["the base itself", "."],
    ["empty string", ""],
    ["NUL byte", "photo.png\0.txt"],
  ])("rejects %s", (_label, input) => {
    expect(resolveInside(base, input)).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(resolveInside(base, undefined)).toBeNull();
    expect(resolveInside(base, 42)).toBeNull();
    expect(resolveInside(base, ["a.png"])).toBeNull();
  });

  it("does not treat sibling directories with a shared prefix as inside", () => {
    expect(resolveInside(base, "../uploads-evil/file.png")).toBeNull();
  });
});

describe("resolveUploadUrl", () => {
  it("maps /uploads URLs to files under the uploads directory", () => {
    expect(resolveUploadUrl(base, "/uploads/reference-images/ref-1.png")).toBe(
      path.join(base, "reference-images", "ref-1.png"),
    );
  });

  it("decodes URL-encoded names", () => {
    expect(resolveUploadUrl(base, "/uploads/my%20photo.png")).toBe(path.join(base, "my photo.png"));
  });

  it.each([
    "/etc/passwd",
    "/placeholder.svg",
    "uploads/a.png",
    "/uploads/../server/config.ts",
    "/uploads/%2e%2e/%2e%2e/etc/passwd",
    "/uploads/%E0%A4%A",
  ])("rejects %s", (url) => {
    expect(resolveUploadUrl(base, url)).toBeNull();
  });
});

describe("sanitizeFilename", () => {
  it("keeps safe names and lowercases the extension", () => {
    expect(sanitizeFilename("campus-photo_01.JPG")).toBe("campus-photo_01.jpg");
  });

  it("strips directories, including Windows-style separators", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Users\\me\\logo.png")).toBe("logo.png");
  });

  it("replaces unsafe characters and trims leading dots", () => {
    expect(sanitizeFilename("WhatsApp Image 2025-09-11 at 11.03.35.jpeg")).toBe(
      "WhatsApp-Image-2025-09-11-at-11.03.35.jpeg",
    );
    expect(sanitizeFilename(".htaccess")).toBe("htaccess");
    expect(sanitizeFilename('<img onerror="x">.png')).toBe("img-onerror-x.png");
  });

  it("falls back when nothing usable remains", () => {
    expect(sanitizeFilename("....png", "image")).toBe("image.png");
    expect(sanitizeFilename(undefined, "logo")).toBe("logo");
  });

  it("bounds the length of the result", () => {
    expect(sanitizeFilename(`${"a".repeat(500)}.png`).length).toBeLessThanOrEqual(90);
  });
});
