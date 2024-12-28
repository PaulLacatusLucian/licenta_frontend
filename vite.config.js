import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importă modulul `path` pentru a defini aliasuri

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Definește aliasul `@` pentru directorul `src`
    },
  },
});
