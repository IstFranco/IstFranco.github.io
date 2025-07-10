import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // Porque estás usando el repo especial istfranco.github.io
  plugins: [react()],
})