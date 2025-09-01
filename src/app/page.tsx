import Link from "next/link";
import InteractiveTree from "@/components/InteractiveTree";
import NightSky from "@/components/NightSky";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating decorative elements - removed colored circles for cleaner design */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Removed colored circles for cleaner design */}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 pt-32">
        {/* Header/Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bedtime Books
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            Magical stories for little dreamers ✨
          </p>
        </div>

        {/* Hero section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Create Personalized Bedtime Adventures
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your child&apos;s name into the hero of their own magical story. 
              Each tale is crafted with love, featuring beautiful illustrations and 
              heartwarming lessons that make bedtime special.
            </p>
            
            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center p-4">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-800 mb-2">Beautiful Art</h3>
                <p className="text-gray-600 text-sm">Whimsical illustrations in your chosen style</p>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="text-3xl mb-3">📖</div>
                <h3 className="font-semibold text-gray-800 mb-2">Personal Stories</h3>
                <p className="text-gray-600 text-sm">Your child as the main character</p>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="text-3xl mb-3">💝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Life Lessons</h3>
                <p className="text-gray-600 text-sm">Positive values and gentle morals</p>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href="/generate"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2">✨</span>
              Start Your Story
              <span className="ml-2">✨</span>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl mb-4">1️⃣</div>
              <h4 className="font-semibold text-gray-800 mb-3">Choose Your Topic</h4>
              <p className="text-gray-600">Pick from kindness, friendship, bravery, or create your own adventure</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl mb-4">2️⃣</div>
              <h4 className="font-semibold text-gray-800 mb-3">Select Art Style</h4>
              <p className="text-gray-600">Choose from watercolor, cartoon, or classic children&apos;s book styles</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl mb-4">3️⃣</div>
              <h4 className="font-semibold text-gray-800 mb-3">Download & Enjoy</h4>
              <p className="text-gray-600">Get your personalized story as a beautiful PDF to read together</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tree */}
      <InteractiveTree />
      
      {/* Night Sky */}
      <NightSky />
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-600">
        <p className="text-sm">
          Made with 💖 for bedtime magic
        </p>
      </footer>
    </div>
  );
}
