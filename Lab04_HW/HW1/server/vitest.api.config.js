import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/api/setup.js'],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
})
