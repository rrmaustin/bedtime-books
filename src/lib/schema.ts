import { z } from "zod";

export const generateStoryInput = z.object({
  childName: z.string().min(1),
  age: z.number().int().min(3).max(10),
  pronouns: z.enum(["she/her", "he/him", "they/them"]),
  minutes: z.number().int().min(3).max(12),
  topic: z.string().min(2),
  illustrationStyle: z.string().default("warm watercolor"),
});

export const pageSchema = z.object({
  text: z.string().min(1).max(220),
  image_prompt: z.string().min(5).max(400),
  imageUrl: z.string().url().optional(),
});

export const storySchema = z.object({
  title: z.string().min(2).max(80),
  pages: z.array(pageSchema).min(8).max(12),
});

export type Story = z.infer<typeof storySchema>;

// Image generation API contracts
export const imagesRequestSchema = z.object({
  story: storySchema,
  illustrationStyle: z.string().min(2),
  childName: z.string().min(1).optional(),
});

export const imagesResponseSchema = z.object({
  images: z.array(z.string()), // data URLs ordered by page index
});
