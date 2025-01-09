import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 200, // .2 second timeout
    coverage: {
      include: ['src/**/*.ts', '!src/**/types.ts', '!src/**/index.ts', '!src/**/*.test.ts'],
    },
  },
});
