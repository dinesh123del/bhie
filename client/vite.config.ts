import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://your-backend.onrender.com',
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
