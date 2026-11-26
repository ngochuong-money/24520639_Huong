import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 120_000, // first run may download the mongod binary
    testTimeout: 20_000,
    fileParallelism: false, // one in-memory mongod at a time
  },
});
