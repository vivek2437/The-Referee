/**
 * Property-based tests for decision support messaging
 * Feature: securestack-referee, Property 5: Decision Support Messaging
 * Validates: Requirements 1.7, 9.1
 */

import fc from 'fast-check';
import { DecisionSupportMessaging, MessagingConfig } from './decision-support-messaging';
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

describe('Property-Based Tests: Decision Support Messaging', () => {
  /**
   * Property 5: Decision Support Messaging
   * For any system output, the analysis shall explicitly state that it provides decision support 
   * rather than decisions and require human oversight.
   * Validates: Requirements 1.7, 9.1
   */
  describe('Property 5: Decision Support Messaging', () => {
    
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
    
    // Generator for complete analysis results
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

    // Generator for messaging configurations
    const messagingConfig = fc.record({
      verbosity: fc.constantFrom('minimal', 'standard', 'comprehensive'),
      targetPersona: fc.option(fc.constantFrom('CISO', 'Enterprise_Security_Architect')),
      includeTechnicalDetails: fc.boolean(),
      emphasizeLimitations: fc.boolean(),
    }) as fc.Arbitrary<MessagingConfig>;

    test('Property 5a: All system outputs explicitly state decision support nature', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Get all messages generated by the system
          const allMessages = messaging.getMessagesForAnalysis(result);
          const disclaimerBlock = messaging.generateDisclaimerBlock(result);
          const footerNotices = messaging.generateFooterNotices(result);
          
          // Combine all textual outputs
          const allContent = [
            disclaimerBlock,
            footerNotices,
            ...allMessages.map(msg => msg.content),
          ].join(' ').toLowerCase();
          
          // Requirement 1.7: Must explicitly state decision support nature
          // Allow for various phrasings including persona-specific variations
          const decisionSupportPatterns = [
            /decision support/i,
            /supports.*decision.*making/i,
            /provides.*support.*not.*decision/i,
            /analysis.*support/i,
            /does not replace.*judgment/i,
            /supports.*process.*does not replace/i,
          ];
          
          const hasDecisionSupportStatement = decisionSupportPatterns.some(pattern => 
            pattern.test(allContent)
          );
          
          expect(hasDecisionSupportStatement).toBe(true);
          
          // Should not claim to make final decisions
          const decisionMakingClaims = [
            /(?:this|system|analysis).*(?:makes|provides|gives).*(?:the|final|ultimate).*decision(?:\s+for\s+you|\s+automatically)/i,
            /(?:final|ultimate|definitive)\s+decision.*(?:is|will\s+be).*(?:irm|urm|hybrid)/i,
            /(?:system|analysis).*(?:decides|determines|concludes).*(?:that|which).*(?:you|organization).*(?:must|should).*(?:choose|select|implement).*(?:irm|urm|hybrid)/i,
            /(?:we|system).*(?:recommend|suggest).*(?:that|you).*(?:choose|select|implement).*(?:irm|urm|hybrid)/i,
            /(?:this|system|analysis).*(?:makes|provides).*(?:final|ultimate|definitive).*(?:decision|choice|recommendation)/i,
          ];
          
          decisionMakingClaims.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 5b: All system outputs require human oversight', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Get all messages generated by the system
          const allMessages = messaging.getMessagesForAnalysis(result);
          const disclaimerBlock = messaging.generateDisclaimerBlock(result);
          const footerNotices = messaging.generateFooterNotices(result);
          
          // Combine all textual outputs
          const allContent = [
            disclaimerBlock,
            footerNotices,
            ...allMessages.map(msg => msg.content),
          ].join(' ').toLowerCase();
          
          // Requirement 9.1: Must require human oversight
          // Allow for various phrasings including persona-specific variations
          const humanOversightPatterns = [
            /human oversight/i,
            /human.*(?:review|validation|judgment)/i,
            /professional.*(?:review|validation|oversight)/i,
            /qualified.*(?:professional|expert|architect).*(?:review|validation)/i,
            /executive.*(?:review|judgment)/i,
            /stakeholder.*(?:consultation|alignment)/i,
            /board.*level.*review/i,
            /technical.*review/i,
            /requires.*(?:human|professional|expert|executive).*(?:oversight|review|validation|judgment)/i,
          ];
          
          const hasHumanOversightRequirement = humanOversightPatterns.some(pattern => 
            pattern.test(allContent)
          );
          
          expect(hasHumanOversightRequirement).toBe(true);
          
          // Should not suggest automated decision-making
          const automatedDecisionPatterns = [
            /(?:automatically|system).*(?:decides|determines|selects|chooses).*(?:architecture|option).*(?:for you)/i,
            /no.*(?:human|manual).*(?:intervention|review).*(?:needed|required).*(?:for|to make).*(?:decision|choice)/i,
            /(?:fully|completely).*automated.*(?:decision|selection).*(?:process|system)/i,
          ];
          
          automatedDecisionPatterns.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 5c: Core disclaimer always contains decision support and human oversight statements', () => {
      fc.assert(
        fc.property(messagingConfig, (config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Get core disclaimer message
          const coreDisclaimer = messaging.getCoreDisclaimer();
          const disclaimerContent = coreDisclaimer.content.toLowerCase();
          
          // Must contain decision support statement (Requirement 1.7)
          expect(disclaimerContent).toMatch(/decision support.*not.*decision/i);
          
          // Must contain human oversight requirement (Requirement 9.1)
          expect(disclaimerContent).toMatch(/human oversight/i);
          
          // Should be marked as critical and always shown
          expect(coreDisclaimer.importance).toBe('critical');
          expect(coreDisclaimer.alwaysShow).toBe(true);
          
          // Check persona variations also contain required elements
          if (coreDisclaimer.personaVariations) {
            Object.values(coreDisclaimer.personaVariations).forEach(variation => {
              if (variation) {
                const variationContent = variation.toLowerCase();
                // Persona variations should also emphasize decision support nature
                const hasDecisionSupportConcept = 
                  variationContent.includes('decision') || 
                  variationContent.includes('analysis') ||
                  variationContent.includes('support');
                expect(hasDecisionSupportConcept).toBe(true);
              }
            });
          }
        })
      );
    });

    test('Property 5d: Human oversight message always requires professional validation', () => {
      fc.assert(
        fc.property(messagingConfig, (config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Get human oversight message
          const oversightMessage = messaging.getHumanOversightMessage();
          const oversightContent = oversightMessage.content.toLowerCase();
          
          // Must require human oversight (Requirement 9.1)
          expect(oversightContent).toMatch(/human oversight.*required/i);
          
          // Must mention qualified professionals
          expect(oversightContent).toMatch(/qualified.*(?:security|professional)/i);
          
          // Should be marked as critical and always shown
          expect(oversightMessage.importance).toBe('critical');
          expect(oversightMessage.alwaysShow).toBe(true);
          
          // Check persona variations also contain oversight requirements
          if (oversightMessage.personaVariations) {
            Object.values(oversightMessage.personaVariations).forEach(variation => {
              if (variation) {
                const variationContent = variation.toLowerCase();
                // Should emphasize review/validation requirements
                const hasOversightConcept = 
                  variationContent.includes('review') || 
                  variationContent.includes('validation') ||
                  variationContent.includes('oversight');
                expect(hasOversightConcept).toBe(true);
              }
            });
          }
        })
      );
    });

    test('Property 5e: Disclaimer block prominently displays decision support and oversight requirements', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Generate disclaimer block
          const disclaimerBlock = messaging.generateDisclaimerBlock(result);
          const blockContent = disclaimerBlock.toLowerCase();
          
          // Must contain header identifying it as decision support system
          expect(blockContent).toMatch(/decision support system/i);
          
          // Must contain decision support statement (Requirement 1.7)
          // Allow for persona-specific variations
          const decisionSupportPatterns = [
            /decision support.*not.*decision/i,
            /supports.*decision.*making.*does not replace/i,
            /analysis.*supports.*does not replace/i,
            /provides.*support.*not.*replace/i,
            /provides.*insights.*requires.*integration/i,
            /comparative analysis.*provides.*insights/i,
            /technical insights.*inform.*decisions.*requires/i,
          ];
          
          const hasDecisionSupportStatement = decisionSupportPatterns.some(pattern => 
            pattern.test(blockContent)
          );
          expect(hasDecisionSupportStatement).toBe(true);
          
          // Must contain human oversight requirement (Requirement 9.1)
          // Allow for persona-specific variations
          const oversightPatterns = [
            /human oversight.*required/i,
            /executive.*(?:review|judgment)/i,
            /stakeholder.*(?:consultation|alignment)/i,
            /professional.*validation/i,
            /technical.*review/i,
            /board.*level.*review/i,
            /technical review.*senior architects.*validation.*implementation teams.*required/i,
            /review.*senior architects.*validation/i,
            /validation.*implementation teams.*required/i,
          ];
          
          const hasOversightRequirement = oversightPatterns.some(pattern => 
            pattern.test(blockContent)
          );
          expect(hasOversightRequirement).toBe(true);
          
          // Should be prominently formatted with visual separators
          expect(disclaimerBlock).toMatch(/={10,}/); // Contains separator lines
          expect(disclaimerBlock).toMatch(/DECISION SUPPORT SYSTEM/); // Contains header
          expect(disclaimerBlock).toMatch(/IMPORTANT DISCLAIMERS/); // Contains disclaimer label
        })
      );
    });

    test('Property 5f: All message types maintain decision support boundaries', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Get all different types of messages
          const uncertaintyMessages = messaging.getUncertaintyMessages(result);
          const limitationMessages = messaging.getLimitationMessages(result);
          const validationMessage = messaging.getValidationRequirementMessage();
          const professionalGuidanceMessage = messaging.getProfessionalGuidanceMessage();
          
          const allMessages = [
            ...uncertaintyMessages,
            ...limitationMessages,
            validationMessage,
            professionalGuidanceMessage,
          ];
          
          allMessages.forEach(message => {
            const messageContent = message.content.toLowerCase();
            
            // Should not contain decision-making language
            const decisionMakingPatterns = [
              /(?:this|system|analysis).*(?:decides|determines|concludes).*(?:that|you|should).*(?:choose|select|implement)/i,
              /(?:final|ultimate|definitive).*(?:answer|solution|choice).*(?:is|will be)/i,
              /(?:automatically|system).*(?:selects|chooses|picks).*(?:architecture|option)/i,
            ];
            
            decisionMakingPatterns.forEach(pattern => {
              expect(messageContent.match(pattern)).toBeNull();
            });
            
            // Should emphasize human involvement where appropriate
            if (message.type === 'validation_requirement' || message.type === 'professional_guidance') {
              const hasHumanInvolvement = 
                messageContent.includes('professional') ||
                messageContent.includes('validation') ||
                messageContent.includes('review') ||
                messageContent.includes('oversight') ||
                messageContent.includes('consultant') ||
                messageContent.includes('architect') ||
                messageContent.includes('counsel') ||
                messageContent.includes('stakeholder') ||
                messageContent.includes('qualified') ||
                messageContent.includes('engaging');
              expect(hasHumanInvolvement).toBe(true);
            }
          });
        })
      );
    });

    test('Property 5g: Messaging configuration does not compromise decision support boundaries', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Test that regardless of configuration, core requirements are met
          const allMessages = messaging.getMessagesForAnalysis(result);
          const disclaimerBlock = messaging.generateDisclaimerBlock(result);
          
          // Even with minimal verbosity, should contain core decision support statement
          const allContent = [disclaimerBlock, ...allMessages.map(msg => msg.content)].join(' ').toLowerCase();
          
          // Core requirements must be present regardless of configuration
          // Allow for persona-specific variations
          const decisionSupportPatterns = [
            /decision support/i,
            /supports.*decision.*making/i,
            /analysis.*supports/i,
            /does not replace/i,
          ];
          
          const hasDecisionSupport = decisionSupportPatterns.some(pattern => 
            pattern.test(allContent)
          );
          expect(hasDecisionSupport).toBe(true);
          
          const oversightPatterns = [
            /human oversight/i,
            /executive.*(?:review|judgment)/i,
            /stakeholder.*(?:consultation|alignment)/i,
            /professional.*validation/i,
            /technical.*review/i,
            /board.*level.*review/i,
          ];
          
          const hasOversight = oversightPatterns.some(pattern => 
            pattern.test(allContent)
          );
          expect(hasOversight).toBe(true);
          
          // Critical messages should always be included
          const criticalMessages = allMessages.filter(msg => 
            msg.styleHint.includes('disclaimer') || msg.styleHint.includes('oversight')
          );
          expect(criticalMessages.length).toBeGreaterThan(0);
          
          // Disclaimer block should always contain required elements
          expect(disclaimerBlock).toMatch(/decision support/i);
          const disclaimerHasOversight = oversightPatterns.some(pattern => 
            pattern.test(disclaimerBlock.toLowerCase())
          );
          expect(disclaimerHasOversight).toBe(true);
        })
      );
    });

    test('Property 5h: Footer notices reinforce decision support and validation requirements', () => {
      fc.assert(
        fc.property(analysisResult, messagingConfig, (result, config) => {
          const messaging = new DecisionSupportMessaging(config);
          
          // Generate footer notices
          const footerNotices = messaging.generateFooterNotices(result);
          
          if (footerNotices.length > 0) {
            const footerContent = footerNotices.toLowerCase();
            
            // Should contain validation requirements (allow for various phrasings)
            const validationPatterns = [
              /validation/i,
              /professional/i,
              /review/i,
              /organizational context/i,
              /stakeholder/i,
              /assessment/i,
              /consultant/i,
            ];
            
            const hasValidationRequirement = validationPatterns.some(pattern => 
              pattern.test(footerContent)
            );
            expect(hasValidationRequirement).toBe(true);
            
            // Should not contain decision-making claims
            const decisionMakingClaims = [
              /(?:this|analysis).*(?:decides|determines|concludes).*(?:that|you).*(?:should|must).*(?:choose|select|implement)/i,
              /(?:final|definitive).*(?:answer|decision|solution).*(?:is|will be).*(?:irm|urm|hybrid)/i,
            ];
            
            decisionMakingClaims.forEach(pattern => {
              expect(footerContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });
  });
});