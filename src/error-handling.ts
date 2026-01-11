/**
 * Error Handling and Graceful Degradation
 * 
 * Provides comprehensive error handling for input validation, processing failures,
 * and graceful degradation scenarios with clear error messages and fallback options.
 * 
 * Requirements: 5.4, 6.5, 9.4, 9.6
 */

import {
  ConstraintProfile,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ConflictWarning,
  AnalysisResult,
  ArchitectureScore,
  AssumptionDisclosure,
} from './types';
import { ConstraintProfileInput } from './constraint-processor';

/**
 * Enhanced validation error with detailed context
 */
export interface EnhancedValidationError extends ValidationError {
  /** Error code for programmatic handling */
  errorCode: string;
  /** Severity level of the error */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Suggested resolution steps */
  resolutionSteps: string[];
  /** Whether the error prevents analysis from proceeding */
  blocking: boolean;
}

/**
 * Processing error details for system failures
 */
export interface ProcessingError {
  /** Unique error identifier */
  errorId: string;
  /** Component where error occurred */
  component: string;
  /** Error message for users */
  message: string;
  /** Technical error details for debugging */
  technicalDetails: string;
  /** Timestamp when error occurred */
  timestamp: Date;
  /** Whether recovery is possible */
  recoverable: boolean;
  /** Suggested recovery actions */
  recoveryActions: string[];
}

/**
 * Fallback analysis result for degraded functionality
 */
export interface FallbackAnalysisResult {
  /** Whether this is a fallback result */
  isFallback: boolean;
  /** Reason for fallback mode */
  fallbackReason: string;
  /** Available functionality in fallback mode */
  availableFunctionality: string[];
  /** Unavailable functionality */
  unavailableFunctionality: string[];
  /** Partial analysis results if available */
  partialResults?: Partial<AnalysisResult> | undefined;
  /** Error that triggered fallback */
  triggeringError?: ProcessingError;
}

/**
 * Contradiction detection result with stakeholder alignment suggestions
 */
export interface ContradictionAnalysis {
  /** Whether contradictions were detected */
  hasContradictions: boolean;
  /** Detected contradictions */
  contradictions: DetectedContradiction[];
  /** Stakeholder alignment suggestions */
  alignmentSuggestions: StakeholderAlignmentSuggestion[];
  /** Impact on analysis reliability */
  reliabilityImpact: 'low' | 'medium' | 'high';
}

/**
 * Individual contradiction details
 */
export interface DetectedContradiction {
  /** Contradiction identifier */
  contradictionId: string;
  /** Conflicting constraints */
  conflictingConstraints: string[];
  /** Values that create the contradiction */
  conflictingValues: Record<string, number>;
  /** Explanation of why this is contradictory */
  explanation: string;
  /** Business impact of the contradiction */
  businessImpact: string;
  /** Severity of the contradiction */
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Stakeholder alignment suggestion
 */
export interface StakeholderAlignmentSuggestion {
  /** Target stakeholder group */
  stakeholderGroup: string;
  /** Specific discussion topics */
  discussionTopics: string[];
  /** Questions to resolve */
  questionsToResolve: string[];
  /** Expected outcomes */
  expectedOutcomes: string[];
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
}

/**
 * Enhanced input validation with detailed error messages and contradiction detection
 */
export class EnhancedInputValidator {
  
  /**
   * Validate constraint inputs with enhanced error reporting
   * Requirements: 5.4 - Clear error messages for invalid constraint weights
   */
  validateConstraintInputs(input: ConstraintProfileInput): {
    validation: ValidationResult;
    enhancedErrors: EnhancedValidationError[];
    contradictions: ContradictionAnalysis;
  } {
    const enhancedErrors: EnhancedValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate each constraint field
    Object.entries(input).forEach(([fieldName, value]) => {
      if (value !== undefined) {
        const error = this.validateSingleConstraint(fieldName, value);
        if (error) {
          enhancedErrors.push(error);
        }
      }
    });
    
    // Detect contradictions and generate stakeholder alignment suggestions
    const contradictions = this.detectContradictions(input);
    
    // Generate warnings for potential issues
    const validationWarnings = this.generateValidationWarnings(input);
    warnings.push(...validationWarnings);
    
    const validation: ValidationResult = {
      isValid: enhancedErrors.length === 0,
      errors: enhancedErrors.map(e => ({
        field: e.field,
        message: e.message,
        providedValue: e.providedValue,
        expectedFormat: e.expectedFormat,
      })),
      warnings: warnings,
    };
    
    return {
      validation,
      enhancedErrors,
      contradictions,
    };
  }
  
