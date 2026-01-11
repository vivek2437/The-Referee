/**
 * Error Handling Tests
 * 
 * Tests for enhanced input validation, processing error recovery,
 * and graceful degradation functionality.
 */

import {
  EnhancedInputValidator,
  ProcessingErrorHandler,
  ErrorHandlingUtils,
} from './error-handling';
import { ConstraintProfileInput } from './constraint-processor';

describe('Enhanced Input Validator', () => {
  let validator: EnhancedInputValidator;

  beforeEach(() => {
    validator = new EnhancedInputValidator();
  });

  describe('Input Validation', () => {
    it('should validate correct inputs without errors', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 5,
        complianceStrictness: 7,
        costSensitivity: 3,
        userExperiencePriority: 6,
        operationalMaturity: 8,
        businessAgility: 4,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.enhancedErrors).toHaveLength(0);
      expect(result.contradictions.hasContradictions).toBe(false);
    });

    it('should detect invalid input types with enhanced error details', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 'invalid' as any,
        complianceStrictness: 5,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors).toHaveLength(1);
      
      const error = result.enhancedErrors[0]!;
      expect(error.errorCode).toBe('INVALID_TYPE');
      expect(error.severity).toBe('high');
      expect(error.blocking).toBe(true);
      expect(error.resolutionSteps).toContain(
        'Provide a numeric value for Risk Tolerance'
      );
    });

    it('should detect out of range values with clear error messages', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 15,
        complianceStrictness: -2,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors).toHaveLength(2);
      
      const riskError = result.enhancedErrors.find(e => e.field === 'riskTolerance');
      expect(riskError?.errorCode).toBe('OUT_OF_RANGE');
      expect(riskError?.message).toContain('must be between 1 and 10');
      expect(riskError?.providedValue).toBe(15);
    });

    it('should detect non-integer values with appropriate severity', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 5.5,
        complianceStrictness: 7.2,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors).toHaveLength(2);
      
      const error = result.enhancedErrors[0]!;
      expect(error.errorCode).toBe('NOT_INTEGER');
      expect(error.severity).toBe('medium');
      expect(error.blocking).toBe(false);
    });
  });

  describe('Contradiction Detection', () => {
    it('should detect high compliance vs low cost contradiction', () => {
      const input: ConstraintProfileInput = {
        complianceStrictness: 9,
        costSensitivity: 9,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.contradictions.hasContradictions).toBe(true);
      expect(result.contradictions.contradictions).toHaveLength(1);
      
      const contradiction = result.contradictions.contradictions[0]!;
      expect(contradiction.contradictionId).toBe('compliance-cost-conflict');
      expect(contradiction.severity).toBe('high');
      expect(contradiction.conflictingConstraints).toContain('complianceStrictness');
      expect(contradiction.conflictingConstraints).toContain('costSensitivity');
    });

    it('should detect low risk tolerance vs high UX priority contradiction', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 2,
        userExperiencePriority: 9,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.contradictions.hasContradictions).toBe(true);
      
      const contradiction = result.contradictions.contradictions[0]!;
      expect(contradiction.contradictionId).toBe('risk-ux-conflict');
      expect(contradiction.explanation).toContain('Low risk tolerance requires strong security controls');
    });

    it('should provide stakeholder alignment suggestions for contradictions', () => {
      const input: ConstraintProfileInput = {
        complianceStrictness: 8,
        costSensitivity: 8,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.contradictions.alignmentSuggestions).toHaveLength(1);
      
      const suggestion = result.contradictions.alignmentSuggestions[0]!;
      expect(suggestion.stakeholderGroup).toBe('Executive Leadership & Compliance Team');
      expect(suggestion.priority).toBe('high');
      expect(suggestion.discussionTopics).toContain('Budget allocation for compliance infrastructure');
    });

    it('should detect multiple contradictions', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 2,
        complianceStrictness: 9,
        costSensitivity: 9,
        userExperiencePriority: 9,
        businessAgility: 9,
        operationalMaturity: 3,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.contradictions.hasContradictions).toBe(true);
      expect(result.contradictions.contradictions.length).toBeGreaterThan(1);
      expect(result.contradictions.reliabilityImpact).toBe('high');
    });
  });

  describe('Validation Warnings', () => {
    it('should generate warnings for extreme values', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 1,
        complianceStrictness: 10,
      };

      const result = validator.validateConstraintInputs(input);

      expect(result.validation.warnings.length).toBeGreaterThan(0);
      
      const extremeWarnings = result.validation.warnings.filter(w => 
        w.message.includes('minimum value') || w.message.includes('maximum value')
      );
      expect(extremeWarnings.length).toBe(2);
    });

    it('should generate warnings for missing critical inputs', () => {
      const input: ConstraintProfileInput = {
        costSensitivity: 5,
      };

      const result = validator.validateConstraintInputs(input);

      const missingWarnings = result.validation.warnings.filter(w => 
        w.message.includes('not provided')
      );
      expect(missingWarnings.length).toBeGreaterThan(0);
    });
  });
});

