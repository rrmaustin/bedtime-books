import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { imagesRequestSchema, imagesResponseSchema } from "@/lib/schema";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google AI API client for Gemini 2.5 Flash Image (Nano Banana) model
async function generateWithGoogleAI(prompt: string): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    
    // Use the correct model name for Gemini 2.5 Flash Image (Nano Banana)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create the image generation request
    const result = await model.generateContent([
      {
        text: `Generate a children's book illustration: ${prompt}`,
      },
    ]);
    
    const response = await result.response;
    
    // Handle the response - Google AI typically returns base64 encoded images
    const imageData = response.text();
    
    // If it's already a data URL, return it
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's base64 without the data URL prefix, add it
    if (imageData && !imageData.startsWith('data:')) {
      return `data:image/png;base64,${imageData}`;
    }
    
    throw new Error("Invalid image data received from Google AI");
  } catch (error) {
    console.error("Google AI generation failed:", error);
    throw error;
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
