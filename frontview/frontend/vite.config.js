import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
 build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Removing manualChunks to avoid Rolldown binding errors
      }
    },
    chunkSizeWarningLimit: 1000
  },
 ptimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['.nip.io', '51.20.250.181.nip.io'] // í¼Ÿ YEH LINE JODNI HAI
  }
})
