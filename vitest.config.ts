import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setupTests.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    // se preferir imports explícitos de describe/it/expect, mantenha globals: false
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
