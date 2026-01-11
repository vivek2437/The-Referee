/**
 * System-wide Error Handler and Recovery Coordinator
 * 
 * Coordinates error handling across all system components and provides
 * comprehensive fallback analysis when multiple components fail.
 * 
 * Requirements: 9.4, 9.6 - System-wide error recovery and graceful degradation
 */

import {
  ConstraintProfile,
  AnalysisResult,
  ArchitectureScore,
  AssumptionDisclosure,
  ConflictWarning,
  TradeoffAnalysis,
} from './types';
import {
  ProcessingErrorHandler,
  FallbackAnalysisResult,
  ProcessingError,
  ErrorHandlingUtils,
} from './error-handling';
import { ConstraintProfileInput, processConstraintProfile } from './constraint-processor';
import { calculateWeightedScores, ScoringResults } from './scoring-calculator';
import { detectConflicts, ConflictDetectionResult } from './conflict-detector';
import { OutputFormatter, FormattedOutput } from './output-formatter';

/**
 * System-wide error recovery result
 */
export interface SystemRecoveryResult {
  /** Whether recovery was successful */
  recoverySuccessful: boolean;
  /** Level of functionality available */
  functionalityLevel: 'full' | 'partial' | 'minimal' | 'none';
  /** Components that failed */
  failedComponents: string[];
  /** Components operating in fallback mode */
  fallbackComponents: string[];
  /** Recovery actions taken */
  recoveryActions: string[];
  /** Analysis result (may be partial or fallback) */
  analysisResult?: AnalysisResult;
  /** Formatted output (may be fallback) */
  formattedOutput?: FormattedOutput;
  /** System errors encountered */
  systemErrors: ProcessingError[];
}

/**
 * System error recovery coordinator
 */
export class SystemErrorRecoveryCoordinator {
  private errorHandler: ProcessingErrorHandler;
  private outputFormatter: OutputFormatter;
  private systemErrors: ProcessingError[] = [];

  constructor() {
    this.errorHandler = new ProcessingErrorHandler();
    this.outputFormatter = new OutputFormatter();
  }

  /**
   * Attempt complete system analysis with comprehensive error recovery
   * Requirements: 9.4, 9.6 - Complete system error recovery
   */
  async performAnalysisWithRecovery(
    input: ConstraintProfileInput,
    outputPreferences: any
  ): Promise<SystemRecoveryResult> {
    const failedComponents: string[] = [];
    const fallbackComponents: string[] = [];
    const recoveryActions: string[] = [];
    let functionalityLevel: 'full' | 'partial' | 'minimal' | 'none' = 'full';

    try {
      // Step 1: Process constraints with error handling
      const constraintResult = this.processConstraintsWithRecovery(input);
      if (!constraintResult.success) {
        failedComponents.push('constraint-processor');
        functionalityLevel = 'partial';
      }

      // Step 2: Detect conflicts with error handling
      const conflictResult = this.detectConflictsWithRecovery(constraintResult.profile);
      if (!conflictResult.success) {
        failedComponents.push('conflict-detector');
        fallbackComponents.push('conflict-detector');
        functionalityLevel = 'partial';
      }

      // Step 3: Calculate scores with error handling
      const scoringResult = this.calculateScoresWithRecovery(constraintResult.profile);
      if (!scoringResult.success) {
        failedComponents.push('scoring-calculator');
        fallbackComponents.push('scoring-calculator');
        functionalityLevel = functionalityLevel === 'full' ? 'partial' : 'minimal';
      }

      // Step 4: Create analysis result
      const analysisResult = this.createAnalysisResult(
        constraintResult,
        conflictResult,
        scoringResult
      );

      // Step 5: Format output with error handling
      const outputResult = this.formatOutputWithRecovery(analysisResult, outputPreferences);
      if (!outputResult.success) {
        failedComponents.push('output-formatter');
        fallbackComponents.push('output-formatter');
      }

      // Determine final functionality level
      if (failedComponents.length >= 3) {
        functionalityLevel = 'minimal';
      } else if (failedComponents.length >= 2) {
        functionalityLevel = 'partial';
      }

      return {
        recoverySuccessful: functionalityLevel !== 'minimal',
        functionalityLevel,
        failedComponents,
        fallbackComponents,
        recoveryActions,
        analysisResult,
        formattedOutput: outputResult.output,
        systemErrors: this.systemErrors,
      };

    } catch (systemError) {
      // Complete system failure - create minimal fallback
      return this.createMinimalSystemFallback(input, systemError);
    }
  }

