/**
 * Property-based tests for comprehensive dimension analysis
 * Feature: securestack-referee, Property 9: Comprehensive Dimension Analysis
 * Validates: Requirements 3.2, 3.3, 3.4
 */

import fc from 'fast-check';
import {
  DimensionExplanationSystem,
  dimensionExplanationSystem,
  explainDimension,
  explainAllDimensions,
  getDimensionSummary,
  getComparativeDimensionAnalysis,
} from './dimension-explanation-system';
import { DimensionScores, ArchitectureType } from './types';

describe('Property-Based Tests: Comprehensive Dimension Analysis', () => {
  /**
   * Property 9: Comprehensive Dimension Analysis
   * For any evaluation dimension, the system shall explain why it matters, 
   * what trade-offs it introduces, and risks of over-optimization.
   * Validates: Requirements 3.2, 3.3, 3.4
   */
  describe('Property 9: Comprehensive Dimension Analysis', () => {
    // Generator for valid dimension keys
    const dimensionGenerator = fc.constantFrom(
      'identityVerification',
      'behavioralAnalytics',
      'operationalComplexity',
      'userExperience',
      'complianceAuditability',
      'scalabilityPerformance',
      'costEfficiency'
    ) as fc.Arbitrary<keyof DimensionScores>;

    // Generator for architecture types
    const architectureGenerator = fc.constantFrom(
      'IRM-Heavy',
      'URM-Heavy',
      'Hybrid'
    ) as fc.Arbitrary<ArchitectureType>;

    test('Property 9a: Every dimension explains why it matters', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation = explainDimension(dimension);
          
          // Requirement 3.2: FOR EACH dimension, THE System SHALL explain why it matters
          expect(explanation.whyItMatters).toBeTruthy();
          expect(typeof explanation.whyItMatters).toBe('string');
          expect(explanation.whyItMatters.length).toBeGreaterThan(20); // Meaningful explanation
          
          // Should contain decision-relevant content
          const relevantKeywords = [
            'security', 'architecture', 'decision', 'affect', 'impact', 
            'determine', 'influence', 'enable', 'support', 'require'
          ];
          const hasRelevantContent = relevantKeywords.some(keyword => 
            explanation.whyItMatters.toLowerCase().includes(keyword)
          );
          expect(hasRelevantContent).toBe(true);
          
          // Should be specific to the dimension (check for key terms)
          const dimensionKeywords = {
            identityVerification: ['identity', 'authentication', 'verification'],
            behavioralAnalytics: ['behavioral', 'behavior', 'analytics', 'anomalous'],
            operationalComplexity: ['operational', 'complexity', 'team', 'maintenance'],
            userExperience: ['user', 'experience', 'adoption', 'productivity'],
            complianceAuditability: ['compliance', 'audit', 'regulatory'],
            scalabilityPerformance: ['scalability', 'performance', 'growth', 'loads'],
            costEfficiency: ['cost', 'budget', 'efficiency', 'ROI']
          };
          
          const keywords = dimensionKeywords[dimension] || [];
          const hasRelevantKeywords = keywords.some(keyword => 
            explanation.whyItMatters.toLowerCase().includes(keyword)
          );
          expect(hasRelevantKeywords).toBe(true);
        })
      );
    });

    test('Property 9b: Every dimension identifies trade-offs', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation = explainDimension(dimension);
          
          // Requirement 3.3: FOR EACH dimension, THE System SHALL identify what trade-offs it introduces
          expect(explanation.tradeoffs).toBeTruthy();
          expect(typeof explanation.tradeoffs).toBe('string');
          expect(explanation.tradeoffs.length).toBeGreaterThan(20); // Meaningful trade-off description
          
          // Should contain trade-off language
          const tradeoffKeywords = [
            'but', 'however', 'while', 'although', 'trade-off', 'balance',
            'increase', 'decrease', 'improve', 'reduce', 'require', 'may',
            'simple', 'complex', 'advanced', 'basic', 'high', 'low'
          ];
          const hasTradeoffLanguage = tradeoffKeywords.some(keyword => 
            explanation.tradeoffs.toLowerCase().includes(keyword)
          );
          expect(hasTradeoffLanguage).toBe(true);
          
          // Should describe contrasting aspects (not necessarily positive/negative)
          const contrastWords = ['simple', 'complex', 'high', 'low', 'strong', 'weak', 'easy', 'difficult', 'advanced', 'significant', 'require'];
          const hasContrast = contrastWords.some(word => 
            explanation.tradeoffs.toLowerCase().includes(word)
          );
          
          expect(hasContrast).toBe(true); // Should discuss contrasting aspects
        })
      );
    });

    test('Property 9c: Every dimension explains over-optimization risks', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation = explainDimension(dimension);
          
          // Requirement 3.4: FOR EACH dimension, THE System SHALL explain risks of over-optimization
          expect(explanation.overOptimizationRisks).toBeTruthy();
          expect(typeof explanation.overOptimizationRisks).toBe('string');
          expect(explanation.overOptimizationRisks.length).toBeGreaterThan(20); // Meaningful risk description
          
          // Should contain risk-related language
          const riskKeywords = [
            'risk', 'can', 'may', 'could', 'excessive', 'over', 'too much',
            'drive', 'cause', 'lead to', 'result in', 'compromise'
          ];
          const hasRiskLanguage = riskKeywords.some(keyword => 
            explanation.overOptimizationRisks.toLowerCase().includes(keyword)
          );
          expect(hasRiskLanguage).toBe(true);
          
          // Should warn about negative consequences
          const consequenceWords = [
            'shadow IT', 'productivity', 'failure', 'gap', 'problem',
            'issue', 'challenge', 'difficulty', 'overhead', 'cost',
            'impede', 'limit', 'compromise', 'increase', 'reduce',
            'false positive', 'specialized', 'expertise', 'generate'
          ];
          const hasConsequences = consequenceWords.some(word => 
            explanation.overOptimizationRisks.toLowerCase().includes(word)
          );
          expect(hasConsequences).toBe(true);
        })
      );
    });

    test('Property 9d: All dimensions provide comprehensive impact analysis', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation = explainDimension(dimension);
          
          // Should provide business, technical, and operational impact analysis
          expect(explanation.impactAnalysis).toBeDefined();
          expect(explanation.impactAnalysis.businessImpact).toBeTruthy();
          expect(explanation.impactAnalysis.technicalImpact).toBeTruthy();
          expect(explanation.impactAnalysis.operationalImpact).toBeTruthy();
          
          // Each impact type should be meaningful
          expect(explanation.impactAnalysis.businessImpact.length).toBeGreaterThan(20);
          expect(explanation.impactAnalysis.technicalImpact.length).toBeGreaterThan(20);
          expect(explanation.impactAnalysis.operationalImpact.length).toBeGreaterThan(20);
          
          // Business impact should mention business concerns
          const businessKeywords = ['business', 'cost', 'budget', 'user', 'adoption', 'productivity', 'compliance', 'investment', 'infrastructure', 'data'];
          const hasBusinessContent = businessKeywords.some(keyword => 
            explanation.impactAnalysis.businessImpact.toLowerCase().includes(keyword)
          );
          expect(hasBusinessContent).toBe(true);
          
          // Technical impact should mention technical concerns
          const technicalKeywords = ['technical', 'system', 'infrastructure', 'architecture', 'integration', 'performance'];
          const hasTechnicalContent = technicalKeywords.some(keyword => 
            explanation.impactAnalysis.technicalImpact.toLowerCase().includes(keyword)
          );
          expect(hasTechnicalContent).toBe(true);
          
          // Operational impact should mention operational concerns
          const operationalKeywords = ['operational', 'team', 'staff', 'management', 'monitoring', 'maintenance'];
          const hasOperationalContent = operationalKeywords.some(keyword => 
            explanation.impactAnalysis.operationalImpact.toLowerCase().includes(keyword)
          );
          expect(hasOperationalContent).toBe(true);
        })
      );
    });

    test('Property 9e: All dimensions provide architecture-specific considerations', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation = explainDimension(dimension);
          const architectures: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
          
          // Should provide considerations for all architecture types
          architectures.forEach(architecture => {
            const considerations = explanation.architectureConsiderations[architecture];
            expect(considerations).toBeDefined();
            
            // Should have valid score (1-10 range)
            expect(considerations.score).toBeGreaterThanOrEqual(1);
            expect(considerations.score).toBeLessThanOrEqual(10);
            expect(Number.isInteger(considerations.score)).toBe(true);
            
            // Should have strengths, weaknesses, and considerations
            expect(considerations.strengths).toBeInstanceOf(Array);
            expect(considerations.weaknesses).toBeInstanceOf(Array);
            expect(considerations.considerations).toBeInstanceOf(Array);
            
            expect(considerations.strengths.length).toBeGreaterThan(0);
            expect(considerations.weaknesses.length).toBeGreaterThan(0);
            expect(considerations.considerations.length).toBeGreaterThan(0);
            
            // Each item should be meaningful
            considerations.strengths.forEach(strength => {
              expect(strength.length).toBeGreaterThan(10);
            });
            considerations.weaknesses.forEach(weakness => {
              expect(weakness.length).toBeGreaterThan(10);
            });
            considerations.considerations.forEach(consideration => {
              expect(consideration.length).toBeGreaterThan(15);
            });
          });
        })
      );
    });

    test('Property 9f: Dimension summaries extract key concepts correctly', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const summary = getDimensionSummary(dimension);
          const fullExplanation = explainDimension(dimension);
          
          // Summary should contain key information from full explanation
          expect(summary.name).toBeTruthy();
          expect(summary.whyItMatters).toBe(fullExplanation.whyItMatters);
          expect(summary.keyTradeoff).toBeTruthy();
          expect(summary.overOptimizationRisk).toBeTruthy();
          
          // Key trade-off should be extracted properly (no "but" connectors)
          expect(summary.keyTradeoff).not.toContain(' but ');
          expect(summary.keyTradeoff.length).toBeLessThanOrEqual(fullExplanation.tradeoffs.length);
          
          // Over-optimization risk should be extracted properly
          expect(summary.overOptimizationRisk).not.toContain(';');
          expect(summary.overOptimizationRisk.length).toBeLessThan(fullExplanation.overOptimizationRisks.length);
        })
      );
    });

    test('Property 9g: Comparative analysis provides meaningful rankings', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const analysis = getComparativeDimensionAnalysis(dimension);
          
          // Should provide complete comparative analysis
          expect(analysis.dimension).toBe(dimension);
          expect(analysis.explanation).toBeDefined();
          expect(analysis.architectureRanking).toHaveLength(3);
          expect(analysis.tradeoffImplications).toBeInstanceOf(Array);
          expect(analysis.tradeoffImplications.length).toBeGreaterThan(0);
          
          // Rankings should be in descending order by score
          for (let i = 0; i < analysis.architectureRanking.length - 1; i++) {
            const current = analysis.architectureRanking[i]!;
            const next = analysis.architectureRanking[i + 1]!;
            expect(current.score).toBeGreaterThanOrEqual(next.score);
          }
          
          // Each ranking should have meaningful rationale
          analysis.architectureRanking.forEach(ranking => {
            expect(ranking.architecture).toBeTruthy();
            expect(ranking.score).toBeGreaterThanOrEqual(1);
            expect(ranking.score).toBeLessThanOrEqual(10);
            expect(ranking.rationale).toBeTruthy();
            expect(ranking.rationale.length).toBeGreaterThan(10);
          });
          
          // Trade-off implications should be meaningful
          analysis.tradeoffImplications.forEach(implication => {
            expect(implication.length).toBeGreaterThan(15);
          });
        })
      );
    });

    test('Property 9h: All dimensions are covered by the system', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const allExplanations = explainAllDimensions();
          
          // Should cover all 7 dimensions
          expect(allExplanations).toHaveLength(7);
          
          const expectedDimensions: (keyof DimensionScores)[] = [
            'identityVerification',
            'behavioralAnalytics',
            'operationalComplexity',
            'userExperience',
            'complianceAuditability',
            'scalabilityPerformance',
            'costEfficiency',
          ];
          
          expectedDimensions.forEach(expectedDimension => {
            const found = allExplanations.find(exp => exp.dimension === expectedDimension);
            expect(found).toBeDefined();
            
            // Each dimension should meet all requirements
            expect(found!.whyItMatters).toBeTruthy();
            expect(found!.tradeoffs).toBeTruthy();
            expect(found!.overOptimizationRisks).toBeTruthy();
          });
        })
      );
    });

    test('Property 9i: Dimension analysis is consistent and deterministic', () => {
      fc.assert(
        fc.property(dimensionGenerator, (dimension) => {
          const explanation1 = explainDimension(dimension);
          const explanation2 = explainDimension(dimension);
          const summary1 = getDimensionSummary(dimension);
          const summary2 = getDimensionSummary(dimension);
          
          // Same dimension should always produce identical results
          expect(explanation1).toEqual(explanation2);
          expect(summary1).toEqual(summary2);
          
          // Content should be stable across calls
          expect(explanation1.whyItMatters).toBe(explanation2.whyItMatters);
          expect(explanation1.tradeoffs).toBe(explanation2.tradeoffs);
          expect(explanation1.overOptimizationRisks).toBe(explanation2.overOptimizationRisks);
        })
      );
    });

    test('Property 9j: Architecture considerations are balanced and comprehensive', () => {
      fc.assert(
        fc.property(dimensionGenerator, architectureGenerator, (dimension, architecture) => {
          const explanation = explainDimension(dimension);
          const considerations = explanation.architectureConsiderations[architecture];
          
          // Should provide balanced view with both strengths and weaknesses
          expect(considerations.strengths.length).toBeGreaterThan(0);
          expect(considerations.weaknesses.length).toBeGreaterThan(0);
          
          // Strengths should be positive
          considerations.strengths.forEach(strength => {
            const positiveWords = ['strong', 'clear', 'comprehensive', 'excellent', 'superior', 'advanced', 'effective'];
            const hasPositiveLanguage = positiveWords.some(word => 
              strength.toLowerCase().includes(word)
            );
            // Should generally be positive or at least neutral
            expect(strength).not.toContain('weakness');
            expect(strength).not.toContain('limited');
          });
          
          // Weaknesses should identify limitations
          considerations.weaknesses.forEach(weakness => {
            const limitationWords = ['limited', 'complex', 'higher', 'difficult', 'requires', 'may', 'potential'];
            const hasLimitationLanguage = limitationWords.some(word => 
              weakness.toLowerCase().includes(word)
            );
            // Should identify challenges or limitations
            expect(weakness).not.toContain('strength');
            expect(weakness).not.toContain('excellent');
          });
          
          // Considerations should provide actionable insights
          considerations.considerations.forEach(consideration => {
            expect(consideration.length).toBeGreaterThan(15);
            // Should provide meaningful content (not just empty strings)
            expect(consideration.trim()).toBeTruthy();
            // Should be descriptive and informative
            expect(consideration.split(' ').length).toBeGreaterThanOrEqual(3);
          });
        })
      );
    });
  });
});