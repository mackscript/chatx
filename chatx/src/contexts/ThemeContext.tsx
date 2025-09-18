import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'dark' | 'light';

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
    root.classList.remove('theme-dark', 'theme-light');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['dark', 'light'];
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
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-gray-700',
    accent: 'from-blue-500 to-violet-600'
  },
  light: {
    name: 'Light Mode',
    icon: '☀️',
    background: 'bg-white',
    surface: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    accent: 'from-blue-500 to-violet-600'
  }
};
