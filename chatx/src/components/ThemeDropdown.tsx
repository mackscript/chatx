import React, { useState, useRef, useEffect } from 'react';
import { useTheme, themeConfig } from '../contexts/ThemeContext';
import type { Theme } from '../contexts/ThemeContext';

const ThemeDropdown: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const currentThemeConfig = themeConfig[theme] || themeConfig.dark;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          theme === 'light'
            ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            : 'hover:bg-gray-800 text-gray-400 hover:text-white'
        }`}
        title="Change Theme"
        aria-label="Theme selector"
      >
        <div className="flex items-center space-x-1">
          <span className="text-lg">{currentThemeConfig.icon}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-sm z-50 ${
          theme === 'light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-gray-800/95 border-gray-700'
        }`}>
          <div className="py-2">
            {(Object.keys(themeConfig) as Theme[]).map((themeKey) => {
              const config = themeConfig[themeKey];
              const isSelected = theme === themeKey;
              
              return (
                <button
                  key={themeKey}
                  onClick={() => handleThemeSelect(themeKey)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-all duration-200 ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-blue-600/10 text-blue-600'
                        : 'bg-blue-600/20 text-blue-400'
                      : theme === 'light'
                      ? 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{config.name}</div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
