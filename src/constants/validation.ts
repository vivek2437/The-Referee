/**
 * Validation constants and configuration
 */

import { ConstraintValidationConfig } from '../types/validation';

/**
 * Validation constraints for all constraint profile fields
 */
export const CONSTRAINT_VALIDATION_CONFIG: ConstraintValidationConfig = {
  riskTolerance: {
    min: 1,
    max: 10,
    required: false, // Can use defaults
  },
  complianceStrictness: {
    min: 1,
    max: 10,
    required: false,
  },
  costSensitivity: {
    min: 1,
    max: 10,
    required: false,
  },
  userExperiencePriority: {
    min: 1,
    max: 10,
    required: false,
  },
  operationalMaturity: {
    min: 1,
    max: 10,
    required: false,
  },
  businessAgility: {
    min: 1,
    max: 10,
    required: false,
  },
};

/**
 * Default values for missing constraint inputs
 */
export const DEFAULT_CONSTRAINT_VALUES = {
  riskTolerance: 5,
  complianceStrictness: 5,
  costSensitivity: 5,
  userExperiencePriority: 5,
  operationalMaturity: 5,
  businessAgility: 5,
} as const;

/**
 * Conflict detection thresholds and rules
 */
export const CONFLICT_DETECTION_RULES = {
  highComplianceVsLowCost: {
    complianceThreshold: 8,
    costThreshold: 8,
    conflictId: 'compliance-cost-conflict',
  },
  lowRiskToleranceVsHighUX: {
    riskToleranceThreshold: 3,
    uxPriorityThreshold: 8,
    conflictId: 'risk-ux-conflict',
  },
  highAgilityVsLowMaturity: {
    agilityThreshold: 8,
    maturityThreshold: 4,
    conflictId: 'agility-maturity-conflict',
  },
  highComplianceVsHighAgility: {
    complianceThreshold: 8,
    agilityThreshold: 8,
    conflictId: 'compliance-agility-conflict',
  },
} as const;

/**
 * Near-tie detection threshold for scoring
 */
export const NEAR_TIE_THRESHOLD = 0.5;

/**
 * System version and metadata
 */
export const SYSTEM_METADATA = {
  engineVersion: '1.0.0',
  supportedArchitectures: ['IRM-Heavy', 'URM-Heavy', 'Hybrid'] as const,
  supportedPersonas: ['CISO', 'Enterprise_Security_Architect'] as const,
} as const;