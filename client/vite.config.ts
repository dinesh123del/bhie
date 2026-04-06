import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon.png', 'robots.txt'],
      manifest: {
        name: 'BHIE - Business Health Implementation Ecosystem',
        short_name: 'BHIE',
        description: 'AI-powered business analytics and health monitoring platform.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ],
  },
  esbuild: command === 'build'
    ? {
        drop: ['console', 'debugger'],
      }
    : undefined,
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('recharts')) {
            return 'charts';
          }

          if (id.includes('axios')) {
            return 'network';
          }

          if (id.includes('react-icons') || id.includes('lucide-react')) {
            return 'icons';
          }

          return undefined;
        },
      },
    },
  },
}))
