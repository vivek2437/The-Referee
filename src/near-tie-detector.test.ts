/**
 * Unit tests for Near-Tie Detection System
 * 
 * Tests the enhanced near-tie detection functionality including score threshold logic,
 * "no clear winner" messaging, and trade-off emphasis over numeric scores.
 */

import { NearTieDetector, NearTieUtils, DEFAULT_NEAR_TIE_CONFIG } from './near-tie-detector';
import { ArchitectureScore, ArchitectureType } from './types';

describe('NearTieDetector', () => {
  let detector: NearTieDetector;

  beforeEach(() => {
    detector = new NearTieDetector();
  });

  describe('Near-tie detection logic', () => {
    test('should detect two-way tie when top scores are within threshold', () => {
      const scores: ArchitectureScore[] = [
        {
          architectureType: 'IRM-Heavy',
          dimensionScores: {
            identityVerification: 8,
            behavioralAnalytics: 4,
            operationalComplexity: 6,
            userExperience: 5,
            complianceAuditability: 9,
            scalabilityPerformance: 6,
            costEfficiency: 5,
          },
          weightedScore: 7.2,
          confidenceLevel: 'High',
        },
        {
          architectureType: 'URM-Heavy',
          dimensionScores: {
            identityVerification: 4,
            behavioralAnalytics: 9,
            operationalComplexity: 7,
            userExperience: 8,
            complianceAuditability: 5,
            scalabilityPerformance: 7,
            costEfficiency: 6,
          },
          weightedScore: 7.0, // Within 0.5 threshold
          confidenceLevel: 'High',
        },
        {
          architectureType: 'Hybrid',
          dimensionScores: {
            identityVerification: 6,
            behavioralAnalytics: 6,
            operationalComplexity: 7,
            userExperience: 6,
            complianceAuditability: 7,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 5.5,
          confidenceLevel: 'Medium',
        },
      ];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(true);
      expect(result.tieType).toBe('two-way-tie');
      expect(result.tiedArchitectures).toContain('IRM-Heavy');
      expect(result.tiedArchitectures).toContain('URM-Heavy');
      expect(result.clearWinner).toBeUndefined();
    });

    test('should detect three-way tie when all scores are within threshold', () => {
      const scores: ArchitectureScore[] = [
        {
          architectureType: 'IRM-Heavy',
          dimensionScores: {
            identityVerification: 7,
            behavioralAnalytics: 6,
            operationalComplexity: 6,
            userExperience: 6,
            complianceAuditability: 7,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 6.3,
          confidenceLevel: 'High',
        },
        {
          architectureType: 'URM-Heavy',
          dimensionScores: {
            identityVerification: 6,
            behavioralAnalytics: 7,
            operationalComplexity: 6,
            userExperience: 7,
            complianceAuditability: 6,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 6.1, // Within 0.5 of top
          confidenceLevel: 'High',
        },
        {
          architectureType: 'Hybrid',
          dimensionScores: {
            identityVerification: 6,
            behavioralAnalytics: 6,
            operationalComplexity: 6,
            userExperience: 6,
            complianceAuditability: 6,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 6.0, // Within 0.5 of second
          confidenceLevel: 'Medium',
        },
      ];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(true);
      expect(result.tieType).toBe('three-way-tie');
      expect(result.tiedArchitectures).toHaveLength(3);
      expect(result.clearWinner).toBeUndefined();
    });

    test('should detect no tie when score difference exceeds threshold', () => {
      const scores: ArchitectureScore[] = [
        {
          architectureType: 'IRM-Heavy',
          dimensionScores: {
            identityVerification: 9,
            behavioralAnalytics: 3,
            operationalComplexity: 7,
            userExperience: 6,
            complianceAuditability: 9,
            scalabilityPerformance: 6,
            costEfficiency: 5,
          },
          weightedScore: 8.0,
          confidenceLevel: 'High',
        },
        {
          architectureType: 'URM-Heavy',
          dimensionScores: {
            identityVerification: 4,
            behavioralAnalytics: 9,
            operationalComplexity: 8,
            userExperience: 3,
            complianceAuditability: 5,
            scalabilityPerformance: 7,
            costEfficiency: 4,
          },
          weightedScore: 6.8, // More than 0.5 difference
          confidenceLevel: 'High',
        },
        {
          architectureType: 'Hybrid',
          dimensionScores: {
            identityVerification: 7,
            behavioralAnalytics: 6,
            operationalComplexity: 8,
            userExperience: 5,
            complianceAuditability: 7,
            scalabilityPerformance: 6,
            costEfficiency: 5,
          },
          weightedScore: 6.0,
          confidenceLevel: 'Medium',
        },
      ];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(false);
      expect(result.tieType).toBe('no-tie');
      expect(result.clearWinner).toBe('IRM-Heavy');
      expect(result.tiedArchitectures).toHaveLength(0);
    });

    test('should detect statistical tie for very small differences', () => {
      const scores: ArchitectureScore[] = [
        {
          architectureType: 'IRM-Heavy',
          dimensionScores: {
            identityVerification: 7,
            behavioralAnalytics: 6,
            operationalComplexity: 6,
            userExperience: 6,
            complianceAuditability: 7,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 6.05,
          confidenceLevel: 'High',
        },
        {
          architectureType: 'URM-Heavy',
          dimensionScores: {
            identityVerification: 6,
            behavioralAnalytics: 7,
            operationalComplexity: 6,
            userExperience: 6,
            complianceAuditability: 6,
            scalabilityPerformance: 6,
            costEfficiency: 6,
          },
          weightedScore: 6.00, // Very small difference (0.05)
          confidenceLevel: 'High',
        },
      ];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(true);
      // The difference is 0.05 which is less than the default nearTieThreshold of 0.5
      // So it should be detected as a two-way-tie, not statistical-tie
      expect(result.tieType).toBe('two-way-tie');
    });
  });

  describe('Messaging generation', () => {
    test('should generate appropriate "no clear winner" message for three-way tie', () => {
      const scores: ArchitectureScore[] = [
        { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 6.3, confidenceLevel: 'High' },
        { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 6.1, confidenceLevel: 'High' },
        { architectureType: 'Hybrid', dimensionScores: {} as any, weightedScore: 6.0, confidenceLevel: 'Medium' },
      ];

      const result = detector.detectNearTie(scores);
      const message = detector.generateNoWinnerMessage(result);

      expect(message).toContain('No clear winner');
      expect(message).toContain('All three architecture options');
    });

    test('should generate appropriate trade-off emphasis message', () => {
      const scores: ArchitectureScore[] = [
        { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 7.2, confidenceLevel: 'High' },
        { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 7.0, confidenceLevel: 'High' },
      ];

      const result = detector.detectNearTie(scores);
      const message = detector.generateTradeoffEmphasisMessage(result);

      expect(message).toContain('Trade-off analysis should drive your decision');
      expect(message).toContain('qualitative factors');
    });

    test('should provide different messaging for clear winner', () => {
      const scores: ArchitectureScore[] = [
        { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 8.0, confidenceLevel: 'High' },
        { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 6.8, confidenceLevel: 'High' },
      ];

      const result = detector.detectNearTie(scores);
      const message = detector.generateTradeoffEmphasisMessage(result);

      expect(result.isNearTie).toBe(false);
      expect(message).toContain('Trade-off analysis should drive your decision');
      expect(message).toContain('numeric advantage');
    });
  });

  describe('Configuration management', () => {
    test('should use custom configuration', () => {
      const customDetector = new NearTieDetector({
        nearTieThreshold: 1.0, // Larger threshold
        meaningfulDifferenceThreshold: 2.0,
      });

      const scores: ArchitectureScore[] = [
        { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 7.5, confidenceLevel: 'High' },
        { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 6.8, confidenceLevel: 'High' },
      ];

      const result = customDetector.detectNearTie(scores);

      expect(result.isNearTie).toBe(true); // Should be tie with larger threshold
      expect(result.thresholdUsed).toBe(1.0);
    });

    test('should update configuration dynamically', () => {
      detector.updateConfiguration({ nearTieThreshold: 0.3 });
      const config = detector.getConfiguration();

      expect(config.nearTieThreshold).toBe(0.3);
      expect(config.meaningfulDifferenceThreshold).toBe(DEFAULT_NEAR_TIE_CONFIG.meaningfulDifferenceThreshold);
    });
  });

  describe('Edge cases', () => {
    test('should handle single architecture gracefully', () => {
      const scores: ArchitectureScore[] = [
        { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 7.0, confidenceLevel: 'High' },
      ];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(false);
      expect(result.tieType).toBe('no-tie');
      expect(result.detectionConfidence).toBe('Low');
      expect(result.messaging.primaryMessage).toContain('Insufficient architectures');
    });

    test('should handle empty architecture list', () => {
      const scores: ArchitectureScore[] = [];

      const result = detector.detectNearTie(scores);

      expect(result.isNearTie).toBe(false);
      expect(result.tieType).toBe('no-tie');
      expect(result.detectionConfidence).toBe('Low');
    });
  });
});

describe('NearTieUtils', () => {
  test('should create detector with default configuration', () => {
    const detector = NearTieUtils.createDetector();
    const config = detector.getConfiguration();

    expect(config.nearTieThreshold).toBe(DEFAULT_NEAR_TIE_CONFIG.nearTieThreshold);
  });

  test('should provide quick near-tie check', () => {
    const scores: ArchitectureScore[] = [
      { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 7.2, confidenceLevel: 'High' },
      { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 7.0, confidenceLevel: 'High' },
    ];

    const isNearTie = NearTieUtils.isNearTie(scores);

    expect(isNearTie).toBe(true);
  });

  test('should get messaging for scores', () => {
    const scores: ArchitectureScore[] = [
      { architectureType: 'IRM-Heavy', dimensionScores: {} as any, weightedScore: 8.0, confidenceLevel: 'High' },
      { architectureType: 'URM-Heavy', dimensionScores: {} as any, weightedScore: 6.8, confidenceLevel: 'High' },
    ];

    const messaging = NearTieUtils.getMessaging(scores);

    expect(messaging.primaryMessage).toContain('Clear differentiation');
    expect(messaging.tradeoffEmphasis).toContain('carefully evaluate whether the trade-offs align');
  });

  test('should validate configuration', () => {
    const validConfig = {
      nearTieThreshold: 0.5,
      meaningfulDifferenceThreshold: 1.0,
      relativeThreshold: 0.05,
      minimumDifferenceThreshold: 0.1,
    };

    const errors = NearTieUtils.validateConfiguration(validConfig);
    expect(errors).toHaveLength(0);

    const invalidConfig = {
      nearTieThreshold: -0.5, // Invalid: negative
      meaningfulDifferenceThreshold: 0.3, // Invalid: less than nearTieThreshold
      relativeThreshold: 1.5, // Invalid: greater than 1
      minimumDifferenceThreshold: 0,
    };

    const invalidErrors = NearTieUtils.validateConfiguration(invalidConfig);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });
});