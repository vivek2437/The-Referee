/**
 * Architecture Profile Definitions
 * 
 * Implements scoring matrix for IRM-heavy, URM-heavy, and Hybrid architectures
 * with dimension scoring logic and explanatory content.
 * 
 * Requirements: 4.1, 4.2, 3.2, 3.3, 3.4
 */

import {
  ArchitectureType,
  DimensionScores,
  ArchitectureScore,
  ConfidenceLevel,
} from './types';
import {
  ARCHITECTURE_BASE_SCORES,
  ARCHITECTURE_PROFILES,
  DIMENSION_EXPLANATIONS,
} from './constants';

/**
 * Architecture profile with complete scoring and explanatory information
 */
export interface ArchitectureProfile {
  /** Architecture type identifier */
  type: ArchitectureType;
  /** Base scores across all dimensions (1-10 scale) */
  baseScores: DimensionScores;
  /** Strengths of this architecture approach */
  strengths: readonly string[];
  /** Weaknesses and limitations */
  weaknesses: readonly string[];
  /** Risks associated with this approach */
  risks: readonly string[];
  /** Detailed rationale for each dimension score */
  scoringRationale: Record<keyof DimensionScores, string>;
}

/**
 * Dimension analysis with comprehensive explanations
 */
export interface DimensionAnalysis {
  /** Dimension identifier */
  dimension: keyof DimensionScores;
  /** Why this dimension matters for security architecture decisions */
  whyItMatters: string;
  /** Trade-offs introduced by this dimension */
  tradeoffs: string;
  /** Risks of over-optimization in this dimension */
  overOptimizationRisks: string;
  /** How different architectures perform in this dimension */
  architectureComparison: Record<ArchitectureType, {
    score: number;
    explanation: string;
  }>;
}

/**
 * Get complete architecture profile with scoring and explanations
 */
export function getArchitectureProfile(type: ArchitectureType): ArchitectureProfile {
  const baseScores = ARCHITECTURE_BASE_SCORES[type];
  const profile = ARCHITECTURE_PROFILES[type];
  
  return {
    type,
    baseScores,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    risks: profile.risks,
    scoringRationale: generateScoringRationale(type, baseScores),
  };
}

/**
 * Get all architecture profiles for comparison
 */
export function getAllArchitectureProfiles(): ArchitectureProfile[] {
  const architectureTypes: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
  return architectureTypes.map(type => getArchitectureProfile(type));
}

/**
 * Get comprehensive dimension analysis
 */
export function getDimensionAnalysis(dimension: keyof DimensionScores): DimensionAnalysis {
  const explanation = DIMENSION_EXPLANATIONS[dimension];
  
  return {
    dimension,
    whyItMatters: explanation.whyItMatters,
    tradeoffs: explanation.tradeoffs,
    overOptimizationRisks: explanation.overOptimizationRisks,
    architectureComparison: generateArchitectureComparison(dimension),
  };
}

/**
 * Get analysis for all dimensions
 */
export function getAllDimensionAnalyses(): DimensionAnalysis[] {
  const dimensions: (keyof DimensionScores)[] = [
    'identityVerification',
    'behavioralAnalytics', 
    'operationalComplexity',
    'userExperience',
    'complianceAuditability',
    'scalabilityPerformance',
    'costEfficiency',
  ];
  
  return dimensions.map(dimension => getDimensionAnalysis(dimension));
}

/**
 * Create base architecture score structure (without weighting)
 */
export function createBaseArchitectureScore(type: ArchitectureType): ArchitectureScore {
  const profile = getArchitectureProfile(type);
  
  return {
    architectureType: type,
    dimensionScores: profile.baseScores,
    weightedScore: 0, // Will be calculated by scoring calculator
    confidenceLevel: 'Medium' as ConfidenceLevel, // Will be determined by scoring calculator
  };
}

/**
 * Generate scoring rationale for each dimension
 */
function generateScoringRationale(
  type: ArchitectureType, 
  scores: DimensionScores
): Record<keyof DimensionScores, string> {
  // Rationale based on design document scoring matrix explanations
  const rationales: Record<ArchitectureType, Record<keyof DimensionScores, string>> = {
    'IRM-Heavy': {
      identityVerification: 'IRM emphasizes strong authentication and identity controls, providing high confidence in user verification',
      behavioralAnalytics: 'Traditional IRM approaches rely less on behavioral patterns, focusing on established identity controls',
      operationalComplexity: 'Well-established patterns with predictable operational requirements, though still requires skilled teams',
      userExperience: 'Strong verification requirements introduce some user friction but maintain security rigor',
      complianceAuditability: 'Excellent audit trails and clear control frameworks support regulatory compliance',
      scalabilityPerformance: 'Predictable scaling patterns but may have limitations with dynamic user behavior',
      costEfficiency: 'Moderate costs with established infrastructure patterns and predictable operational overhead',
    },
    'URM-Heavy': {
      identityVerification: 'Relies more on behavioral patterns than traditional strong authentication mechanisms',
      behavioralAnalytics: 'Specializes in sophisticated user behavior analysis and adaptive threat detection',
      operationalComplexity: 'Requires advanced analytics capabilities and machine learning expertise',
      userExperience: 'Minimizes user friction through adaptive controls and behavioral-based decisions',
      complianceAuditability: 'Algorithmic decisions may be harder to audit and explain to regulators',
      scalabilityPerformance: 'Analytics platforms handle dynamic scaling well with cloud-native architectures',
      costEfficiency: 'Significant infrastructure investment required for analytics and machine learning capabilities',
    },
    'Hybrid': {
      identityVerification: 'Balances strong authentication with behavioral insights for comprehensive verification',
      behavioralAnalytics: 'Incorporates behavioral analysis while maintaining traditional control frameworks',
      operationalComplexity: 'Requires expertise in both traditional security and advanced analytics approaches',
      userExperience: 'Moderate friction through balanced approach between security rigor and usability',
      complianceAuditability: 'Good audit support through traditional controls supplemented by behavioral insights',
      scalabilityPerformance: 'Flexible scaling approach adapting to both predictable and dynamic patterns',
      costEfficiency: 'Balanced investment across traditional and advanced security capabilities',
    },
  };
  
  return rationales[type];
}

/**
 * Generate architecture comparison for a specific dimension
 */
function generateArchitectureComparison(
  dimension: keyof DimensionScores
): Record<ArchitectureType, { score: number; explanation: string }> {
  const architectureTypes: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
  const comparison: Record<ArchitectureType, { score: number; explanation: string }> = {} as any;
  
  architectureTypes.forEach(type => {
    const profile = getArchitectureProfile(type);
    comparison[type] = {
      score: profile.baseScores[dimension],
      explanation: profile.scoringRationale[dimension],
    };
  });
  
  return comparison;
}

/**
 * Validate architecture profile completeness
 */
export function validateArchitectureProfile(profile: ArchitectureProfile): boolean {
  // Ensure all required fields are present
  if (!profile.type || !profile.baseScores || !profile.strengths || !profile.weaknesses || !profile.risks) {
    return false;
  }
  
  // Ensure all dimension scores are within valid range (1-10)
  const scores = Object.values(profile.baseScores);
  if (scores.some(score => score < 1 || score > 10)) {
    return false;
  }
  
  // Ensure scoring rationale exists for all dimensions
  const dimensions: (keyof DimensionScores)[] = [
    'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
    'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
  ];
  
  return dimensions.every(dim => profile.scoringRationale[dim] && profile.scoringRationale[dim].length > 0);
}