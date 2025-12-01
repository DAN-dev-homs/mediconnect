import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Permet d'utiliser process.env pour la clé API même côté client (Note: en prod, sécurisez votre clé)
    'process.env': process.env
  }
})