  /**
   * Validate a single constraint value with enhanced error details
   */
  private validateSingleConstraint(fieldName: string, value: unknown): EnhancedValidationError | null {
    // Type validation
    if (typeof value !== 'number') {
      return {
        field: fieldName,
        message: `${this.getFieldDisplayName(fieldName)} must be a number between 1 and 10`,
        providedValue: value,
        expectedFormat: 'number between 1 and 10',
        errorCode: 'INVALID_TYPE',
        severity: 'high',
        resolutionSteps: [
          `Provide a numeric value for ${this.getFieldDisplayName(fieldName)}`,
          'Ensure the value is between 1 and 10',
          'Remove any non-numeric characters or formatting',
        ],
        blocking: true,
      };
    }
    
    // Range validation
    if (value < 1 || value > 10) {
      return {
        field: fieldName,
        message: `${this.getFieldDisplayName(fieldName)} must be between 1 and 10 (provided: ${value})`,
        providedValue: value,
        expectedFormat: 'integer between 1 and 10',
        errorCode: 'OUT_OF_RANGE',
        severity: 'high',
        resolutionSteps: [
          `Adjust ${this.getFieldDisplayName(fieldName)} to a value between 1 and 10`,
          'Use 1 for lowest priority/tolerance and 10 for highest priority/tolerance',
          'Consider organizational context when selecting appropriate values',
        ],
        blocking: true,
      };
    }
    
    // Integer validation
    if (!Number.isInteger(value)) {
      return {
        field: fieldName,
        message: `${this.getFieldDisplayName(fieldName)} must be a whole number (provided: ${value})`,
        providedValue: value,
        expectedFormat: 'integer between 1 and 10',
        errorCode: 'NOT_INTEGER',
        severity: 'medium',
        resolutionSteps: [
          `Round ${this.getFieldDisplayName(fieldName)} to the nearest whole number`,
          'Use integer values only (1, 2, 3, etc.)',
          'Consider whether to round up or down based on organizational priorities',
        ],
        blocking: false,
      };
    }
    
    return null;
  }
  
