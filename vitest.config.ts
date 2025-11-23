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

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],

      // Exclude noisy/irrelevant files from coverage
      exclude: [
        // node/build & caches
        'node_modules/**',
        'coverage/**',
        'dist/**',
        'build/**',
        '.turbo/**',

        // Next.js output
        '.next/**',

        // Cypress e2e stuff
        'cypress/**',

        // Types & mocks
        'src/types/**',
        '**/*.d.ts',
        '**/__mocks__/**',

        // Config files
        '**/*.config.{js,ts,cjs,mjs}',
        'vitest.config.{js,ts,cjs,mjs}',
        '.eslintrc.*',

        // Misc generated / framework types
        'next-env.d.ts',
      ],
    },
  },

  css: {},

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },

      // Mock any deep import like @mui/icons-material/Add
      {
        find: /^@mui\/icons-material\/.*/,
        replacement: path.resolve(__dirname, 'test/__mocks__/mui-icon-one.tsx'),
      },
      // Mock the barrel @mui/icons-material
      {
        find: '@mui/icons-material',
        replacement: path.resolve(__dirname, 'test/__mocks__/mui-icons-barrel.tsx'),
      },
    ],
  },
})