describe('Processing Error Handler', () => {
  let errorHandler: ProcessingErrorHandler;

  beforeEach(() => {
    errorHandler = new ProcessingErrorHandler();
  });

  describe('Scoring Failure Handling', () => {
    it('should create fallback analysis for scoring failures', () => {
      const error = new Error('Calculation failed');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const result = errorHandler.handleScoringFailure(error, constraints);

      expect(result.isFallback).toBe(true);
      expect(result.fallbackReason).toContain('Scoring calculation failure');
      expect(result.availableFunctionality).toContain('Basic architecture comparison');
      expect(result.unavailableFunctionality).toContain('Weighted scoring calculations');
      expect(result.triggeringError?.component).toBe('scoring-calculator');
      expect(result.triggeringError?.recoverable).toBe(true);
    });
  });

  describe('Conflict Detection Failure Handling', () => {
    it('should create fallback analysis for conflict detection failures', () => {
      const error = new Error('Conflict detection failed');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const result = errorHandler.handleConflictDetectionFailure(error, constraints);

      expect(result.isFallback).toBe(true);
      expect(result.fallbackReason).toContain('Conflict detection failure');
      expect(result.availableFunctionality).toContain('Basic architecture scoring');
      expect(result.unavailableFunctionality).toContain('Automated conflict detection');
      expect(result.triggeringError?.component).toBe('conflict-detector');
    });
  });

  describe('Output Formatting Failure Handling', () => {
    it('should create fallback analysis for formatting failures', () => {
      const error = new Error('Formatting failed');
      const analysisResult = {
        constraintProfile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: true,
          assumptions: [],
        },
        architectureScores: [],
        detectedConflicts: [],
        tradeoffSummary: {
          keyDecisionFactors: [],
          primaryTradeoffs: [],
          isNearTie: false,
          nearTieThreshold: 0.5,
        },
        assumptions: [],
        interpretationGuidance: [],
        analysisTimestamp: new Date(),
        engineVersion: '1.0.0',
      };

      const result = errorHandler.handleFormattingFailure(error, analysisResult);

      expect(result.isFallback).toBe(true);
      expect(result.fallbackReason).toContain('Output formatting failure');
      expect(result.availableFunctionality).toContain('Complete analysis results in plain text');
      expect(result.unavailableFunctionality).toContain('Formatted tables and structured layout');
      expect(result.partialResults).toBe(analysisResult);
    });
  });

  describe('Minimal Fallback Creation', () => {
    it('should create minimal fallback when all processing fails', () => {
      const error = new Error('Complete system failure');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const result = errorHandler.createMinimalFallback(constraints, error);

      expect(result.isFallback).toBe(true);
      expect(result.fallbackReason).toContain('Complete system failure');
      expect(result.availableFunctionality).toContain('Basic constraint validation');
      expect(result.triggeringError?.recoverable).toBe(false);
      expect(result.partialResults?.constraintProfile).toBe(constraints);
    });
  });
});

