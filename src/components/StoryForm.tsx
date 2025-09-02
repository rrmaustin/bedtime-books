"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Story } from "@/lib/schema";

const STYLE_OPTIONS = [
  "warm watercolor",
  "soft pastel crayon",
  "gentle colored pencil",
  "vintage ink & wash",
  "paper cut-out collage",
  "dreamy gouache",
  "bright marker cartoon",
] as const;

const AI_MODEL_OPTIONS = [
  { value: "openai-dalle3", label: "OpenAI DALL-E 3", description: "High quality, detailed images" },
  { value: "google-nano-banana", label: "Google Gemini 2.5 Flash", description: "Fast, cost-effective images" },
] as const;

const TOPIC_SUGGESTIONS = [
  "kindness at school",
  "making new friends",
  "sharing and caring",
  "bedtime bravery",
  "helping others",
  "learning from mistakes",
  "space adventure",
  "first day of school",
] as const;

 type FormInput = {
  childName: string;
  age: number;
  pronouns: "she/her" | "he/him" | "they/them";
  minutes: number;
  topic: string;
  illustrationStyle: (typeof STYLE_OPTIONS)[number];
  aiModel: (typeof AI_MODEL_OPTIONS)[number]["value"];
 };

export default function StoryForm() {
  const { register, handleSubmit, formState: { isSubmitting }, setValue, watch } = useForm<FormInput>({
    defaultValues: {
      pronouns: "they/them",
      minutes: 6,
      age: 5,
      illustrationStyle: "warm watercolor",
      aiModel: "openai-dalle3",
    },
  });
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[] | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const selectedStyle = watch("illustrationStyle");
  const currentTopic = watch("topic");
  const selectedModel = watch("aiModel");

  const onSubmit = async (data: FormInput) => {
    setError(null);
    setStory(null);
    try {
      const res = await fetch("/api/generate/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          age: Number(data.age),
          minutes: Number(data.minutes),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as Story;
      setStory(json);
      // Kick off image generation
      setIsGeneratingImages(true);
      setImages(null);
      const imgRes = await fetch("/api/generate/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          story: json, 
          illustrationStyle: watch("illustrationStyle"), 
          childName: watch("childName"),
          aiModel: watch("aiModel")
        }),
      });
      if (imgRes.ok) {
        const data = (await imgRes.json()) as { images: string[] };
        setImages(data.images || []);
      } else {
        const errorText = await imgRes.text();
        console.error("Image generation failed:", errorText);
        setError(`Image generation failed: ${errorText}`);
      }
      setIsGeneratingImages(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to generate story";
      setError(message);
    }
  };

  const downloadPdf = async () => {
    if (!story) return;
    const storyForPdf: Story = {
      ...story,
      pages: story.pages.map((p, idx) => ({ ...p, imageUrl: images?.[idx] || p.imageUrl })),
    };
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storyForPdf),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title || "story"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Child name</label>
          <input className="mt-1 w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("childName", { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Age</label>
          <input type="number" min={3} max={10} className="mt-1 w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("age", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Pronouns</label>
          <select className="mt-1 w-full border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("pronouns")}> 
            <option value="she/her">she/her</option>
            <option value="he/him">he/him</option>
            <option value="they/them">they/them</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Reading minutes</label>
          <input type="number" min={3} max={12} className="mt-1 w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("minutes", { valueAsNumber: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900">Topic (theme, moral, or subject)</label>
          <input className="mt-1 w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., kindness at school, learning from mistakes, space adventure" {...register("topic", { required: true })} />
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPIC_SUGGESTIONS.map((topic) => {
              const selected = (currentTopic || "").toLowerCase() === topic.toLowerCase();
              return (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setValue("topic", topic, { shouldDirty: true, shouldTouch: true })}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-900 hover:border-blue-400"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900">Illustration style</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((style) => {
              const selected = selectedStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setValue("illustrationStyle", style, { shouldDirty: true })}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white border-gray-300 text-gray-900 hover:border-purple-400"
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("illustrationStyle", { required: true })} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900">AI Image Model</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AI_MODEL_OPTIONS.map((model) => {
              const selected = selectedModel === model.value;
              return (
                <button
                  key={model.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setValue("aiModel", model.value, { shouldDirty: true })}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-900 hover:border-green-400"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs opacity-75">{model.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("aiModel", { required: true })} />
          
          {selectedModel === "google-nano-banana" && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">🚀</span>
                <div className="text-sm text-blue-800">
                  <strong>Google Gemini 2.5 Flash:</strong> Fast image generation with Gemini 2.5 Flash model.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" disabled={isSubmitting || isGeneratingImages} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {isSubmitting ? "Generating story..." : isGeneratingImages ? "Painting pictures..." : "Generate story"}
          </button>
          {story && !isGeneratingImages && images && images.length > 0 && (
            <button type="button" onClick={downloadPdf} className="px-4 py-2 bg-emerald-600 text-white rounded">
              Download PDF
            </button>
          )}
        </div>
      </form>

      {isSubmitting && (
        <div className="mt-4 flex items-center gap-2 text-purple-700">
          <span className="animate-bounce">⭐</span>
          <span className="animate-bounce [animation-delay:150ms]">⭐</span>
          <span className="animate-bounce [animation-delay:300ms]">⭐</span>
          <span className="ml-2 text-sm">Spinning up a cozy bedtime tale...</span>
        </div>
      )}

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      {story && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">{story.title}</h2>
          {isGeneratingImages && (
            <div className="mt-2 flex items-center gap-2 text-purple-700">
              <span className="animate-spin">🎨</span>
              <span className="text-sm">
                Painting pictures... {story?.pages.length || 0} pages total. This may take 2-5 minutes.
              </span>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {story.pages.map((p, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                {images?.[idx] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[idx]} alt={`Page ${idx + 1} illustration`} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-sky-100 to-amber-100 animate-pulse" />
                )}
                <div className="p-3">
                  <p className="text-gray-900 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
