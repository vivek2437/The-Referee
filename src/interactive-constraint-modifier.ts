/**
 * Interactive Constraint Modification System
 * 
 * Adds constraint weight modification capability, creates traceable impact analysis 
 * for input changes, and implements real-time analysis updates.
 * 
 * Requirements: 5.5, 10.4
 */

import { ConstraintProfile, AnalysisResult, ArchitectureScore } from './types';
import { calculateWeightedScores, ScoringResults } from './scoring-calculator';

/**
 * Constraint modification operation
 */
export interface ConstraintModification {
  /** Constraint field being modified */
  constraintField: keyof ConstraintProfile;
  /** Previous value */
  previousValue: number;
  /** New value */
  newValue: number;
  /** Timestamp of modification */
  timestamp: Date;
  /** Reason for modification (optional) */
  reason?: string;
}

/**
 * Impact analysis for constraint changes
 */
export interface ConstraintImpactAnalysis {
  /** The constraint modification that caused this impact */
  modification: ConstraintModification;
  /** Analysis results before the change */
  beforeAnalysis: ScoringResults;
  /** Analysis results after the change */
  afterAnalysis: ScoringResults;
  /** Detailed impact breakdown */
  impactDetails: ImpactDetails;
  /** Summary of key changes */
  changeSummary: string[];
  /** Recommendations based on the impact */
  recommendations: string[];
}

/**
 * Detailed impact breakdown
 */
export interface ImpactDetails {
  /** Score changes for each architecture */
  scoreChanges: Record<string, ScoreChange>;
  /** Changes in architecture ranking */
  rankingChanges: RankingChange[];
  /** Changes in near-tie detection */
  nearTieChanges: NearTieChange;
  /** Changes in conflict detection */
  conflictChanges: ConflictChange[];
  /** Changes in confidence levels */
  confidenceChanges: Record<string, ConfidenceChange>;
}

/**
 * Score change for an architecture
 */
export interface ScoreChange {
  /** Architecture name */
  architecture: string;
  /** Previous weighted score */
  previousScore: number;
  /** New weighted score */
  newScore: number;
  /** Absolute change */
  absoluteChange: number;
  /** Percentage change */
  percentageChange: number;
  /** Impact magnitude */
  impactMagnitude: 'negligible' | 'minor' | 'moderate' | 'significant' | 'major';
}

/**
 * Ranking change information
 */
export interface RankingChange {
  /** Architecture that changed position */
  architecture: string;
  /** Previous rank (1-based) */
  previousRank: number;
  /** New rank (1-based) */
  newRank: number;
  /** Direction of change */
  direction: 'up' | 'down' | 'unchanged';
}

/**
 * Near-tie detection changes
 */
export interface NearTieChange {
  /** Previous near-tie status */
  previousNearTie: boolean;
  /** New near-tie status */
  newNearTie: boolean;
  /** Change in tie type */
  tieTypeChange: string;
  /** Impact description */
  impactDescription: string;
}

/**
 * Conflict detection changes
 */
export interface ConflictChange {
  /** Conflicts that were resolved */
  resolvedConflicts: string[];
  /** New conflicts that emerged */
  newConflicts: string[];
  /** Conflicts that changed severity */
  changedConflicts: string[];
}

/**
 * Confidence level changes
 */
export interface ConfidenceChange {
  /** Previous confidence level */
  previousConfidence: string;
  /** New confidence level */
  newConfidence: string;
  /** Reason for change */
  changeReason: string;
}

/**
 * Modification session tracking
 */
export interface ModificationSession {
  /** Session identifier */
  sessionId: string;
  /** Initial constraint profile */
  initialConstraints: ConstraintProfile;
  /** Current constraint profile */
  currentConstraints: ConstraintProfile;
  /** History of modifications */
  modificationHistory: ConstraintModification[];
  /** History of impact analyses */
  impactHistory: ConstraintImpactAnalysis[];
  /** Session start time */
  startTime: Date;
  /** Last modification time */
  lastModified: Date;
}

