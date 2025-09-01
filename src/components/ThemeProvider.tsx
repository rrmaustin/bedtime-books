'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'day' | 'night';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('day');

  useEffect(() => {
    // Check for URL parameter override first
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme') as Theme;
    
    if (themeParam === 'day' || themeParam === 'night') {
      setTheme(themeParam);
      return;
    }

    // Otherwise, determine theme based on current time
    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour >= 18; // 6 PM to 6 AM
    setTheme(isNight ? 'night' : 'day');
  }, []);

  useEffect(() => {
    // Apply theme to body element
    const body = document.body;
    body.className = body.className.replace(/bg-gradient-to-br from-[^ ]+ via-[^ ]+ to-[^ ]+/, '');
    
    if (theme === 'night') {
      body.classList.add('bg-gradient-to-br', 'from-slate-950', 'via-blue-950', 'to-indigo-950');
    } else {
      body.classList.add('bg-gradient-to-br', 'from-amber-50', 'via-orange-50', 'to-pink-50');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
