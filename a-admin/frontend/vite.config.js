import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,          // allows access from other devices on network
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost', // tells browser where to find the WebSocket
      port: 5173,
    },
  },

})
