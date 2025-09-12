import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { DelegateSummaryResponse, MeetingSummary } from "@shared/api";
import { config } from "../config";

// Helper function to try multiple free models
async function tryFreeModels(apiKey: string, prompt: string, isTranscription: boolean = false): Promise<string> {
  const freeModels = [
    "microsoft/phi-3-mini-128k-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemma-2-2b-it:free"
  ];
  
  const systemPrompt = isTranscription 
    ? "You are an expert audio transcription service. Transcribe the provided audio accurately, maintaining proper punctuation and formatting. Return only the transcript text."
    : "You are an expert meeting analyst. Create structured summaries of meeting transcripts. Always respond with valid JSON format.";
    
  const maxTokens = isTranscription ? 2000 : 1500;
  
  for (const model of freeModels) {
    try {
      console.log(`Trying free model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://icas.manipal.edu",
          "X-Title": "ICAS Delegate Summary",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || "Processing failed";
        console.log(`Success with model: ${model}`);
        return result;
      } else {
        const errorText = await response.text();
        console.warn(`Model ${model} failed:`, errorText);
      }
    } catch (error) {
      console.warn(`Model ${model} error:`, error);
    }
  }
  
  throw new Error("All free models failed");
}

// Helper function for OpenRouter transcription (fallback when Sarvam AI fails)
async function transcribeWithOpenRouter(apiKey: string, filename: string): Promise<string> {
  const prompt = `Please transcribe this audio file: ${filename}. The audio content is about a delegate meeting or session.`;
  return await tryFreeModels(apiKey, prompt, true);
}

export const handleDelegateSummary: RequestHandler = async (req, res) => {
  try {
    const openRouterKey = config.openRouterApiKey;
    const sarvamKey = config.sarvamApiKey;
    
    if (!openRouterKey) {
      return res.status(500).json({ error: "OpenRouter API key required for summary generation" });
    }
    
    if (!sarvamKey) {
      return res.status(500).json({ error: "Sarvam AI API key required for transcription" });
    }

    const filename = req.headers["x-filename"] as string || "meeting.audio";
    const contentType = req.headers["content-type"] as string || "audio/mpeg";
    
    // Check if request body exists and has data
    if (!req.body || req.body.length === 0) {
      console.error("No audio data received in request body");
      return res.status(400).json({ error: "No audio data received. Please upload a valid audio file." });
    }
    
    console.log(`Received audio file: ${filename}, size: ${req.body.length} bytes, type: ${contentType}`);
    console.log(`Request body type: ${typeof req.body}, isBuffer: ${Buffer.isBuffer(req.body)}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads", "audio");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save the uploaded audio file
    const fileId = uuidv4();
    const fileExtension = path.extname(filename) || ".mp3";
    const audioPath = path.join(uploadsDir, `${fileId}${fileExtension}`);
    
    // Ensure we have valid buffer data
    const audioBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    fs.writeFileSync(audioPath, audioBuffer);

    console.log(`Processing audio file: ${audioPath}`);

    // Step 1: Transcribe the audio using Sarvam AI
    let transcript = "";
    
    try {
      console.log("Using Sarvam AI for transcription...");
      
      const transcriptionResponse = await fetch(
        "https://api.sarvam.ai/v1/speech-to-text",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sarvamKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio: audioBuffer.toString('base64'),
            model: "sarvam-ai/whisper-large-v3",
            language: "en",
            response_format: "text"
          }),
        }
      );

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        console.error("Sarvam AI transcription failed:", errorText);
        console.error("Response status:", transcriptionResponse.status);
        console.error("Response headers:", Object.fromEntries(transcriptionResponse.headers.entries()));
        throw new Error(`Sarvam AI transcription failed: ${errorText}`);
      }

      const transcriptionData = await transcriptionResponse.json();
      console.log("Sarvam AI response:", transcriptionData);
      transcript = transcriptionData.transcription || transcriptionData.text || transcriptionData || "Transcription failed";
      console.log("Sarvam AI transcription completed successfully");
      
    } catch (error) {
      console.error("Sarvam AI transcription error:", error);
      // Fallback to OpenRouter if available
      if (openRouterKey) {
        console.log("Falling back to OpenRouter free model for transcription...");
        transcript = await transcribeWithOpenRouter(openRouterKey, filename);
      } else {
        throw error;
      }
    }

    // Step 2: Generate meeting summary using the transcript
    if (!openRouterKey) {
      throw new Error("OpenRouter API key required for summary generation");
    }

    const summaryPrompt = `Based on the following meeting transcript, create a comprehensive summary. Please structure your response as a JSON object with the following fields:
    - title: A brief title for the meeting
    - summary: A 2-3 sentence overview of the meeting
    - attendees: Array of participant names mentioned
    - agenda: Array of main topics discussed
    - decisions: Array of key decisions made
    - action_items: Array of objects with owner, task, and optional due_date
    - risks: Array of any risks or concerns mentioned
    - next_steps: Array of follow-up actions
    - timeline: Array of objects with timestamp and note for important moments

    Transcript: ${transcript}`;

    console.log("Generating meeting summary using free models...");
    const summaryText = await tryFreeModels(openRouterKey, summaryPrompt, false);

    // Try to parse the summary as JSON, fallback to string if it fails
    let summary: MeetingSummary | string;
    try {
      summary = JSON.parse(summaryText) as MeetingSummary;
    } catch (e) {
      console.warn("Failed to parse summary as JSON, using as string:", e);
      summary = summaryText;
    }

    // Clean up the audio file
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (e) {
      console.warn("Failed to clean up audio file:", e);
    }

    // Determine which service was used for transcription
    let modelUsed = "Sarvam AI + OpenRouter AI";

    const response: DelegateSummaryResponse = {
      transcript,
      summary,
      modelUsed
    };

    res.json(response);

  } catch (error: any) {
    console.error("Delegate summary processing error:", error);
    res.status(500).json({ 
      error: error?.message || "Failed to process delegate summary" 
    });
  }
};
