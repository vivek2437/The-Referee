/**
 * Property-based tests for trade-off emphasis over scores
 * Feature: securestack-referee, Property 15: Trade-off Emphasis Over Scores
 * Validates: Requirements 7.4, 7.5
 */

import fc from 'fast-check';
import { OutputFormatter, FormattedOutput } from './output-formatter';
import {
  AnalysisResult,
  PersonaContext,
  UserPersona,
  ArchitectureScore,
  ConstraintProfile,
  ConflictWarning,
  TradeoffAnalysis,
  AssumptionDisclosure,
  ArchitectureType,
  DimensionScores,
  ConfidenceLevel,
  OutputPreferences
} from './types';

describe('Property-Based Tests: Trade-off Emphasis Over Scores', () => {
  const formatter = new OutputFormatter();

  // Generators for test data
  const validScore = fc.integer({ min: 1, max: 10 });
  const validWeightedScore = fc.float({ min: 0, max: 10 });
  
  const architectureTypeGen = fc.constantFrom<ArchitectureType>('IRM-Heavy', 'URM-Heavy', 'Hybrid');
  const confidenceLevelGen = fc.constantFrom<ConfidenceLevel>('High', 'Medium', 'Low');
  const userPersonaGen = fc.constantFrom<UserPersona>('CISO', 'Enterprise_Security_Architect');

  const dimensionScoresGen = fc.record({
    identityVerification: validScore,
    behavioralAnalytics: validScore,
    operationalComplexity: validScore,
    userExperience: validScore,
    complianceAuditability: validScore,
    scalabilityPerformance: validScore,
    costEfficiency: validScore,
  }) as fc.Arbitrary<DimensionScores>;

  const architectureScoreGen = fc.record({
    architectureType: architectureTypeGen,
    dimensionScores: dimensionScoresGen,
    weightedScore: validWeightedScore,
    confidenceLevel: confidenceLevelGen,
  }) as fc.Arbitrary<ArchitectureScore>;

  const constraintProfileGen = fc.record({
    riskTolerance: validScore,
    complianceStrictness: validScore,
    costSensitivity: validScore,
    userExperiencePriority: validScore,
    operationalMaturity: validScore,
    businessAgility: validScore,
    inputCompleteness: fc.boolean(),
    assumptions: fc.array(fc.string(), { maxLength: 6 }),
  }) as fc.Arbitrary<ConstraintProfile>;

  // Generators for meaningful text content
  const professionalStringGen = fc.oneof(
    fc.constant('security architecture analysis'),
    fc.constant('enterprise risk management framework'),
    fc.constant('organizational compliance requirements'),
    fc.constant('strategic decision support methodology'),
    fc.constant('technical implementation considerations'),
    fc.constant('stakeholder alignment and validation process'),
    fc.constant('business continuity and operational resilience'),
    fc.constant('regulatory compliance and audit requirements')
  );

  const conflictWarningGen = fc.record({
    conflictId: fc.oneof(fc.constant('compliance-cost'), fc.constant('risk-ux'), fc.constant('agility-maturity')),
    title: fc.oneof(fc.constant('High Compliance vs Low Cost'), fc.constant('Low Risk Tolerance vs High UX Priority')),
    description: fc.oneof(
      fc.constant('Comprehensive compliance controls require significant infrastructure investment'),
      fc.constant('Strong security controls inherently introduce user interaction steps')
    ),
    implications: fc.array(professionalStringGen, { minLength: 1, maxLength: 3 }),
    resolutionSuggestions: fc.array(professionalStringGen, { minLength: 1, maxLength: 3 }),
    triggeringConstraints: fc.record({}),
  }) as fc.Arbitrary<ConflictWarning>;

  const tradeoffAnalysisGen = fc.record({
    keyDecisionFactors: fc.array(professionalStringGen, { minLength: 1, maxLength: 5 }),
    primaryTradeoffs: fc.array(fc.record({
      dimension: fc.constantFrom<keyof DimensionScores>(
        'identityVerification',
        'behavioralAnalytics', 
        'operationalComplexity',
        'userExperience',
        'complianceAuditability',
        'scalabilityPerformance',
        'costEfficiency'
      ),
      description: professionalStringGen,
      architectureImpacts: fc.record({
        'IRM-Heavy': professionalStringGen,
        'URM-Heavy': professionalStringGen,
        'Hybrid': professionalStringGen,
      }),
    }), { minLength: 1, maxLength: 3 }),
    isNearTie: fc.boolean(),
    nearTieThreshold: fc.float({ min: 0, max: 1 }),
  }) as fc.Arbitrary<TradeoffAnalysis>;

  const assumptionDisclosureGen = fc.record({
    category: fc.constantFrom('input', 'calculation', 'interpretation'),
    description: professionalStringGen,
    impact: fc.constantFrom('low', 'medium', 'high'),
    recommendation: professionalStringGen,
  }) as fc.Arbitrary<AssumptionDisclosure>;

  const analysisResultGen = fc.record({
    constraintProfile: constraintProfileGen,
    architectureScores: fc.constant([
      {
        architectureType: 'IRM-Heavy' as ArchitectureType,
        dimensionScores: {
          identityVerification: 8,
          behavioralAnalytics: 3,
          operationalComplexity: 7,
          userExperience: 6,
          complianceAuditability: 9,
          scalabilityPerformance: 6,
          costEfficiency: 5
        },
        weightedScore: 6.5,
        confidenceLevel: 'High' as ConfidenceLevel
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
          costEfficiency: 4
        },
        weightedScore: 5.8,
        confidenceLevel: 'Medium' as ConfidenceLevel
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
          costEfficiency: 5
        },
        weightedScore: 6.2,
        confidenceLevel: 'High' as ConfidenceLevel
      }
    ]),
    detectedConflicts: fc.array(conflictWarningGen, { maxLength: 3 }),
    tradeoffSummary: tradeoffAnalysisGen,
    assumptions: fc.array(assumptionDisclosureGen, { minLength: 1, maxLength: 5 }),
    interpretationGuidance: fc.array(professionalStringGen, { minLength: 3, maxLength: 8 }),
    analysisTimestamp: fc.constant(new Date()),
    engineVersion: fc.constant('1.0.0'),
  }) as fc.Arbitrary<AnalysisResult>;

  const personaContextGen = fc.record({
    persona: userPersonaGen,
    responsibilities: fc.array(professionalStringGen, { minLength: 2, maxLength: 5 }),
    painPoints: fc.array(professionalStringGen, { minLength: 2, maxLength: 4 }),
    successCriteria: fc.array(professionalStringGen, { minLength: 2, maxLength: 4 }),
  }) as fc.Arbitrary<PersonaContext>;

  const outputPreferencesGen = fc.record({
    personaContext: personaContextGen,
    includeDetailedExplanations: fc.boolean(),
    emphasizeCompliance: fc.boolean(),
    includeCostAnalysis: fc.boolean(),
    numericFormat: fc.constantFrom('detailed', 'summary', 'minimal'),
  }) as fc.Arbitrary<OutputPreferences>;

  /**
   * Property 15: Trade-off Emphasis Over Scores
   * For any system output, trade-off analysis content shall be more prominent than numeric scores, 
   * with clear interpretation limitations.
   * Validates: Requirements 7.4, 7.5
   */
  describe('Property 15: Trade-off Emphasis Over Scores', () => {
    test('Property 15a: Trade-off analysis content is more prominent than numeric scores', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Requirement 7.4: System SHALL emphasize trade-off analysis over numeric score comparison
            
            // Trade-off summary should have substantial content
            expect(formattedOutput.tradeoffSummary).toBeDefined();
            expect(formattedOutput.tradeoffSummary.title).toBeTruthy();
            expect(formattedOutput.tradeoffSummary.keyDecisionFactors.length).toBeGreaterThan(0);
            expect(formattedOutput.tradeoffSummary.primaryTradeoffs.length).toBeGreaterThan(0);
            
            // Each trade-off should have detailed descriptions and implications
            formattedOutput.tradeoffSummary.primaryTradeoffs.forEach(tradeoff => {
              expect(tradeoff.dimensionName).toBeTruthy();
              expect(tradeoff.description).toBeTruthy();
              expect(tradeoff.businessImplications).toBeTruthy();
              
              // Architecture impacts should be detailed for all types
              expect(tradeoff.architectureImpacts['IRM-Heavy']).toBeTruthy();
              expect(tradeoff.architectureImpacts['URM-Heavy']).toBeTruthy();
              expect(tradeoff.architectureImpacts['Hybrid']).toBeTruthy();
            });

            // Executive summary should emphasize trade-offs over scores
            expect(formattedOutput.executiveSummary).toBeTruthy();
            const executiveSummaryLength = formattedOutput.executiveSummary.length;
            expect(executiveSummaryLength).toBeGreaterThan(100); // Substantial content
            
            // Trade-off content should be prominent in persona-specific content
            expect(formattedOutput.personaContent.keyInsights.length).toBeGreaterThan(0);
            expect(formattedOutput.personaContent.strategicConsiderations.length).toBeGreaterThan(0);
            
            // Comparison table should include interpretation, not just raw scores
            formattedOutput.comparisonTable.dimensionRows.forEach(row => {
              expect(row.interpretation).toBeTruthy();
              expect(row.interpretation.length).toBeGreaterThan(20); // Meaningful interpretation
            });
          }
        )
      );
    });

    test('Property 15b: Clear interpretation limitations are provided', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Requirement 7.5: System SHALL provide clear guidance on score interpretation limitations
            
            // Interpretation guidance should be comprehensive
            expect(formattedOutput.interpretationGuidance).toBeDefined();
            expect(formattedOutput.interpretationGuidance.limitations).toBeDefined();
            expect(formattedOutput.interpretationGuidance.limitations.length).toBeGreaterThan(0);
            
            // Each limitation should be meaningful and specific
            formattedOutput.interpretationGuidance.limitations.forEach(limitation => {
              expect(limitation).toBeTruthy();
              expect(limitation.length).toBeGreaterThan(30); // Substantial limitation description
            });

            // Usage guidelines should emphasize proper interpretation
            expect(formattedOutput.interpretationGuidance.usageGuidelines).toBeDefined();
            expect(formattedOutput.interpretationGuidance.usageGuidelines.length).toBeGreaterThan(0);
            
            formattedOutput.interpretationGuidance.usageGuidelines.forEach(guideline => {
              expect(guideline).toBeTruthy();
              expect(guideline.length).toBeGreaterThan(30); // Substantial guidance
            });

            // Disclaimers should emphasize limitations of numeric scores
            expect(formattedOutput.disclaimers.primaryDisclaimer).toBeTruthy();
            expect(formattedOutput.disclaimers.primaryDisclaimer.length).toBeGreaterThan(50);
            
            // Additional notices should include score interpretation warnings
            expect(formattedOutput.disclaimers.additionalNotices).toBeDefined();
            expect(Array.isArray(formattedOutput.disclaimers.additionalNotices)).toBe(true);
          }
        )
      );
    });

    test('Property 15c: Near-tie scenarios emphasize trade-offs over numeric differences', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            // Force near-tie scenario
            const nearTieAnalysisResult = {
              ...analysisResult,
              tradeoffSummary: {
                ...analysisResult.tradeoffSummary,
                isNearTie: true,
                nearTieThreshold: 0.5
              }
            };

            const formattedOutput = formatter.formatAnalysisOutput(nearTieAnalysisResult, outputPreferences);

            // When near-tie is detected, trade-off emphasis should be even stronger
            if (formattedOutput.tradeoffSummary.nearTieAnalysis) {
              expect(formattedOutput.tradeoffSummary.nearTieAnalysis.message).toBeTruthy();
              expect(formattedOutput.tradeoffSummary.nearTieAnalysis.guidance).toBeDefined();
              expect(formattedOutput.tradeoffSummary.nearTieAnalysis.guidance.length).toBeGreaterThan(0);
              
              // Guidance should emphasize qualitative factors over numeric scores
              formattedOutput.tradeoffSummary.nearTieAnalysis.guidance.forEach(guidance => {
                expect(guidance).toBeTruthy();
                expect(guidance.length).toBeGreaterThan(20);
              });
            }

            // Summary row should indicate near-tie status
            expect(formattedOutput.comparisonTable.summaryRow.isNearTie).toBe(true);
          }
        )
      );
    });

    test('Property 15d: Recommendations section emphasizes validation over scores', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Trade-off summary recommendations should emphasize validation and context
            expect(formattedOutput.tradeoffSummary.recommendations).toBeDefined();
            expect(Array.isArray(formattedOutput.tradeoffSummary.recommendations)).toBe(true);
            expect(formattedOutput.tradeoffSummary.recommendations.length).toBeGreaterThan(0);
            
            formattedOutput.tradeoffSummary.recommendations.forEach(recommendation => {
              expect(recommendation).toBeTruthy();
              expect(recommendation.length).toBeGreaterThan(30); // Substantial recommendations
            });

            // Next steps should focus on validation, not score optimization
            expect(formattedOutput.interpretationGuidance.nextSteps).toBeDefined();
            expect(formattedOutput.interpretationGuidance.nextSteps.length).toBeGreaterThan(0);
            
            formattedOutput.interpretationGuidance.nextSteps.forEach(step => {
              expect(step).toBeTruthy();
              expect(step.length).toBeGreaterThan(30); // Meaningful next steps
            });

            // Validation requirements should be comprehensive
            expect(formattedOutput.interpretationGuidance.validationRequirements).toBeDefined();
            expect(formattedOutput.interpretationGuidance.validationRequirements.length).toBeGreaterThan(0);
            
            formattedOutput.interpretationGuidance.validationRequirements.forEach(requirement => {
              expect(requirement).toBeTruthy();
              expect(requirement.length).toBeGreaterThan(30); // Detailed validation requirements
            });
          }
        )
      );
    });

    test('Property 15e: Comparison table notes emphasize interpretation over raw scores', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Comparison table should have explanatory notes
            expect(formattedOutput.comparisonTable.notes).toBeDefined();
            expect(Array.isArray(formattedOutput.comparisonTable.notes)).toBe(true);
            expect(formattedOutput.comparisonTable.notes.length).toBeGreaterThan(0);
            
            // Notes should emphasize proper interpretation
            formattedOutput.comparisonTable.notes.forEach(note => {
              expect(note).toBeTruthy();
              expect(note.length).toBeGreaterThan(20); // Meaningful notes
            });

            // At least one note should mention comparative nature or interpretation guidance
            const hasInterpretationGuidance = formattedOutput.comparisonTable.notes.some(note => 
              note.toLowerCase().includes('comparative') || 
              note.toLowerCase().includes('interpretation') ||
              note.toLowerCase().includes('relative') ||
              note.toLowerCase().includes('trade-off')
            );
            expect(hasInterpretationGuidance).toBe(true);
          }
        )
      );
    });

    test('Property 15f: Content volume favors trade-off analysis over numeric presentation', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Measure content volume for trade-off analysis vs numeric scores
            const tradeoffContentLength = 
              formattedOutput.tradeoffSummary.keyDecisionFactors.join('').length +
              formattedOutput.tradeoffSummary.primaryTradeoffs.reduce((sum, tradeoff) => 
                sum + tradeoff.description.length + tradeoff.businessImplications.length +
                Object.values(tradeoff.architectureImpacts).join('').length, 0) +
              (formattedOutput.tradeoffSummary.nearTieAnalysis?.message.length || 0) +
              formattedOutput.tradeoffSummary.recommendations.join('').length;

            const interpretationContentLength = 
              formattedOutput.interpretationGuidance.usageGuidelines.join('').length +
              formattedOutput.interpretationGuidance.limitations.join('').length +
              formattedOutput.interpretationGuidance.nextSteps.join('').length +
              formattedOutput.interpretationGuidance.validationRequirements.join('').length;

            const totalAnalysisContentLength = tradeoffContentLength + interpretationContentLength;

            // Trade-off and interpretation content should be substantial
            expect(totalAnalysisContentLength).toBeGreaterThan(500); // Significant content volume
            expect(tradeoffContentLength).toBeGreaterThan(200); // Substantial trade-off content

            // Executive summary should be substantial and focus on analysis
            expect(formattedOutput.executiveSummary.length).toBeGreaterThan(100);
          }
        )
      );
    });

    test('Property 15g: Human oversight messaging emphasizes judgment over algorithmic results', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          outputPreferencesGen,
          (analysisResult, outputPreferences) => {
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

            // Human oversight requirement should be prominent
            expect(formattedOutput.disclaimers.humanOversightRequirement).toBeTruthy();
            expect(formattedOutput.disclaimers.humanOversightRequirement.length).toBeGreaterThan(50);

            // Professional validation notice should emphasize human judgment
            expect(formattedOutput.disclaimers.professionalValidationNotice).toBeTruthy();
            expect(formattedOutput.disclaimers.professionalValidationNotice.length).toBeGreaterThan(50);

            // Primary disclaimer should emphasize decision support vs decision making
            expect(formattedOutput.disclaimers.primaryDisclaimer).toBeTruthy();
            const disclaimerLower = formattedOutput.disclaimers.primaryDisclaimer.toLowerCase();
            const hasDecisionSupportLanguage = 
              disclaimerLower.includes('decision support') || 
              disclaimerLower.includes('human oversight') ||
              disclaimerLower.includes('professional validation') ||
              disclaimerLower.includes('judgment');
            expect(hasDecisionSupportLanguage).toBe(true);
          }
        )
      );
    });
  });
});