  /**
   * Detect contradictions in constraint inputs
   * Requirements: 6.5 - Contradiction flagging with stakeholder alignment suggestions
   */
  private detectContradictions(input: ConstraintProfileInput): ContradictionAnalysis {
    const contradictions: DetectedContradiction[] = [];
    const alignmentSuggestions: StakeholderAlignmentSuggestion[] = [];
    
    // High compliance vs low cost contradiction
    if (input.complianceStrictness !== undefined && input.costSensitivity !== undefined) {
      if (input.complianceStrictness >= 8 && input.costSensitivity >= 8) {
        contradictions.push({
          contradictionId: 'compliance-cost-conflict',
          conflictingConstraints: ['complianceStrictness', 'costSensitivity'],
          conflictingValues: {
            complianceStrictness: input.complianceStrictness,
            costSensitivity: input.costSensitivity,
          },
          explanation: 'High compliance requirements typically require significant infrastructure investment, creating tension with cost optimization goals',
          businessImpact: 'May result in budget overruns, delayed implementation, or compromised compliance posture',
          severity: 'high',
        });
        
        alignmentSuggestions.push({
          stakeholderGroup: 'Executive Leadership & Compliance Team',
          discussionTopics: [
            'Budget allocation for compliance infrastructure',
            'Risk tolerance for compliance gaps vs cost overruns',
            'Phased implementation approach to manage costs',
          ],
          questionsToResolve: [
            'What is the acceptable budget range for compliance infrastructure?',
            'Which compliance requirements are non-negotiable vs nice-to-have?',
            'Can compliance implementation be phased to spread costs over time?',
          ],
          expectedOutcomes: [
            'Clear budget allocation for compliance requirements',
            'Prioritized list of compliance controls',
            'Implementation timeline that balances cost and compliance needs',
          ],
          priority: 'high',
        });
      }
    }
    
    // Low risk tolerance vs high UX priority contradiction
    if (input.riskTolerance !== undefined && input.userExperiencePriority !== undefined) {
      if (input.riskTolerance <= 3 && input.userExperiencePriority >= 8) {
        contradictions.push({
          contradictionId: 'risk-ux-conflict',
          conflictingConstraints: ['riskTolerance', 'userExperiencePriority'],
          conflictingValues: {
            riskTolerance: input.riskTolerance,
            userExperiencePriority: input.userExperiencePriority,
          },
          explanation: 'Low risk tolerance requires strong security controls that inherently create user friction, conflicting with seamless user experience goals',
          businessImpact: 'May lead to user resistance, shadow IT adoption, or security control bypassing',
          severity: 'high',
        });
        
        alignmentSuggestions.push({
          stakeholderGroup: 'Security Team & Business Units',
          discussionTopics: [
            'Acceptable level of user friction for security controls',
            'Risk mitigation strategies that minimize user impact',
            'User training and change management approaches',
          ],
          questionsToResolve: [
            'What security controls are non-negotiable regardless of user impact?',
            'Where can user experience be improved without compromising security?',
            'How will user adoption and compliance be measured and enforced?',
          ],
          expectedOutcomes: [
            'Balanced approach to security controls and user experience',
            'Clear guidelines for when security takes precedence over UX',
            'User training and support plan for security requirements',
          ],
          priority: 'high',
        });
      }
    }
    
    // High agility vs low maturity contradiction
    if (input.businessAgility !== undefined && input.operationalMaturity !== undefined) {
      if (input.businessAgility >= 8 && input.operationalMaturity <= 4) {
        contradictions.push({
          contradictionId: 'agility-maturity-conflict',
          conflictingConstraints: ['businessAgility', 'operationalMaturity'],
          conflictingValues: {
            businessAgility: input.businessAgility,
            operationalMaturity: input.operationalMaturity,
          },
          explanation: 'High business agility requirements demand sophisticated, adaptive security architectures that may exceed current operational team capabilities',
          businessImpact: 'May result in implementation failures, operational incidents, or inability to support business requirements',
          severity: 'medium',
        });
        
        alignmentSuggestions.push({
          stakeholderGroup: 'Operations Team & Business Leadership',
          discussionTopics: [
            'Current operational team capabilities and skill gaps',
            'Training and hiring plans to support agility requirements',
            'Interim solutions while building operational maturity',
          ],
          questionsToResolve: [
            'What operational capabilities need to be developed or acquired?',
            'What is the timeline for building required operational maturity?',
            'Can business agility requirements be phased to match operational readiness?',
          ],
          expectedOutcomes: [
            'Operational capability development plan',
            'Phased approach to implementing agility requirements',
            'Clear success metrics for operational maturity improvement',
          ],
          priority: 'medium',
        });
      }
    }
    
    // High compliance vs high agility contradiction
    if (input.complianceStrictness !== undefined && input.businessAgility !== undefined) {
      if (input.complianceStrictness >= 8 && input.businessAgility >= 8) {
        contradictions.push({
          contradictionId: 'compliance-agility-conflict',
          conflictingConstraints: ['complianceStrictness', 'businessAgility'],
          conflictingValues: {
            complianceStrictness: input.complianceStrictness,
            businessAgility: input.businessAgility,
          },
          explanation: 'Strict compliance requirements often impose process constraints and approval workflows that can slow business adaptation and innovation',
          businessImpact: 'May create delays in business initiatives, reduce competitive responsiveness, or lead to compliance workarounds',
          severity: 'medium',
        });
        
        alignmentSuggestions.push({
          stakeholderGroup: 'Compliance Team & Business Units',
          discussionTopics: [
            'Streamlining compliance processes for business agility',
            'Risk-based compliance approaches for different business activities',
            'Automated compliance controls to reduce process overhead',
          ],
          questionsToResolve: [
            'Which compliance processes can be streamlined or automated?',
            'How can compliance be integrated into agile business processes?',
            'What compliance risks are acceptable to maintain business agility?',
          ],
          expectedOutcomes: [
            'Streamlined compliance processes for routine business activities',
            'Risk-based compliance framework that supports agility',
            'Clear escalation paths for compliance decisions in agile environments',
          ],
          priority: 'medium',
        });
      }
    }
    
    // Determine overall reliability impact
    let reliabilityImpact: 'low' | 'medium' | 'high' = 'low';
    if (contradictions.some(c => c.severity === 'critical' || c.severity === 'high')) {
      reliabilityImpact = 'high';
    } else if (contradictions.length > 0) {
      reliabilityImpact = 'medium';
    }
    
    return {
      hasContradictions: contradictions.length > 0,
      contradictions,
      alignmentSuggestions,
      reliabilityImpact,
    };
  }
  
