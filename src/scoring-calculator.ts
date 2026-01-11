/**
 * Weighted Scoring Calculator
 * 
 * Creates scoring calculation engine using constraint weights with transparent
 * methodology and step-by-step explanation. Includes score interpretation logic
 * for meaningful differences vs near-ties, with comprehensive error handling
 * and fallback analysis capabilities.
 * 
 * Requirements: 7.1, 7.2, 10.1, 10.2, 9.4, 9.6
 */

import {
  ConstraintProfile,
  ArchitectureScore,
  ArchitectureType,
  DimensionScores,
  ConfidenceLevel,
  TradeoffAnalysis,
} from './types';
import { getArchitectureProfile, createBaseArchitectureScore } from './architecture-profiles';
import { NearTieDetector, NearTieDetectionResult } from './near-tie-detector';
import { NEAR_TIE_THRESHOLD } from './constants';
import { ProcessingErrorHandler, FallbackAnalysisResult } from './error-handling';

/**
 * Scoring methodology explanation for transparency
 */
export interface ScoringMethodology {
  /** Step-by-step calculation process */
  calculationSteps: ScoringStep[];
  /** How constraint weights influence the final scores */
  weightInfluence: WeightInfluenceExplanation[];
  /** Methodology assumptions and limitations */
  assumptions: string[];
  /** Confidence factors affecting result reliability */
  confidenceFactors: ConfidenceFactorExplanation[];
}

/**
 * Individual step in the scoring calculation
 */
export interface ScoringStep {
  /** Step number in the process */
  stepNumber: number;
  /** Description of what this step does */
  description: string;
  /** Input values for this step */
  inputs: Record<string, number | string>;
  /** Calculation performed */
  calculation: string;
  /** Result of this step */
  result: number | string;
  /** Explanation of why this step is necessary */
  rationale: string;
}

/**
 * Explanation of how constraint weights influence scoring
 */
export interface WeightInfluenceExplanation {
  /** Constraint that influences scoring */
  constraint: keyof ConstraintProfile;
  /** Weight value (1-10) */
  weight: number;
  /** Dimensions most affected by this constraint */
  affectedDimensions: (keyof DimensionScores)[];
  /** How the weight changes the relative importance */
  influence: string;
  /** Impact magnitude on final scores */
  impactMagnitude: 'low' | 'medium' | 'high';
}

/**
 * Factors affecting confidence in scoring results
 */
export interface ConfidenceFactorExplanation {
  /** Factor affecting confidence */
  factor: string;
  /** Impact on confidence (positive or negative) */
  impact: 'increases' | 'decreases';
  /** Magnitude of the impact */
  magnitude: 'low' | 'medium' | 'high';
  /** Explanation of why this factor matters */
  explanation: string;
}

/**
 * Complete scoring results with methodology and error handling
 */
export interface ScoringResults {
  /** Scored architectures in descending order */
  architectureScores: ArchitectureScore[];
  /** Detailed methodology explanation */
  methodology: ScoringMethodology;
  /** Trade-off analysis including near-tie detection */
  tradeoffAnalysis: TradeoffAnalysis;
  /** Near-tie detection results with enhanced messaging */
  nearTieDetection: NearTieDetectionResult;
  /** Overall confidence in the results */
  overallConfidence: ConfidenceLevel;
  /** Interpretation guidance for using the scores */
  interpretationGuidance: string[];
  /** Whether this is a fallback result due to processing errors */
  isFallback: boolean;
  /** Fallback information if applicable */
  fallbackInfo?: FallbackAnalysisResult;
}

/**
 * Configuration for meaningful difference detection
 */
export const MEANINGFUL_DIFFERENCE_THRESHOLD = 1.0; // Points difference considered meaningful

/**
 * Calculate weighted scores for all architectures with error handling
 * Requirements: 9.4, 9.6 - Fallback analysis and reduced functionality modes
 */
export function calculateWeightedScores(constraints: ConstraintProfile): ScoringResults {
  const errorHandler = new ProcessingErrorHandler();
  
  try {
    return calculateWeightedScoresInternal(constraints);
  } catch (error) {
    // Handle scoring calculation failure with fallback
    const fallbackResult = errorHandler.handleScoringFailure(
      error instanceof Error ? error : new Error('Unknown scoring error'),
      constraints
    );
    
    return createFallbackScoringResults(constraints, fallbackResult);
  }
}

