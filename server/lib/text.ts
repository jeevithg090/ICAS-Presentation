/**
 * Strip Markdown formatting from an LLM answer so it renders as plain text,
 * converting list markers to bullets.
 */
export function stripMarkdown(text: string): string {
  // Remove markdown bold formatting (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");

  // Remove other markdown formatting
  text = text.replace(/\*(.*?)\*/g, "$1"); // Remove italic formatting
  text = text.replace(/`(.*?)`/g, "$1"); // Remove code formatting
  text = text.replace(/#{1,6}\s*/g, ""); // Remove heading markers
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1"); // Remove link formatting, keep text

  // Clean up any remaining markdown artifacts
  text = text.replace(/\n{3,}/g, "\n\n"); // Reduce multiple newlines
  text = text.replace(/^\s*[-*]\s*/gm, "• "); // Convert markdown lists to bullet points

  return text.trim();
}

/**
 * Remove prompt-style preambles and stage directions from a generated
 * voice-over script. Falls back to the original text if cleaning leaves
 * almost nothing.
 */
export function cleanScriptOutput(script: string): string {
  // Remove common prompt-style phrases and instructions
  const promptPatterns = [
    /^.*?(?:here'?s|here is|here's) (?:a|the) (?:script|narration):\s*/i,
    /^.*?(?:script|narration):\s*/i,
    /^.*?(?:narrator|voice):\s*/i,
    /^.*?(?:[[(]upbeat[\])]|[[(]energetic[\])]|[[(]cheerful[\])])\s*/gi,
    /^.*?(?:insert picture|show image|display photo|picture of|image of)\s*/gi,
    /^.*?(?:[[(]pause[\])]|[[(]music[\])]|[[(]fade[\])])\s*/gi,
    /^.*?(?:[[(].*?[\])])\s*/g, // Remove anything in brackets/parentheses
    /^.*?(?:stage direction|instruction|note):\s*/gi,
    /^.*?(?:make sure|ensure|remember|don't forget)\s*/gi,
    /^.*?(?:the script should|the narration should|it should)\s*/gi,
    /^.*?(?:speak|say|narrate|voice over):\s*/gi,
    /^.*?(?:imagine|picture this|visualize|think about)\s*/gi,
    /^.*?(?:let me tell you about|i will describe|i'm going to talk about)\s*/gi,
    /^.*?(?:this video shows|this slideshow presents|we will explore)\s*/gi,
    /^.*?(?:welcome to|in this video|today we're going to)\s*/gi,
  ];

  let cleanedScript = script.trim();

  // Apply all cleaning patterns
  promptPatterns.forEach((pattern) => {
    cleanedScript = cleanedScript.replace(pattern, "");
  });

  // Remove multiple consecutive spaces and clean up
  cleanedScript = cleanedScript.replace(/\s+/g, " ").trim();

  // Additional cleaning for descriptive language
  cleanedScript = cleanedScript.replace(
    /^(?:imagine|picture this|visualize|think about|let me tell you|i will describe|i'm going to talk about|this video shows|this slideshow presents|we will explore|welcome to|in this video|today we're going to)\s*/gi,
    "",
  );

  // Remove any remaining introductory phrases
  cleanedScript = cleanedScript.replace(/^(?:so|now|well|alright|okay|let's|here we go)\s*/gi, "");

  // If the script is empty or too short after cleaning, return the original
  if (cleanedScript.length < 10) {
    return script.trim();
  }

  return cleanedScript;
}
