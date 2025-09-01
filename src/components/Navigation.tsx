'use client';

import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Navigation() {
  const { theme } = useTheme();
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${
      theme === 'night' 
        ? 'bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-indigo-950/95' 
        : 'bg-gradient-to-r from-orange-100/95 via-pink-50/95 to-purple-50/95'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-2">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">✨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:via-pink-500 group-hover:to-purple-500 transition-all duration-200">
                Bedtime Books
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">✨</span>
            </div>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className={theme === 'night' ? 'text-yellow-300' : 'text-orange-600'}>
                {theme === 'night' ? '🌙' : '☀️'}
              </span>
              <span className={theme === 'night' ? 'text-gray-300' : 'text-gray-600'}>
                {theme === 'night' ? 'Night Mode' : 'Day Mode'}
              </span>
            </div>
            <Link 
              href="/generate" 
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 hover:from-orange-500 hover:to-pink-500"
            >
              ✨ Create Story ✨
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
