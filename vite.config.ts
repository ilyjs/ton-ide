import { defineConfig } from 'vitest/config'
import svgr from 'vite-plugin-svgr'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

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
  },
})

// import AutoImport from 'unplugin-auto-import/vite'
//
// export default defineConfig({
//   plugins: [
//     AutoImport({
//       imports: ['vitest'],
//       dts: true, // generate TypeScript declaration
//     }),
//   ],
// })
