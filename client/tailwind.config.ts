import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', ...defaultTheme.fontFamily.sans],
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', ...defaultTheme.fontFamily.sans],
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        bg: {
          DEFAULT: '#0f172a',
          muted: '#131f38',
          deep: '#020617',
          elevated: '#18243f',
        },
        surface: {
          DEFAULT: '#111827',
          muted: '#1f2937',
          soft: '#273449',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#7c3aed',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#312e81',
          900: '#1e1b4b',
        },
        ink: {
          50: '#f8fafc',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7dd3fc 0%, #60a5fa 42%, #818cf8 100%)',
        'brand-radial':
          'radial-gradient(circle at top left, rgba(125,211,252,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(129,140,248,0.14), transparent 24%), linear-gradient(145deg, #0b0f19 0%, #111827 48%, #0b0f19 100%)',
        'panel-sheen':
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 35%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        glass:
          '0 18px 48px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-hover':
          '0 22px 56px rgba(2, 6, 23, 0.34), 0 0 0 1px rgba(125, 211, 252, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'brand-glow': '0 12px 36px rgba(96, 165, 250, 0.18)',
        card: '0 12px 32px rgba(2, 6, 23, 0.26)',
        'ring-glow': '0 0 0 3px rgba(125,211,252,0.16)',
        'outer-ring-glow': '0 0 0 1px rgba(255,255,255,0.12), 0 0 24px rgba(96,165,250,0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.42', transform: 'scale(0.98)' },
          '50%': { opacity: '0.92', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(6px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(6px) rotate(-360deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(125,211,252,0.18)' },
          '50%': { boxShadow: '0 0 28px rgba(129,140,248,0.22)' },
        },
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        orbit: 'orbit 8s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