describe('Error Handling Utils', () => {
  describe('Recoverable Error Detection', () => {
    it('should identify recoverable errors', () => {
      const recoverableError = new Error('Network timeout occurred');
      const nonRecoverableError = new Error('Fatal system error');

      expect(ErrorHandlingUtils.isRecoverableError(recoverableError)).toBe(true);
      expect(ErrorHandlingUtils.isRecoverableError(nonRecoverableError)).toBe(false);
    });

    it('should identify various types of recoverable errors', () => {
      const timeoutError = new Error('Request timeout');
      const networkError = new Error('Network connection failed');
      const calculationError = new Error('Calculation overflow');
      const temporaryError = new Error('Temporary service unavailable');
      const retryError = new Error('Retry limit exceeded');

      expect(ErrorHandlingUtils.isRecoverableError(timeoutError)).toBe(true);
      expect(ErrorHandlingUtils.isRecoverableError(networkError)).toBe(true);
      expect(ErrorHandlingUtils.isRecoverableError(calculationError)).toBe(true);
      expect(ErrorHandlingUtils.isRecoverableError(temporaryError)).toBe(true);
      expect(ErrorHandlingUtils.isRecoverableError(retryError)).toBe(true);
    });

    it('should identify non-recoverable errors', () => {
      const fatalError = new Error('Fatal system crash');
      const corruptionError = new Error('Data corruption detected');
      const securityError = new Error('Security violation');

      expect(ErrorHandlingUtils.isRecoverableError(fatalError)).toBe(false);
      expect(ErrorHandlingUtils.isRecoverableError(corruptionError)).toBe(false);
      expect(ErrorHandlingUtils.isRecoverableError(securityError)).toBe(false);
    });
  });

  describe('User-Friendly Message Generation', () => {
    it('should generate appropriate messages for different components', () => {
      const error = new Error('Calculation failed');
      
      const scoringMessage = ErrorHandlingUtils.generateUserFriendlyMessage(error, 'scoring-calculator');
      expect(scoringMessage).toContain('issue calculating architecture scores');
      
      const constraintMessage = ErrorHandlingUtils.generateUserFriendlyMessage(error, 'constraint-processor');
      expect(constraintMessage).toContain('issue processing your organizational constraints');
    });

    it('should indicate recovery attempts for recoverable errors', () => {
      const recoverableError = new Error('Network timeout');
      const message = ErrorHandlingUtils.generateUserFriendlyMessage(recoverableError, 'scoring-calculator');
      
      expect(message).toContain('attempt to provide alternative analysis');
    });

    it('should handle unknown components gracefully', () => {
      const error = new Error('Unknown error');
      const message = ErrorHandlingUtils.generateUserFriendlyMessage(error, 'unknown-component');
      
      expect(message).toContain('There was an issue with the analysis');
    });

    it('should provide different messages for recoverable vs non-recoverable errors', () => {
      const recoverableError = new Error('Temporary network issue');
      const nonRecoverableError = new Error('Fatal system error');
      
      const recoverableMessage = ErrorHandlingUtils.generateUserFriendlyMessage(recoverableError, 'scoring-calculator');
      const nonRecoverableMessage = ErrorHandlingUtils.generateUserFriendlyMessage(nonRecoverableError, 'scoring-calculator');
      
      expect(recoverableMessage).toContain('attempt to provide alternative analysis');
      expect(nonRecoverableMessage).toContain('Manual evaluation may be required');
    });
  });

  describe('Error Recovery Assumption Creation', () => {
    it('should create appropriate assumptions for error recovery', () => {
      const assumption = ErrorHandlingUtils.createErrorRecoveryAssumption(
        'scoring-calculator',
        'simplified scoring'
      );

      expect(assumption.category).toBe('calculation');
      expect(assumption.description).toContain('scoring-calculator encountered an error');
      expect(assumption.description).toContain('simplified scoring');
      expect(assumption.impact).toBe('high');
      expect(assumption.recommendation).toContain('Validate results manually');
    });

    it('should create assumptions for different components and fallback methods', () => {
      const conflictAssumption = ErrorHandlingUtils.createErrorRecoveryAssumption(
        'conflict-detector',
        'manual review'
      );

      expect(conflictAssumption.description).toContain('conflict-detector encountered an error');
      expect(conflictAssumption.description).toContain('manual review');
      expect(conflictAssumption.category).toBe('calculation');
      expect(conflictAssumption.impact).toBe('high');
    });
  });
});

