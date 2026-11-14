import express from "express";
import axios from "axios";
import { z } from "zod";
import { config } from "../config";

const router = express.Router();

// Validation schemas
const searchLinkedInSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const generateMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profile: z
    .object({
      company: z.string().optional(),
      title: z.string().optional(),
      location: z.string().optional(),
      linkedinUrl: z.string().optional(),
    })
    .optional(),
  customMessage: z.string().optional(),
});

const sendHubSpotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profile: z
    .object({
      company: z.string().optional(),
      title: z.string().optional(),
      location: z.string().optional(),
      linkedinUrl: z.string().optional(),
    })
    .optional(),
  message: z.string().min(1, "Message is required"),
});

const sendLinkedInMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  linkedinUrl: z.string().url("Valid LinkedIn URL is required"),
  message: z.string().min(1, "Message is required"),
});

// LinkedIn Profile Search using HubSpot and manual search
router.post("/search-linkedin", async (req, res) => {
  try {
    const { name } = searchLinkedInSchema.parse(req.body);

    // For now, we'll simulate finding a LinkedIn profile
    // In a real implementation, you could:
    // 1. Use HubSpot's LinkedIn integration to search for contacts
    // 2. Use LinkedIn's official API (requires approval)
    // 3. Use a different search service

    console.log(`Searching for LinkedIn profile: ${name}`);

    // Simulate a successful LinkedIn profile search
    // In production, this would integrate with HubSpot's contact search
    const mockLinkedInUrl = `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "-")}`;

    // Mock profile data - in real implementation, this would come from HubSpot
    const mockProfile = {
      linkedinUrl: mockLinkedInUrl,
      company: "Technology Company", // Would be fetched from HubSpot
      title: "Software Engineer", // Would be fetched from HubSpot
      location: "San Francisco, CA", // Would be fetched from HubSpot
    };

    res.json(mockProfile);
  } catch (error) {
    console.error("LinkedIn search error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data" });
    }
    res.status(500).json({ error: "Failed to search LinkedIn profile" });
  }
});

// AI Message Generation using OpenRouter
router.post("/generate-message", async (req, res) => {
  try {
    const { name, profile, customMessage } = generateMessageSchema.parse(req.body);

    // Get OpenRouter API key from environment or use config default
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || config.openRouterApiKey;

    // Generate personalized message using OpenRouter
    const prompt =
      customMessage ||
      `Generate a professional, friendly message to reach out to ${name}, an ICAS alumni who works as ${profile?.title || "a professional"} at ${profile?.company || "their company"}. The message should be warm, mention their success, and invite them to engage with the alumni community. Keep it under 150 words.`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct", // Free model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates professional outreach messages for university alumni.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const generatedMessage = response.data.choices[0]?.message?.content || "";

    res.json({ message: generatedMessage.trim() });
  } catch (error) {
    console.error("Message generation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    res.status(500).json({ error: "Message generation failed" });
  }
});

// Simplified endpoint - just return success for now
router.post("/send-hubspot", async (req, res) => {
  try {
    const { name, profile, message } = sendHubSpotSchema.parse(req.body);

    console.log("HubSpot integration skipped for now:", { name, profile, message });

    // For now, just return success without actual HubSpot integration
    res.json({
      success: true,
      contactId: `contact_${Date.now()}`,
      messageId: `msg_${Date.now()}`,
      status: "skipped",
      note: "HubSpot integration will be implemented later. Profile and message data processed successfully.",
      profile: {
        name,
        company: profile?.company,
        title: profile?.title,
        message,
        linkedinUrl: profile?.linkedinUrl,
      },
    });
  } catch (error) {
    console.error("HubSpot integration error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    res.status(500).json({ error: "HubSpot integration failed" });
  }
});

// Simplified LinkedIn message endpoint
router.post("/send-linkedin-message", async (req, res) => {
  try {
    const { name, linkedinUrl, message } = sendLinkedInMessageSchema.parse(req.body);

    console.log("LinkedIn message sending skipped for now:", { name, linkedinUrl, message });

    // For now, just return success without actual LinkedIn integration
    res.json({
      success: true,
      messageId: `linkedin_msg_${Date.now()}`,
      status: "skipped",
      phantomBusterId: `campaign_${Date.now()}`,
      note: "LinkedIn message sending will be implemented later. Message generated successfully.",
      profile: {
        name,
        linkedinUrl,
        message,
      },
    });
  } catch (error) {
    console.error("LinkedIn message sending error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    res.status(500).json({ error: "Failed to send LinkedIn message" });
  }
});

// Get alumni automation status
router.get("/status", async (req, res) => {
  try {
    // This endpoint would typically fetch status from a database
    // For now, return mock data
    res.json({
      totalProcessed: 0,
      pending: 0,
      completed: 0,
      failed: 0,
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

export default router;
