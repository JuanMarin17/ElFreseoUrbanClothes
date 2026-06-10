import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://46.225.21.146:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
