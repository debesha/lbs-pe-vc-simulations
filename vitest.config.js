import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    // E2E tests handle their own setup via imports
    // Unit tests don't need any setup
    setupFiles: [],
    testTimeout: 10000,
    hookTimeout: 10000,
    // Enable parallel execution for faster test runs
    pool: 'threads',
    poolOptions: {
      threads: {
        // Use multiple threads for parallel execution
        maxThreads: 4,
        minThreads: 1,
      },
    },
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Run unit tests in parallel, E2E tests will run sequentially due to browser sharing
    sequence: {
      shuffle: false,
      concurrent: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});

