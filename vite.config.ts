import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: { ignored: ['**/server/db.json'] },
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalizedId = id.replaceAll('\\', '/')
          const vendorPackages = ['/node_modules/vue/', '/node_modules/vue-router/', '/node_modules/pinia/', '/node_modules/axios/']

          return vendorPackages.some((packagePath) => normalizedId.includes(packagePath)) ? 'vendor' : undefined
        },
      },
    },
  },
})