/**
 * Interactive constraint modification system
 */
export class InteractiveConstraintModifier {
  private currentSession: ModificationSession | null = null;
  private analysisCache: Map<string, ScoringResults> = new Map();

  /**
   * Start a new modification session
   * Requirements: 5.5 - Allow constraint weight modification
   */
  startSession(initialConstraints: ConstraintProfile): ModificationSession {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      sessionId,
      initialConstraints: { ...initialConstraints },
      currentConstraints: { ...initialConstraints },
      modificationHistory: [],
      impactHistory: [],
      startTime: new Date(),
      lastModified: new Date(),
    };

    // Cache initial analysis
    const initialAnalysis = calculateWeightedScores(initialConstraints);
    this.analysisCache.set(this.getConstraintKey(initialConstraints), initialAnalysis);

    return this.currentSession;
  }

  /**
   * Modify a constraint and analyze impact
   * Requirements: 5.5, 10.4 - Traceable impact analysis for input changes
   */
  modifyConstraint(
    constraintField: keyof ConstraintProfile,
    newValue: number,
    reason?: string
  ): ConstraintImpactAnalysis {
    if (!this.currentSession) {
      throw new Error('No active modification session. Call startSession() first.');
    }

    // Validate new value
    this.validateConstraintValue(constraintField, newValue);

    const previousValue = this.currentSession.currentConstraints[constraintField] as number;
    
    // Create modification record
    const modification: ConstraintModification = {
      constraintField,
      previousValue,
      newValue,
      timestamp: new Date(),
    };

    if (reason) {
      modification.reason = reason;
    }

    // Get analysis before change
    const beforeAnalysis = this.getOrCalculateAnalysis(this.currentSession.currentConstraints);

    // Apply modification
    const newConstraints = {
      ...this.currentSession.currentConstraints,
      [constraintField]: newValue,
    };

    // Get analysis after change
    const afterAnalysis = this.getOrCalculateAnalysis(newConstraints);

    // Calculate impact
    const impactAnalysis = this.calculateImpactAnalysis(modification, beforeAnalysis, afterAnalysis);

    // Update session
    this.currentSession.currentConstraints = newConstraints;
    this.currentSession.modificationHistory.push(modification);
    this.currentSession.impactHistory.push(impactAnalysis);
    this.currentSession.lastModified = new Date();

    return impactAnalysis;
  }

  /**
   * Batch modify multiple constraints
   * Requirements: 5.5 - Allow constraint weight modification
   */
  batchModifyConstraints(
    modifications: Array<{
      constraintField: keyof ConstraintProfile;
      newValue: number;
      reason?: string;
    }>
  ): ConstraintImpactAnalysis[] {
    if (!this.currentSession) {
      throw new Error('No active modification session. Call startSession() first.');
    }

    const results: ConstraintImpactAnalysis[] = [];

    for (const mod of modifications) {
      const result = this.modifyConstraint(mod.constraintField, mod.newValue, mod.reason);
      results.push(result);
    }

    return results;
  }

  /**
   * Revert to a previous state in the modification history
   * Requirements: 10.4 - Traceable impact analysis for input changes
   */
  revertToStep(stepIndex: number): ConstraintImpactAnalysis | null {
    if (!this.currentSession) {
      throw new Error('No active modification session.');
    }

    if (stepIndex < 0 || stepIndex >= this.currentSession.modificationHistory.length) {
      throw new Error('Invalid step index.');
    }

    // Revert to initial state and replay modifications up to stepIndex
    let revertedConstraints = { ...this.currentSession.initialConstraints };
    
    for (let i = 0; i <= stepIndex; i++) {
      const mod = this.currentSession.modificationHistory[i];
      if (mod) {
        revertedConstraints = {
          ...revertedConstraints,
          [mod.constraintField]: mod.newValue,
        };
      }
    }

    // Calculate impact of reverting
    const beforeAnalysis = this.getOrCalculateAnalysis(this.currentSession.currentConstraints);
    const afterAnalysis = this.getOrCalculateAnalysis(revertedConstraints);

    const revertModification: ConstraintModification = {
      constraintField: 'riskTolerance', // Placeholder - this represents a revert operation
      previousValue: 0,
      newValue: 0,
      timestamp: new Date(),
      reason: `Reverted to step ${stepIndex}`,
    };

    const impactAnalysis = this.calculateImpactAnalysis(revertModification, beforeAnalysis, afterAnalysis);

    // Update session
    this.currentSession.currentConstraints = revertedConstraints;
    this.currentSession.modificationHistory = this.currentSession.modificationHistory.slice(0, stepIndex + 1);
    this.currentSession.impactHistory = this.currentSession.impactHistory.slice(0, stepIndex + 1);
    this.currentSession.lastModified = new Date();

    return impactAnalysis;
  }

  /**
   * Reset to initial constraints
   * Requirements: 10.4 - Traceable impact analysis for input changes
   */
  resetToInitial(): ConstraintImpactAnalysis | null {
    if (!this.currentSession) {
      throw new Error('No active modification session.');
    }

    const beforeAnalysis = this.getOrCalculateAnalysis(this.currentSession.currentConstraints);
    const afterAnalysis = this.getOrCalculateAnalysis(this.currentSession.initialConstraints);

    const resetModification: ConstraintModification = {
      constraintField: 'riskTolerance', // Placeholder - this represents a reset operation
      previousValue: 0,
      newValue: 0,
      timestamp: new Date(),
      reason: 'Reset to initial constraints',
    };

    const impactAnalysis = this.calculateImpactAnalysis(resetModification, beforeAnalysis, afterAnalysis);

    // Reset session state
    this.currentSession.currentConstraints = { ...this.currentSession.initialConstraints };
    this.currentSession.modificationHistory = [];
    this.currentSession.impactHistory = [];
    this.currentSession.lastModified = new Date();

    return impactAnalysis;
  }

  /**
   * Get current session information
   */
  getCurrentSession(): ModificationSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Get real-time analysis for current constraints
   * Requirements: 5.5 - Real-time analysis updates
   */
  getCurrentAnalysis(): ScoringResults | null {
    if (!this.currentSession) {
      return null;
    }

    return this.getOrCalculateAnalysis(this.currentSession.currentConstraints);
  }

  /**
   * Compare current state with initial state
   * Requirements: 10.4 - Traceable impact analysis for input changes
   */
  compareWithInitial(): ConstraintImpactAnalysis | null {
    if (!this.currentSession) {
      return null;
    }

    const initialAnalysis = this.getOrCalculateAnalysis(this.currentSession.initialConstraints);
    const currentAnalysis = this.getOrCalculateAnalysis(this.currentSession.currentConstraints);

    const comparisonModification: ConstraintModification = {
      constraintField: 'riskTolerance', // Placeholder - this represents a comparison operation
      previousValue: 0,
      newValue: 0,
      timestamp: new Date(),
      reason: 'Comparison with initial state',
    };

    return this.calculateImpactAnalysis(comparisonModification, initialAnalysis, currentAnalysis);
  }

  /**
   * End the current session
   */
  endSession(): ModificationSession | null {
    const session = this.currentSession;
    this.currentSession = null;
    this.analysisCache.clear();
    return session;
  }

  // Private helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateConstraintValue(constraintField: keyof ConstraintProfile, value: number): void {
    // Skip validation for non-numeric fields
    if (constraintField === 'inputCompleteness' || constraintField === 'assumptions') {
      return;
    }

    if (value < 1 || value > 10) {
      throw new Error(`Constraint value must be between 1 and 10. Got: ${value}`);
    }

    if (!Number.isInteger(value)) {
      throw new Error(`Constraint value must be an integer. Got: ${value}`);
    }
  }

  private getConstraintKey(constraints: ConstraintProfile): string {
    return JSON.stringify({
      riskTolerance: constraints.riskTolerance,
      complianceStrictness: constraints.complianceStrictness,
      costSensitivity: constraints.costSensitivity,
      userExperiencePriority: constraints.userExperiencePriority,
      operationalMaturity: constraints.operationalMaturity,
      businessAgility: constraints.businessAgility,
    });
  }

  private getOrCalculateAnalysis(constraints: ConstraintProfile): ScoringResults {
    const key = this.getConstraintKey(constraints);
    
    if (this.analysisCache.has(key)) {
      return this.analysisCache.get(key)!;
    }

    const analysis = calculateWeightedScores(constraints);
    this.analysisCache.set(key, analysis);
    return analysis;
  }

  private calculateImpactAnalysis(
    modification: ConstraintModification,
    beforeAnalysis: ScoringResults,
    afterAnalysis: ScoringResults
  ): ConstraintImpactAnalysis {
    const impactDetails = this.calculateImpactDetails(beforeAnalysis, afterAnalysis);
    const changeSummary = this.generateChangeSummary(impactDetails);
    const recommendations = this.generateRecommendations(impactDetails, modification);

    return {
      modification,
      beforeAnalysis,
      afterAnalysis,
      impactDetails,
      changeSummary,
      recommendations,
    };
  }

  private calculateImpactDetails(
    beforeAnalysis: ScoringResults,
    afterAnalysis: ScoringResults
  ): ImpactDetails {
    const scoreChanges = this.calculateScoreChanges(beforeAnalysis.architectureScores, afterAnalysis.architectureScores);
    const rankingChanges = this.calculateRankingChanges(beforeAnalysis.architectureScores, afterAnalysis.architectureScores);
    const nearTieChanges = this.calculateNearTieChanges(beforeAnalysis, afterAnalysis);
    const conflictChanges = this.calculateConflictChanges(beforeAnalysis, afterAnalysis);
    const confidenceChanges = this.calculateConfidenceChanges(beforeAnalysis.architectureScores, afterAnalysis.architectureScores);

    return {
      scoreChanges,
      rankingChanges,
      nearTieChanges,
      conflictChanges,
      confidenceChanges,
    };
  }

  private calculateScoreChanges(
    beforeScores: ArchitectureScore[],
    afterScores: ArchitectureScore[]
  ): Record<string, ScoreChange> {
    const changes: Record<string, ScoreChange> = {};

    beforeScores.forEach(beforeScore => {
      const afterScore = afterScores.find(s => s.architectureType === beforeScore.architectureType);
      if (afterScore) {
        const absoluteChange = afterScore.weightedScore - beforeScore.weightedScore;
        const percentageChange = beforeScore.weightedScore !== 0 
          ? (absoluteChange / beforeScore.weightedScore) * 100 
          : 0;

        changes[beforeScore.architectureType] = {
          architecture: beforeScore.architectureType,
          previousScore: beforeScore.weightedScore,
          newScore: afterScore.weightedScore,
          absoluteChange,
          percentageChange,
          impactMagnitude: this.determineImpactMagnitude(Math.abs(absoluteChange)),
        };
      }
    });

    return changes;
  }

  private calculateRankingChanges(
    beforeScores: ArchitectureScore[],
    afterScores: ArchitectureScore[]
  ): RankingChange[] {
    const beforeRanks = this.getArchitectureRanks(beforeScores);
    const afterRanks = this.getArchitectureRanks(afterScores);
    const changes: RankingChange[] = [];

    Object.keys(beforeRanks).forEach(architecture => {
      const previousRank = beforeRanks[architecture] || 0;
      const newRank = afterRanks[architecture] || 0;
      
      if (previousRank !== newRank) {
        changes.push({
          architecture,
          previousRank,
          newRank,
          direction: newRank < previousRank ? 'up' : newRank > previousRank ? 'down' : 'unchanged',
        });
      }
    });

    return changes;
  }

  private calculateNearTieChanges(
    beforeAnalysis: ScoringResults,
    afterAnalysis: ScoringResults
  ): NearTieChange {
    const previousNearTie = beforeAnalysis.nearTieDetection?.isNearTie ?? beforeAnalysis.tradeoffAnalysis.isNearTie;
    const newNearTie = afterAnalysis.nearTieDetection?.isNearTie ?? afterAnalysis.tradeoffAnalysis.isNearTie;
    
    let tieTypeChange = 'No change in tie status';
    let impactDescription = 'Near-tie status remained unchanged';

    if (previousNearTie !== newNearTie) {
      if (newNearTie) {
        tieTypeChange = 'Changed from clear differentiation to near-tie';
        impactDescription = 'Constraint modification resulted in architectures becoming more similar in suitability';
      } else {
        tieTypeChange = 'Changed from near-tie to clear differentiation';
        impactDescription = 'Constraint modification resulted in clearer architectural preference';
      }
    }

    return {
      previousNearTie,
      newNearTie,
      tieTypeChange,
      impactDescription,
    };
  }

  private calculateConflictChanges(
    beforeAnalysis: ScoringResults,
    afterAnalysis: ScoringResults
  ): ConflictChange[] {
    // This would need to be implemented when conflict detection is available in ScoringResults
    // For now, return empty changes
    return [{
      resolvedConflicts: [],
      newConflicts: [],
      changedConflicts: [],
    }];
  }

  private calculateConfidenceChanges(
    beforeScores: ArchitectureScore[],
    afterScores: ArchitectureScore[]
  ): Record<string, ConfidenceChange> {
    const changes: Record<string, ConfidenceChange> = {};

    beforeScores.forEach(beforeScore => {
      const afterScore = afterScores.find(s => s.architectureType === beforeScore.architectureType);
      if (afterScore && beforeScore.confidenceLevel !== afterScore.confidenceLevel) {
        changes[beforeScore.architectureType] = {
          previousConfidence: beforeScore.confidenceLevel,
          newConfidence: afterScore.confidenceLevel,
          changeReason: 'Constraint modification affected confidence calculation',
        };
      }
    });

    return changes;
  }

  private getArchitectureRanks(scores: ArchitectureScore[]): Record<string, number> {
    const sortedScores = [...scores].sort((a, b) => b.weightedScore - a.weightedScore);
    const ranks: Record<string, number> = {};
    
    sortedScores.forEach((score, index) => {
      ranks[score.architectureType] = index + 1;
    });

    return ranks;
  }

  private determineImpactMagnitude(absoluteChange: number): ScoreChange['impactMagnitude'] {
    if (absoluteChange < 0.1) return 'negligible';
    if (absoluteChange < 0.5) return 'minor';
    if (absoluteChange < 1.0) return 'moderate';
    if (absoluteChange < 2.0) return 'significant';
    return 'major';
  }

  private generateChangeSummary(impactDetails: ImpactDetails): string[] {
    const summary: string[] = [];

    // Summarize score changes
    const significantChanges = Object.values(impactDetails.scoreChanges)
      .filter(change => change.impactMagnitude !== 'negligible');
    
    if (significantChanges.length > 0) {
      summary.push(`${significantChanges.length} architecture(s) experienced significant score changes`);
    }

    // Summarize ranking changes
    if (impactDetails.rankingChanges.length > 0) {
      summary.push(`${impactDetails.rankingChanges.length} architecture(s) changed ranking position`);
    }

    // Summarize near-tie changes
    if (impactDetails.nearTieChanges.previousNearTie !== impactDetails.nearTieChanges.newNearTie) {
      summary.push(impactDetails.nearTieChanges.impactDescription);
    }

    // Summarize confidence changes
    const confidenceChangeCount = Object.keys(impactDetails.confidenceChanges).length;
    if (confidenceChangeCount > 0) {
      summary.push(`${confidenceChangeCount} architecture(s) experienced confidence level changes`);
    }

    if (summary.length === 0) {
      summary.push('Constraint modification had minimal impact on analysis results');
    }

    return summary;
  }

  private generateRecommendations(
    impactDetails: ImpactDetails,
    modification: ConstraintModification
  ): string[] {
    const recommendations: string[] = [];

    // Check for major score changes
    const majorChanges = Object.values(impactDetails.scoreChanges)
      .filter(change => change.impactMagnitude === 'major' || change.impactMagnitude === 'significant');
    
    if (majorChanges.length > 0) {
      recommendations.push('Review the significant score changes to ensure they align with organizational priorities');
    }

    // Check for ranking changes
    if (impactDetails.rankingChanges.length > 0) {
      recommendations.push('Consider the implications of architecture ranking changes on decision-making');
    }

    // Check for near-tie status changes
    if (impactDetails.nearTieChanges.previousNearTie !== impactDetails.nearTieChanges.newNearTie) {
      if (impactDetails.nearTieChanges.newNearTie) {
        recommendations.push('With architectures now showing similar suitability, focus on qualitative trade-offs');
      } else {
        recommendations.push('Clear architectural preference has emerged - validate this aligns with expectations');
      }
    }

    // Check for confidence changes
    const confidenceDecreases = Object.values(impactDetails.confidenceChanges)
      .filter(change => 
        (change.previousConfidence === 'High' && change.newConfidence !== 'High') ||
        (change.previousConfidence === 'Medium' && change.newConfidence === 'Low')
      );
    
    if (confidenceDecreases.length > 0) {
      recommendations.push('Confidence levels decreased - consider validating constraint assumptions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Changes appear reasonable - continue with analysis or make additional modifications as needed');
    }

    return recommendations;
  }
}

