import { defineConfig } from 'vite'

export default defineConfig({
  base: '/QR-Decryptor/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
  }
})
