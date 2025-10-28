import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setupTests.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    fileParallelism: false,
  },
  css: false,

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: /^@mui\/icons-material\/.*/, replacement: path.resolve(__dirname, 'test/__mocks__/mui-icon-one.tsx') },
      { find: '@mui/icons-material', replacement: path.resolve(__dirname, 'test/__mocks__/mui-icons-barrel.tsx') },
    ],
  },
});
