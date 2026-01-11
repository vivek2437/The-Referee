/**
 * Property-based tests for complete output structure
 * Feature: securestack-referee, Property 16: Complete Output Structure
 * Validates: Requirements 8.1, 8.2, 8.3, 8.5
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

describe('Property-Based Tests: Complete Output Structure', () => {
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
   * Property 16: Complete Output Structure
   * For any analysis result, the output shall include comparison table, trade-off summary, 
   * conflict warnings (if applicable), assumption disclosures, and interpretation guidance.
   * Validates: Requirements 8.1, 8.2, 8.3, 8.5
   */
  test('Property 16: Complete Output Structure - all required components present', () => {
    fc.assert(
      fc.property(
        analysisResultGen,
        outputPreferencesGen,
        (analysisResult, outputPreferences) => {
          const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

          // Requirement 8.1: Comparison table showing scores across all dimensions
          expect(formattedOutput.comparisonTable).toBeDefined();
          expect(formattedOutput.comparisonTable.headers).toBeDefined();
          expect(Array.isArray(formattedOutput.comparisonTable.headers)).toBe(true);
          expect(formattedOutput.comparisonTable.headers.length).toBeGreaterThan(0);
          
          expect(formattedOutput.comparisonTable.dimensionRows).toBeDefined();
          expect(Array.isArray(formattedOutput.comparisonTable.dimensionRows)).toBe(true);
          expect(formattedOutput.comparisonTable.dimensionRows.length).toBeGreaterThan(0);
          
          // Each dimension row should have scores for all architecture types
          formattedOutput.comparisonTable.dimensionRows.forEach(row => {
            expect(row.dimensionName).toBeTruthy();
            expect(row.scores).toBeDefined();
            expect(row.scores['IRM-Heavy']).toBeDefined();
            expect(row.scores['URM-Heavy']).toBeDefined();
            expect(row.scores['Hybrid']).toBeDefined();
          });

          expect(formattedOutput.comparisonTable.summaryRow).toBeDefined();
          expect(formattedOutput.comparisonTable.summaryRow.weightedScores).toBeDefined();
          expect(formattedOutput.comparisonTable.summaryRow.weightedScores['IRM-Heavy']).toBeDefined();
          expect(formattedOutput.comparisonTable.summaryRow.weightedScores['URM-Heavy']).toBeDefined();
          expect(formattedOutput.comparisonTable.summaryRow.weightedScores['Hybrid']).toBeDefined();

          // Requirement 8.2: Trade-off summary highlighting key decision factors
          expect(formattedOutput.tradeoffSummary).toBeDefined();
          expect(formattedOutput.tradeoffSummary.title).toBeTruthy();
          expect(formattedOutput.tradeoffSummary.keyDecisionFactors).toBeDefined();
          expect(Array.isArray(formattedOutput.tradeoffSummary.keyDecisionFactors)).toBe(true);
          expect(formattedOutput.tradeoffSummary.keyDecisionFactors.length).toBeGreaterThan(0);
          
          expect(formattedOutput.tradeoffSummary.primaryTradeoffs).toBeDefined();
          expect(Array.isArray(formattedOutput.tradeoffSummary.primaryTradeoffs)).toBe(true);
          
          // Each tradeoff should have architecture impacts
          formattedOutput.tradeoffSummary.primaryTradeoffs.forEach(tradeoff => {
            expect(tradeoff.dimensionName).toBeTruthy();
            expect(tradeoff.description).toBeTruthy();
            expect(tradeoff.architectureImpacts).toBeDefined();
            expect(tradeoff.architectureImpacts['IRM-Heavy']).toBeTruthy();
            expect(tradeoff.architectureImpacts['URM-Heavy']).toBeTruthy();
            expect(tradeoff.architectureImpacts['Hybrid']).toBeTruthy();
          });

          // Requirement 8.3: Conflict warnings when constraint tensions are detected
          expect(formattedOutput.conflictWarnings).toBeDefined();
          expect(Array.isArray(formattedOutput.conflictWarnings)).toBe(true);
          
          // If conflicts exist in input, they should be present in output
          if (analysisResult.detectedConflicts.length > 0) {
            expect(formattedOutput.conflictWarnings.length).toBeGreaterThan(0);
            
            formattedOutput.conflictWarnings.forEach(conflict => {
              expect(conflict.title).toBeTruthy();
              expect(conflict.description).toBeTruthy();
              expect(conflict.severity).toBeDefined();
              expect(['High', 'Medium', 'Low']).toContain(conflict.severity);
              expect(Array.isArray(conflict.implications)).toBe(true);
              expect(Array.isArray(conflict.resolutionGuidance)).toBe(true);
            });
          }

          // Requirement 8.5: Interpretation guidance explaining how to use results appropriately
          expect(formattedOutput.interpretationGuidance).toBeDefined();
          expect(formattedOutput.interpretationGuidance.title).toBeTruthy();
          expect(formattedOutput.interpretationGuidance.usageGuidelines).toBeDefined();
          expect(Array.isArray(formattedOutput.interpretationGuidance.usageGuidelines)).toBe(true);
          expect(formattedOutput.interpretationGuidance.usageGuidelines.length).toBeGreaterThan(0);
          
          expect(formattedOutput.interpretationGuidance.limitations).toBeDefined();
          expect(Array.isArray(formattedOutput.interpretationGuidance.limitations)).toBe(true);
          expect(formattedOutput.interpretationGuidance.limitations.length).toBeGreaterThan(0);
          
          expect(formattedOutput.interpretationGuidance.nextSteps).toBeDefined();
          expect(Array.isArray(formattedOutput.interpretationGuidance.nextSteps)).toBe(true);
          expect(formattedOutput.interpretationGuidance.nextSteps.length).toBeGreaterThan(0);
          
          expect(formattedOutput.interpretationGuidance.validationRequirements).toBeDefined();
          expect(Array.isArray(formattedOutput.interpretationGuidance.validationRequirements)).toBe(true);
          expect(formattedOutput.interpretationGuidance.validationRequirements.length).toBeGreaterThan(0);

          // Additional structural requirements for complete output
          expect(formattedOutput.header).toBeDefined();
          expect(formattedOutput.header.title).toBeTruthy();
          expect(formattedOutput.header.subtitle).toBeTruthy();
          
          expect(formattedOutput.executiveSummary).toBeTruthy();
          
          expect(formattedOutput.assumptionDisclosures).toBeDefined();
          expect(Array.isArray(formattedOutput.assumptionDisclosures)).toBe(true);
          
          expect(formattedOutput.disclaimers).toBeDefined();
          expect(formattedOutput.disclaimers.primaryDisclaimer).toBeTruthy();
          expect(formattedOutput.disclaimers.humanOversightRequirement).toBeTruthy();
          
          expect(formattedOutput.footer).toBeDefined();
          expect(formattedOutput.footer.generatedBy).toBeTruthy();
          expect(formattedOutput.footer.timestamp).toBeTruthy();
        }
      )
    );
  });

  /**
   * Property 16b: Complete Output Structure - assumption disclosures always present
   * For any analysis result with assumptions, assumption disclosures must be included.
   * Validates: Requirements 8.4 (implicit in 8.5 interpretation guidance)
   */
  test('Property 16b: Complete Output Structure - assumption disclosures present when assumptions exist', () => {
    fc.assert(
      fc.property(
        analysisResultGen,
        outputPreferencesGen,
        (analysisResult, outputPreferences) => {
          const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);

          // If assumptions exist in input, they should be disclosed in output
          if (analysisResult.assumptions.length > 0) {
            expect(formattedOutput.assumptionDisclosures.length).toBeGreaterThan(0);
            
            formattedOutput.assumptionDisclosures.forEach(assumption => {
              expect(assumption.category).toBeTruthy();
              expect(assumption.description).toBeTruthy();
              expect(assumption.impact).toBeTruthy();
              expect(assumption.recommendation).toBeTruthy();
              expect(assumption.businessContext).toBeTruthy();
            });
          }
        }
      )
    );
  });
});