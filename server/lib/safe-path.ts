import path from "path";

/**
 * Resolve `untrusted` inside `baseDir`, refusing anything that would escape it
 * (absolute paths, `..` segments, NUL bytes). Returns the absolute path, or
 * `null` when the input is unsafe.
 */
export function resolveInside(baseDir: string, untrusted: unknown): string | null {
  if (typeof untrusted !== "string" || untrusted.length === 0) return null;
  if (untrusted.includes("\0")) return null;

  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, untrusted);
  const relative = path.relative(base, resolved);

  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return resolved;
}

/**
 * Map a public `/uploads/...` URL to a file path inside `uploadsDir`.
 * Any other URL (or a traversal attempt) yields `null`.
 */
export function resolveUploadUrl(uploadsDir: string, url: unknown): string | null {
  if (typeof url !== "string" || !url.startsWith("/uploads/")) return null;
  let relative: string;
  try {
    relative = decodeURIComponent(url.slice("/uploads/".length));
  } catch {
    return null;
  }
  return resolveInside(uploadsDir, relative);
}

/**
 * Reduce a client-supplied file name to a safe basename: no directories,
 * only `[A-Za-z0-9._-]`, no leading dots, bounded length, extension kept.
 */
export function sanitizeFilename(name: unknown, fallback = "file"): string {
  const raw = typeof name === "string" ? path.basename(name.replace(/\\/g, "/")) : "";
  const ext = path.extname(raw).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 10);
  const stem = path
    .basename(raw, path.extname(raw))
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 80);
  return `${stem || fallback}${ext}`;
}
