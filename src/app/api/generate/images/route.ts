import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { imagesRequestSchema, imagesResponseSchema } from "@/lib/schema";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google AI API client for image generation using Imagen
async function generateWithGoogleAI(prompt: string): Promise<string> {
  try {
    console.log("Attempting Google AI image generation with prompt:", prompt);
    
    // Use Google's Imagen model for actual image generation
    const imageResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create a beautiful children's book illustration: ${prompt}. Style: warm, colorful, child-friendly, bedtime story illustration.`
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
    
    console.log("Google AI response status:", imageResponse.status);
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log("Google AI response data:", JSON.stringify(imageData, null, 2));
      
      // Check for image data in the response
      const candidates = imageData.candidates;
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
      const errorText = await imageResponse.text();
      console.error("Google AI API error:", errorText);
    }
    
    // If Imagen doesn't work, try Gemini with a different approach
    console.log("Trying Gemini text-to-image approach...");
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a children's book illustration as a base64 encoded image: ${prompt}`
              }
            ]
          }
        ]
      })
    });
    
    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content && (content.includes('data:image') || content.includes('base64'))) {
        return content;
      }
    }
    
    throw new Error("No image data received from Google AI");
    
  } catch (error) {
    console.error("Google AI generation failed:", error);
    
    // Fallback to a nice placeholder with better messaging
    const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="100%" height="100%" fill="#f0f9ff"/>
        <circle cx="200" cy="150" r="80" fill="#3b82f6" opacity="0.2"/>
        <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="14" fill="#1e40af">Google AI</text>
        <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">Image Generation</text>
        <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="10" fill="#6b7280">API Issue</text>
        <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="8" fill="#9ca3af">Check logs</text>
      </svg>
    `)}`;
    
    return placeholderSvg;
  }
}

export async function POST(req: NextRequest) {
  try {
    const input = imagesRequestSchema.parse(await req.json());
    const { story, illustrationStyle, childName } = input;

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
      
      try {
        let imageUrl: string;
        
        if (useGoogleAI) {
          // Use Google Nano Banana
          imageUrl = await generateWithGoogleAI(prompt);
        } else {
          // Use OpenAI DALL-E 3 (default)
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url",
          });

          if (response.data && response.data[0]?.url) {
            imageUrl = response.data[0].url;
          } else {
            throw new Error("No image URL returned");
          }
        }
        
        images.push(imageUrl);
      } catch (error) {
        console.error(`Failed to generate image for page ${i + 1}:`, error);
        // Return a placeholder image if generation fails
        const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Image failed to generate</text>
          </svg>
        `)}`;
        images.push(placeholderSvg);
      }
    }

    return NextResponse.json(imagesResponseSchema.parse({ images }));
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
