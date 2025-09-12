import type { RequestHandler } from "express";
import { readFileSync } from "fs";
import { join } from "path";

// Read the comprehensive ICAS features document
const ICAS_FEATURES_PATH = join(__dirname, "../../icasfeatures.md");
let ICAS_FEATURES_CONTENT = "";

try {
  ICAS_FEATURES_CONTENT = readFileSync(ICAS_FEATURES_PATH, "utf-8");
} catch (error) {
  console.warn("Could not read icasfeatures.md:", error);
  ICAS_FEATURES_CONTENT = "ICAS features document not available";
}

// Basic ICAS context for the AI assistant
const ICAS_CONTEXT = `
ICAS Manipal (International Centre for Applied Sciences) is a prestigious institution established in 1994, offering International Transfer Programs in Engineering.

Key Points:
- Students spend first 2 years at ICAS Manipal, then transfer to international universities
- Credit transfer program to over 100 partner universities worldwide
- Specializations: Aeronautical, Chemical, Civil, Computer Science, Electrical & Electronics, Mechanical, Mechatronics
- Cost-effective education with up to 40% savings compared to direct international enrollment
- Global job placements and successful alumni network with over 1,900 transfers
`;

// Function to clean up markdown formatting and improve text styling
function cleanAndStyleResponse(text: string): string {
  // Remove markdown bold formatting (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Remove other markdown formatting
  text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic formatting
  text = text.replace(/`(.*?)`/g, '$1'); // Remove code formatting
  text = text.replace(/#{1,6}\s*/g, ''); // Remove heading markers
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove link formatting, keep text
  
  // Clean up any remaining markdown artifacts
  text = text.replace(/\n{3,}/g, '\n\n'); // Reduce multiple newlines
  text = text.replace(/^\s*[-*]\s*/gm, '• '); // Convert markdown lists to bullet points
  
  return text.trim();
}

export const handleAskICAS: RequestHandler = async (req, res) => {
  try {
    // Hardcoded OpenRouter API key for Ask ICAS
    const key = process.env.OPENROUTER_API_KEY || "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";
    console.log('Ask ICAS API Key configured:', key ? 'Yes' : 'No');
    if (!key) {
      return res.status(500).json({ error: "Ask ICAS not configured - missing OpenRouter API key" });
    }

    const { question, context, conversationHistory } = req.body || {};
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Create a comprehensive system prompt for the ICAS assistant with sentiment analysis
    const systemPrompt = `You are a chatbot assistant for ICAS Manipal (International Centre for Applied Sciences at Manipal University).

Rules:
1. Detect the sentiment in the user's message.
   - If sentiment is Positive → reply in an encouraging, cheerful tone.
   - If sentiment is Negative → reply in an empathetic, supportive tone.
   - If sentiment is Neutral → reply in a factual and clear tone.
2. Do not output the sentiment label. Only return the final answer text.

Your role is to:
1. Provide accurate and helpful information about ICAS Manipal
2. Answer questions about programs, admission, facilities, and student life
3. Guide prospective and current students with relevant information
4. Be friendly, professional, and encouraging
5. Use the provided context to give detailed and accurate responses
6. If you don't know something specific, acknowledge it and suggest where they can find more information

Always maintain a positive and supportive tone while being informative and accurate.`;

    // Try multiple free OpenRouter models as fallbacks
    const models = [
      'mistralai/mistral-7b-instruct', // Free model
      'meta-llama/llama-3.1-8b-instruct', // Free model
      'google/gemini-pro', // Free model
      'openrouter/auto' // Auto-selects best available
    ];

    let response;
    let lastError;

    for (const model of models) {
      try {
        // Build messages array with conversation history
        const messages = [
          { role: "system", content: systemPrompt }
        ];
        
        // Add conversation history if provided
        if (conversationHistory && Array.isArray(conversationHistory)) {
          conversationHistory.forEach((msg: any) => {
            if (msg.role && msg.content) {
              messages.push({
                role: msg.role,
                content: msg.content
              });
            }
          });
        }
        
        // Add current question
        messages.push({
          role: "user",
          content: `ICAS Context: ${ICAS_CONTEXT}\n\nComprehensive ICAS Features Document:\n${ICAS_FEATURES_CONTENT}\n\nAdditional Context: ${context || 'None'}\n\nQuestion: ${question}`,
        });

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://icas-manipal.com",
            "X-Title": "ICAS Ask ICAS Assistant",
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!openRouterResponse.ok) {
          const errorText = await openRouterResponse.text();
          throw new Error(`OpenRouter API error: ${errorText}`);
        }

        const data = await openRouterResponse.json();
        let answer = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response at the moment. Please try again.";
        
        // Clean up markdown formatting and improve text styling
        answer = cleanAndStyleResponse(answer);
        
        response = { answer };
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        console.log(`Failed with model ${model}:`, error.message);
        continue; // Try next model
      }
    }

    if (!response) {
      throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
    }

    res.json(response);
  } catch (e: any) {
    console.error('Ask ICAS error:', e);
    res.status(500).json({ 
      error: e?.message || "Unknown error occurred",
      details: "Please try again or contact support if the issue persists"
    });
  }
};
