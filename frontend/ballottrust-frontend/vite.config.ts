import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const target = env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

  return {
    plugins: [react(), tailwindcss()],

    server: {
      // Keeps dev requests same-origin so the browser never makes a
      // cross-origin call to the API during development. Both prefixes
      // are namespaced, so neither collides with an SPA page route.
      proxy: {
        '/api': { target, changeOrigin: true },
        '/uploads': { target, changeOrigin: true },
      },
    },
  }
})
