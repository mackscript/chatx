import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'ocean' | 'sunset' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('chatx-theme') as Theme;
    // Ensure the saved theme is valid, fallback to dark if not
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('chatx-theme', theme);
    
    // Apply theme to document root
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Remove previous theme classes
    root.classList.remove('theme-dark', 'theme-light', 'theme-ocean', 'theme-sunset', 'theme-forest');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['dark', 'light', 'ocean', 'sunset', 'forest'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, setTheme]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme
  }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme configurations
export const themeConfig = {
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    background: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    surface: 'bg-slate-800/50',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    border: 'border-slate-700',
    accent: 'from-violet-500 to-purple-600',
    messageOwn: 'bg-gradient-to-r from-violet-500 to-purple-600',
    messageOther: 'bg-slate-700/60 backdrop-blur-sm',
    messageOtherText: 'text-white',
    header: 'bg-slate-900/95',
    input: 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400',
    inputFocus: 'border-violet-500 ring-violet-500/20'
  },
  light: {
    name: 'Light Mode',
    icon: '☀️',
    background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
    surface: 'bg-white/80',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-slate-200',
    accent: 'from-blue-500 to-indigo-600',
    messageOwn: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    messageOther: 'bg-white/80 border border-slate-200 shadow-sm backdrop-blur-sm',
    messageOtherText: 'text-slate-900',
    header: 'bg-white/95',
    input: 'bg-white/80 border-slate-300 text-slate-900 placeholder-slate-500',
    inputFocus: 'border-blue-500 ring-blue-500/20'
  },
  ocean: {
    name: 'Ocean Blue',
    icon: '🌊',
    background: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100',
    surface: 'bg-white/80',
    text: 'text-slate-900',
    textSecondary: 'text-cyan-700',
    border: 'border-cyan-200',
    accent: 'from-cyan-500 to-blue-600',
    messageOwn: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    messageOther: 'bg-white/80 border border-cyan-200 shadow-sm backdrop-blur-sm',
    messageOtherText: 'text-slate-900',
    header: 'bg-white/95',
    input: 'bg-white/80 border-cyan-300 text-slate-900 placeholder-cyan-600',
    inputFocus: 'border-cyan-500 ring-cyan-500/20'
  },
  sunset: {
    name: 'Sunset',
    icon: '🌅',
    background: 'bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100',
    surface: 'bg-white/80',
    text: 'text-slate-900',
    textSecondary: 'text-orange-700',
    border: 'border-orange-200',
    accent: 'from-orange-500 to-pink-600',
    messageOwn: 'bg-gradient-to-r from-orange-500 to-pink-600',
    messageOther: 'bg-white/80 border border-orange-200 shadow-sm backdrop-blur-sm',
    messageOtherText: 'text-slate-900',
    header: 'bg-white/95',
    input: 'bg-white/80 border-orange-300 text-slate-900 placeholder-orange-600',
    inputFocus: 'border-orange-500 ring-orange-500/20'
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    background: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
    surface: 'bg-white/80',
    text: 'text-slate-900',
    textSecondary: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'from-emerald-500 to-green-600',
    messageOwn: 'bg-gradient-to-r from-emerald-500 to-green-600',
    messageOther: 'bg-white/80 border border-emerald-200 shadow-sm backdrop-blur-sm',
    messageOtherText: 'text-slate-900',
    header: 'bg-white/95',
    input: 'bg-white/80 border-emerald-300 text-slate-900 placeholder-emerald-600',
    inputFocus: 'border-emerald-500 ring-emerald-500/20'
  }
};
