import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setupTests.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    // se preferir imports explícitos de describe/it/expect, mantenha globals: false
    globals: false,
  },
});
