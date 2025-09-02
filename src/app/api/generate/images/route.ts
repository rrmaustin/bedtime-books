import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { imagesRequestSchema, imagesResponseSchema } from "@/lib/schema";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google AI API client for image generation using Gemini 2.5 Flash
async function generateWithGoogleAI(prompt: string): Promise<string> {
  try {
    console.log("Attempting Google AI image generation with prompt:", prompt);
    
    // Get environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error("Google AI API key not found in environment variables");
    }
    
    console.log("Using Google AI API key:", apiKey ? "Found" : "Missing");
    
    // Try the direct Gemini API first (simpler approach)
    console.log("Trying direct Gemini API...");
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a children's book illustration: ${prompt}. Return the image as base64 data.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    console.log("Gemini API response status:", geminiResponse.status);
    
    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      console.log("Gemini API response data:", JSON.stringify(geminiData, null, 2));
      
      // Check for image data in the response
      const candidates = geminiData.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts && parts.length > 0) {
          const part = parts[0];
          
          // Check if it's an inline data image
          if (part.inlineData && part.inlineData.mimeType && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType;
            const base64Data = part.inlineData.data;
            return `data:${mimeType};base64,${base64Data}`;
          }
          
          // Check if it's a text response with image data
          if (part.text && (part.text.includes('data:image') || part.text.includes('base64'))) {
            return part.text;
          }
        }
      }
    } else {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
    }
    
    throw new Error("No image data received from Google AI");
    
  } catch (error) {
    console.error("Google AI generation failed:", error);
    throw error; // Re-throw to trigger OpenAI fallback
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== IMAGE GENERATION START ===");
    const input = imagesRequestSchema.parse(await req.json());
    const { story, illustrationStyle, childName } = input;
    
    console.log("Input received:", {
      storyTitle: story.title,
      pagesCount: story.pages?.length,
      illustrationStyle,
      childName,
      aiModel: input.aiModel
    });

    // Mock image generation
    if (process.env.MOCK_IMAGES === "true") {
      const mockImages = story.pages.map((_, i) => {
        const colors = ["#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f87171"];
        const color = colors[i % colors.length];
        return `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="${color}"/>
            <circle cx="200" cy="150" r="50" fill="white" opacity="0.3"/>
            <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="16" fill="white">Mock Image ${i + 1}</text>
          </svg>
        `)}`;
      });

      return NextResponse.json(imagesResponseSchema.parse({ images: mockImages }));
    }

    // Choose image generation model based on request or environment variable
    const requestModel = input.aiModel;
    const imageModel = requestModel || process.env.IMAGE_MODEL || "openai-dalle3"; // Default to OpenAI
    const useGoogleAI = imageModel === "google-nano-banana";
    
    console.log(`Using image generation model: ${imageModel} (requested: ${requestModel})`);
    console.log("Environment variables:", {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "SET" : "MISSING",
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? "SET" : "MISSING",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "SET" : "MISSING",
      MOCK_IMAGES: process.env.MOCK_IMAGES
    });
    
    // Real image generation
    const images: string[] = [];
    
    // Create a consistent character description with specific details
    const characterDescription = `main character ${childName || story.title}, a young child with consistent appearance: same hair style and color, same facial features, same clothing style, same age and build throughout the story. The character should be the same person in every image.`;
    
    // Create a consistent art style description
    const artStyleDescription = `${illustrationStyle} children's picture book illustration style, warm and cozy bedtime atmosphere, soft lighting, gentle colors, child-friendly, safe and appropriate for young children`;
    
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i];
      const imagePrompt = page.image_prompt || `page ${i + 1} of the story`;
      const prompt = `${artStyleDescription}, ${characterDescription}, scene: ${imagePrompt}, no sleeping children in beds unless specifically mentioned in the story text, focus on the main character's actions and emotions`;
      
      console.log(`\n--- Generating image for page ${i + 1} ---`);
      console.log("Image prompt:", imagePrompt);
      console.log("Full prompt:", prompt);
      
      try {
        let imageUrl: string;
        
        if (useGoogleAI) {
          // Try Google AI first, fallback to OpenAI if it fails
          try {
            console.log(`Attempting Google AI for page ${i + 1}...`);
            imageUrl = await generateWithGoogleAI(prompt);
            console.log(`✅ Google AI generated image for page ${i + 1}:`, imageUrl.substring(0, 100) + "...");
          } catch (googleError) {
            console.log(`❌ Google AI failed for page ${i + 1}, falling back to OpenAI:`, googleError);
            // Fallback to OpenAI
            console.log(`Attempting OpenAI fallback for page ${i + 1}...`);
            const response = await openai.images.generate({
              model: "dall-e-3",
              prompt,
              n: 1,
              size: "1024x1024",
              response_format: "url",
            });

            if (response.data && response.data[0]?.url) {
              imageUrl = response.data[0].url;
              console.log(`✅ OpenAI fallback generated image for page ${i + 1}:`, imageUrl.substring(0, 100) + "...");
            } else {
              throw new Error("No image URL returned from OpenAI fallback");
            }
          }
        } else {
          // Use OpenAI DALL-E 3 (default)
          console.log(`Attempting OpenAI for page ${i + 1}...`);
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url",
          });

          if (response.data && response.data[0]?.url) {
            imageUrl = response.data[0].url;
            console.log(`✅ OpenAI generated image for page ${i + 1}:`, imageUrl.substring(0, 100) + "...");
          } else {
            throw new Error("No image URL returned");
          }
        }
        
        images.push(imageUrl);
        console.log(`✅ Successfully added image ${i + 1} to array`);
      } catch (error) {
        console.error(`❌ Failed to generate image for page ${i + 1}:`, error);
        // Return a placeholder image if generation fails
        const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Image failed to generate</text>
          </svg>
        `)}`;
        images.push(placeholderSvg);
        console.log(`⚠️ Added placeholder image for page ${i + 1}`);
      }
    }
    
    console.log(`\n=== IMAGE GENERATION COMPLETE ===`);
    console.log(`Generated ${images.length} images`);
    console.log("First image preview:", images[0]?.substring(0, 100) + "...");

    return NextResponse.json(imagesResponseSchema.parse({ images }));
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
