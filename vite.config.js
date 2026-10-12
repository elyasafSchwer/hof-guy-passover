import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base: './'` emits relative asset URLs, so the build works both at a domain
// root (Vercel) and under any sub-path, without rebuilding. Safe here because
// the app is a single page with no router.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
