import { defineConfig } from 'vite';

export default defineConfig({
  base: "/benchmark-ts-vs-as/",
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: "es"
  }
});
