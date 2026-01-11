/**
 * Property-based tests for enterprise-appropriate communication
 * Feature: securestack-referee, Property 8: Enterprise-Appropriate Communication
 * Validates: Requirements 2.3, 2.4, 10.5
 */

import fc from 'fast-check';
import { OutputFormatter, FormattedOutput } from './output-formatter';
import { PersonaContentGenerator } from './persona-content-generator';
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

describe('Property-Based Tests: Enterprise-Appropriate Communication', () => {
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
  const meaningfulStringGen = fc.stringOf(
    fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' '),
    { minLength: 10, maxLength: 50 }
  );
  
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
    detectedConflicts: fc.array(conflictWarningGen, { maxLength: 5 }),
    tradeoffSummary: tradeoffAnalysisGen,
    assumptions: fc.array(assumptionDisclosureGen, { maxLength: 10 }),
    interpretationGuidance: fc.array(professionalStringGen, { minLength: 1, maxLength: 5 }),
    analysisTimestamp: fc.date(),
    engineVersion: fc.oneof(fc.constant('v1.0.0'), fc.constant('v2.1.3'), fc.constant('v1.5.2')),
  }) as fc.Arbitrary<AnalysisResult>;

  const outputPreferencesGen = (persona: UserPersona) => fc.record({
    personaContext: fc.constant(PersonaContentGenerator.getPersonaContext(persona)),
    includeDetailedExplanations: fc.boolean(),
    emphasizeCompliance: fc.boolean(),
    includeCostAnalysis: fc.boolean(),
    numericFormat: fc.constantFrom('detailed', 'summary', 'minimal'),
  }) as fc.Arbitrary<OutputPreferences>;

  /**
   * Property 8: Enterprise-Appropriate Communication
   * For any system output, the language and format shall be suitable for enterprise audiences 
   * including board-level reporting and multi-stakeholder review.
   * Validates: Requirements 2.3, 2.4, 10.5
   */
  describe('Property 8: Enterprise-Appropriate Communication', () => {
    
    test('Property 8a: Board-level and executive reporting suitability (Requirement 2.3)', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: true,
              emphasizeCompliance: true,
              includeCostAnalysis: true,
              numericFormat: 'detailed' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Board-level reporting requirements
            expect(formattedOutput.header).toBeDefined();
            expect(formattedOutput.header.title).toBeTruthy();
            expect(formattedOutput.header.subtitle).toBeTruthy();
            expect(formattedOutput.header.analysisDate).toBeTruthy();
            expect(formattedOutput.header.targetPersona).toBeTruthy();
            
            // Executive summary must be present and substantial for board reporting
            expect(formattedOutput.executiveSummary).toBeTruthy();
            expect(typeof formattedOutput.executiveSummary).toBe('string');
            expect(formattedOutput.executiveSummary.length).toBeGreaterThan(100); // Substantial content for executives
            
            // Professional document structure suitable for board presentation
            expect(formattedOutput.comparisonTable).toBeDefined();
            expect(formattedOutput.comparisonTable.headers).toBeDefined();
            expect(Array.isArray(formattedOutput.comparisonTable.headers)).toBe(true);
            expect(formattedOutput.comparisonTable.headers.length).toBeGreaterThan(0);
            
            expect(formattedOutput.tradeoffSummary).toBeDefined();
            expect(formattedOutput.tradeoffSummary.title).toBeTruthy();
            expect(Array.isArray(formattedOutput.tradeoffSummary.keyDecisionFactors)).toBe(true);
            
            // Interpretation guidance essential for board-level understanding
            expect(formattedOutput.interpretationGuidance).toBeDefined();
            expect(formattedOutput.interpretationGuidance.title).toBeTruthy();
            expect(Array.isArray(formattedOutput.interpretationGuidance.usageGuidelines)).toBe(true);
            expect(formattedOutput.interpretationGuidance.usageGuidelines.length).toBeGreaterThan(0);
            expect(Array.isArray(formattedOutput.interpretationGuidance.limitations)).toBe(true);
            expect(formattedOutput.interpretationGuidance.limitations.length).toBeGreaterThan(0);
            
            // Disclaimers required for board-level risk management
            expect(formattedOutput.disclaimers).toBeDefined();
            expect(formattedOutput.disclaimers.primaryDisclaimer).toBeTruthy();
            expect(formattedOutput.disclaimers.humanOversightRequirement).toBeTruthy();
            expect(formattedOutput.disclaimers.professionalValidationNotice).toBeTruthy();
            
            // Footer with proper attribution for formal documents
            expect(formattedOutput.footer).toBeDefined();
            expect(formattedOutput.footer.generatedBy).toBeTruthy();
            expect(formattedOutput.footer.timestamp).toBeTruthy();
            expect(formattedOutput.footer.version).toBeTruthy();
          }
        )
      );
    });

    test('Property 8b: Multi-stakeholder decision validation process support (Requirement 2.4)', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: true,
              emphasizeCompliance: false,
              includeCostAnalysis: false,
              numericFormat: 'summary' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Multi-stakeholder validation requires transparent assumptions
            expect(formattedOutput.assumptionDisclosures).toBeDefined();
            expect(Array.isArray(formattedOutput.assumptionDisclosures)).toBe(true);
            
            // Each assumption should have validation guidance for stakeholders
            formattedOutput.assumptionDisclosures.forEach(assumption => {
              expect(assumption.category).toBeTruthy();
              expect(assumption.description).toBeTruthy();
              expect(assumption.impact).toBeTruthy();
              expect(assumption.recommendation).toBeTruthy();
              expect(assumption.businessContext).toBeTruthy();
            });
            
            // Validation requirements must be explicit for multi-stakeholder review
            expect(formattedOutput.interpretationGuidance.validationRequirements).toBeDefined();
            expect(Array.isArray(formattedOutput.interpretationGuidance.validationRequirements)).toBe(true);
            expect(formattedOutput.interpretationGuidance.validationRequirements.length).toBeGreaterThan(0);
            
            // Validation requirements should mention stakeholder involvement
            const validationContent = formattedOutput.interpretationGuidance.validationRequirements.join(' ').toLowerCase();
            expect(
              validationContent.includes('stakeholder') ||
              validationContent.includes('review') ||
              validationContent.includes('approval') ||
              validationContent.includes('validation') ||
              validationContent.includes('consultation')
            ).toBe(true);
            
            // Next steps should support multi-stakeholder coordination
            expect(formattedOutput.interpretationGuidance.nextSteps).toBeDefined();
            expect(Array.isArray(formattedOutput.interpretationGuidance.nextSteps)).toBe(true);
            expect(formattedOutput.interpretationGuidance.nextSteps.length).toBeGreaterThan(0);
            
            // Conflict warnings support stakeholder alignment discussions
            if (formattedOutput.conflictWarnings.length > 0) {
              formattedOutput.conflictWarnings.forEach(conflict => {
                expect(conflict.title).toBeTruthy();
                expect(conflict.description).toBeTruthy();
                expect(Array.isArray(conflict.resolutionGuidance)).toBe(true);
                expect(Array.isArray(conflict.affectedConstraints)).toBe(true);
              });
            }
            
            // Trade-off summary supports multi-stakeholder decision discussions
            expect(formattedOutput.tradeoffSummary.recommendations).toBeDefined();
            expect(Array.isArray(formattedOutput.tradeoffSummary.recommendations)).toBe(true);
            expect(formattedOutput.tradeoffSummary.recommendations.length).toBeGreaterThan(0);
          }
        )
      );
    });

    test('Property 8c: Professional language appropriate for enterprise audiences (Requirement 10.5)', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: false,
              emphasizeCompliance: false,
              includeCostAnalysis: false,
              numericFormat: 'minimal' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Collect all text content for language analysis
            const allTextContent = [
              formattedOutput.header.title,
              formattedOutput.header.subtitle,
              formattedOutput.executiveSummary,
              formattedOutput.tradeoffSummary.title,
              ...formattedOutput.tradeoffSummary.keyDecisionFactors,
              ...formattedOutput.tradeoffSummary.recommendations,
              formattedOutput.interpretationGuidance.title,
              ...formattedOutput.interpretationGuidance.usageGuidelines,
              ...formattedOutput.interpretationGuidance.limitations,
              ...formattedOutput.interpretationGuidance.nextSteps,
              ...formattedOutput.interpretationGuidance.validationRequirements,
              formattedOutput.disclaimers.primaryDisclaimer,
              formattedOutput.disclaimers.humanOversightRequirement,
              formattedOutput.disclaimers.professionalValidationNotice,
              ...formattedOutput.disclaimers.additionalNotices,
              ...formattedOutput.assumptionDisclosures.map(a => a.description),
              ...formattedOutput.assumptionDisclosures.map(a => a.recommendation),
              ...formattedOutput.conflictWarnings.map(c => c.description),
              ...formattedOutput.conflictWarnings.flatMap(c => c.resolutionGuidance)
            ].filter(text => text && typeof text === 'string' && text.trim().length > 0);
            
            // Professional language requirements
            allTextContent.forEach(text => {
              expect(typeof text).toBe('string');
              expect(text.trim().length).toBeGreaterThan(5); // Meaningful content
              
              // Should not contain informal or unprofessional language
              const lowerText = text.toLowerCase();
              expect(lowerText).not.toContain('awesome');
              expect(lowerText).not.toContain('cool');
              expect(lowerText).not.toContain('stuff');
              expect(lowerText).not.toContain('things');
              expect(lowerText).not.toContain('gonna');
              expect(lowerText).not.toContain('wanna');
              expect(lowerText).not.toContain('kinda');
              expect(lowerText).not.toContain('sorta');
              expect(lowerText).not.toContain('yeah');
              expect(lowerText).not.toContain('nah');
              expect(lowerText).not.toContain('ok');
              expect(lowerText).not.toContain('btw');
              expect(lowerText).not.toContain('fyi');
              
              // Should not contain overly casual expressions
              expect(lowerText).not.toMatch(/\b(super|really|pretty|quite|kinda|sorta)\s+(good|bad|nice|great)\b/);
              expect(lowerText).not.toMatch(/\b(no worries|no problem|piece of cake|easy peasy)\b/);
            });
            
            // Should use professional terminology appropriate for enterprise context
            const allContentCombined = allTextContent.join(' ').toLowerCase();
            expect(
              allContentCombined.includes('analysis') ||
              allContentCombined.includes('architecture') ||
              allContentCombined.includes('security') ||
              allContentCombined.includes('organization') ||
              allContentCombined.includes('enterprise') ||
              allContentCombined.includes('requirement') ||
              allContentCombined.includes('consideration') ||
              allContentCombined.includes('strategic') ||
              allContentCombined.includes('technical') ||
              allContentCombined.includes('compliance') ||
              allContentCombined.includes('risk') ||
              allContentCombined.includes('decision') ||
              allContentCombined.includes('stakeholder') ||
              allContentCombined.includes('implementation') ||
              allContentCombined.includes('validation') ||
              allContentCombined.includes('assessment') ||
              allContentCombined.includes('evaluation') ||
              allContentCombined.includes('methodology') ||
              allContentCombined.includes('framework') ||
              allContentCombined.includes('governance')
            ).toBe(true);
            
            // Professional document structure
            expect(formattedOutput.header.title).toMatch(/^[A-Z]/); // Proper capitalization
            expect(formattedOutput.tradeoffSummary.title).toMatch(/^[A-Z]/);
            expect(formattedOutput.interpretationGuidance.title).toMatch(/^[A-Z]/);
          }
        )
      );
    });

    test('Property 8d: Consistent enterprise formatting and structure', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: true,
              emphasizeCompliance: true,
              includeCostAnalysis: true,
              numericFormat: 'detailed' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Consistent document structure for enterprise consumption
            expect(formattedOutput.header).toBeDefined();
            expect(formattedOutput.executiveSummary).toBeDefined();
            expect(formattedOutput.comparisonTable).toBeDefined();
            expect(formattedOutput.tradeoffSummary).toBeDefined();
            expect(formattedOutput.personaContent).toBeDefined();
            expect(formattedOutput.assumptionDisclosures).toBeDefined();
            expect(formattedOutput.interpretationGuidance).toBeDefined();
            expect(formattedOutput.disclaimers).toBeDefined();
            expect(formattedOutput.footer).toBeDefined();
            
            // Professional metadata in header
            expect(formattedOutput.header.documentId).toBeTruthy();
            expect(formattedOutput.header.documentId).toMatch(/^SSR-/); // Consistent ID format
            expect(formattedOutput.header.analysisDate).toBeTruthy();
            expect(formattedOutput.header.engineVersion).toBeTruthy();
            
            // Comparison table has proper enterprise structure
            expect(formattedOutput.comparisonTable.headers.length).toBeGreaterThan(3);
            expect(formattedOutput.comparisonTable.dimensionRows).toBeDefined();
            expect(Array.isArray(formattedOutput.comparisonTable.dimensionRows)).toBe(true);
            expect(formattedOutput.comparisonTable.summaryRow).toBeDefined();
            expect(formattedOutput.comparisonTable.notes).toBeDefined();
            expect(Array.isArray(formattedOutput.comparisonTable.notes)).toBe(true);
            
            // Each dimension row has complete enterprise-appropriate information
            formattedOutput.comparisonTable.dimensionRows.forEach(row => {
              expect(row.dimensionName).toBeTruthy();
              expect(row.dimensionDescription).toBeTruthy();
              expect(row.scores).toBeDefined();
              expect(row.interpretation).toBeTruthy();
              
              // Scores should be present for all architecture types
              expect(row.scores['IRM-Heavy']).toBeDefined();
              expect(row.scores['URM-Heavy']).toBeDefined();
              expect(row.scores['Hybrid']).toBeDefined();
            });
            
            // Summary row provides executive-level overview
            expect(formattedOutput.comparisonTable.summaryRow.label).toBeTruthy();
            expect(formattedOutput.comparisonTable.summaryRow.weightedScores).toBeDefined();
            expect(formattedOutput.comparisonTable.summaryRow.confidenceLevels).toBeDefined();
            expect(typeof formattedOutput.comparisonTable.summaryRow.isNearTie).toBe('boolean');
          }
        )
      );
    });

    test('Property 8e: Enterprise-appropriate disclaimers and risk communication', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: false,
              emphasizeCompliance: true,
              includeCostAnalysis: false,
              numericFormat: 'summary' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Enterprise-appropriate risk disclaimers
            expect(formattedOutput.disclaimers.primaryDisclaimer).toBeTruthy();
            expect(formattedOutput.disclaimers.primaryDisclaimer.length).toBeGreaterThan(50);
            
            // Primary disclaimer should mention decision support vs decisions
            const primaryDisclaimer = formattedOutput.disclaimers.primaryDisclaimer.toLowerCase();
            expect(
              primaryDisclaimer.includes('decision support') ||
              primaryDisclaimer.includes('not decisions') ||
              primaryDisclaimer.includes('human oversight') ||
              primaryDisclaimer.includes('professional validation')
            ).toBe(true);
            
            // Human oversight requirement appropriate for enterprise governance
            expect(formattedOutput.disclaimers.humanOversightRequirement).toBeTruthy();
            const oversightText = formattedOutput.disclaimers.humanOversightRequirement.toLowerCase();
            expect(
              oversightText.includes('human') &&
              (oversightText.includes('oversight') || oversightText.includes('judgment') || oversightText.includes('review'))
            ).toBe(true);
            
            // Professional validation notice for enterprise risk management
            expect(formattedOutput.disclaimers.professionalValidationNotice).toBeTruthy();
            const validationText = formattedOutput.disclaimers.professionalValidationNotice.toLowerCase();
            expect(
              validationText.includes('professional') ||
              validationText.includes('qualified') ||
              validationText.includes('expert') ||
              validationText.includes('validation')
            ).toBe(true);
            
            // Additional notices should be professional and enterprise-appropriate
            expect(Array.isArray(formattedOutput.disclaimers.additionalNotices)).toBe(true);
            formattedOutput.disclaimers.additionalNotices.forEach(notice => {
              expect(typeof notice).toBe('string');
              expect(notice.trim().length).toBeGreaterThan(10);
              
              // Should not contain informal language
              const lowerNotice = notice.toLowerCase();
              expect(lowerNotice).not.toContain('just');
              expect(lowerNotice).not.toContain('simply');
              expect(lowerNotice).not.toContain('basically');
              expect(lowerNotice).not.toContain('obviously');
            });
          }
        )
      );
    });

    test('Property 8f: Persona-specific enterprise communication adaptation', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const outputPreferences = {
              personaContext: PersonaContentGenerator.getPersonaContext(persona),
              includeDetailedExplanations: true,
              emphasizeCompliance: false,
              includeCostAnalysis: true,
              numericFormat: 'detailed' as const
            };
            
            const formattedOutput = formatter.formatAnalysisOutput(analysisResult, outputPreferences);
            
            // Target persona should be clearly identified in header
            expect(formattedOutput.header.targetPersona).toBeTruthy();
            if (persona === 'CISO') {
              expect(formattedOutput.header.targetPersona.toLowerCase()).toContain('chief information security officer');
            } else if (persona === 'Enterprise_Security_Architect') {
              expect(formattedOutput.header.targetPersona.toLowerCase()).toContain('enterprise security architect');
            }
            
            // Next steps should be appropriate for the target persona's enterprise role
            expect(formattedOutput.interpretationGuidance.nextSteps.length).toBeGreaterThan(0);
            const nextStepsContent = formattedOutput.interpretationGuidance.nextSteps.join(' ').toLowerCase();
            
            if (persona === 'CISO') {
              // CISO next steps should include executive and board-level activities
              expect(
                nextStepsContent.includes('executive') ||
                nextStepsContent.includes('board') ||
                nextStepsContent.includes('budget') ||
                nextStepsContent.includes('business case') ||
                nextStepsContent.includes('strategic')
              ).toBe(true);
            } else if (persona === 'Enterprise_Security_Architect') {
              // Architect next steps should include technical and implementation activities
              expect(
                nextStepsContent.includes('technical') ||
                nextStepsContent.includes('implementation') ||
                nextStepsContent.includes('integration') ||
                nextStepsContent.includes('proof-of-concept') ||
                nextStepsContent.includes('architecture')
              ).toBe(true);
            }
            
            // Persona content should be enterprise-appropriate
            expect(formattedOutput.personaContent).toBeDefined();
            expect(formattedOutput.personaContent.executiveSummary).toBeTruthy();
            expect(formattedOutput.personaContent.keyInsights).toBeDefined();
            expect(Array.isArray(formattedOutput.personaContent.keyInsights)).toBe(true);
            expect(formattedOutput.personaContent.strategicConsiderations).toBeDefined();
            expect(Array.isArray(formattedOutput.personaContent.strategicConsiderations)).toBe(true);
            
            // All persona content should use professional language
            const personaTextContent = [
              formattedOutput.personaContent.executiveSummary,
              ...formattedOutput.personaContent.keyInsights,
              ...formattedOutput.personaContent.strategicConsiderations,
              ...formattedOutput.personaContent.stakeholderGuidance,
              ...formattedOutput.personaContent.riskCompliance
            ].filter(text => text && typeof text === 'string');
            
            personaTextContent.forEach(text => {
              expect(text.trim().length).toBeGreaterThan(10);
              const lowerText = text.toLowerCase();
              expect(lowerText).not.toContain('cool');
              expect(lowerText).not.toContain('awesome');
              expect(lowerText).not.toContain('stuff');
            });
          }
        )
      );
    });
  });
});