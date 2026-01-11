/**
 * Property-based tests for interactive constraint impact
 * Feature: securestack-referee, Property 12: Interactive Constraint Impact
 * Validates: Requirements 5.5, 10.4
 */

import fc from 'fast-check';
import { InteractiveConstraintModifier, ConstraintModificationUtils } from './interactive-constraint-modifier';
import { ConstraintProfile } from './types';

describe('Property-Based Tests: Interactive Constraint Impact', () => {
  /**
   * Property 12: Interactive Constraint Impact
   * For any constraint modification, the system shall update the analysis and show how changes affect results in a traceable manner.
   * Validates: Requirements 5.5, 10.4
   */
  describe('Property 12: Interactive Constraint Impact', () => {
    // Generator for valid constraint values (1-10 scale)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for constraint field names
    const constraintFieldGen = fc.constantFrom<keyof ConstraintProfile>(
      'riskTolerance',
      'complianceStrictness', 
      'costSensitivity',
      'userExperiencePriority',
      'operationalMaturity',
      'businessAgility'
    );
    
    // Generator for valid constraint profiles
    const constraintProfileGen = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 5 }),
    }) as fc.Arbitrary<ConstraintProfile>;

    // Generator for modification reasons
    const modificationReasonGen = fc.oneof(
      fc.constant('Updated security requirements'),
      fc.constant('New compliance mandate'),
      fc.constant('Budget constraints changed'),
      fc.constant('User feedback incorporated'),
      fc.constant('Operational capacity updated'),
      fc.constant('Business priorities shifted'),
      fc.constant(undefined) // No reason provided
    );

    test('Property 12a: Constraint modifications update analysis and provide traceable impact', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          constraintFieldGen,
          validConstraintValue,
          modificationReasonGen,
          (initialConstraints, constraintField, newValue, reason) => {
            // Skip if new value is same as current value
            if (initialConstraints[constraintField] === newValue) {
              return;
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Requirement 5.5: System SHALL allow constraint weight modification and show impact on analysis
            const impactAnalysis = modifier.modifyConstraint(constraintField, newValue, reason);

            // Should provide complete impact analysis
            expect(impactAnalysis).toBeDefined();
            expect(impactAnalysis.modification).toBeDefined();
            expect(impactAnalysis.beforeAnalysis).toBeDefined();
            expect(impactAnalysis.afterAnalysis).toBeDefined();
            expect(impactAnalysis.impactDetails).toBeDefined();

            // Modification should be properly recorded
            expect(impactAnalysis.modification.constraintField).toBe(constraintField);
            expect(impactAnalysis.modification.previousValue).toBe(initialConstraints[constraintField]);
            expect(impactAnalysis.modification.newValue).toBe(newValue);
            expect(impactAnalysis.modification.timestamp).toBeInstanceOf(Date);
            
            if (reason) {
              expect(impactAnalysis.modification.reason).toBe(reason);
            }

            // Should show how changes affect results (Requirement 10.4)
            expect(impactAnalysis.impactDetails.scoreChanges).toBeDefined();
            expect(impactAnalysis.impactDetails.rankingChanges).toBeDefined();
            expect(impactAnalysis.impactDetails.nearTieChanges).toBeDefined();
            expect(impactAnalysis.impactDetails.confidenceChanges).toBeDefined();

            // Impact should be traceable and meaningful
            expect(impactAnalysis.changeSummary).toBeDefined();
            expect(Array.isArray(impactAnalysis.changeSummary)).toBe(true);
            expect(impactAnalysis.changeSummary.length).toBeGreaterThan(0);

            expect(impactAnalysis.recommendations).toBeDefined();
            expect(Array.isArray(impactAnalysis.recommendations)).toBe(true);
            expect(impactAnalysis.recommendations.length).toBeGreaterThan(0);
          }
        )
      );
    });

    test('Property 12b: Multiple constraint modifications maintain traceable history', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          fc.array(fc.tuple(constraintFieldGen, validConstraintValue), { minLength: 2, maxLength: 5 }),
          (initialConstraints, modifications) => {
            const modifier = new InteractiveConstraintModifier();
            const session = modifier.startSession(initialConstraints);

            // Apply multiple modifications
            const appliedModifications: Array<[keyof ConstraintProfile, number]> = [];
            const impactAnalyses = [];
            for (const [field, value] of modifications) {
              // Skip if value is same as current value
              const currentSession = modifier.getCurrentSession();
              if (currentSession && currentSession.currentConstraints[field] === value) {
                continue;
              }
              
              const impact = modifier.modifyConstraint(field, value);
              impactAnalyses.push(impact);
              appliedModifications.push([field, value]);
            }

            // Requirement 10.4: Users should be able to trace how input changes affect results
            const finalSession = modifier.getCurrentSession();
            expect(finalSession).toBeDefined();
            expect(finalSession!.modificationHistory.length).toBe(impactAnalyses.length);
            expect(finalSession!.impactHistory.length).toBe(impactAnalyses.length);

            // Each modification should be traceable
            appliedModifications.forEach((appliedMod, index) => {
              const modification = finalSession!.modificationHistory[index]!;
              expect(modification.constraintField).toBe(appliedMod[0]);
              expect(modification.newValue).toBe(appliedMod[1]);
              expect(modification.timestamp).toBeInstanceOf(Date);
            });

            // Impact history should correspond to modifications
            expect(finalSession!.impactHistory.length).toBe(finalSession!.modificationHistory.length);
            
            // Each impact analysis should show cumulative effect
            finalSession!.impactHistory.forEach(impact => {
              expect(impact.beforeAnalysis).toBeDefined();
              expect(impact.afterAnalysis).toBeDefined();
              expect(impact.changeSummary.length).toBeGreaterThan(0);
            });
          }
        )
      );
    });

    test('Property 12c: Real-time analysis updates reflect constraint changes', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          constraintFieldGen,
          validConstraintValue,
          (initialConstraints, constraintField, newValue) => {
            // Skip if new value is same as current value
            if (initialConstraints[constraintField] === newValue) {
              return;
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Get initial analysis
            const initialAnalysis = modifier.getCurrentAnalysis();
            expect(initialAnalysis).toBeDefined();

            // Modify constraint
            modifier.modifyConstraint(constraintField, newValue);

            // Get updated analysis
            const updatedAnalysis = modifier.getCurrentAnalysis();
            expect(updatedAnalysis).toBeDefined();

            // Requirement 5.5: Real-time analysis updates
            // Analysis should reflect the constraint change
            expect(updatedAnalysis).not.toEqual(initialAnalysis);
            
            // Architecture scores should be recalculated
            expect(updatedAnalysis!.architectureScores).toBeDefined();
            expect(updatedAnalysis!.architectureScores.length).toBeGreaterThan(0);
            
            // At least one architecture score should be different (unless change was negligible)
            const scoresChanged = updatedAnalysis!.architectureScores.some((updatedScore, index) => {
              const initialScore = initialAnalysis!.architectureScores[index];
              return initialScore && Math.abs(updatedScore.weightedScore - initialScore.weightedScore) > 0.001;
            });
            
            // For significant constraint changes, scores should change
            const constraintChange = Math.abs(newValue - (initialConstraints[constraintField] as number));
            if (constraintChange >= 2) {
              expect(scoresChanged).toBe(true);
            }
          }
        )
      );
    });

    test('Property 12d: Impact analysis provides meaningful score change details', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          constraintFieldGen,
          validConstraintValue,
          (initialConstraints, constraintField, newValue) => {
            // Skip if new value is same as current value
            if (initialConstraints[constraintField] === newValue) {
              return;
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);
            
            const impactAnalysis = modifier.modifyConstraint(constraintField, newValue);

            // Score changes should be detailed and meaningful
            const scoreChanges = impactAnalysis.impactDetails.scoreChanges;
            expect(scoreChanges).toBeDefined();
            
            // Should have score changes for each architecture
            const architectureTypes = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
            architectureTypes.forEach(archType => {
              if (scoreChanges[archType]) {
                const change = scoreChanges[archType]!;
                expect(change.architecture).toBe(archType);
                expect(typeof change.previousScore).toBe('number');
                expect(typeof change.newScore).toBe('number');
                expect(typeof change.absoluteChange).toBe('number');
                expect(typeof change.percentageChange).toBe('number');
                expect(['negligible', 'minor', 'moderate', 'significant', 'major']).toContain(change.impactMagnitude);
                
                // Absolute change should match the difference
                const expectedChange = change.newScore - change.previousScore;
                expect(Math.abs(change.absoluteChange - expectedChange)).toBeLessThan(0.001);
              }
            });

            // Ranking changes should be tracked
            const rankingChanges = impactAnalysis.impactDetails.rankingChanges;
            expect(Array.isArray(rankingChanges)).toBe(true);
            
            rankingChanges.forEach(rankingChange => {
              expect(rankingChange.architecture).toBeTruthy();
              expect(typeof rankingChange.previousRank).toBe('number');
              expect(typeof rankingChange.newRank).toBe('number');
              expect(['up', 'down', 'unchanged']).toContain(rankingChange.direction);
            });
          }
        )
      );
    });

    test('Property 12e: Batch modifications provide comprehensive impact analysis', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          fc.array(
            fc.record({
              constraintField: constraintFieldGen,
              newValue: validConstraintValue,
              reason: modificationReasonGen,
            }),
            { minLength: 2, maxLength: 4 }
          ),
          (initialConstraints, modifications) => {
            // Filter out modifications that don't change values
            const validModifications = modifications.filter(mod => 
              initialConstraints[mod.constraintField] !== mod.newValue
            );
            
            if (validModifications.length === 0) {
              return; // Skip if no valid modifications
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Requirement 5.5: Allow constraint weight modification
            const modificationRequests = validModifications.map(mod => ({
              constraintField: mod.constraintField,
              newValue: mod.newValue,
              ...(mod.reason ? { reason: mod.reason } : {})
            }));
            const impactAnalyses = modifier.batchModifyConstraints(modificationRequests);

            // Should provide impact analysis for each modification
            expect(impactAnalyses.length).toBe(validModifications.length);
            
            impactAnalyses.forEach((impact, index) => {
              const modification = validModifications[index]!;
              expect(impact.modification.constraintField).toBe(modification.constraintField);
              expect(impact.modification.newValue).toBe(modification.newValue);
              
              if (modification.reason) {
                expect(impact.modification.reason).toBe(modification.reason);
              }

              // Each impact should show traceable changes
              expect(impact.beforeAnalysis).toBeDefined();
              expect(impact.afterAnalysis).toBeDefined();
              expect(impact.changeSummary.length).toBeGreaterThan(0);
              expect(impact.recommendations.length).toBeGreaterThan(0);
            });

            // Session should track all modifications
            const session = modifier.getCurrentSession();
            expect(session!.modificationHistory.length).toBe(validModifications.length);
            expect(session!.impactHistory.length).toBe(validModifications.length);
          }
        )
      );
    });

    test('Property 12f: Revert operations maintain traceability', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          fc.array(fc.tuple(constraintFieldGen, validConstraintValue), { minLength: 3, maxLength: 6 }),
          fc.integer({ min: 0, max: 2 }),
          (initialConstraints, modifications, revertToStep) => {
            // Filter out modifications that don't change values
            const validModifications = modifications.filter(([field, value]) => 
              initialConstraints[field] !== value
            );
            
            if (validModifications.length <= revertToStep) {
              return; // Skip if revert step is invalid
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Apply modifications
            for (const [field, value] of validModifications) {
              modifier.modifyConstraint(field, value);
            }

            // Requirement 10.4: Traceable impact analysis for input changes
            const revertImpact = modifier.revertToStep(revertToStep);
            expect(revertImpact).toBeDefined();

            // Should show impact of reverting
            expect(revertImpact!.beforeAnalysis).toBeDefined();
            expect(revertImpact!.afterAnalysis).toBeDefined();
            expect(revertImpact!.changeSummary.length).toBeGreaterThan(0);

            // Session should reflect reverted state
            const session = modifier.getCurrentSession();
            expect(session!.modificationHistory.length).toBe(revertToStep + 1);
            expect(session!.impactHistory.length).toBe(revertToStep + 1);

            // Current constraints should match expected state after revert
            let expectedConstraints = { ...initialConstraints };
            for (let i = 0; i <= revertToStep; i++) {
              const [field, value] = validModifications[i]!;
              expectedConstraints = { ...expectedConstraints, [field]: value };
            }

            // Compare numeric constraint fields
            const numericFields: (keyof ConstraintProfile)[] = [
              'riskTolerance', 'complianceStrictness', 'costSensitivity',
              'userExperiencePriority', 'operationalMaturity', 'businessAgility'
            ];
            
            numericFields.forEach(field => {
              expect(session!.currentConstraints[field]).toBe(expectedConstraints[field]);
            });
          }
        )
      );
    });

    test('Property 12g: Reset to initial provides complete traceability', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          fc.array(fc.tuple(constraintFieldGen, validConstraintValue), { minLength: 1, maxLength: 4 }),
          (initialConstraints, modifications) => {
            // Filter out modifications that don't change values
            const validModifications = modifications.filter(([field, value]) => 
              initialConstraints[field] !== value
            );
            
            if (validModifications.length === 0) {
              return; // Skip if no valid modifications
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Apply modifications
            for (const [field, value] of validModifications) {
              modifier.modifyConstraint(field, value);
            }

            // Reset to initial state
            const resetImpact = modifier.resetToInitial();
            expect(resetImpact).toBeDefined();

            // Should show impact of reset
            expect(resetImpact!.beforeAnalysis).toBeDefined();
            expect(resetImpact!.afterAnalysis).toBeDefined();
            expect(resetImpact!.changeSummary.length).toBeGreaterThan(0);
            expect(resetImpact!.modification.reason).toBe('Reset to initial constraints');

            // Session should be reset
            const session = modifier.getCurrentSession();
            expect(session!.modificationHistory.length).toBe(0);
            expect(session!.impactHistory.length).toBe(0);

            // Current constraints should match initial constraints
            const numericFields: (keyof ConstraintProfile)[] = [
              'riskTolerance', 'complianceStrictness', 'costSensitivity',
              'userExperiencePriority', 'operationalMaturity', 'businessAgility'
            ];
            
            numericFields.forEach(field => {
              expect(session!.currentConstraints[field]).toBe(initialConstraints[field]);
            });
          }
        )
      );
    });

    test('Property 12h: Comparison with initial state shows cumulative impact', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          fc.array(fc.tuple(constraintFieldGen, validConstraintValue), { minLength: 1, maxLength: 3 }),
          (initialConstraints, modifications) => {
            // Filter out modifications that don't change values
            const validModifications = modifications.filter(([field, value]) => 
              initialConstraints[field] !== value
            );
            
            if (validModifications.length === 0) {
              return; // Skip if no valid modifications
            }

            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Apply modifications
            for (const [field, value] of validModifications) {
              modifier.modifyConstraint(field, value);
            }

            // Compare with initial state
            const comparison = modifier.compareWithInitial();
            expect(comparison).toBeDefined();

            // Should show cumulative impact from initial to current state
            expect(comparison!.beforeAnalysis).toBeDefined();
            expect(comparison!.afterAnalysis).toBeDefined();
            expect(comparison!.changeSummary.length).toBeGreaterThan(0);
            expect(comparison!.modification.reason).toBe('Comparison with initial state');

            // Impact should reflect all changes made
            expect(comparison!.impactDetails.scoreChanges).toBeDefined();
            
            // Should have meaningful recommendations based on cumulative changes
            expect(comparison!.recommendations.length).toBeGreaterThan(0);
            comparison!.recommendations.forEach(recommendation => {
              expect(typeof recommendation).toBe('string');
              expect(recommendation.length).toBeGreaterThan(10);
            });
          }
        )
      );
    });

    test('Property 12i: Input validation prevents invalid modifications', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          constraintFieldGen,
          fc.oneof(
            fc.integer({ min: -10, max: 0 }), // Below valid range
            fc.integer({ min: 11, max: 20 }), // Above valid range
            fc.float({ min: Math.fround(1.1), max: Math.fround(9.9) })  // Non-integer
          ),
          (initialConstraints, constraintField, invalidValue) => {
            const modifier = new InteractiveConstraintModifier();
            modifier.startSession(initialConstraints);

            // Should reject invalid constraint values
            expect(() => {
              modifier.modifyConstraint(constraintField, invalidValue);
            }).toThrow();

            // Session should remain unchanged after failed modification
            const session = modifier.getCurrentSession();
            expect(session!.modificationHistory.length).toBe(0);
            expect(session!.impactHistory.length).toBe(0);
            expect(session!.currentConstraints).toEqual(initialConstraints);
          }
        )
      );
    });

    test('Property 12j: Session operations are deterministic and consistent', () => {
      fc.assert(
        fc.property(
          constraintProfileGen,
          constraintFieldGen,
          validConstraintValue,
          (initialConstraints, constraintField, newValue) => {
            // Skip if new value is same as current value
            if (initialConstraints[constraintField] === newValue) {
              return;
            }

            // Create two identical sessions
            const modifier1 = new InteractiveConstraintModifier();
            const modifier2 = new InteractiveConstraintModifier();
            
            modifier1.startSession(initialConstraints);
            modifier2.startSession(initialConstraints);

            // Apply same modification to both
            const impact1 = modifier1.modifyConstraint(constraintField, newValue);
            const impact2 = modifier2.modifyConstraint(constraintField, newValue);

            // Results should be identical (deterministic)
            expect(impact1.modification.constraintField).toBe(impact2.modification.constraintField);
            expect(impact1.modification.previousValue).toBe(impact2.modification.previousValue);
            expect(impact1.modification.newValue).toBe(impact2.modification.newValue);

            // Score changes should be identical
            expect(impact1.impactDetails.scoreChanges).toEqual(impact2.impactDetails.scoreChanges);
            expect(impact1.changeSummary).toEqual(impact2.changeSummary);

            // Current analysis should be identical
            const analysis1 = modifier1.getCurrentAnalysis();
            const analysis2 = modifier2.getCurrentAnalysis();
            expect(analysis1).toEqual(analysis2);
          }
        )
      );
    });
  });
});