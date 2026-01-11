/**
 * Unit tests for Decision Support Messaging System
 */

import { 
  DecisionSupportMessaging, 
  getDecisionSupportMessages, 
  generateCompleteDisclaimer,
  MessagingConfig 
} from './decision-support-messaging';
import { AnalysisResult, ArchitectureScore, TradeoffAnalysis, AssumptionDisclosure } from './types';

describe('DecisionSupportMessaging', () => {
  let messaging: DecisionSupportMessaging;
  let mockAnalysisResult: AnalysisResult;

  beforeEach(() => {
    messaging = new DecisionSupportMessaging();
    
    // Create mock analysis result
    mockAnalysisResult = {
      constraintProfile: {
        riskTolerance: 5,
        complianceStrictness: 7,
        costSensitivity: 6,
        userExperiencePriority: 4,
        operationalMaturity: 5,
        businessAgility: 6,
        inputCompleteness: true,
        assumptions: [],
      },
      architectureScores: [
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
          weightedScore: 7.2,
          confidenceLevel: 'High',
        },
      ] as ArchitectureScore[],
      detectedConflicts: [],
      tradeoffSummary: {
        keyDecisionFactors: ['compliance', 'cost'],
        primaryTradeoffs: [],
        isNearTie: false,
        nearTieThreshold: 0.5,
      } as TradeoffAnalysis,
      assumptions: [],
      interpretationGuidance: [],
      analysisTimestamp: new Date(),
      engineVersion: '1.0.0',
    };
  });

  describe('Core Disclaimer', () => {
    test('should provide core disclaimer message', () => {
      const disclaimer = messaging.getCoreDisclaimer();
      
      expect(disclaimer.type).toBe('disclaimer');
      expect(disclaimer.importance).toBe('critical');
      expect(disclaimer.alwaysShow).toBe(true);
      expect(disclaimer.content).toContain('decision support analysis, not decisions');
      expect(disclaimer.content).toContain('human oversight');
    });

    test('should provide persona-specific disclaimer variations', () => {
      const disclaimer = messaging.getCoreDisclaimer();
      
      expect(disclaimer.personaVariations?.CISO).toContain('strategic decision-making');
      expect(disclaimer.personaVariations?.Enterprise_Security_Architect).toContain('technical insights');
    });
  });

  describe('Human Oversight Messages', () => {
    test('should provide human oversight requirement message', () => {
      const oversight = messaging.getHumanOversightMessage();
      
      expect(oversight.type).toBe('human_oversight');
      expect(oversight.importance).toBe('critical');
      expect(oversight.alwaysShow).toBe(true);
      expect(oversight.content).toContain('Human oversight is required');
      expect(oversight.content).toContain('qualified security professionals');
    });

    test('should provide persona-specific oversight variations', () => {
      const oversight = messaging.getHumanOversightMessage();
      
      expect(oversight.personaVariations?.CISO).toContain('Executive review');
      expect(oversight.personaVariations?.Enterprise_Security_Architect).toContain('Technical review');
    });
  });

  describe('Uncertainty Messages', () => {
    test('should generate uncertainty messages for low confidence scores', () => {
      // Modify mock to have low confidence
      if (mockAnalysisResult.architectureScores[0]) {
        mockAnalysisResult.architectureScores[0].confidenceLevel = 'Low';
      }
      
      const uncertaintyMessages = messaging.getUncertaintyMessages(mockAnalysisResult);
      
      expect(uncertaintyMessages.length).toBeGreaterThan(0);
      expect(uncertaintyMessages[0]?.type).toBe('uncertainty');
      expect(uncertaintyMessages[0]?.content).toContain('Analysis confidence is reduced');
    });

    test('should generate uncertainty messages for near-tie situations', () => {
      // Modify mock to have near-tie
      mockAnalysisResult.tradeoffSummary.isNearTie = true;
      
      const uncertaintyMessages = messaging.getUncertaintyMessages(mockAnalysisResult);
      
      expect(uncertaintyMessages.some(msg => msg.content.includes('near-tie threshold'))).toBe(true);
      expect(uncertaintyMessages.some(msg => msg.content.includes('no clear winner'))).toBe(true);
    });

    test('should generate uncertainty messages for high-impact assumptions', () => {
      // Add high-impact assumptions
      mockAnalysisResult.assumptions = [
        {
          category: 'input',
          description: 'Test assumption',
          impact: 'high',
          recommendation: 'Validate with stakeholders',
        } as AssumptionDisclosure,
      ];
      
      const uncertaintyMessages = messaging.getUncertaintyMessages(mockAnalysisResult);
      
      expect(uncertaintyMessages.some(msg => msg.content.includes('high-impact assumptions'))).toBe(true);
    });
  });

  describe('Limitation Messages', () => {
    test('should generate general limitation messages', () => {
      const limitationMessages = messaging.getLimitationMessages(mockAnalysisResult);
      
      expect(limitationMessages.length).toBeGreaterThan(0);
      expect(limitationMessages.some(msg => msg.content.includes('generalized architecture patterns'))).toBe(true);
      expect(limitationMessages.some(msg => msg.content.includes('Regular reassessment is recommended'))).toBe(true);
    });

    test('should include technical details when configured', () => {
      const technicalMessaging = new DecisionSupportMessaging({
        verbosity: 'standard',
        includeTechnicalDetails: true,
        emphasizeLimitations: true,
      });
      
      const limitationMessages = technicalMessaging.getLimitationMessages(mockAnalysisResult);
      
      expect(limitationMessages.some(msg => msg.content.includes('weighted averages'))).toBe(true);
    });

    test('should generate conflict detection limitation when no conflicts found', () => {
      // Ensure no conflicts in mock
      mockAnalysisResult.detectedConflicts = [];
      
      const limitationMessages = messaging.getLimitationMessages(mockAnalysisResult);
      
      expect(limitationMessages.some(msg => msg.content.includes('No constraint conflicts were automatically detected'))).toBe(true);
    });
  });

  describe('Message Formatting', () => {
    test('should format messages with appropriate placement and styling', () => {
      const messages = messaging.getMessagesForAnalysis(mockAnalysisResult);
      
      expect(messages.length).toBeGreaterThan(0);
      
      // Check that disclaimer messages have header placement
      const disclaimerMessages = messages.filter(msg => msg.styleHint.includes('disclaimer'));
      expect(disclaimerMessages.some(msg => msg.placement === 'header')).toBe(true);
      
      // Check that limitation messages have footer placement
      const limitationMessages = messages.filter(msg => msg.styleHint.includes('limitation'));
      expect(limitationMessages.some(msg => msg.placement === 'footer')).toBe(true);
    });

    test('should sort messages by priority', () => {
      const messages = messaging.getMessagesForAnalysis(mockAnalysisResult);
      
      // Check that messages are sorted by priority (lower numbers first)
      for (let i = 1; i < messages.length; i++) {
        const currentMsg = messages[i];
        const prevMsg = messages[i - 1];
        if (currentMsg && prevMsg) {
          expect(currentMsg.priority).toBeGreaterThanOrEqual(prevMsg.priority);
        }
      }
    });
  });

  describe('Configuration Options', () => {
    test('should respect verbosity configuration', () => {
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
      
      const minimalMessaging = new DecisionSupportMessaging(minimalConfig);
      const comprehensiveMessaging = new DecisionSupportMessaging(comprehensiveConfig);
      
      const minimalMessages = minimalMessaging.getMessagesForAnalysis(mockAnalysisResult);
      const comprehensiveMessages = comprehensiveMessaging.getMessagesForAnalysis(mockAnalysisResult);
      
      expect(comprehensiveMessages.length).toBeGreaterThan(minimalMessages.length);
    });

    test('should use persona-specific content when configured', () => {
      const cisoConfig: MessagingConfig = {
        verbosity: 'standard',
        targetPersona: 'CISO',
        includeTechnicalDetails: false,
        emphasizeLimitations: true,
      };
      
      const cisoMessaging = new DecisionSupportMessaging(cisoConfig);
      const messages = cisoMessaging.getMessagesForAnalysis(mockAnalysisResult);
      
      // Should use CISO-specific content where available
      expect(messages.some(msg => msg.content.includes('strategic decision-making'))).toBe(true);
    });
  });

  describe('Disclaimer and Footer Generation', () => {
    test('should generate complete disclaimer block', () => {
      const disclaimerBlock = messaging.generateDisclaimerBlock(mockAnalysisResult);
      
      expect(disclaimerBlock).toContain('DECISION SUPPORT SYSTEM');
      expect(disclaimerBlock).toContain('IMPORTANT DISCLAIMERS');
      expect(disclaimerBlock).toContain('decision support analysis, not decisions');
      expect(disclaimerBlock).toContain('Human oversight is required');
    });

    test('should generate footer notices', () => {
      const footerNotices = messaging.generateFooterNotices(mockAnalysisResult);
      
      expect(footerNotices).toContain('IMPORTANT LIMITATIONS AND REQUIREMENTS');
      expect(footerNotices).toContain('generalized architecture patterns');
    });
  });

  describe('Utility Functions', () => {
    test('getDecisionSupportMessages utility should work', () => {
      const messages = getDecisionSupportMessages(mockAnalysisResult);
      
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(msg => msg.styleHint.includes('disclaimer'))).toBe(true);
    });

    test('generateCompleteDisclaimer utility should work', () => {
      const disclaimer = generateCompleteDisclaimer(mockAnalysisResult);
      
      expect(disclaimer).toContain('DECISION SUPPORT SYSTEM');
      expect(disclaimer).toContain('decision support analysis, not decisions');
    });

    test('utility functions should work with custom config', () => {
      const config: MessagingConfig = {
        verbosity: 'minimal',
        targetPersona: 'CISO',
        includeTechnicalDetails: false,
        emphasizeLimitations: false,
      };
      
      const messages = getDecisionSupportMessages(mockAnalysisResult, config);
      const disclaimer = generateCompleteDisclaimer(mockAnalysisResult, config);
      
      expect(messages.length).toBeGreaterThan(0);
      expect(disclaimer).toContain('strategic decision-making');
    });
  });

  describe('Edge Cases', () => {
    test('should handle analysis with multiple low confidence scores', () => {
      const baseScore = mockAnalysisResult.architectureScores[0];
      if (baseScore) {
        mockAnalysisResult.architectureScores = [
          { ...baseScore, confidenceLevel: 'Low' },
          { ...baseScore, architectureType: 'URM-Heavy', confidenceLevel: 'Low' },
        ];
      }
      
      const messages = messaging.getMessagesForAnalysis(mockAnalysisResult);
      
      expect(messages.some(msg => msg.content.includes('IRM-Heavy, URM-Heavy'))).toBe(true);
    });

    test('should handle analysis with no assumptions', () => {
      mockAnalysisResult.assumptions = [];
      
      const messages = messaging.getMessagesForAnalysis(mockAnalysisResult);
      
      // Should still generate core messages
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(msg => msg.content.includes('decision support analysis'))).toBe(true);
    });

    test('should handle empty analysis result gracefully', () => {
      const emptyResult: AnalysisResult = {
        ...mockAnalysisResult,
        architectureScores: [],
        detectedConflicts: [],
        assumptions: [],
      };
      
      const messages = messaging.getMessagesForAnalysis(emptyResult);
      
      // Should still generate core disclaimer and oversight messages
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(msg => msg.styleHint.includes('disclaimer'))).toBe(true);
      expect(messages.some(msg => msg.styleHint.includes('oversight'))).toBe(true);
    });
  });
});