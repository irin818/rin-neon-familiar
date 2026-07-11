import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rin-neon-familiar/',
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
})
