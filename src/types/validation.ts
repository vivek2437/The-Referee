/**
 * Validation types and utilities for input processing
 */

/**
 * Validation result for constraint inputs
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** List of validation errors if any */
  errors: ValidationError[];
  /** List of warnings for potentially problematic inputs */
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message describing the issue */
  message: string;
  /** Provided value that caused the error */
  providedValue: unknown;
  /** Expected value format or range */
  expectedFormat: string;
}

/**
 * Validation warning for inputs that are valid but potentially problematic
 */
export interface ValidationWarning {
  /** Field that triggered the warning */
  field: string;
  /** Warning message */
  message: string;
  /** Provided value */
  providedValue: unknown;
  /** Suggestion for improvement */
  suggestion: string;
}

/**
 * Input validation constraints
 */
export interface ValidationConstraints {
  /** Minimum allowed value (inclusive) */
  min: number;
  /** Maximum allowed value (inclusive) */
  max: number;
  /** Whether the field is required */
  required: boolean;
  /** Custom validation function if needed */
  customValidator?: (value: number) => boolean;
}

/**
 * Validation configuration for all constraint fields
 */
export type ConstraintValidationConfig = {
  [K in keyof Omit<import('./core').ConstraintProfile, 'inputCompleteness' | 'assumptions'>]: ValidationConstraints;
};