describe('Additional Error Handling Scenarios', () => {
  let validator: EnhancedInputValidator;
  let errorHandler: ProcessingErrorHandler;

  beforeEach(() => {
    validator = new EnhancedInputValidator();
    errorHandler = new ProcessingErrorHandler();
  });

  describe('Edge Case Input Validation', () => {
    it('should handle null and undefined inputs gracefully', () => {
      const nullInput = {
        riskTolerance: null as any,
        complianceStrictness: undefined as any,
      } as ConstraintProfileInput;

      const result = validator.validateConstraintInputs(nullInput);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors.length).toBeGreaterThan(0);
      expect(result.enhancedErrors[0]?.errorCode).toBe('INVALID_TYPE');
    });

    it('should handle extreme boundary values', () => {
      const extremeInput = {
        riskTolerance: Number.MAX_SAFE_INTEGER,
        complianceStrictness: Number.MIN_SAFE_INTEGER,
        costSensitivity: Number.POSITIVE_INFINITY,
        userExperiencePriority: Number.NEGATIVE_INFINITY,
      } as ConstraintProfileInput;

      const result = validator.validateConstraintInputs(extremeInput);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors.length).toBe(4);
      result.enhancedErrors.forEach(error => {
        expect(error.errorCode).toBe('OUT_OF_RANGE');
      });
    });

    it('should handle NaN values appropriately', () => {
      const nanInput = {
        riskTolerance: NaN,
        complianceStrictness: 5,
      } as ConstraintProfileInput;

      const result = validator.validateConstraintInputs(nanInput);

      expect(result.validation.isValid).toBe(false);
      expect(result.enhancedErrors[0]?.errorCode).toBe('NOT_INTEGER');
    });
  });

  describe('Complex Contradiction Scenarios', () => {
    it('should handle contradictions with missing values', () => {
      const partialInput = {
        complianceStrictness: 9,
        // costSensitivity missing - should not trigger contradiction
      } as ConstraintProfileInput;

      const result = validator.validateConstraintInputs(partialInput);

      expect(result.contradictions.hasContradictions).toBe(false);
    });

    it('should detect all possible contradiction combinations', () => {
      const maxConflictInput = {
        riskTolerance: 1, // Very low tolerance
        complianceStrictness: 10, // Maximum compliance
        costSensitivity: 10, // Maximum cost sensitivity
        userExperiencePriority: 10, // Maximum UX priority
        businessAgility: 10, // Maximum agility
        operationalMaturity: 1, // Minimum maturity
      } as ConstraintProfileInput;

      const result = validator.validateConstraintInputs(maxConflictInput);

      expect(result.contradictions.hasContradictions).toBe(true);
      expect(result.contradictions.contradictions.length).toBeGreaterThanOrEqual(3);
      expect(result.contradictions.reliabilityImpact).toBe('high');
    });
  });

  describe('Processing Error Recovery Edge Cases', () => {
    it('should handle errors with missing error messages', () => {
      const errorWithoutMessage = new Error();
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const result = errorHandler.handleScoringFailure(errorWithoutMessage, constraints);

      expect(result.isFallback).toBe(true);
      expect(result.triggeringError?.technicalDetails).toBeDefined();
    });

    it('should handle partial results in fallback scenarios', () => {
      const error = new Error('Partial calculation failure');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const partialResults = {
        constraintProfile: constraints,
        assumptions: [],
        interpretationGuidance: ['Partial analysis available'],
      };

      const result = errorHandler.handleScoringFailure(error, constraints, partialResults);

      expect(result.partialResults).toBe(partialResults);
      expect(result.availableFunctionality).toContain('Basic architecture comparison');
    });

    it('should create minimal fallback with comprehensive error information', () => {
      const criticalError = new Error('System memory exhausted');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: false,
        assumptions: ['System under stress'],
      };

      const result = errorHandler.createMinimalFallback(constraints, criticalError);

      expect(result.isFallback).toBe(true);
      expect(result.triggeringError?.recoverable).toBe(false);
      expect(result.partialResults?.assumptions).toContainEqual(
        expect.objectContaining({
          category: 'input',
          description: 'System under stress',
        })
      );
      expect(result.partialResults?.interpretationGuidance).toContain(
        'System analysis unavailable - manual evaluation required'
      );
    });
  });

  describe('Fallback Content Quality', () => {
    it('should ensure fallback analysis maintains decision support messaging', () => {
      const error = new Error('Advanced analysis unavailable');
      const analysisResult = {
        constraintProfile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: true,
          assumptions: [],
        },
        architectureScores: [],
        detectedConflicts: [],
        tradeoffSummary: {
          keyDecisionFactors: [],
          primaryTradeoffs: [],
          isNearTie: false,
          nearTieThreshold: 0.5,
        },
        assumptions: [],
        interpretationGuidance: [],
        analysisTimestamp: new Date(),
        engineVersion: '1.0.0',
      };

      const result = errorHandler.handleFormattingFailure(error, analysisResult);

      expect(result.availableFunctionality).toContain('Decision support messaging');
      expect(result.unavailableFunctionality).toContain('Interactive elements');
    });

    it('should provide appropriate functionality lists in fallback modes', () => {
      const error = new Error('Conflict detection service unavailable');
      const constraints = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: true,
        assumptions: [],
      };

      const result = errorHandler.handleConflictDetectionFailure(error, constraints);

      expect(result.availableFunctionality).toContain('Basic architecture scoring');
      expect(result.availableFunctionality).toContain('General stakeholder guidance');
      expect(result.unavailableFunctionality).toContain('Automated conflict detection');
      expect(result.unavailableFunctionality).toContain('Specific contradiction analysis');
    });
  });
});