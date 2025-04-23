// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Définit le chemin de base pour les ressources sur Vercel
  server: {
    host: true, // utile pour Codespaces ou test réseau
    port: 5173
  },
  build: {
    outDir: 'dist' // Vercel attend ce dossier par défaut
  }
});
