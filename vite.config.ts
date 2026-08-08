import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    // The serverless handlers in api/ are not served by Vite. Run them with
    // `vercel dev` (default port 3000) and this proxy lets `npm run dev`
    // reach /api/* instead of getting the SPA HTML back.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
