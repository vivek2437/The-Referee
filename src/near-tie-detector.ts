/**
 * Near-Tie Detection System
 * 
 * Implements score threshold logic for near-tie identification, adds "no clear winner" 
 * messaging for close scores, and creates trade-off emphasis over numeric score comparison.
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */

import { ArchitectureScore, ArchitectureType } from './types';

/**
 * Configuration for near-tie detection thresholds
 */
export interface NearTieConfiguration {
  /** Points difference considered a near-tie (default: 0.5) */
  nearTieThreshold: number;
  /** Points difference considered meaningful (default: 1.0) */
  meaningfulDifferenceThreshold: number;
  /** Percentage difference threshold for relative comparison (default: 5%) */
  relativeThreshold: number;
  /** Minimum score difference to consider any differentiation (default: 0.1) */
  minimumDifferenceThreshold: number;
}

/**
 * Near-tie detection result
 */
export interface NearTieDetectionResult {
  /** Whether a near-tie was detected */
  isNearTie: boolean;
  /** Type of tie detected */
  tieType: 'no-tie' | 'two-way-tie' | 'three-way-tie' | 'statistical-tie';
  /** Score difference between top architectures */
  scoreDifference: number;
  /** Threshold used for detection */
  thresholdUsed: number;
  /** Architectures involved in the tie */
  tiedArchitectures: ArchitectureType[];
  /** Clear winner if no tie, undefined if tie */
  clearWinner?: ArchitectureType;
  /** Confidence level in the tie detection */
  detectionConfidence: 'High' | 'Medium' | 'Low';
  /** Messaging for the detected situation */
  messaging: NearTieMessaging;
}

/**
 * Messaging for near-tie situations
 */
export interface NearTieMessaging {
  /** Primary message about the tie situation */
  primaryMessage: string;
  /** Detailed explanation of what the tie means */
  explanation: string;
  /** Guidance for decision-making in tie situations */
  decisionGuidance: string[];
  /** Trade-off emphasis messaging */
  tradeoffEmphasis: string;
  /** Warning about over-reliance on numeric scores */
  numericScoreWarning: string;
}

/**
 * Default configuration for near-tie detection
 */
export const DEFAULT_NEAR_TIE_CONFIG: NearTieConfiguration = {
  nearTieThreshold: 0.5,
  meaningfulDifferenceThreshold: 1.0,
  relativeThreshold: 0.05, // 5%
  minimumDifferenceThreshold: 0.1,
};

/**
 * Near-tie detection system
 */
export class NearTieDetector {
  private config: NearTieConfiguration;

  constructor(config: Partial<NearTieConfiguration> = {}) {
    this.config = { ...DEFAULT_NEAR_TIE_CONFIG, ...config };
  }

  /**
   * Detect near-ties in architecture scores
   * Requirements: 7.2 - Define what constitutes meaningful score differences vs near-ties
   */
  detectNearTie(architectureScores: ArchitectureScore[]): NearTieDetectionResult {
    if (architectureScores.length < 2) {
      return this.createNoComparisonResult();
    }

    // Sort scores in descending order
    const sortedScores = [...architectureScores].sort((a, b) => b.weightedScore - a.weightedScore);
    
    // Analyze score differences
    const scoreAnalysis = this.analyzeScoreDifferences(sortedScores);
    
    // Determine tie type and messaging
    const tieType = this.determineTieType(scoreAnalysis);
    const messaging = this.generateNearTieMessaging(tieType, scoreAnalysis);
    
    const result: NearTieDetectionResult = {
      isNearTie: tieType !== 'no-tie',
      tieType: tieType,
      scoreDifference: scoreAnalysis.topDifference,
      thresholdUsed: this.config.nearTieThreshold,
      tiedArchitectures: this.getTiedArchitectures(sortedScores, scoreAnalysis),
      detectionConfidence: this.calculateDetectionConfidence(scoreAnalysis, sortedScores),
      messaging: messaging,
    };

    if (tieType === 'no-tie' && sortedScores[0]) {
      result.clearWinner = sortedScores[0].architectureType;
    }

    return result;
  }

  /**
   * Generate "no clear winner" messaging for close scores
   * Requirements: 7.3 - State "no clear winner" when options are closely matched
   */
  generateNoWinnerMessage(detectionResult: NearTieDetectionResult): string {
    if (!detectionResult.isNearTie) {
      return '';
    }

    switch (detectionResult.tieType) {
      case 'three-way-tie':
        return 'No clear winner: All three architecture options show similar suitability based on your organizational constraints.';
      
      case 'two-way-tie':
        return `No clear winner: ${detectionResult.tiedArchitectures.join(' and ')} architectures show similar suitability based on your organizational constraints.`;
      
      case 'statistical-tie':
        return 'No clear winner: Score differences are within the margin of analytical uncertainty.';
      
      default:
        return 'No clear winner emerges from this analysis based on your organizational constraints.';
    }
  }

