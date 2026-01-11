/**
 * Unit tests for Dimension Explanation System
 * 
 * Tests the comprehensive dimension explanation functionality including
 * "why it matters" explanations, trade-off identification, and over-optimization risks.
 */

import {
  DimensionExplanationSystem,
  dimensionExplanationSystem,
  explainDimension,
  explainAllDimensions,
  getDimensionSummary,
  getComparativeDimensionAnalysis,
} from './dimension-explanation-system';
import { DimensionScores, ArchitectureType } from './types';

describe('DimensionExplanationSystem', () => {
  let system: DimensionExplanationSystem;

  beforeEach(() => {
    system = new DimensionExplanationSystem();
  });

  describe('getDimensionExplanation', () => {
    it('should provide complete explanation for identity verification dimension', () => {
      const explanation = system.getDimensionExplanation('identityVerification');

      expect(explanation.dimension).toBe('identityVerification');
      expect(explanation.displayName).toBe('Identity Verification Strength');
      expect(explanation.whyItMatters).toContain('authentication and authorization');
      expect(explanation.tradeoffs).toContain('security but reduces user experience');
      expect(explanation.overOptimizationRisks).toContain('shadow IT');
      expect(explanation.impactAnalysis).toBeDefined();
      expect(explanation.architectureConsiderations).toBeDefined();
    });

    it('should provide complete explanation for behavioral analytics dimension', () => {
      const explanation = system.getDimensionExplanation('behavioralAnalytics');

      expect(explanation.dimension).toBe('behavioralAnalytics');
      expect(explanation.displayName).toBe('Behavioral Analytics Sophistication');
      expect(explanation.whyItMatters).toContain('anomalous behavior');
      expect(explanation.tradeoffs).toContain('threat detection');
      expect(explanation.overOptimizationRisks).toContain('false positives');
    });

    it('should include architecture considerations for all architecture types', () => {
      const explanation = system.getDimensionExplanation('operationalComplexity');
      const architectures: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];

      architectures.forEach(arch => {
        expect(explanation.architectureConsiderations[arch]).toBeDefined();
        expect(explanation.architectureConsiderations[arch].score).toBeGreaterThanOrEqual(1);
        expect(explanation.architectureConsiderations[arch].score).toBeLessThanOrEqual(10);
        expect(explanation.architectureConsiderations[arch].strengths).toBeInstanceOf(Array);
        expect(explanation.architectureConsiderations[arch].weaknesses).toBeInstanceOf(Array);
        expect(explanation.architectureConsiderations[arch].considerations).toBeInstanceOf(Array);
      });
    });

    it('should include comprehensive impact analysis', () => {
      const explanation = system.getDimensionExplanation('userExperience');

      expect(explanation.impactAnalysis.businessImpact).toBeTruthy();
      expect(explanation.impactAnalysis.technicalImpact).toBeTruthy();
      expect(explanation.impactAnalysis.operationalImpact).toBeTruthy();
      expect(explanation.impactAnalysis.businessImpact).toContain('user');
      expect(explanation.impactAnalysis.technicalImpact.length).toBeGreaterThan(10);
      expect(explanation.impactAnalysis.operationalImpact.length).toBeGreaterThan(10);
    });
  });

  describe('getAllDimensionExplanations', () => {
    it('should return explanations for all seven dimensions', () => {
      const explanations = system.getAllDimensionExplanations();

      expect(explanations).toHaveLength(7);
      
      const expectedDimensions: (keyof DimensionScores)[] = [
        'identityVerification',
        'behavioralAnalytics',
        'operationalComplexity',
        'userExperience',
        'complianceAuditability',
        'scalabilityPerformance',
        'costEfficiency',
      ];

      expectedDimensions.forEach(dimension => {
        expect(explanations.find(exp => exp.dimension === dimension)).toBeDefined();
      });
    });

    it('should provide consistent explanation structure for all dimensions', () => {
      const explanations = system.getAllDimensionExplanations();

      explanations.forEach(explanation => {
        expect(explanation.dimension).toBeTruthy();
        expect(explanation.displayName).toBeTruthy();
        expect(explanation.whyItMatters).toBeTruthy();
        expect(explanation.tradeoffs).toBeTruthy();
        expect(explanation.overOptimizationRisks).toBeTruthy();
        expect(explanation.impactAnalysis).toBeDefined();
        expect(explanation.architectureConsiderations).toBeDefined();
      });
    });
  });

  describe('getDimensionSummary', () => {
    it('should provide concise summary for compliance auditability', () => {
      const summary = system.getDimensionSummary('complianceAuditability');

      expect(summary.name).toBe('Compliance Auditability');
      expect(summary.whyItMatters).toContain('regulatory');
      expect(summary.keyTradeoff).toBeTruthy();
      expect(summary.overOptimizationRisk).toBeTruthy();
    });

    it('should extract key concepts from detailed explanations', () => {
      const summary = system.getDimensionSummary('scalabilityPerformance');

      expect(summary.keyTradeoff).not.toContain('but');
      expect(summary.overOptimizationRisk).not.toContain(';');
      expect(summary.keyTradeoff.length).toBeLessThan(100);
      expect(summary.overOptimizationRisk.length).toBeLessThan(100);
    });
  });

  describe('getComparativeDimensionAnalysis', () => {
    it('should provide comparative analysis for cost efficiency', () => {
      const analysis = system.getComparativeDimensionAnalysis('costEfficiency');

      expect(analysis.dimension).toBe('costEfficiency');
      expect(analysis.explanation).toBeDefined();
      expect(analysis.architectureRanking).toHaveLength(3);
      expect(analysis.tradeoffImplications).toBeInstanceOf(Array);
      expect(analysis.tradeoffImplications.length).toBeGreaterThan(0);
    });

    it('should rank architectures by score in descending order', () => {
      const analysis = system.getComparativeDimensionAnalysis('identityVerification');

      for (let i = 0; i < analysis.architectureRanking.length - 1; i++) {
        const current = analysis.architectureRanking[i];
        const next = analysis.architectureRanking[i + 1];
        expect(current?.score).toBeGreaterThanOrEqual(next?.score || 0);
      }
    });

    it('should include meaningful trade-off implications', () => {
      const analysis = system.getComparativeDimensionAnalysis('behavioralAnalytics');

      expect(analysis.tradeoffImplications.length).toBeGreaterThan(2);
      analysis.tradeoffImplications.forEach(implication => {
        expect(implication).toBeTruthy();
        expect(implication.length).toBeGreaterThan(10);
      });
    });
  });

  describe('convenience functions', () => {
    it('should provide same results as class methods', () => {
      const dimension: keyof DimensionScores = 'operationalComplexity';
      
      const classResult = system.getDimensionExplanation(dimension);
      const functionResult = explainDimension(dimension);

      expect(functionResult).toEqual(classResult);
    });

    it('should return all dimension explanations through convenience function', () => {
      const classResult = system.getAllDimensionExplanations();
      const functionResult = explainAllDimensions();

      expect(functionResult).toEqual(classResult);
    });

    it('should provide dimension summary through convenience function', () => {
      const dimension: keyof DimensionScores = 'userExperience';
      
      const classResult = system.getDimensionSummary(dimension);
      const functionResult = getDimensionSummary(dimension);

      expect(functionResult).toEqual(classResult);
    });

    it('should provide comparative analysis through convenience function', () => {
      const dimension: keyof DimensionScores = 'complianceAuditability';
      
      const classResult = system.getComparativeDimensionAnalysis(dimension);
      const functionResult = getComparativeDimensionAnalysis(dimension);

      expect(functionResult).toEqual(classResult);
    });
  });

  describe('global instance', () => {
    it('should provide access to dimension explanation system', () => {
      expect(dimensionExplanationSystem).toBeInstanceOf(DimensionExplanationSystem);
      
      const explanation = dimensionExplanationSystem.getDimensionExplanation('scalabilityPerformance');
      expect(explanation.dimension).toBe('scalabilityPerformance');
    });
  });

  describe('edge cases and validation', () => {
    it('should handle all valid dimension keys', () => {
      const validDimensions: (keyof DimensionScores)[] = [
        'identityVerification',
        'behavioralAnalytics',
        'operationalComplexity',
        'userExperience',
        'complianceAuditability',
        'scalabilityPerformance',
        'costEfficiency',
      ];

      validDimensions.forEach(dimension => {
        expect(() => system.getDimensionExplanation(dimension)).not.toThrow();
        expect(() => system.getDimensionSummary(dimension)).not.toThrow();
        expect(() => system.getComparativeDimensionAnalysis(dimension)).not.toThrow();
      });
    });

    it('should provide consistent architecture scores across explanations', () => {
      const explanations = system.getAllDimensionExplanations();
      
      explanations.forEach(explanation => {
        const architectures: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
        
        architectures.forEach(arch => {
          const score = explanation.architectureConsiderations[arch].score;
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(10);
          expect(Number.isInteger(score)).toBe(true);
        });
      });
    });

    it('should provide non-empty content for all required fields', () => {
      const explanations = system.getAllDimensionExplanations();
      
      explanations.forEach(explanation => {
        expect(explanation.whyItMatters.length).toBeGreaterThan(10);
        expect(explanation.tradeoffs.length).toBeGreaterThan(10);
        expect(explanation.overOptimizationRisks.length).toBeGreaterThan(10);
        
        Object.values(explanation.architectureConsiderations).forEach(archConsideration => {
          expect(archConsideration.strengths.length).toBeGreaterThan(0);
          expect(archConsideration.weaknesses.length).toBeGreaterThan(0);
          expect(archConsideration.considerations.length).toBeGreaterThan(0);
        });
      });
    });
  });
});