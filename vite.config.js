// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Important pour que les assets soient trouvés après build
  server: {
    host: true, // utile pour Codespaces ou test réseau
    port: 5173
  },
  build: {
    outDir: 'dist' // Vercel attend ce dossier par défaut
  }
});
