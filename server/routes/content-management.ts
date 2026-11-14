import { RequestHandler } from "express";
import axios from "axios";
import { config } from "../config";

// OpenRouter API configuration
const OPENROUTER_API_KEY = config.openRouterApiKey;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface ContentGenerationRequest {
  type: "blog" | "social" | "video" | "image" | "document" | "presentation";
  topic: string;
  requirements: string;
  targetAudience: string;
  tone?: "professional" | "casual" | "academic" | "marketing";
  length?: "short" | "medium" | "long";
}

interface ContentGenerationResponse {
  content: any[];
  model: string;
  timestamp: string;
  totalGenerated: number;
}

interface ContentOptimizationRequest {
  content: string;
  type: string;
  targetAudience: string;
  goals: string[];
}

interface ContentOptimizationResponse {
  optimizedContent: string;
  seoScore: number;
  suggestions: string[];
  keywords: string[];
  model: string;
  timestamp: string;
}

// Generate content using OpenRouter and MCP servers
export const generateContent: RequestHandler = async (req, res) => {
  try {
    const {
      type,
      topic,
      requirements,
      targetAudience,
      tone = "professional",
      length = "medium",
    }: ContentGenerationRequest = req.body;

    if (!type || !topic || !requirements || !targetAudience) {
      return res.status(400).json({
        error: "Missing required fields: type, topic, requirements, targetAudience",
      });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "OpenRouter API key not configured",
      });
    }

    console.log(`🎨 Generating ${type} content for: ${topic}`);

    // Create comprehensive prompt for content generation
    const prompt = createContentPrompt(type, topic, requirements, targetAudience, tone, length);

    // Try multiple OpenRouter models as fallbacks
    const models = [
      "openrouter/auto", // Auto-selects best available
      "mistralai/mistral-7b-instruct:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemini-flash-1.5:free",
    ];

    let response;
    let modelUsed = "";
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);

        const openRouterResponse = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: model,
            messages: [
              {
                role: "system",
                content:
                  "You are a professional content creator for ICAS Manipal (International Centre for Applied Sciences). Create high-quality, engaging content that reflects ICAS's reputation as a leading international education institution. Always maintain professionalism and provide valuable, accurate information.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://icas-manipal.com",
              "X-Title": "ICAS Content Management",
            },
            timeout: 30000,
          },
        );

        response = openRouterResponse;
        modelUsed = model;
        break;
      } catch (error: any) {
        console.error(`OpenRouter model ${model} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!response) {
      throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
    }

    const generatedContent = response.data.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error("No content generated from OpenRouter");
    }

    // Parse and structure the generated content
    const structuredContent = parseGeneratedContent(generatedContent, type, topic, targetAudience);

    const result: ContentGenerationResponse = {
      content: structuredContent,
      model: modelUsed,
      timestamp: new Date().toISOString(),
      totalGenerated: structuredContent.length,
    };

    console.log(
      `✅ Successfully generated ${structuredContent.length} content pieces using model: ${modelUsed}`,
    );
    res.json(result);
  } catch (error: any) {
    console.error("Content generation error:", error);

    if (error.response?.data?.error) {
      return res.status(500).json({
        error: "OpenRouter API error",
        detail: error.response.data.error.message || error.response.data.error,
      });
    }

    res.status(500).json({
      error: "Failed to generate content",
      detail: error.message,
    });
  }
};

// Optimize content for SEO and engagement
export const optimizeContent: RequestHandler = async (req, res) => {
  try {
    const { content, type, targetAudience, goals }: ContentOptimizationRequest = req.body;

    if (!content || !type || !targetAudience || !goals) {
      return res.status(400).json({
        error: "Missing required fields: content, type, targetAudience, goals",
      });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "OpenRouter API key not configured",
      });
    }

    console.log(`🔧 Optimizing ${type} content for: ${targetAudience}`);

    // Create optimization prompt
    const prompt = createOptimizationPrompt(content, type, targetAudience, goals);

    // Use OpenRouter for content optimization
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content:
              "You are a professional content optimizer and SEO specialist for ICAS Manipal. Analyze content and provide specific, actionable improvements for better engagement, SEO performance, and audience appeal. Always maintain ICAS's professional standards.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.5,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://icas-manipal.com",
          "X-Title": "ICAS Content Optimization",
        },
        timeout: 30000,
      },
    );

    const optimizationResult = response.data.choices[0]?.message?.content?.trim();

    if (!optimizationResult) {
      throw new Error("No optimization result generated");
    }

    // Parse optimization results
    const parsedOptimization = parseOptimizationResult(optimizationResult, content);

    const result: ContentOptimizationResponse = {
      optimizedContent: parsedOptimization.optimizedContent,
      seoScore: parsedOptimization.seoScore,
      suggestions: parsedOptimization.suggestions,
      keywords: parsedOptimization.keywords,
      model: response.data.model || "openrouter/auto",
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Content optimization completed with SEO score: ${parsedOptimization.seoScore}`);
    res.json(result);
  } catch (error: any) {
    console.error("Content optimization error:", error);

    if (error.response?.data?.error) {
      return res.status(500).json({
        error: "OpenRouter API error",
        detail: error.response.data.error.message || error.response.data.error,
      });
    }

    res.status(500).json({
      error: "Failed to optimize content",
      detail: error.message,
    });
  }
};

