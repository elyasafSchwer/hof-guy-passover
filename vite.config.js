import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base: './'` emits relative asset URLs, so the same build works on
// Vercel (served from /) and on GitHub Pages (served from /<repo-name>/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
