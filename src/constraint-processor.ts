/**
 * Constraint Input Processor
 * 
 * Handles validation and processing of organizational constraint inputs
 * with explicit assumption tracking for missing values and enhanced error handling.
 */

import {
  ConstraintProfile,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AssumptionDisclosure,
} from './types';
import {
  CONSTRAINT_VALIDATION_CONFIG,
  DEFAULT_CONSTRAINT_VALUES,
} from './constants';
import {
  EnhancedInputValidator,
  EnhancedValidationError,
  ContradictionAnalysis,
} from './error-handling';

/**
 * Raw input interface for constraint profile creation
 * All fields are optional to handle partial inputs
 */
export interface ConstraintProfileInput {
  riskTolerance?: number;
  complianceStrictness?: number;
  costSensitivity?: number;
  userExperiencePriority?: number;
  operationalMaturity?: number;
  businessAgility?: number;
}

/**
 * Result of constraint profile processing
 */
export interface ConstraintProcessingResult {
  /** Validated and complete constraint profile */
  profile: ConstraintProfile;
  /** Validation results including errors and warnings */
  validation: ValidationResult;
  /** Assumptions made for missing or defaulted inputs */
  assumptions: AssumptionDisclosure[];
}

/**
 * Enhanced result of constraint profile processing with error handling
 */
export interface EnhancedConstraintProcessingResult extends ConstraintProcessingResult {
  /** Enhanced validation errors with detailed context */
  enhancedErrors: EnhancedValidationError[];
  /** Contradiction analysis with stakeholder alignment suggestions */
  contradictions: ContradictionAnalysis;
  /** Whether processing succeeded or required fallback */
  processingStatus: 'success' | 'partial' | 'failed';
  /** Recovery actions taken if any */
  recoveryActions: string[];
}

/**
 * Validates a single constraint value against the 1-10 scale requirement
 */
function validateConstraintValue(
  fieldName: string,
  value: unknown,
  config = CONSTRAINT_VALIDATION_CONFIG[fieldName as keyof typeof CONSTRAINT_VALIDATION_CONFIG]
): ValidationError | null {
  // Check if value is a number
  if (typeof value !== 'number') {
    return {
      field: fieldName,
      message: `${fieldName} must be a number`,
      providedValue: value,
      expectedFormat: 'number between 1 and 10',
    };
  }

  // Check if value is within valid range
  if (value < config.min || value > config.max) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${config.min} and ${config.max}`,
      providedValue: value,
      expectedFormat: `number between ${config.min} and ${config.max}`,
    };
  }

  // Check if value is an integer
  if (!Number.isInteger(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a whole number`,
      providedValue: value,
      expectedFormat: 'integer between 1 and 10',
    };
  }

  return null;
}

/**
 * Generates assumption disclosure for a defaulted field
 */
function createAssumptionDisclosure(
  fieldName: string,
  defaultValue: number,
  description: string
): AssumptionDisclosure {
  return {
    category: 'input',
    description: `${fieldName} was not provided, defaulted to ${defaultValue} (${description})`,
    impact: 'medium',
    recommendation: `Consider providing explicit ${fieldName} value based on organizational assessment`,
  };
}

/**
 * Gets the human-readable description for constraint field defaults
 */
function getDefaultDescription(fieldName: string): string {
  const descriptions: Record<string, string> = {
    riskTolerance: 'moderate risk tolerance',
    complianceStrictness: 'moderate compliance requirements',
    costSensitivity: 'moderate cost sensitivity',
    userExperiencePriority: 'balanced UX priority',
    operationalMaturity: 'moderate operational capabilities',
    businessAgility: 'moderate agility requirements',
  };
  return descriptions[fieldName] || 'moderate priority';
}

/**
 * Validates all constraint inputs and returns validation results
 */
