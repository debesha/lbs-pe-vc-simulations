import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lbs-pe-vc-simulations/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        vestaron: './vestaron.html',
        schroders: './schroders.html',
      },
    },
  },
})

