/**
 * Main type exports for SecureStack Referee
 */

// Core types
export * from './core';
export * from './validation';

// Re-export commonly used types for convenience
export type {
  ConstraintProfile,
  ArchitectureScore,
  AnalysisResult,
  ConflictWarning,
  TradeoffAnalysis,
  AssumptionDisclosure,
  ArchitectureType,
  UserPersona,
  ConfidenceLevel,
} from './core';

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationConstraints,
} from './validation';

// Re-export from constraint processor for convenience
export type { ConstraintProfileInput } from '../constraint-processor';

// Re-export from output formatter for convenience
export type { FormattedOutput } from '../output-formatter';