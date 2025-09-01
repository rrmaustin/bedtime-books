import StoryForm from "@/components/StoryForm";
import Link from "next/link";
import InteractiveTree from "@/components/InteractiveTree";
import NightSky from "@/components/NightSky";

export default function Page() {
  return (
    <main className="relative min-h-screen">
      {/* Floating decorative elements - removed colored circles for cleaner design */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute top-1/3 -right-10 h-56 w-56 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-amber-200/60 blur-3xl" />
      </div>
      
      <div className="relative mx-auto max-w-5xl py-8 px-6 z-10">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Your Story
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill in the details below and watch your child become the hero of their own magical bedtime adventure ✨
          </p>
        </div>
        
        <StoryForm />
      </div>
      
      {/* Interactive Tree */}
      <InteractiveTree />
      
      {/* Night Sky */}
      <NightSky />
    </main>
  );
}