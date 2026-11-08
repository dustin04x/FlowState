import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  build: {
    outDir: '../website-dist',
    emptyOutDir: true,
  },
  server: {
    strictPort: true,
  },
})
