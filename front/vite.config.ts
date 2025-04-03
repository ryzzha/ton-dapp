import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: {
    global: 'globalThis', // Робить global доступним, як у Node.js
  },
  resolve: {
    alias: {
      buffer: 'buffer', // Використовуємо npm-пакет buffer
    },
  },
})