/**
 * Internal scoring calculation function
 */
function calculateWeightedScoresInternal(constraints: ConstraintProfile): ScoringResults {
  const architectureTypes: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
  
  // Step 1: Create base architecture scores
  const baseScores = architectureTypes.map(type => createBaseArchitectureScore(type));
  
  // Step 2: Calculate constraint weights mapping to dimensions
  const dimensionWeights = calculateDimensionWeights(constraints);
  
  // Step 3: Apply weights to calculate final scores
  const weightedScores = baseScores.map(score => 
    applyWeightsToArchitecture(score, dimensionWeights, constraints)
  );
  
  // Step 4: Sort by weighted score (descending)
  const sortedScores = weightedScores.sort((a, b) => b.weightedScore - a.weightedScore);
  
  // Step 5: Generate methodology explanation
  const methodology = generateScoringMethodology(constraints, dimensionWeights, sortedScores);
  
  // Step 6: Perform enhanced near-tie detection
  const nearTieDetector = new NearTieDetector();
  const nearTieDetection = nearTieDetector.detectNearTie(sortedScores);
  
  // Step 7: Perform trade-off analysis using near-tie results
  const tradeoffAnalysis = performTradeoffAnalysis(sortedScores, constraints, nearTieDetection);
  
  // Step 8: Determine overall confidence
  const overallConfidence = determineOverallConfidence(constraints, sortedScores);
  
  // Step 9: Generate interpretation guidance with near-tie awareness
  const interpretationGuidance = generateInterpretationGuidance(sortedScores, tradeoffAnalysis, nearTieDetection);
  
  return {
    architectureScores: sortedScores,
    methodology,
    tradeoffAnalysis,
    nearTieDetection,
    overallConfidence,
    interpretationGuidance,
    isFallback: false,
  };
}

/**
 * Create fallback scoring results when calculation fails
 * Requirements: 9.4, 9.6 - Fallback analysis for scoring calculation failures
 */
function createFallbackScoringResults(
  constraints: ConstraintProfile,
  fallbackResult: FallbackAnalysisResult
): ScoringResults {
  // Create simplified architecture scores using base profiles only
  const architectureTypes: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
  const fallbackScores: ArchitectureScore[] = architectureTypes.map(type => {
    const baseScore = createBaseArchitectureScore(type);
    return {
      ...baseScore,
      weightedScore: calculateSimpleScore(baseScore.dimensionScores),
      confidenceLevel: 'Low' as ConfidenceLevel,
    };
  });
  
  // Sort by simple score
  const sortedScores = fallbackScores.sort((a, b) => b.weightedScore - a.weightedScore);
  
  // Create simplified methodology
  const fallbackMethodology: ScoringMethodology = {
    calculationSteps: [{
      stepNumber: 1,
      description: 'Fallback scoring using base architecture profiles',
      inputs: { method: 'simplified' },
      calculation: 'Average of dimension scores',
      result: 'Basic comparative scores',
      rationale: 'Full weighted calculation unavailable due to processing error',
    }],
    weightInfluence: [],
    assumptions: [
      'Using base architecture profiles without constraint weighting',
      'Scores are simplified averages, not weighted calculations',
      'Results have reduced accuracy due to processing limitations',
    ],
    confidenceFactors: [{
      factor: 'Processing error fallback',
      impact: 'decreases',
      magnitude: 'high',
      explanation: 'Simplified calculation method reduces result accuracy',
    }],
  };
  
  // Create simplified trade-off analysis
  const fallbackTradeoff: TradeoffAnalysis = {
    keyDecisionFactors: [
      'Full analysis unavailable - manual evaluation recommended',
      'Consider organizational constraints manually',
      'Consult with security architecture experts',
    ],
    primaryTradeoffs: [],
    isNearTie: true, // Default to near-tie when uncertain
    nearTieThreshold: NEAR_TIE_THRESHOLD,
  };
  
  // Create fallback near-tie detection
  const fallbackNearTie: NearTieDetectionResult = {
    isNearTie: true,
    tieType: 'three-way-tie',
    tiedArchitectures: architectureTypes,
    scoreDifference: 0,
    thresholdUsed: NEAR_TIE_THRESHOLD,
    detectionConfidence: 'Low',
    messaging: {
      primaryMessage: 'Analysis unavailable - all options require manual evaluation',
      explanation: 'System unable to complete scoring calculation',
      tradeoffEmphasis: 'Manual trade-off analysis required',
      numericScoreWarning: 'Numeric scores are unreliable due to processing error',
      decisionGuidance: [
        'Consult with security architecture professionals',
        'Evaluate each option against specific organizational requirements',
        'Consider proof-of-concept validation for preferred options',
      ],
    },
  };
  
  return {
    architectureScores: sortedScores,
    methodology: fallbackMethodology,
    tradeoffAnalysis: fallbackTradeoff,
    nearTieDetection: fallbackNearTie,
    overallConfidence: 'Low',
    interpretationGuidance: [
      'Analysis results are limited due to processing error',
      'Manual evaluation by security professionals is strongly recommended',
      'Consider retrying analysis after addressing system issues',
      'Use qualitative comparison of architecture patterns instead of numeric scores',
    ],
    isFallback: true,
    fallbackInfo: fallbackResult,
  };
}

