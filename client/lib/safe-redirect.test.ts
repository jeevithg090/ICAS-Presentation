import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it.each(["/portal", "/administration/smart-marketing", "/portal/courses/CS101?tab=notes#top"])(
    "allows same-origin path %s",
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    "https://evil.example",
    "//evil.example/portal",
    "/\\evil.example",
    "javascript:alert(1)",
    "portal",
    "/\tportal",
    "",
    null,
    undefined,
  ])("rejects %j", (target) => {
    expect(safeRedirectPath(target)).toBeNull();
  });
});