  /**
   * Create trade-off emphasis messaging over numeric scores
   * Requirements: 7.4, 7.5 - Emphasize trade-off analysis over numeric score comparison
   */
  generateTradeoffEmphasisMessage(detectionResult: NearTieDetectionResult): string {
    const baseMessage = 'Trade-off analysis should drive your decision rather than numeric score differences.';
    
    if (detectionResult.isNearTie) {
      return `${baseMessage} When scores are this close, qualitative factors such as organizational readiness, implementation complexity, and stakeholder alignment become the decisive factors.`;
    } else {
      return `${baseMessage} While one architecture shows a numeric advantage, carefully evaluate the trade-offs and organizational implications before making your final decision.`;
    }
  }

  /**
   * Update configuration for near-tie detection
   */
  updateConfiguration(newConfig: Partial<NearTieConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): NearTieConfiguration {
    return { ...this.config };
  }

  // Private helper methods

  private analyzeScoreDifferences(sortedScores: ArchitectureScore[]): ScoreAnalysis {
    const scores = sortedScores.map(s => s.weightedScore);
    
    return {
      topScore: scores[0] || 0,
      secondScore: scores[1] || 0,
      thirdScore: scores[2] || 0,
      topDifference: (scores[0] || 0) - (scores[1] || 0),
      secondDifference: (scores[1] || 0) - (scores[2] || 0),
      totalRange: (scores[0] || 0) - (scores[scores.length - 1] || 0),
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      scoreCount: scores.length,
    };
  }

  private determineTieType(analysis: ScoreAnalysis): NearTieDetectionResult['tieType'] {
    // Check for three-way tie (all scores within threshold)
    if (analysis.scoreCount >= 3 && 
        analysis.topDifference <= this.config.nearTieThreshold && 
        analysis.secondDifference <= this.config.nearTieThreshold) {
      return 'three-way-tie';
    }

    // Check for two-way tie (top two scores within threshold)
    if (analysis.topDifference <= this.config.nearTieThreshold) {
      return 'two-way-tie';
    }

    // Check for statistical tie (differences too small to be meaningful)
    if (analysis.topDifference <= this.config.minimumDifferenceThreshold) {
      return 'statistical-tie';
    }

    // Check relative threshold (percentage-based)
    if (analysis.averageScore > 0) {
      const relativeThreshold = analysis.averageScore * this.config.relativeThreshold;
      if (analysis.topDifference <= relativeThreshold) {
        return 'statistical-tie';
      }
    }

    return 'no-tie';
  }

  private getTiedArchitectures(
    sortedScores: ArchitectureScore[], 
    analysis: ScoreAnalysis
  ): ArchitectureType[] {
    const tied: ArchitectureType[] = [];
    
    if (analysis.topDifference <= this.config.nearTieThreshold) {
      tied.push(sortedScores[0]?.architectureType || 'IRM-Heavy');
      tied.push(sortedScores[1]?.architectureType || 'URM-Heavy');
      
      // Check if third is also tied
      if (sortedScores.length >= 3 && analysis.secondDifference <= this.config.nearTieThreshold) {
        tied.push(sortedScores[2]?.architectureType || 'Hybrid');
      }
    }
    
    return tied;
  }

  private calculateDetectionConfidence(
    analysis: ScoreAnalysis, 
    sortedScores: ArchitectureScore[]
  ): 'High' | 'Medium' | 'Low' {
    let confidenceScore = 100;
    
    // Reduce confidence if any architecture has low confidence
    const hasLowConfidence = sortedScores.some(score => score.confidenceLevel === 'Low');
    if (hasLowConfidence) {
      confidenceScore -= 30;
    }
    
    // Reduce confidence if scores are very close (harder to distinguish)
    if (analysis.topDifference <= this.config.minimumDifferenceThreshold) {
      confidenceScore -= 20;
    }
    
    // Reduce confidence if total range is very small
    if (analysis.totalRange <= this.config.nearTieThreshold) {
      confidenceScore -= 15;
    }
    
    if (confidenceScore >= 70) return 'High';
    if (confidenceScore >= 50) return 'Medium';
    return 'Low';
  }

