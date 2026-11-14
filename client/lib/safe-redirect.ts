/**
 * Return `target` only if it is a same-origin path (e.g. "/portal?tab=1").
 * Absolute URLs, protocol-relative URLs ("//evil.example") and backslash
 * tricks are rejected to prevent open redirects via `?next=`.
 */
export function safeRedirectPath(target: string | null | undefined): string | null {
  if (!target) return null;
  if (!target.startsWith("/")) return null;
  if (target.startsWith("//") || target.startsWith("/\\")) return null;
  if ([...target].some((ch) => ch.charCodeAt(0) < 0x20)) return null;
  return target;
}