  /**
   * Generate validation warnings for potentially problematic inputs
   */
  private generateValidationWarnings(input: ConstraintProfileInput): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // Check for extreme values that might indicate misunderstanding
    Object.entries(input).forEach(([fieldName, value]) => {
      if (value !== undefined && typeof value === 'number') {
        if (value === 1) {
          warnings.push({
            field: fieldName,
            message: `${this.getFieldDisplayName(fieldName)} is set to minimum value (1) - confirm this reflects organizational reality`,
            providedValue: value,
            suggestion: 'Consider whether this extremely low priority/tolerance is accurate for your organization',
          });
        } else if (value === 10) {
          warnings.push({
            field: fieldName,
            message: `${this.getFieldDisplayName(fieldName)} is set to maximum value (10) - confirm this reflects organizational reality`,
            providedValue: value,
            suggestion: 'Consider whether this extremely high priority/tolerance is accurate for your organization',
          });
        }
      }
    });
    
    // Check for missing critical inputs
    const criticalFields = ['riskTolerance', 'complianceStrictness'];
    criticalFields.forEach(fieldName => {
      if (input[fieldName as keyof ConstraintProfileInput] === undefined) {
        warnings.push({
          field: fieldName,
          message: `${this.getFieldDisplayName(fieldName)} not provided - using default assumption`,
          providedValue: undefined,
          suggestion: `Consider providing explicit ${this.getFieldDisplayName(fieldName)} value based on organizational assessment`,
        });
      }
    });
    
    return warnings;
  }
  
  /**
   * Get user-friendly display name for constraint fields
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      riskTolerance: 'Risk Tolerance',
      complianceStrictness: 'Compliance Strictness',
      costSensitivity: 'Cost Sensitivity',
      userExperiencePriority: 'User Experience Priority',
      operationalMaturity: 'Operational Maturity',
      businessAgility: 'Business Agility',
    };
    return displayNames[fieldName] || fieldName;
  }
}

/**
 * Processing error handler for system failures and recovery
 */
export class ProcessingErrorHandler {
  
  /**
   * Handle scoring calculation failures with fallback analysis
   * Requirements: 9.4, 9.6 - Fallback analysis and reduced functionality modes
   */
  handleScoringFailure(
    error: Error,
    constraints: ConstraintProfile,
    partialResults?: Partial<AnalysisResult>
  ): FallbackAnalysisResult {
    const processingError: ProcessingError = {
      errorId: `scoring-failure-${Date.now()}`,
      component: 'scoring-calculator',
      message: 'Unable to complete full scoring analysis due to calculation error',
      technicalDetails: error.message,
      timestamp: new Date(),
      recoverable: true,
      recoveryActions: [
        'Attempting simplified scoring methodology',
        'Using base architecture profiles without complex weighting',
        'Providing qualitative comparison instead of numeric scores',
      ],
    };
    
    return {
      isFallback: true,
      fallbackReason: 'Scoring calculation failure - using simplified analysis',
      availableFunctionality: [
        'Basic architecture comparison',
        'Constraint conflict detection',
        'Assumption tracking',
        'Qualitative trade-off analysis',
      ],
      unavailableFunctionality: [
        'Weighted scoring calculations',
        'Precise numeric comparisons',
        'Advanced near-tie detection',
        'Detailed scoring methodology explanation',
      ],
      partialResults: partialResults,
      triggeringError: processingError,
    };
  }
  
  /**
   * Handle conflict detection failures
   */
  handleConflictDetectionFailure(
    error: Error,
    constraints: ConstraintProfile
  ): FallbackAnalysisResult {
    const processingError: ProcessingError = {
      errorId: `conflict-detection-failure-${Date.now()}`,
      component: 'conflict-detector',
      message: 'Unable to complete automated conflict detection',
      technicalDetails: error.message,
      timestamp: new Date(),
      recoverable: true,
      recoveryActions: [
        'Proceeding with manual conflict identification',
        'Providing general stakeholder alignment guidance',
        'Recommending manual constraint review',
      ],
    };
    
    return {
      isFallback: true,
      fallbackReason: 'Conflict detection failure - manual review recommended',
      availableFunctionality: [
        'Basic architecture scoring',
        'General stakeholder guidance',
        'Assumption tracking',
        'Output formatting',
      ],
      unavailableFunctionality: [
        'Automated conflict detection',
        'Specific contradiction analysis',
        'Targeted stakeholder alignment suggestions',
      ],
      triggeringError: processingError,
    };
  }
  
