/**
 * Comprehensive Dimension Explanation System
 * 
 * Implements "why it matters" explanations, trade-off identification,
 * and over-optimization risk descriptions for each dimension.
 * 
 * Requirements: 3.2, 3.3, 3.4
 */

import { DimensionScores, ArchitectureType } from './types';
import { DIMENSION_EXPLANATIONS, ARCHITECTURE_BASE_SCORES } from './constants';

/**
 * Comprehensive explanation for a single dimension
 */
export interface DimensionExplanation {
  /** Dimension identifier */
  dimension: keyof DimensionScores;
  /** Human-readable dimension name */
  displayName: string;
  /** Why this dimension matters for security architecture decisions */
  whyItMatters: string;
  /** Trade-offs introduced by this dimension */
  tradeoffs: string;
  /** Risks of over-optimization in this dimension */
  overOptimizationRisks: string;
  /** Detailed impact analysis */
  impactAnalysis: {
    /** Business impact of this dimension */
    businessImpact: string;
    /** Technical impact of this dimension */
    technicalImpact: string;
    /** Operational impact of this dimension */
    operationalImpact: string;
  };
  /** Architecture-specific considerations */
  architectureConsiderations: Record<ArchitectureType, {
    score: number;
    strengths: string[];
    weaknesses: string[];
    considerations: string[];
  }>;
}

/**
 * Complete dimension explanation system
 */
export class DimensionExplanationSystem {
  private readonly dimensionDisplayNames: Record<keyof DimensionScores, string> = {
    identityVerification: 'Identity Verification Strength',
    behavioralAnalytics: 'Behavioral Analytics Sophistication',
    operationalComplexity: 'Operational Complexity',
    userExperience: 'User Experience Friction',
    complianceAuditability: 'Compliance Auditability',
    scalabilityPerformance: 'Scalability & Performance',
    costEfficiency: 'Cost Efficiency',
  };

  /**
   * Get comprehensive explanation for a specific dimension
   */
  getDimensionExplanation(dimension: keyof DimensionScores): DimensionExplanation {
    const baseExplanation = DIMENSION_EXPLANATIONS[dimension];
    
    return {
      dimension,
      displayName: this.dimensionDisplayNames[dimension],
      whyItMatters: baseExplanation.whyItMatters,
      tradeoffs: baseExplanation.tradeoffs,
      overOptimizationRisks: baseExplanation.overOptimizationRisks,
      impactAnalysis: this.getImpactAnalysis(dimension),
      architectureConsiderations: this.getArchitectureConsiderations(dimension),
    };
  }

  /**
   * Get explanations for all dimensions
   */
  getAllDimensionExplanations(): DimensionExplanation[] {
    const dimensions: (keyof DimensionScores)[] = [
      'identityVerification',
      'behavioralAnalytics',
      'operationalComplexity',
      'userExperience',
      'complianceAuditability',
      'scalabilityPerformance',
      'costEfficiency',
    ];

    return dimensions.map(dimension => this.getDimensionExplanation(dimension));
  }

  /**
   * Get dimension explanation summary for quick reference
   */
  getDimensionSummary(dimension: keyof DimensionScores): {
    name: string;
    whyItMatters: string;
    keyTradeoff: string;
    overOptimizationRisk: string;
  } {
    const explanation = this.getDimensionExplanation(dimension);
    
    return {
      name: explanation.displayName,
      whyItMatters: explanation.whyItMatters,
      keyTradeoff: this.extractKeyTradeoff(explanation.tradeoffs),
      overOptimizationRisk: this.extractKeyRisk(explanation.overOptimizationRisks),
    };
  }

