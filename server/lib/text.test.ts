import { describe, expect, it } from "vitest";
import { cleanScriptOutput, stripMarkdown } from "./text";

describe("stripMarkdown", () => {
  it("removes emphasis, inline code, headings and links", () => {
    const input =
      "## Transfers\n**ICAS** offers *flexible* `2+2` paths. See [the site](https://example.com).";
    expect(stripMarkdown(input)).toBe("Transfers\nICAS offers flexible 2+2 paths. See the site.");
  });

  it("converts list markers to bullets", () => {
    expect(stripMarkdown("- USA\n- Canada")).toBe("• USA\n• Canada");
  });

  it("collapses runs of blank lines and trims", () => {
    expect(stripMarkdown("\n\nFirst\n\n\n\nSecond\n\n")).toBe("First\n\nSecond");
  });
});

describe("cleanScriptOutput", () => {
  it("removes a 'here is the script' preamble", () => {
    expect(
      cleanScriptOutput("Here is the script: ICAS opens doors to universities around the world."),
    ).toBe("ICAS opens doors to universities around the world.");
  });

  it("removes bracketed stage directions and collapses whitespace", () => {
    expect(
      cleanScriptOutput("[upbeat music]   Students   build their future at ICAS Manipal."),
    ).toBe("Students build their future at ICAS Manipal.");
  });

  it("returns the original text when cleaning would leave too little", () => {
    expect(cleanScriptOutput("  Narration: Hi  ")).toBe("Narration: Hi");
  });
});