  /**
   * Handle output formatting failures with plain text fallback
   * Requirements: 9.6 - Plain text output fallback for formatting errors
   */
  handleFormattingFailure(
    error: Error,
    analysisResult: AnalysisResult
  ): FallbackAnalysisResult {
    const processingError: ProcessingError = {
      errorId: `formatting-failure-${Date.now()}`,
      component: 'output-formatter',
      message: 'Unable to generate formatted output - providing plain text alternative',
      technicalDetails: error.message,
      timestamp: new Date(),
      recoverable: true,
      recoveryActions: [
        'Generating plain text output',
        'Including all essential analysis content',
        'Maintaining decision support messaging',
      ],
    };
    
    return {
      isFallback: true,
      fallbackReason: 'Output formatting failure - using plain text format',
      availableFunctionality: [
        'Complete analysis results in plain text',
        'All scoring and trade-off information',
        'Conflict warnings and assumptions',
        'Decision support messaging',
      ],
      unavailableFunctionality: [
        'Formatted tables and structured layout',
        'Persona-specific formatting',
        'Advanced visual presentation',
        'Interactive elements',
      ],
      partialResults: analysisResult,
      triggeringError: processingError,
    };
  }
  
  /**
   * Create a minimal fallback analysis when all processing fails
   */
  createMinimalFallback(
    constraints: ConstraintProfile,
    error: Error
  ): FallbackAnalysisResult {
    const processingError: ProcessingError = {
      errorId: `system-failure-${Date.now()}`,
      component: 'system',
      message: 'System unable to complete analysis - providing basic guidance',
      technicalDetails: error.message,
      timestamp: new Date(),
      recoverable: false,
      recoveryActions: [
        'Manual architecture evaluation recommended',
        'Consult with security architecture experts',
        'Review constraint inputs and try again',
      ],
    };
    
    // Create minimal analysis result with basic information
    const minimalResult: Partial<AnalysisResult> = {
      constraintProfile: constraints,
      assumptions: constraints.assumptions.map(assumption => ({
        category: 'input' as const,
        description: assumption,
        impact: 'medium' as const,
        recommendation: 'Validate assumption with organizational stakeholders',
      })),
      interpretationGuidance: [
        'System analysis unavailable - manual evaluation required',
        'Consider consulting with security architecture professionals',
        'Review organizational constraints and priorities with stakeholders',
        'Evaluate each architecture option (IRM-Heavy, URM-Heavy, Hybrid) against specific requirements',
      ],
      analysisTimestamp: new Date(),
      engineVersion: '1.0.0-fallback',
    };
    
    return {
      isFallback: true,
      fallbackReason: 'Complete system failure - manual evaluation required',
      availableFunctionality: [
        'Basic constraint validation',
        'General architecture guidance',
        'Stakeholder consultation recommendations',
      ],
      unavailableFunctionality: [
        'Automated scoring and comparison',
        'Conflict detection and analysis',
        'Detailed trade-off analysis',
        'Persona-specific content generation',
      ],
      partialResults: minimalResult,
      triggeringError: processingError,
    };
  }
}

/**
 * Utility functions for error handling and recovery
 */
export class ErrorHandlingUtils {
  
  /**
   * Determine if an error is recoverable
   */
  static isRecoverableError(error: Error): boolean {
    // Network errors, temporary failures, and calculation errors are typically recoverable
    const recoverablePatterns = [
      'timeout',
      'network',
      'calculation',
      'temporary',
      'retry',
    ];
    
    return recoverablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
  
  /**
   * Generate user-friendly error message from technical error
   */
  static generateUserFriendlyMessage(error: Error, component: string): string {
    const componentMessages: Record<string, string> = {
      'constraint-processor': 'There was an issue processing your organizational constraints.',
      'scoring-calculator': 'There was an issue calculating architecture scores.',
      'conflict-detector': 'There was an issue detecting constraint conflicts.',
      'output-formatter': 'There was an issue formatting the analysis results.',
    };
    
    const baseMessage = componentMessages[component] || 'There was an issue with the analysis.';
    
    if (this.isRecoverableError(error)) {
      return `${baseMessage} The system will attempt to provide alternative analysis.`;
    } else {
      return `${baseMessage} Manual evaluation may be required.`;
    }
  }
  
  /**
   * Create assumption disclosure for error recovery
   */
  static createErrorRecoveryAssumption(
    component: string,
    fallbackMethod: string
  ): AssumptionDisclosure {
    return {
      category: 'calculation',
      description: `${component} encountered an error and used ${fallbackMethod} for analysis`,
      impact: 'high',
      recommendation: `Validate results manually and consider re-running analysis after addressing underlying issues`,
    };
  }
}