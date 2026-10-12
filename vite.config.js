import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages (/NontendoFolio-Portifolio/)
// or any other static host without extra configuration.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
});
