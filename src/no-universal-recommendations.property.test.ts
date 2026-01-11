/**
 * Property-based tests for no universal recommendations
 * Feature: securestack-referee, Property 3: No Universal Recommendations
 * Validates: Requirements 1.4, 4.4
 */

import fc from 'fast-check';
import { ContentValidator, validateContent } from './content-validator';
import { DecisionSupportMessaging } from './decision-support-messaging';
import { 
  AnalysisResult, 
  ArchitectureScore, 
  ConstraintProfile, 
  TradeoffAnalysis, 
  AssumptionDisclosure,
  ConflictWarning,
  ArchitectureType,
  ConfidenceLevel,
  DimensionScores
} from './types';

describe('Property-Based Tests: No Universal Recommendations', () => {
  /**
   * Property 3: No Universal Recommendations
   * For any system output, the analysis shall never declare a single architecture option 
   * as universally superior or use recommendation language such as "best," "optimal," or "should choose."
   * Validates: Requirements 1.4, 4.4
   */
  describe('Property 3: No Universal Recommendations', () => {
    
    // Generator for valid constraint values (1-10 integers)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for architecture types
    const architectureType = fc.constantFrom('IRM-Heavy', 'URM-Heavy', 'Hybrid') as fc.Arbitrary<ArchitectureType>;
    
    // Generator for confidence levels
    const confidenceLevel = fc.constantFrom('High', 'Medium', 'Low') as fc.Arbitrary<ConfidenceLevel>;
    
    // Generator for dimension scores
    const dimensionScores = fc.record({
      identityVerification: validConstraintValue,
      behavioralAnalytics: validConstraintValue,
      operationalComplexity: validConstraintValue,
      userExperience: validConstraintValue,
      complianceAuditability: validConstraintValue,
      scalabilityPerformance: validConstraintValue,
      costEfficiency: validConstraintValue,
    }) as fc.Arbitrary<DimensionScores>;
    
    // Generator for constraint profiles
    const constraintProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 5 }),
    }) as fc.Arbitrary<ConstraintProfile>;
    
    // Generator for architecture scores
    const architectureScore = fc.record({
      architectureType,
      dimensionScores,
      weightedScore: fc.float({ min: Math.fround(1.0), max: Math.fround(10.0) }),
      confidenceLevel,
    }) as fc.Arbitrary<ArchitectureScore>;
    
    // Generator for assumption disclosures
    const assumptionDisclosure = fc.record({
      category: fc.constantFrom('input', 'calculation', 'interpretation'),
      description: fc.string({ minLength: 10, maxLength: 200 }),
      impact: fc.constantFrom('low', 'medium', 'high'),
      recommendation: fc.string({ minLength: 10, maxLength: 100 }),
    }) as fc.Arbitrary<AssumptionDisclosure>;
    
    // Generator for conflict warnings
    const conflictWarning = fc.record({
      conflictId: fc.string({ minLength: 5, maxLength: 20 }),
      title: fc.string({ minLength: 10, maxLength: 50 }),
      description: fc.string({ minLength: 20, maxLength: 200 }),
      implications: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { maxLength: 3 }),
      resolutionSuggestions: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { maxLength: 3 }),
      triggeringConstraints: fc.record({
        riskTolerance: fc.option(validConstraintValue),
        complianceStrictness: fc.option(validConstraintValue),
        costSensitivity: fc.option(validConstraintValue),
      }),
    }) as fc.Arbitrary<ConflictWarning>;
    
    // Generator for tradeoff analysis
    const tradeoffAnalysis = fc.record({
      keyDecisionFactors: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 5 }),
      primaryTradeoffs: fc.array(fc.record({
        dimension: fc.constantFrom(
          'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
          'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
        ),
        description: fc.string({ minLength: 20, maxLength: 100 }),
        architectureImpacts: fc.record({
          'IRM-Heavy': fc.string({ minLength: 10, maxLength: 50 }),
          'URM-Heavy': fc.string({ minLength: 10, maxLength: 50 }),
          'Hybrid': fc.string({ minLength: 10, maxLength: 50 }),
        }),
      }), { maxLength: 3 }),
      isNearTie: fc.boolean(),
      nearTieThreshold: fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) }),
    }) as fc.Arbitrary<TradeoffAnalysis>;
    
    // Generator for complete analysis results with proper architecture distribution
    const analysisResult = fc.record({
      constraintProfile,
      architectureScores: fc.constant([
        {
          architectureType: 'IRM-Heavy' as ArchitectureType,
          dimensionScores: {
            identityVerification: 9,
            behavioralAnalytics: 3,
            operationalComplexity: 7,
            userExperience: 6,
            complianceAuditability: 9,
            scalabilityPerformance: 6,
            costEfficiency: 5,
          },
          weightedScore: Math.fround(6.5),
          confidenceLevel: 'High' as ConfidenceLevel,
        },
        {
          architectureType: 'URM-Heavy' as ArchitectureType,
          dimensionScores: {
            identityVerification: 4,
            behavioralAnalytics: 9,
            operationalComplexity: 8,
            userExperience: 3,
            complianceAuditability: 5,
            scalabilityPerformance: 7,
            costEfficiency: 4,
          },
          weightedScore: Math.fround(6.2),
          confidenceLevel: 'Medium' as ConfidenceLevel,
        },
        {
          architectureType: 'Hybrid' as ArchitectureType,
          dimensionScores: {
            identityVerification: 7,
            behavioralAnalytics: 6,
            operationalComplexity: 8,
            userExperience: 5,
            complianceAuditability: 7,
            scalabilityPerformance: 6,
            costEfficiency: 5,
          },
          weightedScore: Math.fround(6.3),
          confidenceLevel: 'High' as ConfidenceLevel,
        },
      ]),
      detectedConflicts: fc.array(conflictWarning, { maxLength: 3 }),
      tradeoffSummary: fc.record({
        keyDecisionFactors: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 5 }),
        primaryTradeoffs: fc.array(fc.record({
          dimension: fc.constantFrom(
            'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
            'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
          ),
          description: fc.string({ minLength: 20, maxLength: 100 }),
          architectureImpacts: fc.record({
            'IRM-Heavy': fc.string({ minLength: 10, maxLength: 50 }),
            'URM-Heavy': fc.string({ minLength: 10, maxLength: 50 }),
            'Hybrid': fc.string({ minLength: 10, maxLength: 50 }),
          }),
        }), { maxLength: 3 }),
        isNearTie: fc.boolean(),
        nearTieThreshold: fc.constant(Math.fround(0.5)),
      }),
      assumptions: fc.array(assumptionDisclosure, { maxLength: 6 }),
      interpretationGuidance: fc.array(fc.string({ minLength: 20, maxLength: 100 }), { maxLength: 5 }),
      analysisTimestamp: fc.constant(new Date()),
      engineVersion: fc.constant('1.0.0'),
    }) as fc.Arbitrary<AnalysisResult>;

    test('Property 3a: Content validator detects recommendation language', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 500 }), (content) => {
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          
          // Test content with known recommendation language
          const recommendationContent = content + ' We recommend the best option is IRM-Heavy architecture.';
          const result = validator.validateContent(recommendationContent);
          
          // Should detect recommendation language violations (Requirement 1.4)
          const recommendationViolations = result.violations.filter(v => 
            v.type === 'recommendation_language' || v.type === 'universal_superiority'
          );
          
          expect(recommendationViolations.length).toBeGreaterThan(0);
          expect(result.isValid).toBe(false);
          
          // Each violation should be properly categorized
          recommendationViolations.forEach(violation => {
            expect(violation.description).toBeTruthy();
            expect(violation.violatingText).toBeTruthy();
            expect(violation.severity).toBe('error');
          });
        })
      );
    });

    test('Property 3b: Analysis results never contain universal superiority language', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          const messaging = new DecisionSupportMessaging();
          
          // Generate all possible output content from the analysis
          const disclaimerBlock = messaging.generateDisclaimerBlock(result);
          const footerNotices = messaging.generateFooterNotices(result);
          const allMessages = messaging.getMessagesForAnalysis(result);
          
          // Combine all generated content
          const allContent = [
            disclaimerBlock,
            footerNotices,
            ...allMessages.map(msg => msg.content),
            ...result.interpretationGuidance,
            ...result.assumptions.map(a => a.description + ' ' + a.recommendation),
            ...result.detectedConflicts.map(c => c.description + ' ' + c.implications.join(' ')),
          ].join(' ');
          
          // Validate that no recommendation language exists
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          const validationResult = validator.validateContent(allContent);
          
          // Should not contain any recommendation language violations (Requirement 1.4)
          const recommendationViolations = validationResult.violations.filter(v => 
            v.type === 'recommendation_language' || v.type === 'universal_superiority'
          );
          
          expect(recommendationViolations).toHaveLength(0);
          
          // Specifically check for prohibited phrases
          const prohibitedPhrases = [
            /\b(should choose|recommend|best option|optimal choice)\b/gi,
            /\b(superior|better than|preferred|ideal)\b/gi,
            /\b(you should|we recommend|it is recommended)\b/gi,
            /\b(always use|never use|must implement)\b/gi,
          ];
          
          prohibitedPhrases.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 3c: Architecture comparison maintains neutrality', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Verify we have all three architecture types
          const architectureTypes = result.architectureScores.map(score => score.architectureType);
          expect(architectureTypes).toContain('IRM-Heavy');
          expect(architectureTypes).toContain('URM-Heavy');
          expect(architectureTypes).toContain('Hybrid');
          
          // Generate tradeoff analysis content
          const tradeoffContent = result.tradeoffSummary.primaryTradeoffs
            .map(tradeoff => tradeoff.description + ' ' + Object.values(tradeoff.architectureImpacts).join(' '))
            .join(' ');
          
          // Only test if there's actual content to validate
          if (tradeoffContent.trim().length > 0) {
            // Validate neutrality in tradeoff descriptions (Requirement 4.4)
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(tradeoffContent);
            
            const neutralityViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || v.type === 'universal_superiority'
            );
            
            expect(neutralityViolations).toHaveLength(0);
            
            // Check that no single architecture is declared superior
            const superiorityPatterns = [
              /IRM-Heavy.*(?:is|are).*(?:best|better|superior|optimal|recommended)/gi,
              /URM-Heavy.*(?:is|are).*(?:best|better|superior|optimal|recommended)/gi,
              /Hybrid.*(?:is|are).*(?:best|better|superior|optimal|recommended)/gi,
            ];
            
            superiorityPatterns.forEach(pattern => {
              expect(tradeoffContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 3d: Near-tie detection prevents false precision', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test specifically when scores are close (near-tie situation)
          const scores = result.architectureScores.map(score => score.weightedScore);
          const maxScore = Math.max(...scores);
          const minScore = Math.min(...scores);
          const scoreRange = maxScore - minScore;
          
          // If scores are within near-tie threshold, should not declare a winner
          if (scoreRange <= result.tradeoffSummary.nearTieThreshold) {
            // For this test, we'll check that the system handles near-ties appropriately
            // The isNearTie flag should be consistent with the score range
            const messaging = new DecisionSupportMessaging();
            const messages = messaging.getMessagesForAnalysis(result);
            
            // Should not contain winner declaration language (but allow "no clear winner")
            const allMessageContent = messages.map(msg => msg.content).join(' ');
            
            // Check for inappropriate winner language (excluding "no clear winner")
            const inappropriateWinnerMatches = allMessageContent.match(/\b(?:winner)\b/gi);
            if (inappropriateWinnerMatches) {
              // Allow "no clear winner" but not other winner usage
              const allowedWinnerUsage = inappropriateWinnerMatches.every(match => {
                const context = allMessageContent.toLowerCase();
                const matchIndex = context.indexOf(match.toLowerCase());
                const beforeMatch = context.substring(Math.max(0, matchIndex - 20), matchIndex);
                return beforeMatch.includes('no clear') || beforeMatch.includes('no obvious');
              });
              expect(allowedWinnerUsage).toBe(true);
            }
            
            // Check for other problematic winner language
            const otherWinnerPatterns = [
              /\b(?:winning|wins|victorious)\b/gi,
              /\b(?:clearly superior|obviously better|definitively)\b/gi,
            ];
            
            otherWinnerPatterns.forEach(pattern => {
              expect(allMessageContent.match(pattern)).toBeNull();
            });
            
            // Should not contain recommendation language
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(allMessageContent);
            
            const recommendationViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || v.type === 'universal_superiority'
            );
            
            expect(recommendationViolations).toHaveLength(0);
          }
        })
      );
    });

    test('Property 3e: Conflict resolution suggestions remain neutral', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test conflict resolution suggestions for neutrality
          const conflictContent = result.detectedConflicts
            .map(conflict => 
              conflict.description + ' ' + 
              conflict.implications.join(' ') + ' ' + 
              conflict.resolutionSuggestions.join(' ')
            )
            .join(' ');
          
          if (conflictContent.trim().length > 0) {
            // Validate that conflict resolution doesn't contain recommendations
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(conflictContent);
            
            const recommendationViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || v.type === 'universal_superiority'
            );
            
            expect(recommendationViolations).toHaveLength(0);
            
            // Should not contain directive language
            const directivePatterns = [
              /\b(?:must|should|shall|required to|need to)\b/gi,
              /\b(?:always|never|only way|best practice)\b/gi,
            ];
            
            directivePatterns.forEach(pattern => {
              expect(conflictContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 3f: Assumption recommendations avoid prescriptive language', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test assumption recommendations for non-prescriptive language
          const assumptionContent = result.assumptions
            .map(assumption => assumption.description + ' ' + assumption.recommendation)
            .join(' ');
          
          if (assumptionContent.trim().length > 0) {
            // Validate assumptions don't contain prescriptive recommendations
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(assumptionContent);
            
            const prescriptiveViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || 
              v.type === 'universal_superiority' ||
              v.type === 'prescriptive_guidance'
            );
            
            expect(prescriptiveViolations).toHaveLength(0);
            
            // Should not contain directive language
            const directivePatterns = [
              /\b(?:must|should|shall|required to|need to)\b/gi,
              /\b(?:always|never|only way|best practice)\b/gi,
            ];
            
            directivePatterns.forEach(pattern => {
              expect(assumptionContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 3g: Interpretation guidance maintains decision support boundaries', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test interpretation guidance for appropriate boundaries
          const guidanceContent = result.interpretationGuidance.join(' ');
          
          if (guidanceContent.length > 0) {
            // Should not contain decision-making language
            const decisionMakingPatterns = [
              /\b(?:decide|choose|select|pick|go with)\b/gi,
              /\b(?:final decision|ultimate choice|definitive answer)\b/gi,
            ];
            
            decisionMakingPatterns.forEach(pattern => {
              expect(guidanceContent.match(pattern)).toBeNull();
            });
            
            // Should emphasize human oversight and professional validation
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(guidanceContent);
            
            const boundaryViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || v.type === 'universal_superiority'
            );
            
            expect(boundaryViolations).toHaveLength(0);
          }
        })
      );
    });

    test('Property 3h: System consistently avoids recommendation language across all outputs', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Comprehensive test across all possible system outputs
          const messaging = new DecisionSupportMessaging();
          
          // Collect all textual outputs from the system
          const allOutputs = [
            // Decision support messaging
            ...messaging.getMessagesForAnalysis(result).map(msg => msg.content),
            messaging.generateDisclaimerBlock(result),
            messaging.generateFooterNotices(result),
            
            // Analysis result content
            ...result.interpretationGuidance,
            ...result.assumptions.map(a => a.description + ' ' + a.recommendation),
            ...result.detectedConflicts.flatMap(c => [
              c.description,
              ...c.implications,
              ...c.resolutionSuggestions
            ]),
            ...result.tradeoffSummary.keyDecisionFactors,
            ...result.tradeoffSummary.primaryTradeoffs.flatMap(t => [
              t.description,
              ...Object.values(t.architectureImpacts)
            ]),
          ];
          
          // Test each output individually for recommendation language
          allOutputs.forEach(output => {
            if (output && output.length > 0) {
              const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
              const validationResult = validator.validateContent(output);
              
              const recommendationViolations = validationResult.violations.filter(v => 
                v.type === 'recommendation_language' || 
                v.type === 'universal_superiority' ||
                v.type === 'prescriptive_guidance'
              );
              
              // No output should contain recommendation language (Requirements 1.4, 4.4)
              expect(recommendationViolations).toHaveLength(0);
            }
          });
          
          // Test combined output as well
          const combinedOutput = allOutputs.filter(Boolean).join(' ');
          if (combinedOutput.length > 0) {
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(combinedOutput);
            
            const recommendationViolations = validationResult.violations.filter(v => 
              v.type === 'recommendation_language' || 
              v.type === 'universal_superiority' ||
              v.type === 'prescriptive_guidance'
            );
            
            expect(recommendationViolations).toHaveLength(0);
          }
        })
      );
    });
  });
});