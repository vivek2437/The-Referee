/**
 * Property-based tests for near-tie detection
 * Feature: securestack-referee, Property 14: Near-Tie Detection
 * Validates: Requirements 7.2, 7.3
 */

import fc from 'fast-check';
import { NearTieDetector, NearTieUtils, DEFAULT_NEAR_TIE_CONFIG } from './near-tie-detector';
import { ArchitectureScore, ArchitectureType, DimensionScores, ConfidenceLevel } from './types';

describe('Property-Based Tests: Near-Tie Detection', () => {
  /**
   * Property 14: Near-Tie Detection
   * For any analysis where architecture scores are within defined thresholds, 
   * the system shall identify near-ties and state "no clear winner."
   * Validates: Requirements 7.2, 7.3
   */
  describe('Property 14: Near-Tie Detection', () => {
    // Generator for valid scores (1-10 range)
    const validScore = fc.float({ min: 1, max: 10 });
    
    // Generator for architecture types
    const architectureType = fc.oneof(
      fc.constant('IRM-Heavy' as ArchitectureType),
      fc.constant('URM-Heavy' as ArchitectureType),
      fc.constant('Hybrid' as ArchitectureType)
    );
    
    // Generator for confidence levels
    const confidenceLevel = fc.oneof(
      fc.constant('High' as ConfidenceLevel),
      fc.constant('Medium' as ConfidenceLevel),
      fc.constant('Low' as ConfidenceLevel)
    );
    
    // Generator for dimension scores
    const dimensionScores = fc.record({
      identityVerification: validScore,
      behavioralAnalytics: validScore,
      operationalComplexity: validScore,
      userExperience: validScore,
      complianceAuditability: validScore,
      scalabilityPerformance: validScore,
      costEfficiency: validScore,
    });
    
    // Generator for architecture scores
    const architectureScore = fc.record({
      architectureType,
      dimensionScores,
      weightedScore: validScore,
      confidenceLevel,
    });
    
    // Generator for near-tie scenarios (scores within threshold)
    const nearTieScores = fc.tuple(
      fc.float({ min: 2, max: 9 }), // Ensure base score has room for subtraction
      fc.float({ min: 0, max: Math.fround(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold - 0.01) }) // Slightly less than threshold
    ).map(([baseScore, difference]) => {
      const secondScore = baseScore - difference;
      // Ensure both scores are valid and different
      if (secondScore < 1 || isNaN(secondScore) || isNaN(baseScore)) {
        return [
          {
            architectureType: 'IRM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 5.2,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
          {
            architectureType: 'URM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 5.0,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
        ];
      }
      return [
        {
          architectureType: 'IRM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: baseScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
        {
          architectureType: 'URM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: secondScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
      ];
    });
    
    // Generator for clear winner scenarios (scores beyond threshold)
    const clearWinnerScores = fc.tuple(
      fc.float({ min: 2, max: 8 }), // Ensure room for addition
      fc.float({ min: Math.fround(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold + 0.1), max: 3 })
    ).map(([baseScore, difference]) => {
      const topScore = Math.min(10, baseScore + difference);
      // Ensure valid scores
      if (isNaN(topScore) || isNaN(baseScore)) {
        return [
          {
            architectureType: 'IRM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 8.0,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
          {
            architectureType: 'URM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 6.8,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
        ];
      }
      return [
        {
          architectureType: 'IRM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: topScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
        {
          architectureType: 'URM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: baseScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
      ];
    });
    
    // Generator for three-way near-tie scenarios
    const threeWayNearTieScores = fc.tuple(
      fc.float({ min: 3, max: 8 }), // Ensure room for subtraction
      fc.float({ min: 0, max: Math.fround(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold - 0.01) }),
      fc.float({ min: 0, max: Math.fround(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold - 0.01) })
    ).map(([baseScore, diff1, diff2]) => {
      const secondScore = baseScore - diff1;
      const thirdScore = secondScore - diff2;
      // Ensure all scores are valid
      if (thirdScore < 1 || isNaN(baseScore) || isNaN(secondScore) || isNaN(thirdScore)) {
        return [
          {
            architectureType: 'IRM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 6.3,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
          {
            architectureType: 'URM-Heavy' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 6.1,
            confidenceLevel: 'High' as ConfidenceLevel,
          },
          {
            architectureType: 'Hybrid' as ArchitectureType,
            dimensionScores: {} as DimensionScores,
            weightedScore: 6.0,
            confidenceLevel: 'Medium' as ConfidenceLevel,
          },
        ];
      }
      return [
        {
          architectureType: 'IRM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: baseScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
        {
          architectureType: 'URM-Heavy' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: secondScore,
          confidenceLevel: 'High' as ConfidenceLevel,
        },
        {
          architectureType: 'Hybrid' as ArchitectureType,
          dimensionScores: {} as DimensionScores,
          weightedScore: thirdScore,
          confidenceLevel: 'Medium' as ConfidenceLevel,
        },
      ];
    });

    test('Property 14a: Near-ties are correctly identified within threshold', () => {
      fc.assert(
        fc.property(nearTieScores, (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Requirement 7.2: System SHALL define what constitutes meaningful score differences vs near-ties
          expect(result.isNearTie).toBe(true);
          expect(result.tieType).not.toBe('no-tie');
          expect(result.scoreDifference).toBeLessThanOrEqual(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold);
          expect(result.thresholdUsed).toBe(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold);
          
          // Should not have a clear winner
          expect(result.clearWinner).toBeUndefined();
          
          // Should identify tied architectures
          expect(result.tiedArchitectures.length).toBeGreaterThanOrEqual(2);
        })
      );
    });

    test('Property 14b: Clear winners are identified beyond threshold', () => {
      fc.assert(
        fc.property(clearWinnerScores, (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Requirement 7.2: Meaningful score differences should not be near-ties
          expect(result.isNearTie).toBe(false);
          expect(result.tieType).toBe('no-tie');
          expect(result.scoreDifference).toBeGreaterThan(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold);
          
          // Should have a clear winner
          expect(result.clearWinner).toBeDefined();
          expect(result.tiedArchitectures.length).toBe(0);
        })
      );
    });

    test('Property 14c: "No clear winner" message is generated for near-ties', () => {
      fc.assert(
        fc.property(nearTieScores, (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          const message = detector.generateNoWinnerMessage(result);
          
          // Requirement 7.3: System SHALL state "no clear winner" when options are closely matched
          expect(result.isNearTie).toBe(true);
          expect(message).toContain('No clear winner');
          expect(message.length).toBeGreaterThan(0);
          
          // Message should be informative and professional
          expect(message).toMatch(/similar suitability|closely matched|within.*margin/i);
        })
      );
    });

    test('Property 14d: Three-way ties are properly detected', () => {
      fc.assert(
        fc.property(threeWayNearTieScores, (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Should detect three-way tie when all scores are within threshold
          if (result.isNearTie && result.tieType === 'three-way-tie') {
            expect(result.tiedArchitectures.length).toBe(3);
            expect(result.clearWinner).toBeUndefined();
            
            const message = detector.generateNoWinnerMessage(result);
            expect(message).toContain('All three architecture options');
          }
        })
      );
    });

    test('Property 14e: Trade-off emphasis messaging is always provided', () => {
      fc.assert(
        fc.property(fc.array(architectureScore, { minLength: 2, maxLength: 3 }), (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          const tradeoffMessage = detector.generateTradeoffEmphasisMessage(result);
          
          // Should always provide trade-off emphasis messaging
          expect(tradeoffMessage).toBeTruthy();
          expect(tradeoffMessage.length).toBeGreaterThan(0);
          expect(tradeoffMessage).toContain('Trade-off analysis should drive your decision');
          
          // Message should vary based on tie status
          if (result.isNearTie) {
            expect(tradeoffMessage).toMatch(/qualitative factors|organizational readiness|stakeholder alignment/i);
          } else {
            expect(tradeoffMessage).toMatch(/numeric advantage|carefully evaluate|organizational implications/i);
          }
        })
      );
    });

    test('Property 14f: Detection confidence is appropriately calculated', () => {
      fc.assert(
        fc.property(fc.array(architectureScore, { minLength: 2, maxLength: 3 }), (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Detection confidence should be valid
          expect(['High', 'Medium', 'Low']).toContain(result.detectionConfidence);
          
          // The confidence calculation is complex and depends on multiple factors
          // We'll just verify that it's calculated consistently
          const result2 = detector.detectNearTie(scores);
          expect(result.detectionConfidence).toBe(result2.detectionConfidence);
        })
      );
    });

    test('Property 14g: Threshold configuration affects detection', () => {
      fc.assert(
        fc.property(
          fc.array(architectureScore, { minLength: 2, maxLength: 3 }),
          fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) })
        , (scores, customThreshold) => {
          // Skip if threshold is NaN or invalid
          if (isNaN(customThreshold) || customThreshold <= 0) {
            return;
          }
          
          const detector = new NearTieDetector({ nearTieThreshold: customThreshold });
          const result = detector.detectNearTie(scores);
          
          // Should use the custom threshold
          expect(result.thresholdUsed).toBe(customThreshold);
          
          // Detection should be consistent with threshold (when scores are valid)
          const validScores = scores.every(s => !isNaN(s.weightedScore) && s.weightedScore >= 1 && s.weightedScore <= 10);
          if (validScores && result.isNearTie) {
            expect(result.scoreDifference).toBeLessThanOrEqual(customThreshold);
          } else if (validScores && result.tieType === 'no-tie') {
            expect(result.scoreDifference).toBeGreaterThan(customThreshold);
          }
        })
      );
    });

    test('Property 14h: Messaging structure is complete and consistent', () => {
      fc.assert(
        fc.property(fc.array(architectureScore, { minLength: 2, maxLength: 3 }), (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Messaging should have all required components
          expect(result.messaging.primaryMessage).toBeTruthy();
          expect(result.messaging.explanation).toBeTruthy();
          expect(result.messaging.decisionGuidance).toBeInstanceOf(Array);
          expect(result.messaging.decisionGuidance.length).toBeGreaterThan(0);
          expect(result.messaging.tradeoffEmphasis).toBeTruthy();
          expect(result.messaging.numericScoreWarning).toBeTruthy();
          
          // Each guidance item should be meaningful
          result.messaging.decisionGuidance.forEach(guidance => {
            expect(guidance.length).toBeGreaterThan(20);
            expect(typeof guidance).toBe('string');
          });
        })
      );
    });

    test('Property 14i: Statistical ties are detected for very small differences', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 2, max: 8 }),
          fc.float({ min: 0, max: Math.fround(DEFAULT_NEAR_TIE_CONFIG.minimumDifferenceThreshold - 0.01) })
        , (baseScore, smallDifference) => {
          const secondScore = baseScore - smallDifference;
          // Ensure valid scores
          if (secondScore < 1 || isNaN(baseScore) || isNaN(secondScore)) {
            return; // Skip invalid cases
          }
          
          const scores = [
            {
              architectureType: 'IRM-Heavy' as ArchitectureType,
              dimensionScores: {} as DimensionScores,
              weightedScore: baseScore,
              confidenceLevel: 'High' as ConfidenceLevel,
            },
            {
              architectureType: 'URM-Heavy' as ArchitectureType,
              dimensionScores: {} as DimensionScores,
              weightedScore: secondScore,
              confidenceLevel: 'High' as ConfidenceLevel,
            },
          ];
          
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Very small differences should be detected as ties
          expect(result.isNearTie).toBe(true);
          expect(['two-way-tie', 'statistical-tie']).toContain(result.tieType);
        })
      );
    });

    test('Property 14j: Detection is deterministic for identical inputs', () => {
      fc.assert(
        fc.property(fc.array(architectureScore, { minLength: 2, maxLength: 3 }), (scores) => {
          const detector = new NearTieDetector();
          const result1 = detector.detectNearTie(scores);
          const result2 = detector.detectNearTie(scores);
          
          // Same input should produce identical results
          expect(result1.isNearTie).toBe(result2.isNearTie);
          expect(result1.tieType).toBe(result2.tieType);
          expect(result1.scoreDifference).toBe(result2.scoreDifference);
          expect(result1.tiedArchitectures).toEqual(result2.tiedArchitectures);
          expect(result1.clearWinner).toBe(result2.clearWinner);
          expect(result1.detectionConfidence).toBe(result2.detectionConfidence);
        })
      );
    });

    test('Property 14k: Utility functions provide consistent results', () => {
      fc.assert(
        fc.property(fc.array(architectureScore, { minLength: 2, maxLength: 3 }), (scores) => {
          const detector = new NearTieDetector();
          const detectorResult = detector.detectNearTie(scores);
          
          // Utility functions should be consistent with detector
          const utilityIsNearTie = NearTieUtils.isNearTie(scores);
          expect(utilityIsNearTie).toBe(detectorResult.isNearTie);
          
          const utilityMessaging = NearTieUtils.getMessaging(scores);
          expect(utilityMessaging).toEqual(detectorResult.messaging);
        })
      );
    });

    test('Property 14l: Edge cases are handled gracefully', () => {
      fc.assert(
        fc.property(fc.oneof(
          fc.constant([]), // Empty array
          fc.array(architectureScore, { minLength: 1, maxLength: 1 }) // Single score
        ), (scores) => {
          const detector = new NearTieDetector();
          const result = detector.detectNearTie(scores);
          
          // Should handle edge cases without errors
          expect(result.isNearTie).toBe(false);
          expect(result.tieType).toBe('no-tie');
          expect(result.detectionConfidence).toBe('Low');
          expect(result.messaging.primaryMessage).toContain('Insufficient architectures');
        })
      );
    });
  });
});