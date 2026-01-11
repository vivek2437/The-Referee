/**
 * Architecture-related constants and configuration
 */

import { ArchitectureType, DimensionScores } from '../types';

/**
 * Base scoring matrix for architecture comparison (1-10 scale)
 * Based on design document specifications
 */
export const ARCHITECTURE_BASE_SCORES: Record<ArchitectureType, DimensionScores> = {
  'IRM-Heavy': {
    identityVerification: 9,
    behavioralAnalytics: 3,
    operationalComplexity: 7,
    userExperience: 6,
    complianceAuditability: 9,
    scalabilityPerformance: 6,
    costEfficiency: 5,
  },
  'URM-Heavy': {
    identityVerification: 4,
    behavioralAnalytics: 9,
    operationalComplexity: 8,
    userExperience: 3,
    complianceAuditability: 5,
    scalabilityPerformance: 7,
    costEfficiency: 4,
  },
  'Hybrid': {
    identityVerification: 7,
    behavioralAnalytics: 6,
    operationalComplexity: 8,
    userExperience: 5,
    complianceAuditability: 7,
    scalabilityPerformance: 6,
    costEfficiency: 5,
  },
};

/**
 * Architecture strengths, weaknesses, and risks
 */
export const ARCHITECTURE_PROFILES = {
  'IRM-Heavy': {
    strengths: [
      'Strong compliance support',
      'Clear audit trails',
      'Established security patterns',
      'Predictable behavior',
    ],
    weaknesses: [
      'Limited behavioral threat detection',
      'Higher user friction',
      'Less adaptive to new threats',
    ],
    risks: [
      'May miss sophisticated insider threats',
      'User experience friction could drive shadow IT',
    ],
  },
  'URM-Heavy': {
    strengths: [
      'Superior user experience',
      'Advanced threat detection',
      'Adaptive security controls',
      'Scalable analytics',
    ],
    weaknesses: [
      'Complex operational requirements',
      'Algorithmic decision opacity',
      'Privacy considerations',
    ],
    risks: [
      'False positive management',
      'Specialized skill requirements',
      'Regulatory interpretation challenges',
    ],
  },
  'Hybrid': {
    strengths: [
      'Balanced approach',
      'Flexibility to emphasize different aspects',
      'Comprehensive coverage',
    ],
    weaknesses: [
      'Increased complexity',
      'Potential integration challenges',
      'Requires expertise in both approaches',
    ],
    risks: [
      'Jack-of-all-trades syndrome',
      'Higher operational overhead',
      'Decision complexity',
    ],
  },
} as const;

/**
 * Dimension explanations for comprehensive analysis
 */
export const DIMENSION_EXPLANATIONS = {
  identityVerification: {
    whyItMatters: 'Determines confidence in user authentication and authorization decisions',
    tradeoffs: 'Stronger verification increases security but reduces user experience and increases complexity',
    overOptimizationRisks: 'Excessive verification can drive shadow IT adoption and reduce productivity',
  },
  behavioralAnalytics: {
    whyItMatters: 'Enables detection of anomalous behavior and insider threats through pattern analysis',
    tradeoffs: 'Advanced analytics improve threat detection but require significant infrastructure and privacy considerations',
    overOptimizationRisks: 'Complex analytics can generate false positives and require specialized expertise',
  },
  operationalComplexity: {
    whyItMatters: 'Affects team capability requirements, maintenance overhead, and system reliability',
    tradeoffs: 'Simple systems are easier to manage but may lack advanced security capabilities',
    overOptimizationRisks: 'Over-simplification can leave security gaps; over-complexity can cause operational failures',
  },
  userExperience: {
    whyItMatters: 'Influences user adoption, productivity, and shadow IT risk',
    tradeoffs: 'Low friction improves business enablement but may reduce security control effectiveness',
    overOptimizationRisks: 'Excessive focus on UX can compromise security; excessive friction drives workarounds',
  },
  complianceAuditability: {
    whyItMatters: 'Supports regulatory requirements and reduces audit costs and risks',
    tradeoffs: 'High auditability requires extensive logging and controls but increases operational overhead',
    overOptimizationRisks: 'Excessive compliance focus can impede business agility and innovation',
  },
  scalabilityPerformance: {
    whyItMatters: 'Determines system ability to handle growth and peak loads without degradation',
    tradeoffs: 'High scalability requires architectural investment but supports business growth',
    overOptimizationRisks: 'Over-engineering for scale can increase costs; under-engineering limits growth',
  },
  costEfficiency: {
    whyItMatters: 'Affects budget allocation and ROI on security investments',
    tradeoffs: 'Lower costs may require capability compromises or increased operational risk',
    overOptimizationRisks: 'Excessive cost focus can compromise security; ignoring costs limits adoption',
  },
} as const;