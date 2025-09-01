import OpenAI from "openai";
import { z } from "zod";
import { generateStoryInput } from "./schema";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const buildSystemPrompt = (age: number, minutes: number) => `
You are a children's author for ages ${age}.
Constraints: positive, kid-safe, cozy bedtime tone.
Reading time ≈ ${minutes} minutes, short sentences, simple vocabulary.
Return ONLY valid JSON per schema: { "title": string, "pages": [{ "text": string, "image_prompt": string }] }.
`;

export const buildUserPrompt = (input: z.infer<typeof generateStoryInput>) => `
Child: ${input.childName} (${input.pronouns}), Age ${input.age}
Topic from parent (theme/moral/subject): ${input.topic}.
Derive a positive, age-appropriate theme and gentle moral from this topic that encourages kindness, resilience, and curiosity.
Structure: Title + 10 pages. Each page 1–2 sentences.
Illustration style: ${input.illustrationStyle}. Soothing palette.
Consistent recurring character using the child's name.
`;
