import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config de capture uniquement (hors build applicatif Devvit).
export default defineConfig({
  root: 'capture',
  base: './',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