function validateConstraintInputs(input: ConstraintProfileInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate each provided field
  Object.entries(input).forEach(([fieldName, value]) => {
    if (value !== undefined) {
      const error = validateConstraintValue(fieldName, value);
      if (error) {
        errors.push(error);
      }
    }
  });

  // Check for potential contradictory combinations (warnings only)
  if (input.riskTolerance !== undefined && input.userExperiencePriority !== undefined) {
    if (input.riskTolerance <= 3 && input.userExperiencePriority >= 8) {
      warnings.push({
        field: 'riskTolerance/userExperiencePriority',
        message: 'Low risk tolerance with high UX priority may create implementation conflicts',
        providedValue: { riskTolerance: input.riskTolerance, userExperiencePriority: input.userExperiencePriority },
        suggestion: 'Consider reviewing these priorities with stakeholders for alignment',
      });
    }
  }

  if (input.complianceStrictness !== undefined && input.costSensitivity !== undefined) {
    if (input.complianceStrictness >= 8 && input.costSensitivity >= 8) {
      warnings.push({
        field: 'complianceStrictness/costSensitivity',
        message: 'High compliance requirements with high cost sensitivity may create budget conflicts',
        providedValue: { complianceStrictness: input.complianceStrictness, costSensitivity: input.costSensitivity },
        suggestion: 'Consider budget implications of strict compliance requirements',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a complete constraint profile from partial input with explicit assumptions
 */
function createConstraintProfile(input: ConstraintProfileInput): {
  profile: ConstraintProfile;
  assumptions: AssumptionDisclosure[];
} {
  const assumptions: AssumptionDisclosure[] = [];
  const constraintFields = Object.keys(DEFAULT_CONSTRAINT_VALUES) as Array<keyof typeof DEFAULT_CONSTRAINT_VALUES>;
  
  // Track which inputs were provided vs defaulted
  let inputCompleteness = true;

  // Build the complete profile
  const profile: ConstraintProfile = {
    riskTolerance: 0,
    complianceStrictness: 0,
    costSensitivity: 0,
    userExperiencePriority: 0,
    operationalMaturity: 0,
    businessAgility: 0,
    inputCompleteness: true,
    assumptions: [],
  };

  // Process each constraint field
  constraintFields.forEach((fieldName) => {
    if (input[fieldName] !== undefined) {
      profile[fieldName] = input[fieldName]!;
    } else {
      // Use default value and create assumption
      const defaultValue = DEFAULT_CONSTRAINT_VALUES[fieldName];
      profile[fieldName] = defaultValue;
      inputCompleteness = false;
      
      assumptions.push(createAssumptionDisclosure(
        fieldName,
        defaultValue,
        getDefaultDescription(fieldName)
      ));
    }
  });

  profile.inputCompleteness = inputCompleteness;
  profile.assumptions = assumptions.map(a => a.description);

  return { profile, assumptions };
}

/**
 * Main constraint processor function
 * 
 * Validates input, applies defaults for missing values, and tracks assumptions
 * 
 * @param input - Partial constraint profile input
 * @returns Complete processing result with validation and assumptions
 */
export function processConstraintProfile(input: ConstraintProfileInput): ConstraintProcessingResult {
  // Validate the provided inputs
  const validation = validateConstraintInputs(input);
  
  // If validation failed, return early with errors
  if (!validation.isValid) {
    // Create a minimal profile for error case (all defaults)
    const { profile, assumptions } = createConstraintProfile({});
    return {
      profile,
      validation,
      assumptions,
    };
  }

  // Create complete profile with assumptions for missing inputs
  const { profile, assumptions } = createConstraintProfile(input);

  return {
    profile,
    validation,
    assumptions,
  };
}
/**
 * Enhanced constraint processor function with comprehensive error handling
 * 
 * Validates input, applies defaults for missing values, tracks assumptions,
 * detects contradictions, and provides stakeholder alignment suggestions.
 * 
 * Requirements: 5.4, 6.5 - Enhanced error handling and contradiction flagging
 * 
 * @param input - Partial constraint profile input
 * @returns Enhanced processing result with error handling and contradiction analysis
 */
export function processConstraintProfileEnhanced(input: ConstraintProfileInput): EnhancedConstraintProcessingResult {
  const validator = new EnhancedInputValidator();
  const recoveryActions: string[] = [];
  
  try {
    // Enhanced validation with contradiction detection
    const { validation, enhancedErrors, contradictions } = validator.validateConstraintInputs(input);
    
    // Determine processing status based on validation results
    let processingStatus: 'success' | 'partial' | 'failed' = 'success';
    
    if (enhancedErrors.some(e => e.blocking)) {
      processingStatus = 'failed';
      recoveryActions.push('Correct blocking validation errors before proceeding');
    } else if (enhancedErrors.length > 0 || contradictions.hasContradictions) {
      processingStatus = 'partial';
      if (enhancedErrors.length > 0) {
        recoveryActions.push('Review and address validation warnings');
      }
      if (contradictions.hasContradictions) {
        recoveryActions.push('Resolve constraint contradictions through stakeholder alignment');
      }
    }
    
    // Create constraint profile (even with errors, use defaults for missing values)
    const { profile, assumptions } = createConstraintProfile(input);
    
    // Add contradiction-related assumptions
    if (contradictions.hasContradictions) {
      const contradictionAssumptions = contradictions.contradictions.map(contradiction => ({
        category: 'input' as const,
        description: `Contradiction detected: ${contradiction.explanation}`,
        impact: contradiction.severity === 'critical' || contradiction.severity === 'high' ? 'high' as const : 'medium' as const,
        recommendation: `Address through stakeholder alignment: ${contradiction.businessImpact}`,
      }));
      assumptions.push(...contradictionAssumptions);
    }
    
    return {
      profile,
      validation,
      assumptions,
      enhancedErrors,
      contradictions,
      processingStatus,
      recoveryActions,
    };
    
  } catch (error) {
    // Handle unexpected processing errors
    const fallbackProfile = createFallbackProfile();
    const fallbackAssumptions = [{
      category: 'calculation' as const,
      description: 'Constraint processing encountered an error, using default values for all constraints',
      impact: 'high' as const,
      recommendation: 'Review input format and try again, or proceed with manual constraint evaluation',
    }];
    
    return {
      profile: fallbackProfile,
      validation: {
        isValid: false,
        errors: [{
          field: 'system',
          message: 'Unexpected error during constraint processing',
          providedValue: input,
          expectedFormat: 'valid constraint profile input',
        }],
        warnings: [],
      },
      assumptions: fallbackAssumptions,
      enhancedErrors: [{
        field: 'system',
        message: 'System error during constraint processing - using fallback defaults',
        providedValue: input,
        expectedFormat: 'valid constraint profile input',
        errorCode: 'SYSTEM_ERROR',
        severity: 'critical',
        resolutionSteps: [
          'Check input format and data types',
          'Retry with simplified input',
          'Contact system administrator if error persists',
        ],
        blocking: true,
      }],
      contradictions: {
        hasContradictions: false,
        contradictions: [],
        alignmentSuggestions: [],
        reliabilityImpact: 'high',
      },
      processingStatus: 'failed',
      recoveryActions: [
        'Review input format and correct any issues',
        'Use manual constraint evaluation if system errors persist',
        'Contact technical support for assistance',
      ],
    };
  }
}

/**
 * Create a fallback constraint profile with all default values
 */
function createFallbackProfile(): ConstraintProfile {
  return {
    riskTolerance: DEFAULT_CONSTRAINT_VALUES.riskTolerance,
    complianceStrictness: DEFAULT_CONSTRAINT_VALUES.complianceStrictness,
    costSensitivity: DEFAULT_CONSTRAINT_VALUES.costSensitivity,
    userExperiencePriority: DEFAULT_CONSTRAINT_VALUES.userExperiencePriority,
    operationalMaturity: DEFAULT_CONSTRAINT_VALUES.operationalMaturity,
    businessAgility: DEFAULT_CONSTRAINT_VALUES.businessAgility,
    inputCompleteness: false,
    assumptions: [
      'All constraint values defaulted due to processing error',
      'Manual evaluation recommended for accurate analysis',
    ],
  };
}

/**
 * Utility function to check if a constraint profile has any missing inputs
 */
export function hasIncompleteInputs(profile: ConstraintProfile): boolean {
  return !profile.inputCompleteness;
}

/**
 * Utility function to get all assumption descriptions from a profile
 */
export function getAssumptionDescriptions(profile: ConstraintProfile): string[] {
  return profile.assumptions;
}

/**
 * Validates that a complete constraint profile is internally consistent
 */
export function validateProfileConsistency(profile: ConstraintProfile): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Check for potential conflicts
  if (profile.riskTolerance <= 3 && profile.userExperiencePriority >= 8) {
    warnings.push({
      field: 'riskTolerance/userExperiencePriority',
      message: 'Low risk tolerance conflicts with high user experience priority',
      providedValue: { riskTolerance: profile.riskTolerance, userExperiencePriority: profile.userExperiencePriority },
      suggestion: 'Consider stakeholder alignment on security vs usability priorities',
    });
  }

  if (profile.complianceStrictness >= 8 && profile.costSensitivity >= 8) {
    warnings.push({
      field: 'complianceStrictness/costSensitivity',
      message: 'High compliance requirements conflict with high cost sensitivity',
      providedValue: { complianceStrictness: profile.complianceStrictness, costSensitivity: profile.costSensitivity },
      suggestion: 'Review budget allocation for compliance infrastructure requirements',
    });
  }

  if (profile.businessAgility >= 8 && profile.operationalMaturity <= 4) {
    warnings.push({
      field: 'businessAgility/operationalMaturity',
      message: 'High agility requirements may exceed current operational maturity',
      providedValue: { businessAgility: profile.businessAgility, operationalMaturity: profile.operationalMaturity },
      suggestion: 'Consider operational capability development to support agility goals',
    });
  }

  if (profile.complianceStrictness >= 8 && profile.businessAgility >= 8) {
    warnings.push({
      field: 'complianceStrictness/businessAgility',
      message: 'Strict compliance requirements may limit business agility',
      providedValue: { complianceStrictness: profile.complianceStrictness, businessAgility: profile.businessAgility },
      suggestion: 'Balance regulatory requirements with business flexibility needs',
    });
  }

  return warnings;
}