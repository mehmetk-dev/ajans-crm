import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router-dom|@tanstack[\\/]react-query)/,
              priority: 30,
            },
            {
              name: 'vendor-icons',
              test: /node_modules[\\/]lucide-react/,
              priority: 25,
            },
            {
              name: 'vendor-charts',
              test: /node_modules[\\/](recharts|d3-|victory-vendor)/,
              priority: 20,
            },
            {
              name: 'vendor-motion',
              test: /node_modules[\\/]framer-motion/,
              priority: 20,
            },
            {
              name: 'vendor-forms',
              test: /node_modules[\\/](react-hook-form|@hookform|zod)/,
              priority: 20,
            },
            {
              name: 'vendor-realtime',
              test: /node_modules[\\/](@stomp|sockjs-client)/,
              priority: 20,
            },
            {
              name: 'vendor-dnd',
              test: /node_modules[\\/]@dnd-kit/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://backend:8080',
        ws: true,
      },
    },
  },
  // @ts-expect-error - Vitest types for Vite config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