// Search for content ideas and trends
export const searchContentIdeas: RequestHandler = async (req, res) => {
  try {
    const { topic, category, targetAudience } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Missing required field: topic",
      });
    }

    console.log(`🔍 Searching content ideas for: ${topic}`);

    const searchQuery = `${topic} content ideas trends ${category || ""} ${targetAudience || ""}`;
    const results = [];

    // 1. Use Brave Search API for content research
    try {
      console.log("🌐 Searching with Brave Search API...");
      const braveResults = await performBraveContentSearch(searchQuery, topic, category);
      results.push(...braveResults);
    } catch (error) {
      console.error("Brave Search error:", error);
    }

    // 2. Use SerpAPI for Google search results
    try {
      console.log("🔍 Searching with SerpAPI...");
      const serpResults = await performSerpAPIContentSearch(searchQuery, topic, category);
      results.push(...serpResults);
    } catch (error) {
      console.error("SerpAPI error:", error);
    }

    // 3. Generate AI-powered content ideas
    if (OPENROUTER_API_KEY) {
      try {
        console.log("🤖 Generating AI content ideas...");
        const aiIdeas = await generateAIContentIdeas(topic, category, targetAudience);
        results.push(...aiIdeas);
      } catch (error) {
        console.error("AI content ideas error:", error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = removeDuplicateResults(results);
    const sortedResults = uniqueResults.sort((a, b) => b.relevance - a.relevance);

    console.log(`✅ Found ${sortedResults.length} content ideas for ${topic}`);

    res.json({
      ideas: sortedResults,
      total: sortedResults.length,
      timestamp: new Date().toISOString(),
      searchQuery,
      topic,
      category,
      sources:
        results.length > 0
          ? results.some((r) => r.source.includes("Brave")) &&
            results.some((r) => r.source.includes("SerpAPI"))
            ? ["Brave Search API", "SerpAPI", "AI Generation"]
            : results.map((r) => r.source).filter((v, i, a) => a.indexOf(v) === i)
          : ["Brave Search API", "SerpAPI", "AI Generation"],
    });
  } catch (error: any) {
    console.error("Content ideas search error:", error);
    res.status(500).json({
      error: "Failed to search content ideas",
      detail: error.message,
    });
  }
};

// Create comprehensive prompt for content generation
function createContentPrompt(
  type: string,
  topic: string,
  requirements: string,
  targetAudience: string,
  tone: string,
  length: string,
): string {
  const typeContext = getTypeContext(type);
  const toneContext = getToneContext(tone);
  const lengthContext = getLengthContext(length);

  return `
You are creating ${type} content for ICAS Manipal (International Centre for Applied Sciences).

CONTEXT:
- ICAS Manipal is a leading international education institution in India
- We offer world-class programs in engineering, management, and applied sciences
- We have strong industry partnerships and international collaborations
- Our students are highly skilled and ready for global opportunities

CONTENT SPECIFICATIONS:
Type: ${typeContext}
Topic: ${topic}
Requirements: ${requirements}
Target Audience: ${targetAudience}
Tone: ${toneContext}
Length: ${lengthContext}

REQUIREMENTS:
1. Create engaging, professional content that reflects ICAS's reputation
2. Include relevant information about ${topic}
3. Address the specific requirements: ${requirements}
4. Tailor content for ${targetAudience}
5. Use ${tone} tone throughout
6. Make it ${length} in length
7. Include actionable insights and valuable information
8. Ensure content is accurate and well-researched
9. Include relevant examples and case studies where appropriate
10. End with a clear call-to-action or next steps

FORMAT:
Create multiple content variations (2-3 different approaches) for the same topic, each with:
- Title
- Introduction
- Main content sections
- Key takeaways
- Call-to-action

Please generate comprehensive, high-quality content that ICAS can use for ${type} purposes.
`;
}

// Create optimization prompt
function createOptimizationPrompt(
  content: string,
  type: string,
  targetAudience: string,
  goals: string[],
): string {
  return `
You are optimizing content for ICAS Manipal. Analyze the following content and provide specific improvements.

ORIGINAL CONTENT:
${content}

CONTENT TYPE: ${type}
TARGET AUDIENCE: ${targetAudience}
GOALS: ${goals.join(", ")}

Please provide:
1. **Optimized Content**: Improved version of the original content
2. **SEO Score**: Rate from 1-100 (include specific reasons)
3. **Suggestions**: 5-7 specific improvement recommendations
4. **Keywords**: Relevant keywords for SEO optimization

Focus on:
- Better engagement and readability
- SEO optimization
- Audience appeal
- Goal achievement
- ICAS brand alignment
- Professional quality

Format your response as:
OPTIMIZED CONTENT:
[Improved content here]

SEO SCORE: [Score]/100
[Explanation of score]

SUGGESTIONS:
1. [Specific suggestion]
2. [Specific suggestion]
...
`;
}

// Get type-specific context
function getTypeContext(type: string): string {
  switch (type) {
    case "blog":
      return "Blog Post - Educational, informative content for website";
    case "social":
      return "Social Media Content - Engaging posts for social platforms";
    case "video":
      return "Video Script - Content for video production";
    case "image":
      return "Image Content - Visual content descriptions and captions";
    case "document":
      return "Document - Formal documents and reports";
    case "presentation":
      return "Presentation - Content for slides and presentations";
    default:
      return "General Content - Multi-purpose content";
  }
}

// Get tone-specific context
function getToneContext(tone: string): string {
  switch (tone) {
    case "professional":
      return "Professional and formal tone suitable for business and academic contexts";
    case "casual":
      return "Friendly and approachable tone for social media and informal communication";
    case "academic":
      return "Academic and scholarly tone for educational content";
    case "marketing":
      return "Persuasive and engaging tone for marketing and promotional content";
    default:
      return "Professional tone suitable for ICAS communications";
  }
}

// Get length-specific context
function getLengthContext(length: string): string {
  switch (length) {
    case "short":
      return "Concise and brief (200-400 words)";
    case "medium":
      return "Moderate length (500-800 words)";
    case "long":
      return "Comprehensive and detailed (1000+ words)";
    default:
      return "Moderate length suitable for the content type";
  }
}

// Parse generated content into structured format
function parseGeneratedContent(
  content: string,
  type: string,
  topic: string,
  targetAudience: string,
): any[] {
  const variations = content.split(/(?=Title:|# )/).filter((section) => section.trim());
  const results = [];

  variations.forEach((variation, index) => {
    if (variation.trim()) {
      results.push({
        id: `content-${index + 1}`,
        title: extractTitle(variation),
        content: variation.trim(),
        type: type,
        topic: topic,
        targetAudience: targetAudience,
        status: "draft",
        createdAt: new Date().toISOString(),
        wordCount: variation.split(" ").length,
        variation: index + 1,
      });
    }
  });

  return results;
}

// Extract title from content
function extractTitle(content: string): string {
  const titleMatch = content.match(/(?:Title:|# )([^\n]+)/);
  return titleMatch ? titleMatch[1].trim() : "Generated Content";
}

// Parse optimization result
function parseOptimizationResult(result: string, originalContent: string): any {
  const optimizedMatch = result.match(/OPTIMIZED CONTENT:\s*([\s\S]*?)(?=SEO SCORE:|$)/);
  const scoreMatch = result.match(/SEO SCORE:\s*(\d+)/);
  const suggestionsMatch = result.match(/SUGGESTIONS:\s*([\s\S]*?)(?=KEYWORDS:|$)/);
  const keywordsMatch = result.match(/KEYWORDS:\s*([\s\S]*?)$/);

  return {
    optimizedContent: optimizedMatch ? optimizedMatch[1].trim() : originalContent,
    seoScore: scoreMatch ? parseInt(scoreMatch[1]) : 75,
    suggestions: suggestionsMatch
      ? suggestionsMatch[1]
          .split("\n")
          .filter((s) => s.trim())
          .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      : ["Improve readability", "Add more engaging content", "Optimize for SEO"],
    keywords: keywordsMatch
      ? keywordsMatch[1]
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k)
      : ["ICAS Manipal", "education", "professional development"],
  };
}

// Perform Brave Search for content research
async function performBraveContentSearch(query: string, topic: string, category: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&offset=0&safesearch=moderate`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": "BSA", // Free tier token
        },
      },
    );

    if (response.ok) {
      const data = await response.json();

      if (data.web && data.web.results) {
        data.web.results.forEach((result: any, index: number) => {
          results.push({
            id: `brave-content-${index + 1}`,
            title: result.title || `${topic} Content Ideas`,
            description: result.description || `Content ideas and trends for ${topic}`,
            url: result.url,
            source: "Brave Search API",
            category: "content_ideas",
            relevance: 95 - index * 3,
            data: {
              type: "content_idea",
              title: result.title,
              description: result.description,
              url: result.url,
              publishedDate: result.published_date,
              contentType: category || "general",
            },
            timestamp,
          });
        });
      }
    }
  } catch (error) {
    console.error("Brave Search API error:", error);
  }

  return results;
}

// Perform SerpAPI search for content research
async function performSerpAPIContentSearch(query: string, topic: string, category: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    if (!config.serpApiKey) {
      console.warn("SerpAPI key not configured; skipping SerpAPI content search");
      return results;
    }

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${config.serpApiKey}&engine=google&num=8&gl=us&hl=en&safe=active`,
    );

    if (response.ok) {
      const data = await response.json();

      if (data.organic_results) {
        data.organic_results.forEach((result: any, index: number) => {
          results.push({
            id: `serp-content-${index + 1}`,
            title: result.title || `${topic} Content Trends`,
            description: result.snippet || `Latest trends and ideas for ${topic} content`,
            url: result.link,
            source: "SerpAPI (Google)",
            category: "content_trends",
            relevance: 90 - index * 3,
            data: {
              type: "content_trend",
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              position: result.position,
              contentType: category || "general",
            },
            timestamp,
          });
        });
      }
    }
  } catch (error) {
    console.error("SerpAPI error:", error);
  }

  return results;
}

// Generate AI-powered content ideas
async function generateAIContentIdeas(topic: string, category: string, targetAudience: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    const prompt = `Generate 5 creative content ideas for ${topic} targeting ${targetAudience}. 
    Category: ${category || "general"}
    
    For each idea, provide:
    - Title
    - Brief description
    - Content type (blog, social, video, etc.)
    - Key points to cover
    - Target engagement
    
    Format as JSON array with these fields: title, description, type, keyPoints, engagement.`;

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content:
              "You are a creative content strategist for ICAS Manipal. Generate innovative, engaging content ideas that align with our educational mission and professional standards.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://icas-manipal.com",
          "X-Title": "ICAS Content Ideas",
        },
        timeout: 30000,
      },
    );

    const aiIdeas = response.data.choices[0]?.message?.content?.trim();

    if (aiIdeas) {
      try {
        const parsedIdeas = JSON.parse(aiIdeas);
        parsedIdeas.forEach((idea: any, index: number) => {
          results.push({
            id: `ai-idea-${index + 1}`,
            title: idea.title || `${topic} Content Idea`,
            description: idea.description || `AI-generated content idea for ${topic}`,
            source: "AI Content Generator",
            category: "ai_generated",
            relevance: 85 - index * 2,
            data: {
              type: "ai_content_idea",
              title: idea.title,
              description: idea.description,
              contentType: idea.type,
              keyPoints: idea.keyPoints,
              engagement: idea.engagement,
            },
            timestamp,
          });
        });
      } catch (parseError) {
        console.error("Error parsing AI ideas:", parseError);
      }
    }
  } catch (error) {
    console.error("AI content ideas error:", error);
  }

  return results;
}

// Remove duplicate results based on URL and title
function removeDuplicateResults(results: any[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.url || ""}-${result.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Health check for content management service
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const openRouterStatus = OPENROUTER_API_KEY ? "configured" : "not_configured";

    res.json({
      status: "healthy",
      services: {
        openrouter: openRouterStatus,
        content_generation: "available",
        seo_optimization: "available",
        content_research: "available",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
