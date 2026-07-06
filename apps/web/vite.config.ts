import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@libs': path.resolve(__dirname, '../../libs'),
      '@common-types': path.resolve(__dirname, '../../libs/common-types/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/chat': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/zalo': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api/v1/chat': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api/v1/web-search': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api/v1/deep-research': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api/trips': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/bookings': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})