/**
 * Calculate simple score as average of dimension scores
 */
function calculateSimpleScore(dimensionScores: DimensionScores): number {
  const scores = Object.values(dimensionScores);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

/**
 * Map constraint weights to dimension importance
 */
function calculateDimensionWeights(constraints: ConstraintProfile): Record<keyof DimensionScores, number> {
  // Mapping based on how each constraint influences each dimension
  // Higher constraint values increase the importance of related dimensions
  
  return {
    identityVerification: 
      (constraints.riskTolerance * 0.4) + // Lower risk tolerance = higher identity verification importance
      (constraints.complianceStrictness * 0.3) + // Higher compliance = more identity verification
      (5 * 0.3), // Base importance
      
    behavioralAnalytics:
      ((10 - constraints.riskTolerance) * 0.3) + // Higher risk tolerance = more behavioral analytics
      (constraints.operationalMaturity * 0.4) + // Higher maturity = can handle analytics
      (constraints.businessAgility * 0.3), // Higher agility = adaptive controls
      
    operationalComplexity:
      (constraints.operationalMaturity * 0.5) + // Higher maturity = can handle complexity
      ((10 - constraints.costSensitivity) * 0.3) + // Lower cost sensitivity = can afford complexity
      (5 * 0.2), // Base importance
      
    userExperience:
      (constraints.userExperiencePriority * 0.6) + // Direct mapping
      (constraints.businessAgility * 0.2) + // Agility needs good UX
      ((10 - constraints.riskTolerance) * 0.2), // Higher risk tolerance = better UX acceptable
      
    complianceAuditability:
      (constraints.complianceStrictness * 0.7) + // Direct mapping
      (constraints.riskTolerance * 0.3), // Lower risk tolerance = more audit needs
      
    scalabilityPerformance:
      (constraints.businessAgility * 0.4) + // Agility needs scalability
      (constraints.operationalMaturity * 0.3) + // Maturity enables scalability
      ((10 - constraints.costSensitivity) * 0.3), // Lower cost sensitivity = can invest in scalability
      
    costEfficiency:
      (constraints.costSensitivity * 0.8) + // Direct mapping
      ((10 - constraints.operationalMaturity) * 0.2), // Lower maturity = need cost efficiency
  };
}

/**
 * Apply dimension weights to calculate final architecture score
 */
function applyWeightsToArchitecture(
  baseScore: ArchitectureScore,
  dimensionWeights: Record<keyof DimensionScores, number>,
  constraints: ConstraintProfile
): ArchitectureScore {
  const dimensions: (keyof DimensionScores)[] = [
    'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
    'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
  ];
  
  // Calculate weighted score
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  dimensions.forEach(dimension => {
    const dimensionScore = baseScore.dimensionScores[dimension];
    const weight = dimensionWeights[dimension];
    totalWeightedScore += dimensionScore * weight;
    totalWeight += weight;
  });
  
  const finalScore = totalWeightedScore / totalWeight;
  
  // Determine confidence level based on input completeness and constraint consistency
  const confidence = determineConfidenceLevel(constraints, baseScore.architectureType);
  
  return {
    ...baseScore,
    weightedScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
    confidenceLevel: confidence,
  };
}

/**
 * Determine confidence level for individual architecture score
 */
function determineConfidenceLevel(
  constraints: ConstraintProfile,
  architectureType: ArchitectureType
): ConfidenceLevel {
  let confidenceScore = 100;
  
  // Reduce confidence for incomplete inputs
  if (!constraints.inputCompleteness) {
    confidenceScore -= 20;
  }
  
  // Reduce confidence for extreme constraint values (may indicate conflicts)
  const constraintValues = [
    constraints.riskTolerance,
    constraints.complianceStrictness,
    constraints.costSensitivity,
    constraints.userExperiencePriority,
    constraints.operationalMaturity,
    constraints.businessAgility,
  ];
  
  const extremeValues = constraintValues.filter(val => val <= 2 || val >= 9).length;
  confidenceScore -= extremeValues * 5;
  
  // Reduce confidence for many assumptions
  confidenceScore -= constraints.assumptions.length * 3;
  
  if (confidenceScore >= 80) return 'High';
  if (confidenceScore >= 60) return 'Medium';
  return 'Low';
}

/**
 * Generate detailed scoring methodology explanation
 */
function generateScoringMethodology(
  constraints: ConstraintProfile,
  dimensionWeights: Record<keyof DimensionScores, number>,
  scores: ArchitectureScore[]
): ScoringMethodology {
  const calculationSteps: ScoringStep[] = [
    {
      stepNumber: 1,
      description: 'Load base architecture scores from design matrix',
      inputs: { architectures: '3', dimensions: '7' },
      calculation: 'Base scores from comparative analysis matrix',
      result: 'IRM-Heavy, URM-Heavy, Hybrid base scores loaded',
      rationale: 'Provides standardized starting point for all architectures across dimensions',
    },
    {
      stepNumber: 2,
      description: 'Map organizational constraints to dimension weights',
      inputs: { 
        riskTolerance: constraints.riskTolerance,
        complianceStrictness: constraints.complianceStrictness,
        costSensitivity: constraints.costSensitivity,
      },
      calculation: 'Constraint values × dimension influence factors',
      result: 'Dimension-specific weight multipliers',
      rationale: 'Reflects organizational priorities in the scoring calculation',
    },
    {
      stepNumber: 3,
      description: 'Calculate weighted scores for each architecture',
      inputs: { baseScores: 'matrix', weights: 'calculated' },
      calculation: 'Σ(dimension_score × dimension_weight) / Σ(dimension_weight)',
      result: `Weighted scores: ${scores.map(s => `${s.architectureType}=${s.weightedScore}`).join(', ')}`,
      rationale: 'Produces organization-specific comparative scores',
    },
    {
      stepNumber: 4,
      description: 'Determine confidence levels and rank results',
      inputs: { inputCompleteness: constraints.inputCompleteness.toString() },
      calculation: 'Confidence factors analysis + score ranking',
      result: 'Final ranked results with confidence indicators',
      rationale: 'Provides transparency about result reliability and relative performance',
    },
  ];
  
  const weightInfluence = generateWeightInfluenceExplanations(constraints, dimensionWeights);
  
  const assumptions = [
    'Base architecture scores represent typical implementations of each pattern',
    'Constraint weights linearly influence dimension importance',
    'All dimensions are measurable on a consistent 1-10 scale',
    'Organizational constraints accurately reflect actual priorities',
    'Architecture patterns can be meaningfully compared across dimensions',
  ];
  
  const confidenceFactors = generateConfidenceFactorExplanations(constraints);
  
  return {
    calculationSteps,
    weightInfluence,
    assumptions,
    confidenceFactors,
  };
}

/**
 * Generate weight influence explanations
 */
function generateWeightInfluenceExplanations(
  constraints: ConstraintProfile,
  dimensionWeights: Record<keyof DimensionScores, number>
): WeightInfluenceExplanation[] {
  return [
    {
      constraint: 'riskTolerance',
      weight: constraints.riskTolerance,
      affectedDimensions: ['identityVerification', 'complianceAuditability'],
      influence: 'Lower risk tolerance increases emphasis on strong identity controls and audit capabilities',
      impactMagnitude: constraints.riskTolerance <= 3 ? 'high' : constraints.riskTolerance >= 7 ? 'low' : 'medium',
    },
    {
      constraint: 'complianceStrictness',
      weight: constraints.complianceStrictness,
      affectedDimensions: ['complianceAuditability', 'identityVerification'],
      influence: 'Higher compliance requirements prioritize auditability and traditional identity controls',
      impactMagnitude: constraints.complianceStrictness >= 8 ? 'high' : constraints.complianceStrictness <= 3 ? 'low' : 'medium',
    },
    {
      constraint: 'userExperiencePriority',
      weight: constraints.userExperiencePriority,
      affectedDimensions: ['userExperience', 'behavioralAnalytics'],
      influence: 'Higher UX priority favors low-friction approaches and adaptive behavioral controls',
      impactMagnitude: constraints.userExperiencePriority >= 8 ? 'high' : constraints.userExperiencePriority <= 3 ? 'low' : 'medium',
    },
    {
      constraint: 'operationalMaturity',
      weight: constraints.operationalMaturity,
      affectedDimensions: ['operationalComplexity', 'behavioralAnalytics', 'scalabilityPerformance'],
      influence: 'Higher maturity enables handling of complex systems and advanced analytics',
      impactMagnitude: Math.abs(constraints.operationalMaturity - 5) >= 3 ? 'high' : 'medium',
    },
  ];
}

/**
 * Generate confidence factor explanations
 */
function generateConfidenceFactorExplanations(constraints: ConstraintProfile): ConfidenceFactorExplanation[] {
  const factors: ConfidenceFactorExplanation[] = [];
  
  if (constraints.inputCompleteness) {
    factors.push({
      factor: 'Complete constraint inputs provided',
      impact: 'increases',
      magnitude: 'medium',
      explanation: 'All organizational constraints specified, reducing need for assumptions',
    });
  } else {
    factors.push({
      factor: 'Missing constraint inputs',
      impact: 'decreases',
      magnitude: 'medium',
      explanation: 'Default assumptions used for missing inputs may not reflect actual priorities',
    });
  }
  
  if (constraints.assumptions.length > 3) {
    factors.push({
      factor: 'Multiple assumptions required',
      impact: 'decreases',
      magnitude: 'high',
      explanation: 'Significant assumptions about organizational context may affect accuracy',
    });
  }
  
  return factors;
}

/**
 * Perform trade-off analysis and near-tie detection
 */
function performTradeoffAnalysis(
  scores: ArchitectureScore[],
  constraints: ConstraintProfile,
  nearTieDetection: NearTieDetectionResult
): TradeoffAnalysis {
  // Use enhanced near-tie detection results
  const isNearTie = nearTieDetection.isNearTie;
  const nearTieThreshold = nearTieDetection.thresholdUsed;
  
  // Identify key decision factors
  const keyDecisionFactors = identifyKeyDecisionFactors(scores, constraints, nearTieDetection);
  
  // Generate primary trade-offs
  const primaryTradeoffs = generatePrimaryTradeoffs(scores);
  
  return {
    keyDecisionFactors,
    primaryTradeoffs,
    isNearTie,
    nearTieThreshold,
  };
}

/**
 * Identify key decision factors based on scoring results
 */
function identifyKeyDecisionFactors(
  scores: ArchitectureScore[],
  constraints: ConstraintProfile,
  nearTieDetection: NearTieDetectionResult
): string[] {
  const factors: string[] = [];
  
  // Add near-tie specific factors
  if (nearTieDetection.isNearTie) {
    factors.push(nearTieDetection.messaging.primaryMessage);
    factors.push('Qualitative trade-offs should drive decision over numeric scores');
  }
  
  // Check for high-priority constraints
  if (constraints.complianceStrictness >= 8) {
    factors.push('Regulatory compliance requirements are critical');
  }
  
  if (constraints.userExperiencePriority >= 8) {
    factors.push('User experience is a top priority');
  }
  
  if (constraints.costSensitivity >= 8) {
    factors.push('Cost optimization is essential');
  }
  
  if (constraints.riskTolerance <= 3) {
    factors.push('Low risk tolerance requires strong security controls');
  }
  
  // Add tie-specific decision factors
  if (nearTieDetection.tieType === 'three-way-tie') {
    factors.push('All architectures show similar quantitative suitability');
  } else if (nearTieDetection.tieType === 'two-way-tie') {
    factors.push(`${nearTieDetection.tiedArchitectures.join(' and ')} show similar quantitative suitability`);
  }
  
  return factors;
}

/**
 * Generate primary trade-offs between architectures
 */
function generatePrimaryTradeoffs(scores: ArchitectureScore[]): TradeoffAnalysis['primaryTradeoffs'] {
  const dimensions: (keyof DimensionScores)[] = [
    'identityVerification', 'behavioralAnalytics', 'userExperience', 'complianceAuditability'
  ];
  
  return dimensions.map(dimension => ({
    dimension,
    description: getTradeoffDescription(dimension),
    architectureImpacts: {
      'IRM-Heavy': getArchitectureImpact('IRM-Heavy', dimension),
      'URM-Heavy': getArchitectureImpact('URM-Heavy', dimension),
      'Hybrid': getArchitectureImpact('Hybrid', dimension),
    },
  }));
}

/**
 * Get trade-off description for a dimension
 */
function getTradeoffDescription(dimension: keyof DimensionScores): string {
  const descriptions: Record<keyof DimensionScores, string> = {
    identityVerification: 'Strong identity controls vs. user experience friction',
    behavioralAnalytics: 'Advanced threat detection vs. operational complexity',
    operationalComplexity: 'System sophistication vs. management overhead',
    userExperience: 'Security rigor vs. user productivity',
    complianceAuditability: 'Regulatory support vs. system flexibility',
    scalabilityPerformance: 'Growth capability vs. infrastructure investment',
    costEfficiency: 'Budget optimization vs. capability breadth',
  };
  
  return descriptions[dimension];
}

/**
 * Get architecture impact for a specific dimension
 */
function getArchitectureImpact(architecture: ArchitectureType, dimension: keyof DimensionScores): string {
  const profile = getArchitectureProfile(architecture);
  const score = profile.baseScores[dimension];
  
  if (score >= 8) return 'Strong advantage';
  if (score >= 6) return 'Moderate advantage';
  if (score >= 4) return 'Balanced approach';
  return 'Potential limitation';
}

/**
 * Determine overall confidence in results
 */
function determineOverallConfidence(
  constraints: ConstraintProfile,
  scores: ArchitectureScore[]
): ConfidenceLevel {
  const individualConfidences = scores.map(score => score.confidenceLevel);
  
  // If any architecture has low confidence, overall is low
  if (individualConfidences.includes('Low')) return 'Low';
  
  // If most have medium confidence, overall is medium
  const mediumCount = individualConfidences.filter(c => c === 'Medium').length;
  if (mediumCount >= 2) return 'Medium';
  
  // Otherwise high confidence
  return 'High';
}

/**
 * Generate interpretation guidance for using scores
 */
function generateInterpretationGuidance(
  scores: ArchitectureScore[],
  tradeoffAnalysis: TradeoffAnalysis,
  nearTieDetection: NearTieDetectionResult
): string[] {
  const guidance: string[] = [
    'Scores represent comparative suitability based on your organizational constraints, not absolute quality measures',
    'Consider trade-offs and organizational context beyond numeric scores when making decisions',
    'Validate results with stakeholders and subject matter experts before proceeding',
  ];
  
  // Add near-tie specific guidance
  if (nearTieDetection.isNearTie) {
    guidance.push(nearTieDetection.messaging.explanation);
    guidance.push(nearTieDetection.messaging.tradeoffEmphasis);
    guidance.push(nearTieDetection.messaging.numericScoreWarning);
    guidance.push(...nearTieDetection.messaging.decisionGuidance);
  } else {
    if (scores.length === 0) {
      guidance.push('No architecture scores available for comparison');
      return guidance;
    }
    
    const topArchitecture = scores[0]!.architectureType;
    
    if (scores.length >= 2) {
      const scoreDifference = scores[0]!.weightedScore - scores[1]!.weightedScore;
      
      if (scoreDifference >= MEANINGFUL_DIFFERENCE_THRESHOLD) {
        guidance.push(
          `${topArchitecture} shows meaningful advantage based on your constraints`,
          'Review the specific strengths and weaknesses before making final decisions'
        );
      } else {
        guidance.push(
          'Score differences are modest - carefully evaluate trade-offs',
          'Consider organizational change management capabilities when choosing'
        );
      }
    } else {
      guidance.push(
        `${topArchitecture} is the only architecture evaluated`,
        'Consider comparing with other architecture options for completeness'
      );
    }
  }
  
  guidance.push(
    'This analysis provides decision support, not decisions - human oversight is required',
    'Reassess if organizational constraints or priorities change significantly'
  );
  
  return guidance;
}