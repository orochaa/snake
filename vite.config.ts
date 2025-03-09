import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * https://vitejs.dev/config/
 */

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
    strictPort: true,
    cors: false,
  },
  build: {
    target: 'ES6',
    outDir: 'dist',
    minify: 'esbuild',
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
