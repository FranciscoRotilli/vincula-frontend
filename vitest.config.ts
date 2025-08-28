import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setupTests.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
