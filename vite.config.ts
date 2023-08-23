import { defineConfig } from 'vitest/config'
import svgr from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react'

//https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), ],
  base: '/ton-ide/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/bridge': {
        target: 'https://ton-ide.co',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})