import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, Vite redirige /api al backend Express para evitar CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
