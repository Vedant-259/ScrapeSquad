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
          ? process.env.CLIENT_URL
          : `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    },
  },
}))
