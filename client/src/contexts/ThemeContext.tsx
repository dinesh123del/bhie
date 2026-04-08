import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ThemeToggleIcon: React.FC;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('dark');
  const [resolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // No-op for forced dark mode
  const setTheme = useCallback(() => {}, []);
  const toggleTheme = useCallback(() => {}, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    setMounted(true);
  }, []);

  const ThemeToggleIcon: React.FC = () => null; // Hide the toggle icon logic

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    ThemeToggleIcon,
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">
          INITIALIZING_EXPERIENCE...
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

