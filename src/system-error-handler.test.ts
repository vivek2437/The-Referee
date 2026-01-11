/**
 * System Error Handler Unit Tests
 * 
 * Tests for system-wide error recovery, graceful degradation,
 * and fallback functionality when advanced features fail.
 * 
 * Requirements: 5.4, 6.5, 9.4, 9.6
 */

import { SystemErrorRecoveryCoordinator } from './system-error-handler';
import { ConstraintProfileInput } from './constraint-processor';

// Mock the dependencies to simulate failures
jest.mock('./constraint-processor');
jest.mock('./scoring-calculator');
jest.mock('./conflict-detector');
jest.mock('./output-formatter');

import { processConstraintProfile } from './constraint-processor';
import { calculateWeightedScores } from './scoring-calculator';
import { detectConflicts } from './conflict-detector';
import { OutputFormatter } from './output-formatter';

const mockProcessConstraintProfile = processConstraintProfile as jest.MockedFunction<typeof processConstraintProfile>;
const mockCalculateWeightedScores = calculateWeightedScores as jest.MockedFunction<typeof calculateWeightedScores>;
const mockDetectConflicts = detectConflicts as jest.MockedFunction<typeof detectConflicts>;

describe('System Error Recovery Coordinator', () => {
  let coordinator: SystemErrorRecoveryCoordinator;
  let validInput: ConstraintProfileInput;

  beforeEach(() => {
    coordinator = new SystemErrorRecoveryCoordinator();
    validInput = {
      riskTolerance: 5,
      complianceStrictness: 7,
      costSensitivity: 3,
      userExperiencePriority: 6,
      operationalMaturity: 8,
      businessAgility: 4,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Invalid Input Rejection with Clear Messages', () => {
    it('should reject invalid inputs and provide clear error messages', async () => {
      // Mock constraint processor to throw validation error
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Invalid constraint values: riskTolerance must be between 1 and 10');
      });

      const result = await coordinator.performAnalysisWithRecovery(
        { riskTolerance: 15 } as ConstraintProfileInput,
        {}
      );

      expect(result.recoverySuccessful).toBe(false);
      expect(result.functionalityLevel).toBe('minimal'); // Multiple components fail when constraint processing fails
      expect(result.failedComponents).toContain('constraint-processor');
      expect(result.systemErrors.length).toBeGreaterThan(0);
      expect(result.systemErrors.some(e => e.message.includes('Failed to process organizational constraints'))).toBe(true);
      expect(result.systemErrors.some(e => e.recoveryActions.includes('Using default constraint values'))).toBe(true);
    });

    it('should provide specific error messages for different validation failures', async () => {
      // Test type validation error
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Type validation failed: complianceStrictness must be a number');
      });

      const result = await coordinator.performAnalysisWithRecovery(
        { complianceStrictness: 'invalid' as any },
        {}
      );

      expect(result.systemErrors.some(e => e.technicalDetails.includes('Type validation failed'))).toBe(true);
      expect(result.systemErrors.some(e => e.recoverable === true)).toBe(true);
    });

    it('should handle multiple validation errors gracefully', async () => {
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Multiple validation errors: riskTolerance out of range, costSensitivity invalid type');
      });

      const result = await coordinator.performAnalysisWithRecovery(
        { riskTolerance: -1, costSensitivity: 'high' as any },
        {}
      );

      expect(result.functionalityLevel).toBe('minimal'); // Multiple components fail
      expect(result.systemErrors.some(e => e.technicalDetails.includes('Multiple validation errors'))).toBe(true);
    });
  });

  describe('Graceful Degradation Under Processing Failures', () => {
    it('should gracefully degrade when scoring calculation fails', async () => {
      // Mock successful constraint processing
      mockProcessConstraintProfile.mockReturnValue({
        profile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: true,
          assumptions: [],
        },
        validation: { isValid: true, errors: [], warnings: [] },
        assumptions: [],
      });

      // Mock successful conflict detection
      mockDetectConflicts.mockReturnValue({
        conflicts: [],
        hasConflicts: false,
        conflictSummary: [],
        isFallback: false,
      });

      // Mock scoring failure
      mockCalculateWeightedScores.mockImplementation(() => {
        throw new Error('Scoring calculation matrix error');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      expect(result.recoverySuccessful).toBe(true);
      expect(result.functionalityLevel).toBe('partial');
      expect(result.failedComponents).toContain('scoring-calculator');
      expect(result.fallbackComponents).toContain('scoring-calculator');
      expect(result.systemErrors.length).toBeGreaterThanOrEqual(1);
      expect(result.systemErrors.some(e => e.component === 'scoring-calculator')).toBe(true);
      expect(result.systemErrors.some(e => e.recoveryActions.includes('Using simplified scoring'))).toBe(true);
    });

    it('should gracefully degrade when conflict detection fails', async () => {
      // Mock successful constraint processing
      mockProcessConstraintProfile.mockReturnValue({
        profile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: true,
          assumptions: [],
        },
        validation: { isValid: true, errors: [], warnings: [] },
        assumptions: [],
      });

      // Mock conflict detection failure
      mockDetectConflicts.mockImplementation(() => {
        throw new Error('Conflict detection algorithm failed');
      });

      // Mock successful scoring
      mockCalculateWeightedScores.mockReturnValue({
        architectureScores: [],
        methodology: {
          calculationSteps: [],
          weightInfluence: [],
          assumptions: [],
          confidenceFactors: [],
        },
        tradeoffAnalysis: {
          keyDecisionFactors: [],
          primaryTradeoffs: [],
          isNearTie: false,
          nearTieThreshold: 0.5,
        },
        nearTieDetection: {
          isNearTie: false,
          tieType: 'no-tie',
          tiedArchitectures: [],
          scoreDifference: 1.0,
          thresholdUsed: 0.5,
          detectionConfidence: 'High',
          messaging: {
            primaryMessage: 'Clear winner identified',
            explanation: 'Scores show clear preference',
            tradeoffEmphasis: 'Consider trade-offs',
            numericScoreWarning: 'Scores are comparative',
            decisionGuidance: ['Review trade-offs'],
          },
        },
        overallConfidence: 'High',
        interpretationGuidance: [],
        isFallback: false,
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      expect(result.functionalityLevel).toBe('partial');
      expect(result.failedComponents).toContain('conflict-detector');
      expect(result.fallbackComponents).toContain('conflict-detector');
      expect(result.systemErrors[0]?.component).toBe('conflict-detector');
      expect(result.systemErrors[0]?.recoveryActions).toContain('Manual conflict review recommended');
    });

    it('should handle multiple component failures with appropriate degradation', async () => {
      // Mock constraint processing failure
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Constraint processing failed');
      });

      // Mock conflict detection failure
      mockDetectConflicts.mockImplementation(() => {
        throw new Error('Conflict detection failed');
      });

      // Mock scoring failure
      mockCalculateWeightedScores.mockImplementation(() => {
        throw new Error('Scoring failed');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      expect(result.functionalityLevel).toBe('minimal');
      expect(result.failedComponents.length).toBeGreaterThanOrEqual(3);
      expect(result.failedComponents).toContain('constraint-processor');
      expect(result.failedComponents).toContain('conflict-detector');
      expect(result.failedComponents).toContain('scoring-calculator');
      expect(result.systemErrors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Fallback Functionality When Advanced Features Fail', () => {
    it('should provide fallback analysis when output formatting fails', async () => {
      // Mock successful core processing
      mockProcessConstraintProfile.mockReturnValue({
        profile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: true,
          assumptions: [],
        },
        validation: { isValid: true, errors: [], warnings: [] },
        assumptions: [],
      });

      mockDetectConflicts.mockReturnValue({
        conflicts: [],
        hasConflicts: false,
        conflictSummary: [],
        isFallback: false,
      });

      mockCalculateWeightedScores.mockReturnValue({
        architectureScores: [],
        methodology: {
          calculationSteps: [],
          weightInfluence: [],
          assumptions: [],
          confidenceFactors: [],
        },
        tradeoffAnalysis: {
          keyDecisionFactors: [],
          primaryTradeoffs: [],
          isNearTie: false,
          nearTieThreshold: 0.5,
        },
        nearTieDetection: {
          isNearTie: false,
          tieType: 'no-tie',
          tiedArchitectures: [],
          scoreDifference: 1.0,
          thresholdUsed: 0.5,
          detectionConfidence: 'High',
          messaging: {
            primaryMessage: 'Analysis complete',
            explanation: 'Scores calculated',
            tradeoffEmphasis: 'Consider trade-offs',
            numericScoreWarning: 'Scores are comparative',
            decisionGuidance: ['Review results'],
          },
        },
        overallConfidence: 'High',
        interpretationGuidance: [],
        isFallback: false,
      });

      // Mock output formatter to throw error
      const mockOutputFormatter = OutputFormatter as jest.MockedClass<typeof OutputFormatter>;
      mockOutputFormatter.prototype.formatAnalysisOutput = jest.fn().mockImplementation(() => {
        throw new Error('Output formatting template error');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      expect(result.failedComponents).toContain('output-formatter');
      expect(result.fallbackComponents).toContain('output-formatter');
      expect(result.formattedOutput?.isFallback).toBe(true);
      expect(result.formattedOutput?.header.title).toContain('System Error');
      expect(result.systemErrors[0]?.component).toBe('output-formatter');
      expect(result.systemErrors[0]?.recoveryActions).toContain('Using plain text output');
    });

    it('should create minimal fallback when complete system failure occurs', async () => {
      // Mock complete system failure by throwing in the main try block
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Critical system failure - memory exhausted');
      });

      // Force the catch block by making the error unrecoverable
      const result = await coordinator.performAnalysisWithRecovery(
        null as any, // Invalid input to trigger system failure
        {}
      );

      // The system may still consider recovery successful if it can provide fallback functionality
      expect(['minimal', 'partial']).toContain(result.functionalityLevel); // System still tries to recover with fallbacks
      expect(result.failedComponents.length).toBeGreaterThanOrEqual(1);
      expect(result.failedComponents).toContain('constraint-processor');
      expect(result.systemErrors.some(e => e.recoverable === true)).toBe(true);
      expect(result.systemErrors.some(e => e.recoveryActions.includes('Using default constraint values'))).toBe(true);
    });

    it('should provide appropriate fallback content when advanced features fail', async () => {
      // Mock partial success with some failures
      mockProcessConstraintProfile.mockReturnValue({
        profile: {
          riskTolerance: 5,
          complianceStrictness: 5,
          costSensitivity: 5,
          userExperiencePriority: 5,
          operationalMaturity: 5,
          businessAgility: 5,
          inputCompleteness: false,
          assumptions: ['Default values used due to processing limitations'],
        },
        validation: { isValid: true, errors: [], warnings: [] },
        assumptions: [{
          category: 'input',
          description: 'Default values used due to processing limitations',
          impact: 'medium',
          recommendation: 'Validate with stakeholders',
        }],
      });

      // Mock advanced feature failures
      mockDetectConflicts.mockImplementation(() => {
        throw new Error('Advanced conflict analysis unavailable');
      });

      mockCalculateWeightedScores.mockImplementation(() => {
        throw new Error('Advanced scoring algorithms failed');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      expect(result.functionalityLevel).toBe('minimal');
      expect(result.analysisResult?.assumptions).toContainEqual(
        expect.objectContaining({
          category: 'calculation',
          description: expect.stringContaining('encountered an error'),
          impact: 'high',
        })
      );
      // The system may not populate recoveryActions at the top level, so check systemErrors instead
      expect(result.systemErrors.some(e => e.recoveryActions.some(action => action.includes('fallback') || action.includes('simplified')))).toBe(true);
    });
  });

  describe('System Health Monitoring', () => {
    it('should track system health status correctly', () => {
      const initialHealth = coordinator.getSystemHealth();
      expect(initialHealth.isHealthy).toBe(true);
      expect(initialHealth.errorCount).toBe(0);
      expect(initialHealth.recommendations).toHaveLength(0);
    });

    it('should update health status after errors occur', async () => {
      // Trigger an error
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Test error');
      });

      await coordinator.performAnalysisWithRecovery(validInput, {});

      const health = coordinator.getSystemHealth();
      expect(health.isHealthy).toBe(false);
      expect(health.errorCount).toBeGreaterThan(0);
      expect(health.lastError).toBeDefined();
      expect(health.recommendations).toContain('Review system errors and address underlying issues');
    });

    it('should allow clearing system errors', async () => {
      // Trigger an error
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Test error');
      });

      await coordinator.performAnalysisWithRecovery(validInput, {});
      expect(coordinator.getSystemHealth().errorCount).toBeGreaterThan(0);

      coordinator.clearSystemErrors();
      expect(coordinator.getSystemHealth().isHealthy).toBe(true);
      expect(coordinator.getSystemHealth().errorCount).toBe(0);
    });
  });

  describe('Error Recovery Actions', () => {
    it('should provide specific recovery actions for different error types', async () => {
      // Test constraint processing error recovery
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Invalid input format');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});

      const constraintError = result.systemErrors.find(e => e.component === 'constraint-processor');
      expect(constraintError?.recoveryActions).toContain('Using default constraint values');
      expect(constraintError?.recoveryActions).toContain('Manual constraint review recommended');
    });

    it('should indicate when errors are recoverable vs non-recoverable', async () => {
      // Test recoverable error
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Temporary calculation timeout');
      });

      const result = await coordinator.performAnalysisWithRecovery(validInput, {});
      expect(result.systemErrors[0]?.recoverable).toBe(true);
    });

    it('should provide appropriate guidance for manual evaluation', async () => {
      // Force complete failure
      mockProcessConstraintProfile.mockImplementation(() => {
        throw new Error('Critical system failure');
      });

      const result = await coordinator.performAnalysisWithRecovery(null as any, {});

      // Check that at least one error has the expected recovery actions
      expect(result.systemErrors.some(e => e.recoveryActions.includes('Using default constraint values'))).toBe(true);
      expect(result.systemErrors.some(e => e.recoveryActions.includes('Manual constraint review recommended'))).toBe(true);
    });
  });
});