  /**
   * Get comparative dimension analysis across all architectures
   */
  getComparativeDimensionAnalysis(dimension: keyof DimensionScores): {
    dimension: keyof DimensionScores;
    explanation: DimensionExplanation;
    architectureRanking: {
      architecture: ArchitectureType;
      score: number;
      rationale: string;
    }[];
    tradeoffImplications: string[];
  } {
    const explanation = this.getDimensionExplanation(dimension);
    const architectures: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
    
    // Create ranking based on scores
    const ranking = architectures
      .map(arch => ({
        architecture: arch,
        score: ARCHITECTURE_BASE_SCORES[arch][dimension],
        rationale: explanation.architectureConsiderations[arch].considerations.join('; '),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      dimension,
      explanation,
      architectureRanking: ranking,
      tradeoffImplications: this.generateTradeoffImplications(dimension, ranking),
    };
  }

  /**
   * Generate detailed impact analysis for a dimension
   */
  private getImpactAnalysis(dimension: keyof DimensionScores): DimensionExplanation['impactAnalysis'] {
    const impactAnalyses: Record<keyof DimensionScores, DimensionExplanation['impactAnalysis']> = {
      identityVerification: {
        businessImpact: 'Affects user onboarding speed, customer experience, and regulatory compliance confidence',
        technicalImpact: 'Influences authentication infrastructure complexity, integration requirements, and system reliability',
        operationalImpact: 'Determines identity management overhead, support burden, and incident response capabilities',
      },
      behavioralAnalytics: {
        businessImpact: 'Enables advanced threat detection but requires significant data infrastructure investment',
        technicalImpact: 'Requires machine learning capabilities, data processing infrastructure, and specialized expertise',
        operationalImpact: 'Increases monitoring complexity, requires analytics expertise, and generates investigation workload',
      },
      operationalComplexity: {
        businessImpact: 'Directly affects operational costs, team scaling requirements, and system reliability',
        technicalImpact: 'Influences architecture maintainability, troubleshooting difficulty, and change management',
        operationalImpact: 'Determines staffing requirements, training needs, and operational risk exposure',
      },
      userExperience: {
        businessImpact: 'Affects user adoption, productivity levels, and shadow IT risk',
        technicalImpact: 'Influences interface design, authentication flows, and system integration complexity',
        operationalImpact: 'Determines user support burden, training requirements, and change management difficulty',
      },
      complianceAuditability: {
        businessImpact: 'Affects regulatory risk, audit costs, and business process constraints',
        technicalImpact: 'Requires comprehensive logging, reporting capabilities, and data retention systems',
        operationalImpact: 'Determines audit preparation effort, documentation requirements, and compliance monitoring overhead',
      },
      scalabilityPerformance: {
        businessImpact: 'Enables business growth but requires upfront architectural investment',
        technicalImpact: 'Influences infrastructure design, resource allocation, and performance optimization requirements',
        operationalImpact: 'Affects capacity planning, performance monitoring, and incident response capabilities',
      },
      costEfficiency: {
        businessImpact: 'Directly affects security budget allocation and ROI on security investments',
        technicalImpact: 'Influences technology selection, infrastructure optimization, and resource utilization',
        operationalImpact: 'Determines operational overhead, licensing costs, and resource allocation efficiency',
      },
    };

    return impactAnalyses[dimension];
  }

  /**
   * Generate architecture-specific considerations for a dimension
   */
  private getArchitectureConsiderations(dimension: keyof DimensionScores): DimensionExplanation['architectureConsiderations'] {
    const considerations: Record<keyof DimensionScores, Record<ArchitectureType, Omit<DimensionExplanation['architectureConsiderations'][ArchitectureType], 'score'>>> = {
      identityVerification: {
        'IRM-Heavy': {
          strengths: ['Strong multi-factor authentication', 'Comprehensive identity governance', 'Clear access control policies'],
          weaknesses: ['Higher user friction', 'Limited adaptive capabilities', 'Complex credential management'],
          considerations: ['Requires robust identity infrastructure', 'May impact user productivity', 'Excellent for high-security environments'],
        },
        'URM-Heavy': {
          strengths: ['Adaptive authentication', 'Reduced user friction', 'Context-aware decisions'],
          weaknesses: ['Lower verification confidence', 'Algorithmic complexity', 'Privacy considerations'],
          considerations: ['Relies on behavioral patterns', 'May miss sophisticated attacks', 'Good for user-centric environments'],
        },
        'Hybrid': {
          strengths: ['Balanced verification approach', 'Flexible authentication methods', 'Comprehensive coverage'],
          weaknesses: ['Increased complexity', 'Integration challenges', 'Higher operational overhead'],
          considerations: ['Combines strong and adaptive methods', 'Requires expertise in both approaches', 'Suitable for diverse environments'],
        },
      },
      behavioralAnalytics: {
        'IRM-Heavy': {
          strengths: ['Simple rule-based detection', 'Predictable behavior', 'Clear audit trails'],
          weaknesses: ['Limited threat detection', 'Reactive approach', 'Misses subtle anomalies'],
          considerations: ['Focuses on known patterns', 'May miss advanced threats', 'Easier to understand and audit'],
        },
        'URM-Heavy': {
          strengths: ['Advanced anomaly detection', 'Machine learning capabilities', 'Proactive threat identification'],
          weaknesses: ['Complex implementation', 'False positive management', 'Requires specialized skills'],
          considerations: ['Requires significant data infrastructure', 'Excellent for insider threat detection', 'Needs ongoing tuning'],
        },
        'Hybrid': {
          strengths: ['Balanced detection approach', 'Multiple analysis methods', 'Comprehensive coverage'],
          weaknesses: ['Integration complexity', 'Higher resource requirements', 'Coordination challenges'],
          considerations: ['Combines rule-based and ML approaches', 'Provides defense in depth', 'Requires diverse expertise'],
        },
      },
      operationalComplexity: {
        'IRM-Heavy': {
          strengths: ['Established patterns', 'Predictable operations', 'Clear procedures'],
          weaknesses: ['Limited flexibility', 'Manual processes', 'Scaling challenges'],
          considerations: ['Well-understood operational model', 'Requires traditional security skills', 'Good for stable environments'],
        },
        'URM-Heavy': {
          strengths: ['Automated decision-making', 'Adaptive responses', 'Scalable analytics'],
          weaknesses: ['Complex troubleshooting', 'Specialized expertise required', 'Algorithm management'],
          considerations: ['Requires advanced operational capabilities', 'High automation potential', 'Needs ML/analytics expertise'],
        },
        'Hybrid': {
          strengths: ['Flexible operational model', 'Multiple response options', 'Comprehensive capabilities'],
          weaknesses: ['Highest complexity', 'Multiple skill requirements', 'Integration overhead'],
          considerations: ['Most complex operational model', 'Requires diverse skill sets', 'Highest operational overhead'],
        },
      },
      userExperience: {
        'IRM-Heavy': {
          strengths: ['Predictable user flows', 'Clear security boundaries', 'Consistent experience'],
          weaknesses: ['Higher friction', 'More user steps', 'Potential productivity impact'],
          considerations: ['Prioritizes security over convenience', 'May require user training', 'Good for security-conscious users'],
        },
        'URM-Heavy': {
          strengths: ['Seamless authentication', 'Minimal user interaction', 'Adaptive to user behavior'],
          weaknesses: ['Less user control', 'Algorithmic decisions', 'Potential privacy concerns'],
          considerations: ['Optimizes for user convenience', 'Transparent security decisions', 'Excellent for productivity environments'],
        },
        'Hybrid': {
          strengths: ['Balanced user experience', 'Flexible interaction modes', 'Context-appropriate friction'],
          weaknesses: ['Inconsistent experience', 'User confusion potential', 'Complex user education'],
          considerations: ['Adapts friction to context', 'Requires clear user communication', 'Good for diverse user populations'],
        },
      },
      complianceAuditability: {
        'IRM-Heavy': {
          strengths: ['Comprehensive audit logs', 'Clear control frameworks', 'Regulatory alignment'],
          weaknesses: ['High logging overhead', 'Complex reporting', 'Storage requirements'],
          considerations: ['Excellent for regulated industries', 'Clear compliance evidence', 'High audit confidence'],
        },
        'URM-Heavy': {
          strengths: ['Automated compliance monitoring', 'Real-time risk assessment', 'Adaptive controls'],
          weaknesses: ['Algorithmic decision explanation', 'Complex audit trails', 'Regulatory interpretation'],
          considerations: ['May challenge traditional audit approaches', 'Requires new compliance frameworks', 'Good for dynamic environments'],
        },
        'Hybrid': {
          strengths: ['Comprehensive compliance coverage', 'Multiple evidence types', 'Flexible reporting'],
          weaknesses: ['Complex audit preparation', 'Multiple compliance frameworks', 'Integration challenges'],
          considerations: ['Provides multiple compliance approaches', 'Requires comprehensive audit strategy', 'Good for complex regulatory environments'],
        },
      },
      scalabilityPerformance: {
        'IRM-Heavy': {
          strengths: ['Predictable scaling patterns', 'Well-understood performance', 'Linear resource requirements'],
          weaknesses: ['Limited dynamic scaling', 'Manual capacity planning', 'Performance bottlenecks'],
          considerations: ['Scales predictably with users', 'Requires capacity planning', 'Good for stable growth patterns'],
        },
        'URM-Heavy': {
          strengths: ['Dynamic scaling capabilities', 'Cloud-native architecture', 'Elastic resource usage'],
          weaknesses: ['Complex performance tuning', 'Resource intensive analytics', 'Unpredictable scaling patterns'],
          considerations: ['Excellent for variable workloads', 'Requires sophisticated infrastructure', 'Good for rapid growth'],
        },
        'Hybrid': {
          strengths: ['Flexible scaling approaches', 'Multiple performance optimization options', 'Adaptive resource allocation'],
          weaknesses: ['Complex performance management', 'Multiple scaling patterns', 'Resource coordination challenges'],
          considerations: ['Most flexible scaling approach', 'Requires sophisticated management', 'Good for diverse workload patterns'],
        },
      },
      costEfficiency: {
        'IRM-Heavy': {
          strengths: ['Predictable costs', 'Established pricing models', 'Clear ROI calculation'],
          weaknesses: ['Limited cost optimization', 'Manual resource management', 'Potential over-provisioning'],
          considerations: ['Well-understood cost structure', 'Predictable budget planning', 'Good for stable budgets'],
        },
        'URM-Heavy': {
          strengths: ['Dynamic resource optimization', 'Automated cost management', 'Usage-based scaling'],
          weaknesses: ['Complex cost modeling', 'High initial investment', 'Unpredictable operational costs'],
          considerations: ['Requires significant upfront investment', 'Potential for cost optimization', 'Good for variable usage patterns'],
        },
        'Hybrid': {
          strengths: ['Balanced cost approach', 'Multiple optimization strategies', 'Flexible cost management'],
          weaknesses: ['Complex cost allocation', 'Multiple cost models', 'Optimization complexity'],
          considerations: ['Most complex cost management', 'Requires sophisticated financial planning', 'Good for diverse cost requirements'],
        },
      },
    };

    const dimensionConsiderations = considerations[dimension];
    const result: DimensionExplanation['architectureConsiderations'] = {} as any;

    Object.entries(dimensionConsiderations).forEach(([arch, data]) => {
      const architecture = arch as ArchitectureType;
      result[architecture] = {
        score: ARCHITECTURE_BASE_SCORES[architecture][dimension],
        ...data,
      };
    });

    return result;
  }

  /**
   * Extract key trade-off from trade-offs description
   */
  private extractKeyTradeoff(tradeoffs: string): string {
    // Extract the main trade-off concept (first part before "but")
    const parts = tradeoffs.split(' but ');
    return parts[0]?.trim() || tradeoffs.trim();
  }

  /**
   * Extract key risk from over-optimization risks description
   */
  private extractKeyRisk(risks: string): string {
    // Extract the primary risk (first part before semicolon or "and")
    const parts = risks.split(/[;,]|and /);
    return parts[0]?.trim() || risks.trim();
  }

  /**
   * Generate trade-off implications based on architecture ranking
   */
  private generateTradeoffImplications(
    dimension: keyof DimensionScores,
    ranking: { architecture: ArchitectureType; score: number; rationale: string }[]
  ): string[] {
    const implications: string[] = [];
    
    if (ranking.length < 3) {
      return implications;
    }
    
    const highest = ranking[0]!;
    const lowest = ranking[ranking.length - 1]!;

    // Generate implications based on score differences
    const scoreDifference = highest.score - lowest.score;
    
    if (scoreDifference >= 5) {
      implications.push(`Significant variation in ${this.dimensionDisplayNames[dimension]} across architectures (${scoreDifference} point difference)`);
    }
    
    implications.push(`${highest.architecture} leads in ${this.dimensionDisplayNames[dimension]} (score: ${highest.score})`);
    implications.push(`${lowest.architecture} has the lowest ${this.dimensionDisplayNames[dimension]} (score: ${lowest.score})`);
    
    // Add dimension-specific implications
    const dimensionImplications = this.getDimensionSpecificImplications(dimension, ranking);
    implications.push(...dimensionImplications);

    return implications;
  }

  /**
   * Get dimension-specific trade-off implications
   */
  private getDimensionSpecificImplications(
    dimension: keyof DimensionScores,
    ranking: { architecture: ArchitectureType; score: number }[]
  ): string[] {
    if (ranking.length === 0) {
      return [];
    }
    
    const highest = ranking[0]!;
    
    const specificImplications: Record<keyof DimensionScores, string[]> = {
      identityVerification: [
        `Organizations prioritizing strong identity controls should consider ${highest.architecture}`,
        'Higher identity verification may increase user friction but improves security confidence',
      ],
      behavioralAnalytics: [
        `Advanced threat detection capabilities favor ${highest.architecture}`,
        'Sophisticated analytics require specialized expertise and infrastructure investment',
      ],
      operationalComplexity: [
        'Higher complexity scores indicate greater operational overhead and skill requirements',
        'Consider team capabilities and operational maturity when evaluating complexity trade-offs',
      ],
      userExperience: [
        'Lower friction scores improve user adoption but may reduce security control effectiveness',
        'Balance user experience with security requirements based on organizational risk tolerance',
      ],
      complianceAuditability: [
        `Regulatory compliance requirements favor ${highest.architecture}`,
        'Strong auditability requires comprehensive logging and may increase operational overhead',
      ],
      scalabilityPerformance: [
        `Growth-oriented organizations should consider ${highest.architecture}`,
        'Higher scalability requires architectural investment but supports business expansion',
      ],
      costEfficiency: [
        'Cost efficiency varies significantly based on organizational size and usage patterns',
        'Consider both upfront investment and ongoing operational costs in decision-making',
      ],
    };

    return specificImplications[dimension];
  }
}

/**
 * Global instance of the dimension explanation system
 */
export const dimensionExplanationSystem = new DimensionExplanationSystem();

/**
 * Convenience functions for common use cases
 */

/**
 * Get explanation for a specific dimension
 */
export function explainDimension(dimension: keyof DimensionScores): DimensionExplanation {
  return dimensionExplanationSystem.getDimensionExplanation(dimension);
}

/**
 * Get all dimension explanations
 */
export function explainAllDimensions(): DimensionExplanation[] {
  return dimensionExplanationSystem.getAllDimensionExplanations();
}

/**
 * Get dimension summary for quick reference
 */
export function getDimensionSummary(dimension: keyof DimensionScores): ReturnType<DimensionExplanationSystem['getDimensionSummary']> {
  return dimensionExplanationSystem.getDimensionSummary(dimension);
}

/**
 * Get comparative analysis for a dimension
 */
export function getComparativeDimensionAnalysis(dimension: keyof DimensionScores): ReturnType<DimensionExplanationSystem['getComparativeDimensionAnalysis']> {
  return dimensionExplanationSystem.getComparativeDimensionAnalysis(dimension);
}