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
        // Futuristic Cinematic Minimalism Core
        cinematic: {
          bg: '#0A0A0A',
          primary: '#C0C0C0',     // Chrome Silver
          accent1: '#00D4FF',     // Neon Blue
          accent2: '#7B61FF',     // Electric Purple
        },
        // Legacy Mappings (Enforcing the new unified system over old names safely)
        premium: {
          light: { bg: '#0A0A0A', card: '#0A0A0A', text: '#C0C0C0', border: 'rgba(255,255,255,0.05)' },
          dark: { bg: '#0A0A0A', card: '#0A0A0A', text: '#C0C0C0', border: 'rgba(255,255,255,0.05)' }
        },
        brand: {
          50: '#0A0A0A', 100: '#0A0A0A', 200: '#111111', 300: '#C0C0C0', 400: '#00D4FF',
          500: '#00D4FF', 600: '#7B61FF', 700: '#7B61FF', 800: '#0A0A0A', 900: '#0A0A0A',
        },
        bhie: {
          primary: '#00D4FF',
          purple: '#7B61FF',
          black: '#0A0A0A',
          surface: 'rgba(10, 10, 10, 0.7)',
          border: 'rgba(255, 255, 255, 0.05)',
          glow: 'rgba(0, 212, 255, 0.5)',
        }
      },
      backgroundImage: {
         'gradient-cinematic': 'linear-gradient(135deg, #00D4FF 0%, #7B61FF 100%)',
      },
      borderRadius: {
        'xl': '1rem', // 16px radius standard
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 212, 255, 0.05)',
        'premium-hover': '0 20px 40px -15px rgba(0, 212, 255, 0.15)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(123, 97, 255, 0.3)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '300': '300ms',
        '600': '600ms',
      }
    },
  },
  plugins: [],
};

export default config;
