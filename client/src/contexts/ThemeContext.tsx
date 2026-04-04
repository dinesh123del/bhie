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
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = window.document.documentElement;
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
      setResolvedTheme(systemTheme);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
      setResolvedTheme(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Load stored theme
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('system');
    }

    // Sync system preference listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange();

    setMounted(true);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  const ThemeToggleIcon: React.FC = () => (
    <motion.div whileHover={{ rotate: 20 }} whileTap={{ scale: 0.95 }}>
      {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.div>
  );

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    ThemeToggleIcon,
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
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

