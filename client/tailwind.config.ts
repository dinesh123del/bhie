import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Custom SaaS Palette
        premium: {
          light: {
            bg: '#f9fafb',
            card: '#ffffff',
            text: '#111827',
            border: 'rgba(0, 0, 0, 0.08)',
          },
          dark: {
            bg: '#0f172a',
            card: '#111827',
            text: '#f9fafb',
            border: 'rgba(255, 255, 255, 0.1)',
          }
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        bhie: {
          primary: '#5E5CE6',
          purple: '#BF5AF2',
          black: '#000000',
          surface: 'rgba(28, 28, 30, 0.7)',
          border: 'rgba(255, 255, 255, 0.12)',
          glow: 'rgba(94, 92, 230, 0.5)',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
};

export default config;
