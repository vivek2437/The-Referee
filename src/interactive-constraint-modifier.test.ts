/**
 * Unit tests for Interactive Constraint Modification System
 * 
 * Tests the constraint weight modification capability, traceable impact analysis,
 * and real-time analysis updates.
 */

import { InteractiveConstraintModifier, ConstraintModificationUtils } from './interactive-constraint-modifier';
import { ConstraintProfile } from './types';

describe('InteractiveConstraintModifier', () => {
  let modifier: InteractiveConstraintModifier;
  let testConstraints: ConstraintProfile;

  beforeEach(() => {
    modifier = new InteractiveConstraintModifier();
    testConstraints = {
      riskTolerance: 5,
      complianceStrictness: 6,
      costSensitivity: 4,
      userExperiencePriority: 7,
      operationalMaturity: 5,
      businessAgility: 6,
      inputCompleteness: true,
      assumptions: [],
    };
  });

  describe('Session management', () => {
    test('should start a new modification session', () => {
      const session = modifier.startSession(testConstraints);

      expect(session.sessionId).toBeDefined();
      expect(session.initialConstraints).toEqual(testConstraints);
      expect(session.currentConstraints).toEqual(testConstraints);
      expect(session.modificationHistory).toHaveLength(0);
      expect(session.impactHistory).toHaveLength(0);
    });

    test('should get current session information', () => {
      modifier.startSession(testConstraints);
      const session = modifier.getCurrentSession();

      expect(session).toBeDefined();
      expect(session!.initialConstraints).toEqual(testConstraints);
    });

    test('should end session and clear state', () => {
      modifier.startSession(testConstraints);
      const endedSession = modifier.endSession();

      expect(endedSession).toBeDefined();
      expect(modifier.getCurrentSession()).toBeNull();
    });
  });

  describe('Constraint modification', () => {
    beforeEach(() => {
      modifier.startSession(testConstraints);
    });

    test('should modify a single constraint and track impact', () => {
      const impact = modifier.modifyConstraint('riskTolerance', 8, 'Increased security requirements');

      expect(impact.modification.constraintField).toBe('riskTolerance');
      expect(impact.modification.previousValue).toBe(5);
      expect(impact.modification.newValue).toBe(8);
      expect(impact.modification.reason).toBe('Increased security requirements');
      expect(impact.beforeAnalysis).toBeDefined();
      expect(impact.afterAnalysis).toBeDefined();
      expect(impact.changeSummary).toBeDefined();
    });

    test('should validate constraint values', () => {
      expect(() => {
        modifier.modifyConstraint('riskTolerance', 11); // Invalid: > 10
      }).toThrow('Constraint value must be between 1 and 10');

      expect(() => {
        modifier.modifyConstraint('riskTolerance', 0); // Invalid: < 1
      }).toThrow('Constraint value must be between 1 and 10');

      expect(() => {
        modifier.modifyConstraint('riskTolerance', 5.5); // Invalid: not integer
      }).toThrow('Constraint value must be an integer');
    });

    test('should track modification history', () => {
      modifier.modifyConstraint('riskTolerance', 8);
      modifier.modifyConstraint('complianceStrictness', 9);

      const session = modifier.getCurrentSession();
      expect(session!.modificationHistory).toHaveLength(2);
      expect(session!.impactHistory).toHaveLength(2);
    });

    test('should batch modify multiple constraints', () => {
      const modifications = [
        { constraintField: 'riskTolerance' as const, newValue: 8 },
        { constraintField: 'complianceStrictness' as const, newValue: 9 },
      ];

      const impacts = modifier.batchModifyConstraints(modifications);

      expect(impacts).toHaveLength(2);
      expect(impacts[0]!.modification.constraintField).toBe('riskTolerance');
      expect(impacts[1]!.modification.constraintField).toBe('complianceStrictness');
    });
  });

  describe('Impact analysis', () => {
    beforeEach(() => {
      modifier.startSession(testConstraints);
    });

    test('should calculate score changes', () => {
      const impact = modifier.modifyConstraint('riskTolerance', 2); // Significant change

      expect(impact.impactDetails.scoreChanges).toBeDefined();
      
      // Check that score changes are calculated for each architecture
      const architectures = Object.keys(impact.impactDetails.scoreChanges);
      expect(architectures.length).toBeGreaterThan(0);
      
      // Verify score change structure
      const firstArchitecture = architectures[0];
      if (firstArchitecture) {
        const scoreChange = impact.impactDetails.scoreChanges[firstArchitecture];
        if (scoreChange) {
          expect(scoreChange.previousScore).toBeDefined();
          expect(scoreChange.newScore).toBeDefined();
          expect(scoreChange.absoluteChange).toBeDefined();
          expect(scoreChange.impactMagnitude).toBeDefined();
        }
      }
    });

    test('should detect ranking changes', () => {
      const impact = modifier.modifyConstraint('complianceStrictness', 10); // Max compliance

      expect(impact.impactDetails.rankingChanges).toBeDefined();
      // Ranking changes depend on the specific scoring logic
    });

    test('should track near-tie changes', () => {
      const impact = modifier.modifyConstraint('userExperiencePriority', 10);

      expect(impact.impactDetails.nearTieChanges).toBeDefined();
      expect(impact.impactDetails.nearTieChanges.previousNearTie).toBeDefined();
      expect(impact.impactDetails.nearTieChanges.newNearTie).toBeDefined();
    });
  });

  describe('Session operations', () => {
    beforeEach(() => {
      modifier.startSession(testConstraints);
    });

    test('should revert to previous state', () => {
      modifier.modifyConstraint('riskTolerance', 8);
      modifier.modifyConstraint('complianceStrictness', 9);
      
      const revertImpact = modifier.revertToStep(0);

      expect(revertImpact).toBeDefined();
      const session = modifier.getCurrentSession();
      expect(session!.modificationHistory).toHaveLength(1);
    });

    test('should reset to initial constraints', () => {
      modifier.modifyConstraint('riskTolerance', 8);
      modifier.modifyConstraint('complianceStrictness', 9);
      
      const resetImpact = modifier.resetToInitial();

      expect(resetImpact).toBeDefined();
      const session = modifier.getCurrentSession();
      expect(session!.currentConstraints).toEqual(testConstraints);
      expect(session!.modificationHistory).toHaveLength(0);
    });

    test('should compare with initial state', () => {
      modifier.modifyConstraint('riskTolerance', 8);
      
      const comparison = modifier.compareWithInitial();

      expect(comparison).toBeDefined();
      expect(comparison!.modification.reason).toBe('Comparison with initial state');
    });

    test('should get real-time analysis', () => {
      modifier.modifyConstraint('riskTolerance', 8);
      
      const analysis = modifier.getCurrentAnalysis();

      expect(analysis).toBeDefined();
      expect(analysis!.architectureScores).toBeDefined();
    });
  });

  describe('Error handling', () => {
    test('should throw error when no session is active', () => {
      expect(() => {
        modifier.modifyConstraint('riskTolerance', 8);
      }).toThrow('No active modification session');
    });

    test('should handle invalid revert step', () => {
      modifier.startSession(testConstraints);
      
      expect(() => {
        modifier.revertToStep(5); // No modifications made yet
      }).toThrow('Invalid step index');
    });
  });
});

