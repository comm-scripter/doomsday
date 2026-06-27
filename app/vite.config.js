import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // GDELT doesn't send CORS headers — proxy it through Vite in dev
      '/api/gdelt': {
        target: 'https://api.gdeltproject.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/gdelt/, '/api/v2/doc/doc'),
      },
      // WHO Disease Outbreak News RSS — lacks CORS headers
      '/api/who': {
        target: 'https://www.who.int',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/who/, ''),
      },
      // GDACS disaster alerts RSS — lacks CORS headers
      '/api/gdacs': {
        target: 'https://www.gdacs.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/gdacs/, ''),
      },
    },
  },
})
