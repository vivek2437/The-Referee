/**
 * SecureStack Referee - Enterprise Security Architecture Decision Support System
 * 
 * Main entry point for the application
 */

// Export all public types and interfaces
export * from './types';
export * from './constants';

// Export constraint processing functionality
export * from './constraint-processor';

// Export scoring and analysis functionality
export * from './scoring-calculator';
export * from './near-tie-detector';
export * from './interactive-constraint-modifier';

// Export content validation and messaging
export * from './content-validator';
export * from './decision-support-messaging';

// Export persona and output formatting functionality
export * from './persona-content-generator';
export * from './output-formatter';

// Export error handling and recovery functionality
export * from './error-handling';
export * from './system-error-handler';

// Version and metadata
export const VERSION = '1.0.0';
export const SYSTEM_NAME = 'SecureStack Referee';

/**
 * System capabilities and boundaries
 */
export const SYSTEM_CAPABILITIES = {
  provides: [
    'Comparative analysis of IRM-heavy, URM-heavy, and Hybrid security architectures',
    'Trade-off identification and conflict detection',
    'Transparent assumption tracking',
    'Persona-specific content generation',
    'Enterprise-appropriate decision support',
  ],
  doesNotProvide: [
    'Universal architecture recommendations',
    'Implementation guidance or vendor recommendations', 
    'Compliance guarantees or legal interpretations',
    'Automated decision making',
  ],
  requiresHumanOversight: true,
} as const;

/**
 * System disclaimer for all outputs
 */
export const SYSTEM_DISCLAIMER = 
  'This system provides decision support analysis, not decisions. ' +
  'All architectural choices require human oversight, professional validation, ' +
  'and consideration of organization-specific factors not captured in this analysis.';

/**
 * Main Analysis Orchestration Function
 * 
 * Integrates constraint processing, scoring, conflict detection, and output formatting
 * to provide end-to-end analysis workflow for security architecture decision support.
 * 
 * Requirements: All requirements integrated
 */

import {
  ConstraintProfile,
  ConstraintProfileInput,
  AnalysisResult,
  OutputPreferences,
  UserPersona,
} from './types';
import { FormattedOutput } from './output-formatter';
import { processConstraintProfileEnhanced } from './constraint-processor';
import { detectConflicts } from './conflict-detector';
import { calculateWeightedScores } from './scoring-calculator';
import { OutputFormatter } from './output-formatter';
import { PersonaContentGenerator } from './persona-content-generator';

/**
 * Main SecureStack Referee Analysis Interface
 */
export interface SecureStackReferee {
  analyzeArchitectures: (
    constraints: ConstraintProfileInput,
    preferences?: Partial<OutputPreferences>
  ) => Promise<AnalysisResult>;
  
  formatAnalysisOutput: (
    analysisResult: AnalysisResult,
    preferences?: Partial<OutputPreferences>
  ) => Promise<FormattedOutput>;
  
  performCompleteAnalysis: (
    constraints: ConstraintProfileInput,
    preferences?: Partial<OutputPreferences>
  ) => Promise<FormattedOutput>;
}

/**
 * Default output preferences
 */
const DEFAULT_OUTPUT_PREFERENCES: OutputPreferences = {
  personaContext: PersonaContentGenerator.getPersonaContext('CISO'),
  includeDetailedExplanations: true,
  emphasizeCompliance: false,
  includeCostAnalysis: true,
  numericFormat: 'detailed',
};

/**
 * Main analysis orchestration function
 * 
 * Integrates all system components to provide complete security architecture analysis
 * 
 * @param constraints - Organizational constraint inputs
 * @param preferences - Output formatting preferences
 * @returns Complete analysis result with all components integrated
 */
export async function analyzeArchitectures(
  constraints: ConstraintProfileInput,
  preferences: Partial<OutputPreferences> = {}
): Promise<AnalysisResult> {
  // Step 1: Process and validate constraint inputs
  const constraintResult = processConstraintProfileEnhanced(constraints);
  
  if (constraintResult.processingStatus === 'failed') {
    throw new Error('Constraint processing failed: ' + constraintResult.enhancedErrors.map(e => e.message).join(', '));
  }
  
  const constraintProfile = constraintResult.profile;
  
  // Step 2: Detect constraint conflicts
  const conflictResult = detectConflicts(constraintProfile);
  
  // Step 3: Calculate weighted scores for all architectures
  const scoringResult = calculateWeightedScores(constraintProfile);
  
  // Step 4: Compile complete analysis result
  const analysisResult: AnalysisResult = {
    constraintProfile: constraintProfile,
    architectureScores: scoringResult.architectureScores,
    detectedConflicts: conflictResult.conflicts,
    tradeoffSummary: scoringResult.tradeoffAnalysis,
    nearTieDetection: scoringResult.nearTieDetection,
    assumptions: [
      ...constraintResult.assumptions,
      ...scoringResult.methodology.assumptions.map(assumption => ({
        category: 'calculation' as const,
        description: assumption,
        impact: 'medium' as const,
        recommendation: 'Validate assumption through stakeholder consultation',
      })),
    ],
    interpretationGuidance: scoringResult.interpretationGuidance,
    analysisTimestamp: new Date(),
    engineVersion: VERSION,
  };
  
  return analysisResult;
}

/**
 * Format analysis output for enterprise consumption
 * 
 * @param analysisResult - Complete analysis result
 * @param preferences - Output formatting preferences
 * @returns Formatted output ready for enterprise presentation
 */
export async function formatAnalysisOutput(
  analysisResult: AnalysisResult,
  preferences: Partial<OutputPreferences> = {}
): Promise<FormattedOutput> {
  const outputPreferences: OutputPreferences = {
    ...DEFAULT_OUTPUT_PREFERENCES,
    ...preferences,
  };
  
  const formatter = new OutputFormatter();
  return formatter.formatAnalysisOutput(analysisResult, outputPreferences);
}

/**
 * Complete end-to-end analysis workflow
 * 
 * Performs constraint processing, analysis, and formatting in a single operation
 * 
 * @param constraints - Organizational constraint inputs
 * @param preferences - Output formatting preferences
 * @returns Complete formatted analysis ready for enterprise use
 */
export async function performCompleteAnalysis(
  constraints: ConstraintProfileInput,
  preferences: Partial<OutputPreferences> = {}
): Promise<FormattedOutput> {
  // Perform analysis
  const analysisResult = await analyzeArchitectures(constraints, preferences);
  
  // Format output
  const formattedOutput = await formatAnalysisOutput(analysisResult, preferences);
  
  return formattedOutput;
}

/**
 * Create SecureStack Referee instance with default configuration
 */
export function createSecureStackReferee(): SecureStackReferee {
  return {
    analyzeArchitectures,
    formatAnalysisOutput,
    performCompleteAnalysis,
  };
}

/**
 * Default SecureStack Referee instance
 */
export const secureStackReferee = createSecureStackReferee();