describe('ConstraintModificationUtils', () => {
  test('should create a new modifier', () => {
    const modifier = ConstraintModificationUtils.createModifier();
    expect(modifier).toBeInstanceOf(InteractiveConstraintModifier);
  });

  test('should validate constraint profile', () => {
    const validConstraints: ConstraintProfile = {
      riskTolerance: 5,
      complianceStrictness: 6,
      costSensitivity: 4,
      userExperiencePriority: 7,
      operationalMaturity: 5,
      businessAgility: 6,
      inputCompleteness: true,
      assumptions: [],
    };

    const errors = ConstraintModificationUtils.validateConstraintProfile(validConstraints);
    expect(errors).toHaveLength(0);

    const invalidConstraints = {
      ...validConstraints,
      riskTolerance: 11, // Invalid: > 10
      complianceStrictness: 0, // Invalid: < 1
    };

    const invalidErrors = ConstraintModificationUtils.validateConstraintProfile(invalidConstraints);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  test('should calculate constraint similarity', () => {
    const constraints1: ConstraintProfile = {
      riskTolerance: 5,
      complianceStrictness: 6,
      costSensitivity: 4,
      userExperiencePriority: 7,
      operationalMaturity: 5,
      businessAgility: 6,
      inputCompleteness: true,
      assumptions: [],
    };

    const constraints2: ConstraintProfile = {
      riskTolerance: 5,
      complianceStrictness: 6,
      costSensitivity: 4,
      userExperiencePriority: 7,
      operationalMaturity: 5,
      businessAgility: 6,
      inputCompleteness: true,
      assumptions: [],
    };

    const similarity = ConstraintModificationUtils.calculateConstraintSimilarity(constraints1, constraints2);
    expect(similarity).toBe(100); // Identical constraints

    const constraints3 = {
      ...constraints1,
      riskTolerance: 1, // Different value
    };

    const similarity2 = ConstraintModificationUtils.calculateConstraintSimilarity(constraints1, constraints3);
    expect(similarity2).toBeLessThan(100);
    expect(similarity2).toBeGreaterThan(0);
  });
});