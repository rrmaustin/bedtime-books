import { NextRequest, NextResponse } from "next/server";
import { openai, buildSystemPrompt, buildUserPrompt } from "@/lib/ai";
import { generateStoryInput, storySchema, type Story } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = generateStoryInput.parse(body);

    // Mock mode to avoid API errors during development/demo
    if (process.env.MOCK_AI === "true") {
      const beats = [
        (n: string, t: string) => `${n} hears a gentle idea about ${t} and feels curious.`,
        (n: string, t: string) => `${n} meets a kind helper who shares a story about ${t}.`,
        (n: string, t: string) => `${n} tries a small act related to ${t} and smiles at the result.`,
        (n: string, t: string) => `${n} learns a friendly lesson about patience and ${t}.`,
        (n: string, t: string) => `${n} notices how ${t} can make friends feel safe and happy.`,
        (n: string, t: string) => `${n} practices ${t} again, a little braver this time.`,
        (n: string, t: string) => `${n} teaches someone else a tiny tip about ${t}.`,
        (n: string, t: string) => `${n} discovers that mistakes with ${t} are okay and help us grow.`,
        (n: string, t: string) => `${n} uses ${t} to solve a gentle problem before bedtime.`,
        (n: string, t: string) => `Tucked in and cozy, ${n} dreams of tomorrow and more ${t}.`,
      ];

      const mock: Story = {
        title: `${input.childName}'s ${input.topic} Adventure`,
        pages: Array.from({ length: 10 }).map((_, i) => ({
          text: beats[i % beats.length](input.childName, input.topic),
          image_prompt: `${input.illustrationStyle} -- soft cozy colors, bedtime picture book style, scene ${i + 1}`,
        })),
      };
      return NextResponse.json(storySchema.parse(mock));
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(input.age, input.minutes) },
        { role: "user", content: buildUserPrompt(input) },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    const json = JSON.parse(content) as unknown;
    const story = storySchema.parse(json);
    return NextResponse.json(story);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    // Friendly fallback story when upstream fails
    if (process.env.MOCK_AI_FALLBACK !== "false") {
      const fallback: Story = {
        title: "A Cozy Night of Kindness",
        pages: Array.from({ length: 10 }).map((_, i) => ({
          text: `On page ${i + 1}, our hero discovers small ways to be kind and brave, drifting toward sweet dreams.`,
          image_prompt: `soft watercolor, bedtime scene, stars and moon, page ${i + 1}`,
        })),
      };
      return NextResponse.json(storySchema.parse(fallback), { headers: { "x-fallback": "true" } });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
