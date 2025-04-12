import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? 'https://scrapesquad-production.up.railway.app'
          : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}))
