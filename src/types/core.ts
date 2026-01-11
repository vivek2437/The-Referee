/**
 * Core data models and interfaces for SecureStack Referee
 * Based on the design document specifications
 */

import { NearTieDetectionResult } from '../near-tie-detector';

/**
 * Organizational constraint profile with weighted inputs (1-10 scale)
 */
export interface ConstraintProfile {
  /** Risk tolerance (inverse scale: 1 = high tolerance, 10 = very low tolerance) */
  riskTolerance: number;
  /** Compliance strictness (1 = minimal requirements, 10 = highly regulated environment) */
  complianceStrictness: number;
  /** Cost sensitivity (1 = cost not a factor, 10 = extremely cost-constrained) */
  costSensitivity: number;
  /** User experience priority (1 = security over UX, 10 = UX critical for adoption) */
  userExperiencePriority: number;
  /** Operational maturity (1 = basic capabilities, 10 = advanced security operations) */
  operationalMaturity: number;
  /** Business agility (1 = stable environment, 10 = rapid change requirements) */
  businessAgility: number;
  /** Tracks whether all inputs were provided or defaults were used */
  inputCompleteness: boolean;
  /** List of explicit assumptions made for missing inputs */
  assumptions: string[];
}

/**
 * Architecture types supported by the system
 */
export type ArchitectureType = 'IRM-Heavy' | 'URM-Heavy' | 'Hybrid';

/**
 * Evaluation dimensions for architecture comparison
 */
export interface DimensionScores {
  /** Identity verification strength and authentication rigor */
  identityVerification: number;
  /** Behavioral analytics sophistication and threat detection */
  behavioralAnalytics: number;
  /** Operational complexity and management overhead */
  operationalComplexity: number;
  /** User experience friction and usability impact */
  userExperience: number;
  /** Compliance auditability and regulatory support */
  complianceAuditability: number;
  /** Scalability and performance characteristics */
  scalabilityPerformance: number;
  /** Cost efficiency and resource optimization */
  costEfficiency: number;
}

/**
 * Confidence level for scoring results
 */
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

/**
 * Architecture scoring results with comparative analysis
 */
export interface ArchitectureScore {
  /** Type of architecture being scored */
  architectureType: ArchitectureType;
  /** Scores across all evaluation dimensions */
  dimensionScores: DimensionScores;
  /** Weighted total score based on organizational constraints */
  weightedScore: number;
  /** Confidence level in the scoring results */
  confidenceLevel: ConfidenceLevel;
}

/**
 * Detected constraint conflicts with explanations
 */
export interface ConflictWarning {
  /** Unique identifier for the conflict type */
  conflictId: string;
  /** Human-readable title for the conflict */
  title: string;
  /** Detailed explanation of why the conflict exists */
  description: string;
  /** Implications of the conflict for decision-making */
  implications: string[];
  /** Suggested approaches for resolving the conflict */
  resolutionSuggestions: string[];
  /** Constraint values that triggered this conflict */
  triggeringConstraints: Partial<ConstraintProfile>;
}

/**
 * Trade-off analysis summary
 */
export interface TradeoffAnalysis {
  /** Key decision factors identified from the analysis */
  keyDecisionFactors: string[];
  /** Primary trade-offs between architecture options */
  primaryTradeoffs: {
    dimension: keyof DimensionScores;
    description: string;
    architectureImpacts: Record<ArchitectureType, string>;
  }[];
  /** Whether scores are close enough to be considered a near-tie */
  isNearTie: boolean;
  /** Threshold used for near-tie detection */
  nearTieThreshold: number;
}

/**
 * Assumption disclosure for transparency
 */
export interface AssumptionDisclosure {
  /** Category of the assumption (input, calculation, interpretation) */
  category: 'input' | 'calculation' | 'interpretation';
  /** Description of what was assumed */
  description: string;
  /** Impact of the assumption on results */
  impact: 'low' | 'medium' | 'high';
  /** Recommendation for validating or refining the assumption */
  recommendation: string;
}

/**
 * Complete analysis result containing all outputs
 */
export interface AnalysisResult {
  /** Input constraint profile used for analysis */
  constraintProfile: ConstraintProfile;
  /** Scores for all architecture options */
  architectureScores: ArchitectureScore[];
  /** Any constraint conflicts detected */
  detectedConflicts: ConflictWarning[];
  /** Trade-off analysis summary */
  tradeoffSummary: TradeoffAnalysis;
  /** Enhanced near-tie detection results */
  nearTieDetection?: NearTieDetectionResult;
  /** All assumptions made during analysis */
  assumptions: AssumptionDisclosure[];
  /** Guidance for interpreting and using results */
  interpretationGuidance: string[];
  /** Timestamp when analysis was performed */
  analysisTimestamp: Date;
  /** Version of the analysis engine used */
  engineVersion: string;
}

/**
 * User persona types supported by the system
 */
export type UserPersona = 'CISO' | 'Enterprise_Security_Architect';

/**
 * Persona-specific context for tailored outputs
 */
export interface PersonaContext {
  /** Selected user persona */
  persona: UserPersona;
  /** Persona-specific responsibilities and concerns */
  responsibilities: string[];
  /** Key pain points this persona faces */
  painPoints: string[];
  /** Success criteria for this persona */
  successCriteria: string[];
}

/**
 * Output formatting preferences
 */
export interface OutputPreferences {
  /** Selected user persona for content tailoring */
  personaContext: PersonaContext;
  /** Whether to include detailed technical explanations */
  includeDetailedExplanations: boolean;
  /** Whether to emphasize compliance-related content */
  emphasizeCompliance: boolean;
  /** Whether to include cost-focused analysis */
  includeCostAnalysis: boolean;
  /** Format preference for numeric data presentation */
  numericFormat: 'detailed' | 'summary' | 'minimal';
}