/**
 * Property-based tests for persona-appropriate content
 * Feature: securestack-referee, Property 7: Persona-Appropriate Content
 * Validates: Requirements 2.1, 2.2
 */

import fc from 'fast-check';
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
  ConfidenceLevel
} from './types';

describe('Property-Based Tests: Persona-Appropriate Content', () => {
  const generator = new PersonaContentGenerator();

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

  const conflictWarningGen = fc.record({
    conflictId: fc.string(),
    title: fc.string(),
    description: fc.string(),
    implications: fc.array(fc.string()),
    resolutionSuggestions: fc.array(fc.string()),
    triggeringConstraints: fc.record({}),
  }) as fc.Arbitrary<ConflictWarning>;

  const tradeoffAnalysisGen = fc.record({
    keyDecisionFactors: fc.array(fc.string()),
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
      description: fc.string(),
      architectureImpacts: fc.record({
        'IRM-Heavy': fc.string(),
        'URM-Heavy': fc.string(),
        'Hybrid': fc.string(),
      }),
    })),
    isNearTie: fc.boolean(),
    nearTieThreshold: fc.float({ min: 0, max: 1 }),
  }) as fc.Arbitrary<TradeoffAnalysis>;

  const assumptionDisclosureGen = fc.record({
    category: fc.constantFrom('input', 'calculation', 'interpretation'),
    description: fc.string(),
    impact: fc.constantFrom('low', 'medium', 'high'),
    recommendation: fc.string(),
  }) as fc.Arbitrary<AssumptionDisclosure>;

  const analysisResultGen = fc.record({
    constraintProfile: constraintProfileGen,
    architectureScores: fc.array(architectureScoreGen, { minLength: 3, maxLength: 3 }), // Always 3 architectures
    detectedConflicts: fc.array(conflictWarningGen, { maxLength: 5 }),
    tradeoffSummary: tradeoffAnalysisGen,
    assumptions: fc.array(assumptionDisclosureGen, { maxLength: 10 }),
    interpretationGuidance: fc.array(fc.string()),
    analysisTimestamp: fc.date(),
    engineVersion: fc.string(),
  }) as fc.Arbitrary<AnalysisResult>;

  const personaContextGen = (persona: UserPersona) => fc.constant({
    persona,
    responsibilities: [
      'Strategic security decision authority',
      'Security budget management',
      'Board and executive reporting'
    ],
    painPoints: [
      'Justifying architecture decisions with data',
      'Communicating trade-offs to non-technical stakeholders'
    ],
    successCriteria: [
      'Defensible recommendations backed by analysis',
      'Improved stakeholder confidence'
    ]
  }) as fc.Arbitrary<PersonaContext>;

  /**
   * Property 7: Persona-Appropriate Content
   * For any selected user persona, the system output shall include content relevant 
   * to that persona's responsibilities and decision-making context.
   * Validates: Requirements 2.1, 2.2
   */
  describe('Property 7: Persona-Appropriate Content', () => {
    test('Property 7a: CISO content includes strategic and budget considerations', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          personaContextGen('CISO'),
          (analysisResult, personaContext) => {
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Requirement 2.1: CISO strategic security decision authority and budget responsibility
            expect(content.executiveSummary).toBeTruthy();
            expect(typeof content.executiveSummary).toBe('string');
            expect(content.executiveSummary.length).toBeGreaterThan(50); // Substantial content
            
            // CISO-specific content should include budget implications
            expect(content.budgetImplications).toBeDefined();
            expect(Array.isArray(content.budgetImplications)).toBe(true);
            expect(content.budgetImplications!.length).toBeGreaterThan(0);
            
            // Budget content should mention cost, investment, or budget-related terms
            const budgetContent = content.budgetImplications!.join(' ').toLowerCase();
            expect(
              budgetContent.includes('cost') ||
              budgetContent.includes('budget') ||
              budgetContent.includes('investment') ||
              budgetContent.includes('efficiency')
            ).toBe(true);
            
            // Strategic considerations should be present
            expect(content.strategicConsiderations).toBeDefined();
            expect(Array.isArray(content.strategicConsiderations)).toBe(true);
            expect(content.strategicConsiderations.length).toBeGreaterThan(0);
            
            // Strategic content should mention strategic, board, or executive terms
            const strategicContent = content.strategicConsiderations.join(' ').toLowerCase();
            expect(
              strategicContent.includes('strategic') ||
              strategicContent.includes('board') ||
              strategicContent.includes('executive') ||
              strategicContent.includes('roadmap')
            ).toBe(true);
            
            // Should NOT include technical implementation details (architect-specific)
            expect(content.technicalConsiderations).toBeUndefined();
          }
        )
      );
    });

    test('Property 7b: Enterprise Architect content includes technical and stakeholder considerations', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          personaContextGen('Enterprise_Security_Architect'),
          (analysisResult, personaContext) => {
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Requirement 2.2: Enterprise Architect technical architecture design and stakeholder management
            expect(content.executiveSummary).toBeTruthy();
            expect(typeof content.executiveSummary).toBe('string');
            expect(content.executiveSummary.length).toBeGreaterThan(50); // Substantial content
            
            // Architect-specific content should include technical considerations
            expect(content.technicalConsiderations).toBeDefined();
            expect(Array.isArray(content.technicalConsiderations)).toBe(true);
            expect(content.technicalConsiderations!.length).toBeGreaterThan(0);
            
            // Technical content should mention implementation, integration, or technical terms
            const technicalContent = content.technicalConsiderations!.join(' ').toLowerCase();
            expect(
              technicalContent.includes('implementation') ||
              technicalContent.includes('integration') ||
              technicalContent.includes('technical') ||
              technicalContent.includes('architecture') ||
              technicalContent.includes('platform')
            ).toBe(true);
            
            // Stakeholder guidance should be present for cross-functional coordination
            expect(content.stakeholderGuidance).toBeDefined();
            expect(Array.isArray(content.stakeholderGuidance)).toBe(true);
            expect(content.stakeholderGuidance.length).toBeGreaterThan(0);
            
            // Should NOT include budget implications (CISO-specific)
            expect(content.budgetImplications).toBeUndefined();
          }
        )
      );
    });

    test('Property 7c: All personas receive core content sections', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const personaContext = PersonaContentGenerator.getPersonaContext(persona);
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Core sections that all personas should receive
            expect(content.executiveSummary).toBeTruthy();
            expect(content.keyInsights).toBeDefined();
            expect(Array.isArray(content.keyInsights)).toBe(true);
            expect(content.keyInsights.length).toBeGreaterThan(0);
            
            expect(content.strategicConsiderations).toBeDefined();
            expect(Array.isArray(content.strategicConsiderations)).toBe(true);
            expect(content.strategicConsiderations.length).toBeGreaterThan(0);
            
            expect(content.stakeholderGuidance).toBeDefined();
            expect(Array.isArray(content.stakeholderGuidance)).toBe(true);
            expect(content.stakeholderGuidance.length).toBeGreaterThan(0);
            
            expect(content.riskCompliance).toBeDefined();
            expect(Array.isArray(content.riskCompliance)).toBe(true);
            expect(content.riskCompliance.length).toBeGreaterThan(0);
          }
        )
      );
    });

    test('Property 7d: Content reflects persona-specific responsibilities', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const personaContext = PersonaContentGenerator.getPersonaContext(persona);
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Content should reflect the persona's specific responsibilities
            const allContent = [
              content.executiveSummary,
              ...content.keyInsights,
              ...content.strategicConsiderations,
              ...content.stakeholderGuidance,
              ...content.riskCompliance,
              ...(content.budgetImplications || []),
              ...(content.technicalConsiderations || [])
            ].join(' ').toLowerCase();
            
            if (persona === 'CISO') {
              // CISO content should reflect strategic and budget responsibilities
              expect(
                allContent.includes('budget') ||
                allContent.includes('strategic') ||
                allContent.includes('board') ||
                allContent.includes('executive') ||
                allContent.includes('cost') ||
                allContent.includes('investment')
              ).toBe(true);
            } else if (persona === 'Enterprise_Security_Architect') {
              // Architect content should reflect technical and implementation responsibilities
              expect(
                allContent.includes('technical') ||
                allContent.includes('implementation') ||
                allContent.includes('integration') ||
                allContent.includes('architecture') ||
                allContent.includes('design')
              ).toBe(true);
            }
          }
        )
      );
    });

    test('Property 7e: Content addresses persona-specific pain points', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const personaContext = PersonaContentGenerator.getPersonaContext(persona);
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Content should address the persona's known pain points
            const allContent = [
              content.executiveSummary,
              ...content.keyInsights,
              ...content.strategicConsiderations,
              ...content.stakeholderGuidance,
              ...content.riskCompliance,
              ...(content.budgetImplications || []),
              ...(content.technicalConsiderations || [])
            ].join(' ').toLowerCase();
            
            if (persona === 'CISO') {
              // CISO pain points: justifying decisions, communicating to non-technical stakeholders
              expect(
                allContent.includes('justif') ||
                allContent.includes('stakeholder') ||
                allContent.includes('board') ||
                allContent.includes('executive') ||
                allContent.includes('decision') ||
                allContent.includes('analysis')
              ).toBe(true);
            } else if (persona === 'Enterprise_Security_Architect') {
              // Architect pain points: balancing requirements, managing complexity, coordination
              expect(
                allContent.includes('balanc') ||
                allContent.includes('complex') ||
                allContent.includes('coordinat') ||
                allContent.includes('stakeholder') ||
                allContent.includes('requirement') ||
                allContent.includes('team')
              ).toBe(true);
            }
          }
        )
      );
    });

    test('Property 7f: Persona context generation is consistent and complete', () => {
      fc.assert(
        fc.property(userPersonaGen, (persona) => {
          const context = PersonaContentGenerator.getPersonaContext(persona);
          
          // Context should be complete and consistent
          expect(context.persona).toBe(persona);
          expect(context.responsibilities).toBeDefined();
          expect(Array.isArray(context.responsibilities)).toBe(true);
          expect(context.responsibilities.length).toBeGreaterThan(0);
          
          expect(context.painPoints).toBeDefined();
          expect(Array.isArray(context.painPoints)).toBe(true);
          expect(context.painPoints.length).toBeGreaterThan(0);
          
          expect(context.successCriteria).toBeDefined();
          expect(Array.isArray(context.successCriteria)).toBe(true);
          expect(context.successCriteria.length).toBeGreaterThan(0);
          
          // Content should be meaningful (not empty strings)
          context.responsibilities.forEach(responsibility => {
            expect(responsibility.trim().length).toBeGreaterThan(5);
          });
          
          context.painPoints.forEach(painPoint => {
            expect(painPoint.trim().length).toBeGreaterThan(5);
          });
          
          context.successCriteria.forEach(criterion => {
            expect(criterion.trim().length).toBeGreaterThan(5);
          });
        })
      );
    });

    test('Property 7g: Content generation is deterministic for same inputs', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const personaContext = PersonaContentGenerator.getPersonaContext(persona);
            
            const content1 = generator.generatePersonaContent(analysisResult, personaContext);
            const content2 = generator.generatePersonaContent(analysisResult, personaContext);
            
            // Same inputs should produce identical content
            expect(content1).toEqual(content2);
          }
        )
      );
    });

    test('Property 7h: Content is enterprise-appropriate and professional', () => {
      fc.assert(
        fc.property(
          analysisResultGen,
          userPersonaGen,
          (analysisResult, persona) => {
            const personaContext = PersonaContentGenerator.getPersonaContext(persona);
            const content = generator.generatePersonaContent(analysisResult, personaContext);
            
            // All content should be professional and enterprise-appropriate
            const allTextContent = [
              content.executiveSummary,
              ...content.keyInsights,
              ...content.strategicConsiderations,
              ...content.stakeholderGuidance,
              ...content.riskCompliance,
              ...(content.budgetImplications || []),
              ...(content.technicalConsiderations || [])
            ];
            
            allTextContent.forEach(text => {
              expect(typeof text).toBe('string');
              expect(text.trim().length).toBeGreaterThan(10); // Substantial content
              
              // Should not contain informal language
              const lowerText = text.toLowerCase();
              expect(lowerText).not.toContain('awesome');
              expect(lowerText).not.toContain('cool');
              expect(lowerText).not.toContain('stuff');
              expect(lowerText).not.toContain('things');
            });
            
            // At least some content should use professional terminology (not every piece)
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
              allContentCombined.includes('budget') ||
              allContentCombined.includes('implementation')
            ).toBe(true);
          }
        )
      );
    });
  });
});