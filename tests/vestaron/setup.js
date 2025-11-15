/**
 * Test setup file for Vitest
 * Configures the Playwright environment for React app testing
 */

import { initializeTestEnvironment } from './helpers/test-environment.js';

// Initialize test environment before all tests
let testEnv = null;

// Export a function to get the test environment (will be initialized in beforeEach)
export async function getTestEnvironment() {
  if (!testEnv) {
    testEnv = await initializeTestEnvironment();
  }
  return testEnv;
}

// Make testEnv available globally for cleanup
global.__testEnv = () => testEnv;