/**
 * Utility functions for constraint modification
 */
export class ConstraintModificationUtils {
  
  /**
   * Create a new interactive constraint modifier
   */
  static createModifier(): InteractiveConstraintModifier {
    return new InteractiveConstraintModifier();
  }

  /**
   * Validate a complete constraint profile
   */
  static validateConstraintProfile(constraints: ConstraintProfile): string[] {
    const errors: string[] = [];
    
    const numericFields: (keyof ConstraintProfile)[] = [
      'riskTolerance', 'complianceStrictness', 'costSensitivity',
      'userExperiencePriority', 'operationalMaturity', 'businessAgility'
    ];

    numericFields.forEach(field => {
      const value = constraints[field] as number;
      if (typeof value !== 'number' || value < 1 || value > 10 || !Number.isInteger(value)) {
        errors.push(`${field} must be an integer between 1 and 10`);
      }
    });

    return errors;
  }

  /**
   * Calculate similarity between two constraint profiles
   */
  static calculateConstraintSimilarity(
    constraints1: ConstraintProfile,
    constraints2: ConstraintProfile
  ): number {
    const fields: (keyof ConstraintProfile)[] = [
      'riskTolerance', 'complianceStrictness', 'costSensitivity',
      'userExperiencePriority', 'operationalMaturity', 'businessAgility'
    ];

    let totalDifference = 0;
    let fieldCount = 0;

    fields.forEach(field => {
      const value1 = constraints1[field] as number;
      const value2 = constraints2[field] as number;
      
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        totalDifference += Math.abs(value1 - value2);
        fieldCount++;
      }
    });

    if (fieldCount === 0) return 0;

    // Calculate similarity as percentage (0-100)
    const maxPossibleDifference = fieldCount * 9; // Max difference per field is 9 (10-1)
    const similarity = ((maxPossibleDifference - totalDifference) / maxPossibleDifference) * 100;
    
    return Math.max(0, Math.min(100, similarity));
  }
}