  private generateNearTieMessaging(
    tieType: NearTieDetectionResult['tieType'], 
    analysis: ScoreAnalysis
  ): NearTieMessaging {
    switch (tieType) {
      case 'three-way-tie':
        return {
          primaryMessage: 'Three-way near-tie detected: All architecture options show similar suitability.',
          explanation: `All three architectures scored within ${this.config.nearTieThreshold} points of each other, indicating no clear quantitative winner.`,
          decisionGuidance: [
            'Focus on qualitative trade-offs rather than numeric scores',
            'Consider organizational readiness and implementation complexity',
            'Evaluate team capabilities and training requirements',
            'Assess integration complexity with existing systems',
            'Consider vendor relationships and support requirements'
          ],
          tradeoffEmphasis: 'With scores this close, trade-off analysis and organizational factors should be the primary decision drivers.',
          numericScoreWarning: 'Numeric score differences are too small to be meaningful - avoid over-interpreting small variations.'
        };

      case 'two-way-tie':
        return {
          primaryMessage: 'Two-way near-tie detected: Top architectures show similar suitability.',
          explanation: `The top two architectures scored within ${this.config.nearTieThreshold} points of each other, indicating no clear quantitative preference.`,
          decisionGuidance: [
            'Compare trade-offs between the tied architectures',
            'Consider implementation timeline and complexity',
            'Evaluate organizational change management requirements',
            'Assess team expertise and training needs',
            'Consider proof-of-concept validation'
          ],
          tradeoffEmphasis: 'Since numeric scores are essentially tied, focus on the specific trade-offs that matter most to your organization.',
          numericScoreWarning: 'Small score differences between tied options should not drive the decision - focus on qualitative factors.'
        };

      case 'statistical-tie':
        return {
          primaryMessage: 'Statistical tie: Score differences are within analytical uncertainty.',
          explanation: `Score differences are too small (${analysis.topDifference.toFixed(2)} points) to represent meaningful distinctions.`,
          decisionGuidance: [
            'Treat all options as essentially equivalent numerically',
            'Focus entirely on qualitative trade-offs and organizational fit',
            'Consider conducting stakeholder preference assessment',
            'Evaluate non-technical factors like vendor support',
            'Consider hybrid or phased implementation approaches'
          ],
          tradeoffEmphasis: 'Numeric scores provide no meaningful differentiation - base your decision entirely on trade-off analysis and organizational factors.',
          numericScoreWarning: 'Score differences are within the margin of analytical error - do not use numeric scores for decision-making.'
        };

      default: // no-tie
        return {
          primaryMessage: 'Clear differentiation: One architecture shows meaningful advantage.',
          explanation: `Score differences exceed the near-tie threshold (${this.config.nearTieThreshold} points), indicating quantitative differentiation.`,
          decisionGuidance: [
            'Review the specific advantages of the leading architecture',
            'Validate that trade-offs align with organizational priorities',
            'Consider implementation feasibility and organizational readiness',
            'Assess whether the advantage justifies any trade-offs',
            'Plan validation and proof-of-concept activities'
          ],
          tradeoffEmphasis: 'While scores show differentiation, carefully evaluate whether the trade-offs align with your organizational priorities.',
          numericScoreWarning: 'Even with clear numeric differences, consider the full trade-off implications before making final decisions.'
        };
    }
  }

  private createNoComparisonResult(): NearTieDetectionResult {
    return {
      isNearTie: false,
      tieType: 'no-tie',
      scoreDifference: 0,
      thresholdUsed: this.config.nearTieThreshold,
      tiedArchitectures: [],
      detectionConfidence: 'Low',
      messaging: {
        primaryMessage: 'Insufficient architectures for comparison.',
        explanation: 'At least two architecture options are required for near-tie detection.',
        decisionGuidance: ['Ensure multiple architecture options are evaluated for meaningful comparison.'],
        tradeoffEmphasis: 'Multiple architecture options are needed to perform trade-off analysis.',
        numericScoreWarning: 'Single architecture evaluation provides no comparative context.'
      }
    };
  }
}

/**
 * Internal interface for score analysis
 */
interface ScoreAnalysis {
  topScore: number;
  secondScore: number;
  thirdScore: number;
  topDifference: number;
  secondDifference: number;
  totalRange: number;
  averageScore: number;
  scoreCount: number;
}

/**
 * Utility functions for near-tie detection
 */
export class NearTieUtils {
  
  /**
   * Create a configured near-tie detector with custom thresholds
   */
  static createDetector(config?: Partial<NearTieConfiguration>): NearTieDetector {
    return new NearTieDetector(config);
  }

  /**
   * Quick check if scores represent a near-tie using default configuration
   */
  static isNearTie(architectureScores: ArchitectureScore[]): boolean {
    const detector = new NearTieDetector();
    const result = detector.detectNearTie(architectureScores);
    return result.isNearTie;
  }

  /**
   * Get appropriate messaging for a set of scores
   */
  static getMessaging(architectureScores: ArchitectureScore[]): NearTieMessaging {
    const detector = new NearTieDetector();
    const result = detector.detectNearTie(architectureScores);
    return result.messaging;
  }

  /**
   * Validate near-tie configuration
   */
  static validateConfiguration(config: NearTieConfiguration): string[] {
    const errors: string[] = [];
    
    if (config.nearTieThreshold <= 0) {
      errors.push('Near-tie threshold must be positive');
    }
    
    if (config.meaningfulDifferenceThreshold <= config.nearTieThreshold) {
      errors.push('Meaningful difference threshold must be greater than near-tie threshold');
    }
    
    if (config.relativeThreshold <= 0 || config.relativeThreshold >= 1) {
      errors.push('Relative threshold must be between 0 and 1');
    }
    
    if (config.minimumDifferenceThreshold <= 0) {
      errors.push('Minimum difference threshold must be positive');
    }
    
    return errors;
  }
}