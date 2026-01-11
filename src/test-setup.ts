/**
 * Jest test setup configuration
 */

// Configure fast-check for property-based testing
import fc from 'fast-check';

// Set global test timeout
jest.setTimeout(10000);

// Configure fast-check global settings
fc.configureGlobal({
  numRuns: 100, // Minimum 100 iterations as specified in design
  verbose: false,
  seed: 42, // For reproducible tests during development
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidConstraintValue(): R;
      toBeValidArchitectureScore(): R;
    }
  }
}

// Custom Jest matchers for domain-specific validation
expect.extend({
  toBeValidConstraintValue(received: unknown) {
    const isValid = typeof received === 'number' && received >= 1 && received <= 10;
    return {
      message: () =>
        `expected ${received} to be a valid constraint value (number between 1 and 10)`,
      pass: isValid,
    };
  },
  
  toBeValidArchitectureScore(received: unknown) {
    const isValid = typeof received === 'number' && received >= 0 && received <= 10;
    return {
      message: () =>
        `expected ${received} to be a valid architecture score (number between 0 and 10)`,
      pass: isValid,
    };
  },
});