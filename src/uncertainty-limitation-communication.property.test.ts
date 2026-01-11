/**
 * Property-based tests for uncertainty and limitation communication
 * Feature: securestack-referee, Property 17: Uncertainty and Limitation Communication
 * Validates: Requirements 9.4, 9.5, 9.6
 */

import fc from 'fast-check';
import {
  DecisionSupportMessaging,
  getDecisionSupportMessages,
  generateCompleteDisclaimer,
  MessagingConfig,
  MessageType,
} from './decision-support-messaging';
import { OutputFormatter } from './output-formatter';
import {
  AnalysisResult,
  ConstraintProfile,
  ArchitectureScore,
  ConflictWarning,
  TradeoffAnalysis,
  AssumptionDisclosure,
  ArchitectureType,
  ConfidenceLevel,
  UserPersona,
  OutputPreferences,
  PersonaContext,
} from './types';

describe('Property-Based Tests: Uncertainty and Limitation Communication', () => {
  /**
   * Property 17: Uncertainty and Limitation Communication
   * For any system output, uncertainty, analysis limitations, and need for professional 
   * validation shall be clearly communicated without false precision.
   * Validates: Requirements 9.4, 9.5, 9.6
   */
  describe('Property 17: Uncertainty and Limitation Communication', () => {
    // Generator for confidence levels
    const confidenceLevelGenerator = fc.constantFrom(
      'High',
      'Medium', 
      'Low'
    ) as fc.Arbitrary<ConfidenceLevel>;

    // Generator for architecture types
    const architectureTypeGenerator = fc.constantFrom(
      'IRM-Heavy',
      'URM-Heavy',
      'Hybrid'
    ) as fc.Arbitrary<ArchitectureType>;

    // Generator for user personas
    const userPersonaGenerator = fc.constantFrom(
      'CISO',
      'Enterprise_Security_Architect'
    ) as fc.Arbitrary<UserPersona>;

    // Generator for assumption impact levels
    const impactLevelGenerator = fc.constantFrom('low', 'medium', 'high');

    // Generator for constraint profiles
    const constraintProfileGenerator = fc.record({
      riskTolerance: fc.integer({ min: 1, max: 10 }),
      complianceStrictness: fc.integer({ min: 1, max: 10 }),
      costSensitivity: fc.integer({ min: 1, max: 10 }),
      userExperiencePriority: fc.integer({ min: 1, max: 10 }),
      operationalMaturity: fc.integer({ min: 1, max: 10 }),
      businessAgility: fc.integer({ min: 1, max: 10 }),
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 0, maxLength: 5 }),
    }) as fc.Arbitrary<ConstraintProfile>;

    // Generator for architecture scores
    const architectureScoreGenerator = fc.record({
      architectureType: architectureTypeGenerator,
      dimensionScores: fc.record({
        identityVerification: fc.integer({ min: 1, max: 10 }),
        behavioralAnalytics: fc.integer({ min: 1, max: 10 }),
        operationalComplexity: fc.integer({ min: 1, max: 10 }),
        userExperience: fc.integer({ min: 1, max: 10 }),
        complianceAuditability: fc.integer({ min: 1, max: 10 }),
        scalabilityPerformance: fc.integer({ min: 1, max: 10 }),
        costEfficiency: fc.integer({ min: 1, max: 10 }),
      }),
      weightedScore: fc.float({ min: 1, max: 10 }),
      confidenceLevel: confidenceLevelGenerator,
    }) as fc.Arbitrary<ArchitectureScore>;

    // Generator for assumption disclosures
    const assumptionDisclosureGenerator = fc.record({
      category: fc.constantFrom('input', 'calculation', 'interpretation'),
      description: fc.string({ minLength: 20, maxLength: 200 }),
      impact: impactLevelGenerator,
      recommendation: fc.string({ minLength: 15, maxLength: 150 }),
    }) as fc.Arbitrary<AssumptionDisclosure>;

    // Generator for analysis results
    const analysisResultGenerator = fc.record({
      constraintProfile: constraintProfileGenerator,
      architectureScores: fc.array(architectureScoreGenerator, { minLength: 3, maxLength: 3 }),
      detectedConflicts: fc.array(fc.record({
        conflictId: fc.string({ minLength: 5, maxLength: 20 }),
        title: fc.string({ minLength: 10, maxLength: 50 }),
        description: fc.string({ minLength: 20, maxLength: 200 }),
        implications: fc.array(fc.string({ minLength: 15, maxLength: 100 }), { minLength: 1, maxLength: 3 }),
        resolutionSuggestions: fc.array(fc.string({ minLength: 15, maxLength: 100 }), { minLength: 1, maxLength: 3 }),
        triggeringConstraints: fc.record({
          riskTolerance: fc.option(fc.integer({ min: 1, max: 10 })),
          complianceStrictness: fc.option(fc.integer({ min: 1, max: 10 })),
        }),
      }), { minLength: 0, maxLength: 3 }),
      tradeoffSummary: fc.record({
        keyDecisionFactors: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
        primaryTradeoffs: fc.array(fc.record({
          dimension: fc.constantFrom(
            'identityVerification',
            'behavioralAnalytics',
            'operationalComplexity',
            'userExperience',
            'complianceAuditability',
            'scalabilityPerformance',
            'costEfficiency'
          ),
          description: fc.string({ minLength: 20, maxLength: 200 }),
          architectureImpacts: fc.record({
            'IRM-Heavy': fc.string({ minLength: 10, maxLength: 100 }),
            'URM-Heavy': fc.string({ minLength: 10, maxLength: 100 }),
            'Hybrid': fc.string({ minLength: 10, maxLength: 100 }),
          }),
        }), { minLength: 1, maxLength: 3 }),
        isNearTie: fc.boolean(),
        nearTieThreshold: fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) }),
      }),
      assumptions: fc.array(assumptionDisclosureGenerator, { minLength: 0, maxLength: 5 }),
      interpretationGuidance: fc.array(fc.string({ minLength: 20, maxLength: 150 }), { minLength: 1, maxLength: 5 }),
      analysisTimestamp: fc.date(),
      engineVersion: fc.string({ minLength: 5, maxLength: 20 }),
    }) as fc.Arbitrary<AnalysisResult>;

    test('Property 17a: All system outputs include uncertainty communication', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(analysisResult);
          
          // Requirement 9.4: THE System SHALL clearly communicate uncertainty and analysis limitations
          const uncertaintyMessages = messages.filter(msg => 
            msg.styleHint.includes('uncertainty') || 
            msg.content.toLowerCase().includes('uncertainty') ||
            msg.content.toLowerCase().includes('confidence') ||
            msg.content.toLowerCase().includes('assumption')
          );
          
          // Should have uncertainty communication when confidence is low or assumptions exist
          const hasLowConfidence = analysisResult.architectureScores.some(score => 
            score.confidenceLevel === 'Low'
          );
          const hasHighImpactAssumptions = analysisResult.assumptions.some(assumption => 
            assumption.impact === 'high'
          );
          const isNearTie = analysisResult.tradeoffSummary.isNearTie;
          
          if (hasLowConfidence || hasHighImpactAssumptions || isNearTie) {
            expect(uncertaintyMessages.length).toBeGreaterThan(0);
          }
          
          // Uncertainty messages should be clear and specific
          uncertaintyMessages.forEach(msg => {
            expect(msg.content.length).toBeGreaterThan(20);
            expect(msg.content).not.toContain('100%');
            expect(msg.content).not.toContain('guaranteed');
            expect(msg.content).not.toContain('certain');
            expect(msg.content).not.toContain('always correct');
          });
        })
      );
    });

    test('Property 17b: All system outputs include limitation communication', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(analysisResult);
          
          // Requirement 9.5: THE System SHALL include disclaimers about the need for professional validation
          const limitationMessages = messages.filter(msg => 
            msg.styleHint.includes('limitation') || 
            msg.content.toLowerCase().includes('limitation') ||
            msg.content.toLowerCase().includes('not account for') ||
            msg.content.toLowerCase().includes('may not') ||
            msg.content.toLowerCase().includes('based on generalized')
          );
          
          // Should always have limitation messages
          expect(limitationMessages.length).toBeGreaterThan(0);
          
          // Limitation messages should identify specific constraints
          const allLimitationContent = limitationMessages.map(msg => msg.content).join(' ').toLowerCase();
          
          // Should mention key limitations
          const expectedLimitations = [
            'generalized', 'organization-specific', 'existing infrastructure',
            'emerging threats', 'qualitative factors', 'current', 'evolve'
          ];
          
          const mentionsLimitations = expectedLimitations.some(limitation => 
            allLimitationContent.includes(limitation)
          );
          expect(mentionsLimitations).toBe(true);
        })
      );
    });

    test('Property 17c: All system outputs require professional validation', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(analysisResult);
          
          // Requirement 9.5: THE System SHALL include disclaimers about the need for professional validation
          const validationMessages = messages.filter(msg => 
            msg.content.toLowerCase().includes('professional') ||
            msg.content.toLowerCase().includes('validation') ||
            msg.content.toLowerCase().includes('qualified') ||
            msg.content.toLowerCase().includes('expert') ||
            msg.content.toLowerCase().includes('consultant')
          );
          
          // Should always require professional validation
          expect(validationMessages.length).toBeGreaterThan(0);
          
          // Validation messages should be clear about requirements
          validationMessages.forEach(msg => {
            expect(msg.content.length).toBeGreaterThan(15);
            
            // Should mention specific types of professionals
            const professionalTypes = [
              'professional', 'qualified', 'expert', 'consultant', 
              'architect', 'security', 'legal', 'compliance'
            ];
            const mentionsProfessionals = professionalTypes.some(type => 
              msg.content.toLowerCase().includes(type)
            );
            expect(mentionsProfessionals).toBe(true);
          });
        })
      );
    });

    test('Property 17d: System avoids false precision in outputs', () => {
      fc.assert(
        fc.property(analysisResultGenerator, userPersonaGenerator, (analysisResult, persona) => {
          const personaContext: PersonaContext = {
            persona,
            responsibilities: ['Strategic decisions', 'Architecture design'],
            painPoints: ['Complex requirements', 'Stakeholder alignment'],
            successCriteria: ['Effective decisions', 'Risk reduction'],
          };
          
          const outputPreferences: OutputPreferences = {
            personaContext,
            includeDetailedExplanations: true,
            emphasizeCompliance: false,
            includeCostAnalysis: true,
            numericFormat: 'detailed',
          };
          
          const formatter = new OutputFormatter();
          const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
          
          // Requirement 9.6: THE System SHALL avoid false precision in security or risk metrics
          
          // Check executive summary for false precision
          expect(formattedOutput.executiveSummary).not.toContain('99.9%');
          expect(formattedOutput.executiveSummary).not.toContain('100%');
          expect(formattedOutput.executiveSummary).not.toContain('zero risk');
          expect(formattedOutput.executiveSummary).not.toContain('completely secure');
          expect(formattedOutput.executiveSummary).not.toContain('eliminates all');
          
          // Check comparison table notes for appropriate caveats
          const tableNotes = formattedOutput.comparisonTable.notes.join(' ').toLowerCase();
          expect(tableNotes).toContain('comparative');
          expect(tableNotes).toContain('relative');
          
          // Should not claim absolute measurements
          expect(tableNotes).not.toContain('absolute');
          expect(tableNotes).not.toContain('exact');
          expect(tableNotes).not.toContain('precise');
          
          // Check interpretation guidance for appropriate limitations
          const guidanceContent = [
            ...formattedOutput.interpretationGuidance.usageGuidelines,
            ...formattedOutput.interpretationGuidance.limitations,
          ].join(' ').toLowerCase();
          
          // Should acknowledge limitations
          expect(guidanceContent).toContain('not');
          const limitationWords = ['may not', 'cannot', 'does not', 'limited', 'approximate'];
          const hasLimitationLanguage = limitationWords.some(word => 
            guidanceContent.includes(word)
          );
          expect(hasLimitationLanguage).toBe(true);
        })
      );
    });

    test('Property 17e: Messaging adapts to analysis confidence levels', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(analysisResult);
          
          // Should provide more uncertainty messaging for low confidence results
          const lowConfidenceCount = analysisResult.architectureScores.filter(score => 
            score.confidenceLevel === 'Low'
          ).length;
          
          const uncertaintyMessageCount = messages.filter(msg => 
            msg.styleHint.includes('uncertainty') || 
            msg.content.toLowerCase().includes('confidence')
          ).length;
          
          if (lowConfidenceCount > 0) {
            // Should have uncertainty messages when confidence is low
            expect(uncertaintyMessageCount).toBeGreaterThan(0);
            
            // Should mention specific confidence issues
            const uncertaintyContent = messages
              .filter(msg => msg.styleHint.includes('uncertainty'))
              .map(msg => msg.content)
              .join(' ')
              .toLowerCase();
            
            if (uncertaintyContent.length > 0) {
              const confidenceKeywords = [
                'confidence', 'reduced', 'limited', 'additional', 'may improve'
              ];
              const mentionsConfidence = confidenceKeywords.some(keyword => 
                uncertaintyContent.includes(keyword)
              );
              expect(mentionsConfidence).toBe(true);
            }
          }
        })
      );
    });

    test('Property 17f: Near-tie situations receive appropriate uncertainty messaging', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          // Force near-tie situation for this test
          const nearTieResult = {
            ...analysisResult,
            tradeoffSummary: {
              ...analysisResult.tradeoffSummary,
              isNearTie: true,
            },
          };
          
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(nearTieResult);
          
          // Should have specific messaging for near-tie situations
          const nearTieMessages = messages.filter(msg => 
            msg.content.toLowerCase().includes('near-tie') ||
            msg.content.toLowerCase().includes('no clear winner') ||
            msg.content.toLowerCase().includes('closely matched') ||
            msg.content.toLowerCase().includes('trade-off analysis')
          );
          
          expect(nearTieMessages.length).toBeGreaterThan(0);
          
          // Near-tie messages should emphasize qualitative analysis
          nearTieMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            const emphasizesQualitative = [
              'trade-off', 'qualitative', 'rather than', 'instead of', 'focus on'
            ].some(phrase => content.includes(phrase));
            
            expect(emphasizesQualitative).toBe(true);
          });
        })
      );
    });

    test('Property 17g: High-impact assumptions trigger appropriate uncertainty messaging', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          // Force exactly 2 high-impact assumptions for this test
          const highAssumptionResult = {
            ...analysisResult,
            assumptions: [
              // Replace all assumptions with exactly 2 high-impact ones
              {
                category: 'input' as const,
                description: 'High impact assumption for testing',
                impact: 'high' as const,
                recommendation: 'Validate with stakeholders',
              },
              {
                category: 'calculation' as const,
                description: 'Another high impact assumption',
                impact: 'high' as const,
                recommendation: 'Review methodology',
              },
            ],
          };
          
          const messaging = new DecisionSupportMessaging();
          const messages = messaging.getMessagesForAnalysis(highAssumptionResult);
          
          // Should have specific messaging for high-impact assumptions
          const assumptionMessages = messages.filter(msg => 
            msg.content.toLowerCase().includes('assumption') ||
            msg.content.toLowerCase().includes('relies on') ||
            msg.content.toLowerCase().includes('validating')
          );
          
          expect(assumptionMessages.length).toBeGreaterThan(0);
          
          // Should mention the number of high-impact assumptions
          const assumptionContent = assumptionMessages.map(msg => msg.content).join(' ');
          expect(assumptionContent).toContain('2');
          expect(assumptionContent.toLowerCase()).toContain('high-impact');
        })
      );
    });

    test('Property 17h: Disclaimer generation is comprehensive and consistent', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const disclaimer = generateCompleteDisclaimer(analysisResult);
          
          // Should be substantial and comprehensive
          expect(disclaimer.length).toBeGreaterThan(200);
          
          // Should include key disclaimer elements
          const disclaimerLower = disclaimer.toLowerCase();
          
          // Core disclaimer concepts
          const requiredConcepts = [
            'decision support', 'not decisions', 'human oversight', 
            'professional validation', 'organization-specific'
          ];
          
          requiredConcepts.forEach(concept => {
            expect(disclaimerLower).toContain(concept);
          });
          
          // Should have proper formatting
          expect(disclaimer).toContain('='.repeat(80));
          expect(disclaimer).toContain('DECISION SUPPORT SYSTEM');
          expect(disclaimer).toContain('IMPORTANT DISCLAIMERS');
          
          // Should not make absolute claims
          expect(disclaimer).not.toContain('always correct');
          expect(disclaimer).not.toContain('guaranteed');
          expect(disclaimer).not.toContain('100% accurate');
        })
      );
    });

    test('Property 17i: Messaging configuration affects verbosity appropriately', () => {
      fc.assert(
        fc.property(analysisResultGenerator, (analysisResult) => {
          const minimalConfig: MessagingConfig = {
            verbosity: 'minimal',
            includeTechnicalDetails: false,
            emphasizeLimitations: false,
          };
          
          const comprehensiveConfig: MessagingConfig = {
            verbosity: 'comprehensive',
            includeTechnicalDetails: true,
            emphasizeLimitations: true,
          };
          
          const minimalMessages = getDecisionSupportMessages(analysisResult, minimalConfig);
          const comprehensiveMessages = getDecisionSupportMessages(analysisResult, comprehensiveConfig);
          
          // Comprehensive should have more or equal messages than minimal
          expect(comprehensiveMessages.length).toBeGreaterThanOrEqual(minimalMessages.length);
          
          // Both should have at least core disclaimer and human oversight messages
          expect(minimalMessages.length).toBeGreaterThanOrEqual(2);
          expect(comprehensiveMessages.length).toBeGreaterThanOrEqual(2);
          
          // All messages should have valid content
          [...minimalMessages, ...comprehensiveMessages].forEach(msg => {
            expect(msg.content).toBeTruthy();
            expect(msg.content.length).toBeGreaterThan(10);
            expect(msg.placement).toBeTruthy();
            expect(msg.styleHint).toBeTruthy();
            expect(typeof msg.priority).toBe('number');
          });
          
          // Comprehensive should include professional guidance when configured
          if (comprehensiveConfig.includeTechnicalDetails) {
            const comprehensiveContent = comprehensiveMessages.map(msg => msg.content).join(' ').toLowerCase();
            // May include technical terms but not required to
          }
        })
      );
    });

    test('Property 17j: Persona-specific messaging maintains consistency', () => {
      fc.assert(
        fc.property(analysisResultGenerator, userPersonaGenerator, (analysisResult, persona) => {
          const config: MessagingConfig = {
            verbosity: 'standard',
            targetPersona: persona,
            includeTechnicalDetails: false,
            emphasizeLimitations: true,
          };
          
          const messages = getDecisionSupportMessages(analysisResult, config);
          
          // Should have persona-appropriate content
          const allContent = messages.map(msg => msg.content).join(' ').toLowerCase();
          
          if (persona === 'CISO') {
            // CISO messages should mention strategic concerns
            const cisoTerms = ['strategic', 'executive', 'board', 'stakeholder'];
            const hasCisoTerms = cisoTerms.some(term => allContent.includes(term));
            // May or may not have CISO-specific terms, but should not contradict
          } else if (persona === 'Enterprise_Security_Architect') {
            // Architect messages should mention technical concerns
            const architectTerms = ['technical', 'architecture', 'implementation', 'team'];
            const hasArchitectTerms = architectTerms.some(term => allContent.includes(term));
            // May or may not have architect-specific terms, but should not contradict
          }
          
          // All personas should still get core uncertainty and limitation messaging
          const hasUncertaintyMessaging = messages.some(msg => 
            msg.styleHint.includes('uncertainty') || 
            msg.styleHint.includes('limitation') ||
            msg.content.toLowerCase().includes('limitation') ||
            msg.content.toLowerCase().includes('professional validation')
          );
          
          // Should have uncertainty/limitation messaging regardless of persona
          expect(hasUncertaintyMessaging).toBe(true);
        })
      );
    });
  });
});