  /**
   * Process constraints with error recovery
   */
  private processConstraintsWithRecovery(input: ConstraintProfileInput): {
    success: boolean;
    profile: ConstraintProfile;
    errors: ProcessingError[];
  } {
    try {
      const result = processConstraintProfile(input);
      return {
        success: result.validation.isValid,
        profile: result.profile,
        errors: [],
      };
    } catch (error) {
      const processingError: ProcessingError = {
        errorId: `constraint-processing-${Date.now()}`,
        component: 'constraint-processor',
        message: 'Failed to process organizational constraints',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: true,
        recoveryActions: ['Using default constraint values', 'Manual constraint review recommended'],
      };

      this.systemErrors.push(processingError);

      // Create fallback profile with all defaults
      const fallbackProfile: ConstraintProfile = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
        inputCompleteness: false,
        assumptions: [
          'All constraint values defaulted due to processing error',
          'Manual evaluation strongly recommended',
        ],
      };

      return {
        success: false,
        profile: fallbackProfile,
        errors: [processingError],
      };
    }
  }

  /**
   * Detect conflicts with error recovery
   */
  private detectConflictsWithRecovery(profile: ConstraintProfile): {
    success: boolean;
    result: ConflictDetectionResult;
    errors: ProcessingError[];
  } {
    try {
      const result = detectConflicts(profile);
      return {
        success: !result.isFallback,
        result,
        errors: [],
      };
    } catch (error) {
      const processingError: ProcessingError = {
        errorId: `conflict-detection-${Date.now()}`,
        component: 'conflict-detector',
        message: 'Failed to detect constraint conflicts',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: true,
        recoveryActions: ['Manual conflict review recommended', 'Stakeholder alignment suggested'],
      };

      this.systemErrors.push(processingError);

      // Create fallback conflict result
      const fallbackResult: ConflictDetectionResult = {
        conflicts: [{
          conflictId: 'system-error-manual-review',
          title: 'Manual Conflict Review Required',
          description: 'Automated conflict detection failed - manual review recommended',
          implications: ['Potential constraint conflicts may exist but were not detected'],
          resolutionSuggestions: ['Conduct manual review of constraint combinations'],
          triggeringConstraints: {},
        }],
        hasConflicts: true,
        conflictSummary: ['Manual review required due to system error'],
        isFallback: true,
      };

      return {
        success: false,
        result: fallbackResult,
        errors: [processingError],
      };
    }
  }

  /**
   * Calculate scores with error recovery
   */
  private calculateScoresWithRecovery(profile: ConstraintProfile): {
    success: boolean;
    result: ScoringResults;
    errors: ProcessingError[];
  } {
    try {
      const result = calculateWeightedScores(profile);
      return {
        success: !result.isFallback,
        result,
        errors: [],
      };
    } catch (error) {
      const processingError: ProcessingError = {
        errorId: `scoring-calculation-${Date.now()}`,
        component: 'scoring-calculator',
        message: 'Failed to calculate architecture scores',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: true,
        recoveryActions: ['Using simplified scoring', 'Manual architecture evaluation recommended'],
      };

      this.systemErrors.push(processingError);

      // Create minimal fallback scoring result
      const fallbackResult = this.errorHandler.handleScoringFailure(
        error instanceof Error ? error : new Error('Scoring calculation failed'),
        profile
      );

      const minimalScoringResult: ScoringResults = {
        architectureScores: [],
        methodology: {
          calculationSteps: [],
          weightInfluence: [],
          assumptions: ['Scoring calculation failed - manual evaluation required'],
          confidenceFactors: [],
        },
        tradeoffAnalysis: {
          keyDecisionFactors: ['Manual evaluation required due to scoring failure'],
          primaryTradeoffs: [],
          isNearTie: true,
          nearTieThreshold: 0.5,
        },
        nearTieDetection: {
          isNearTie: true,
          tieType: 'three-way-tie',
          tiedArchitectures: ['IRM-Heavy', 'URM-Heavy', 'Hybrid'],
          scoreDifference: 0,
          thresholdUsed: 0.5,
          detectionConfidence: 'Low',
          messaging: {
            primaryMessage: 'Scoring unavailable - manual evaluation required',
            explanation: 'System unable to calculate architecture scores',
            tradeoffEmphasis: 'Manual trade-off analysis required',
            numericScoreWarning: 'No numeric scores available',
            decisionGuidance: ['Consult security architecture professionals'],
          },
        },
        overallConfidence: 'Low',
        interpretationGuidance: ['Manual evaluation required due to system error'],
        isFallback: true,
        fallbackInfo: fallbackResult,
      };

      return {
        success: false,
        result: minimalScoringResult,
        errors: [processingError],
      };
    }
  }

  /**
   * Format output with error recovery
   */
  private formatOutputWithRecovery(
    analysisResult: AnalysisResult,
    outputPreferences: any
  ): {
    success: boolean;
    output: FormattedOutput;
    errors: ProcessingError[];
  } {
    try {
      const output = this.outputFormatter.formatAnalysisOutput(analysisResult, outputPreferences);
      return {
        success: !output.isFallback,
        output,
        errors: [],
      };
    } catch (error) {
      const processingError: ProcessingError = {
        errorId: `output-formatting-${Date.now()}`,
        component: 'output-formatter',
        message: 'Failed to format analysis output',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        recoverable: true,
        recoveryActions: ['Using plain text output', 'Manual formatting recommended'],
      };

      this.systemErrors.push(processingError);

      // Create minimal plain text output
      const fallbackOutput: FormattedOutput = {
        header: {
          title: 'Security Architecture Analysis (System Error)',
          subtitle: 'Minimal output due to formatting error',
          analysisDate: new Date().toLocaleDateString(),
          engineVersion: '1.0.0-error-fallback',
          targetPersona: 'Unknown',
          documentId: `ERROR-${Date.now()}`,
        },
        executiveSummary: 'Analysis completed with system errors. Manual review required.',
        comparisonTable: {
          headers: ['Status'],
          dimensionRows: [],
          summaryRow: {
            label: 'System Status',
            weightedScores: {} as any,
            confidenceLevels: {} as any,
            isNearTie: true,
          },
          notes: ['System error prevented detailed comparison'],
        },
        tradeoffSummary: {
          title: 'System Error - Manual Analysis Required',
          keyDecisionFactors: ['System error prevented automated analysis'],
          primaryTradeoffs: [],
          recommendations: ['Manual architecture evaluation required'],
        },
        conflictWarnings: [],
        personaContent: {
          executiveSummary: 'System error - manual analysis required',
          keyInsights: ['System error prevented analysis'],
          strategicConsiderations: ['System error prevented analysis'],
          stakeholderGuidance: ['Inform stakeholders of system limitations'],
          riskCompliance: ['Professional consultation required'],
        },
        assumptionDisclosures: [],
        interpretationGuidance: {
          title: 'System Error Guidance',
          usageGuidelines: ['System error prevented normal analysis'],
          limitations: ['All automated analysis unavailable'],
          nextSteps: ['Manual evaluation required'],
          validationRequirements: ['Professional consultation essential'],
        },
        disclaimers: {
          primaryDisclaimer: 'System error prevented normal analysis - manual evaluation required',
          additionalNotices: ['All automated analysis unavailable due to system error'],
          humanOversightRequirement: 'Human oversight essential due to system limitations',
          professionalValidationNotice: 'Professional consultation required',
        },
        footer: {
          generatedBy: 'SecureStack Referee (Error Recovery)',
          timestamp: new Date().toISOString(),
          version: '1.0.0-error-fallback',
          contactInfo: 'Contact system administrator',
        },
        isFallback: true,
      };

      return {
        success: false,
        output: fallbackOutput,
        errors: [processingError],
      };
    }
  }

  /**
   * Create analysis result from component results
   */
  private createAnalysisResult(
    constraintResult: any,
    conflictResult: any,
    scoringResult: any
  ): AnalysisResult {
    const assumptions: AssumptionDisclosure[] = [
      ...constraintResult.profile.assumptions.map((assumption: string) => ({
        category: 'input' as const,
        description: assumption,
        impact: 'medium' as const,
        recommendation: 'Validate assumption with organizational stakeholders',
      })),
    ];

    // Add error-related assumptions
    this.systemErrors.forEach(error => {
      assumptions.push(ErrorHandlingUtils.createErrorRecoveryAssumption(
        error.component,
        'fallback analysis'
      ));
    });

    return {
      constraintProfile: constraintResult.profile,
      architectureScores: scoringResult.result.architectureScores,
      detectedConflicts: conflictResult.result.conflicts,
      tradeoffSummary: scoringResult.result.tradeoffAnalysis,
      nearTieDetection: scoringResult.result.nearTieDetection,
      assumptions,
      interpretationGuidance: scoringResult.result.interpretationGuidance,
      analysisTimestamp: new Date(),
      engineVersion: '1.0.0',
    };
  }

  /**
   * Create minimal system fallback when everything fails
   */
  private createMinimalSystemFallback(
    input: ConstraintProfileInput,
    systemError: unknown
  ): SystemRecoveryResult {
    const error = systemError instanceof Error ? systemError : new Error('Complete system failure');
    
    const criticalError: ProcessingError = {
      errorId: `system-failure-${Date.now()}`,
      component: 'system',
      message: 'Complete system failure - all automated analysis unavailable',
      technicalDetails: error.message,
      timestamp: new Date(),
      recoverable: false,
      recoveryActions: [
        'Manual architecture evaluation required',
        'Professional consultation essential',
        'System administrator contact recommended',
      ],
    };

    return {
      recoverySuccessful: false,
      functionalityLevel: 'none',
      failedComponents: ['constraint-processor', 'conflict-detector', 'scoring-calculator', 'output-formatter'],
      fallbackComponents: [],
      recoveryActions: criticalError.recoveryActions,
      systemErrors: [criticalError],
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    isHealthy: boolean;
    errorCount: number;
    lastError?: ProcessingError | undefined;
    recommendations: string[];
  } {
    const errorCount = this.systemErrors.length;
    const isHealthy = errorCount === 0;
    const lastError = this.systemErrors[this.systemErrors.length - 1];

    const recommendations: string[] = [];
    if (errorCount > 0) {
      recommendations.push('Review system errors and address underlying issues');
      recommendations.push('Consider manual evaluation for critical decisions');
      recommendations.push('Contact system administrator if errors persist');
    }

    return {
      isHealthy,
      errorCount,
      lastError,
      recommendations,
    };
  }

  /**
   * Clear system errors (for testing or reset)
   */
  clearSystemErrors(): void {
    this.systemErrors = [];
  }
}