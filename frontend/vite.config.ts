import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // MapLibre is intentionally isolated as a cacheable vendor chunk; the
    // application code remains small while the mapping engine loads once.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('maplibre-gl')) return 'maplibre'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
})

