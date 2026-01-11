/**
 * Property-based tests for content boundary compliance
 * Feature: securestack-referee, Property 4: Content Boundary Compliance
 * Validates: Requirements 1.5, 1.6, 9.2, 9.3
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

describe('Property-Based Tests: Content Boundary Compliance', () => {
  /**
   * Property 4: Content Boundary Compliance
   * For any system output, the content shall not include vendor recommendations, 
   * product guidance, compliance guarantees, or legal interpretations.
   * Validates: Requirements 1.5, 1.6, 9.2, 9.3
   */
  describe('Property 4: Content Boundary Compliance', () => {
    
    // Generator for valid constraint values (1-10 integers)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for architecture types
    const architectureType = fc.constantFrom('IRM-Heavy', 'URM-Heavy', 'Hybrid') as fc.Arbitrary<ArchitectureType>;
    
    // Generator for confidence levels
    const confidenceLevel = fc.constantFrom('High', 'Medium', 'Low') as fc.Arbitrary<ConfidenceLevel>;
    
    // Generator for safe strings that avoid vendor/product names
    const safeString = (minLength: number, maxLength: number) => 
      fc.string({ minLength, maxLength })
        .filter(str => {
          // Filter out strings that might contain vendor/product names
          const lowerStr = str.toLowerCase();
          const prohibitedTerms = [
            'microsoft', 'google', 'amazon', 'aws', 'azure', 'okta', 'ping', 
            'cyberark', 'sailpoint', 'splunk', 'ibm', 'oracle', 's3', 'ec2', 
            'lambda', 'active directory', 'office 365', 'g suite', 'workspace',
            'guarantee', 'ensures', 'compliant', 'audit', 'legal', 'law', 'mandates'
          ];
          return !prohibitedTerms.some(term => lowerStr.includes(term));
        });

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
      assumptions: fc.array(safeString(5, 50), { maxLength: 5 }),
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
      description: safeString(10, 200),
      impact: fc.constantFrom('low', 'medium', 'high'),
      recommendation: safeString(10, 100),
    }) as fc.Arbitrary<AssumptionDisclosure>;
    
    // Generator for conflict warnings
    const conflictWarning = fc.record({
      conflictId: safeString(5, 20),
      title: safeString(10, 50),
      description: safeString(20, 200),
      implications: fc.array(safeString(10, 100), { maxLength: 3 }),
      resolutionSuggestions: fc.array(safeString(10, 100), { maxLength: 3 }),
      triggeringConstraints: fc.record({
        riskTolerance: fc.option(validConstraintValue),
        complianceStrictness: fc.option(validConstraintValue),
        costSensitivity: fc.option(validConstraintValue),
      }),
    }) as fc.Arbitrary<ConflictWarning>;
    
    // Generator for tradeoff analysis
    const tradeoffAnalysis = fc.record({
      keyDecisionFactors: fc.array(safeString(10, 50), { maxLength: 5 }),
      primaryTradeoffs: fc.array(fc.record({
        dimension: fc.constantFrom(
          'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
          'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
        ),
        description: safeString(20, 100),
        architectureImpacts: fc.record({
          'IRM-Heavy': safeString(10, 50),
          'URM-Heavy': safeString(10, 50),
          'Hybrid': safeString(10, 50),
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
      tradeoffSummary: tradeoffAnalysis,
      assumptions: fc.array(assumptionDisclosure, { maxLength: 6 }),
      interpretationGuidance: fc.array(safeString(20, 100), { maxLength: 5 }),
      analysisTimestamp: fc.constant(new Date()),
      engineVersion: fc.constant('1.0.0'),
    }) as fc.Arbitrary<AnalysisResult>;

    test('Property 4a: Content validator detects vendor mentions', () => {
      fc.assert(
        fc.property(safeString(10, 500), (content) => {
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          
          // Test content with known vendor mentions
          const vendorContent = content + ' Microsoft Azure and Amazon AWS provide security solutions.';
          const result = validator.validateContent(vendorContent);
          
          // Should detect vendor mention violations (Requirement 1.5)
          const vendorViolations = result.violations.filter(v => 
            v.type === 'vendor_mention' || v.type === 'product_guidance'
          );
          
          expect(vendorViolations.length).toBeGreaterThan(0);
          expect(result.isValid).toBe(false);
          
          // Each violation should be properly categorized
          vendorViolations.forEach(violation => {
            expect(violation.description).toBeTruthy();
            expect(violation.violatingText).toBeTruthy();
            expect(violation.severity).toBe('error');
          });
        })
      );
    });

    test('Property 4b: Content validator detects compliance guarantees', () => {
      fc.assert(
        fc.property(safeString(10, 500), (content) => {
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          
          // Test content with compliance guarantee language
          const complianceContent = content + ' This architecture guarantees compliance with all regulations and will pass audit.';
          const result = validator.validateContent(complianceContent);
          
          // Should detect compliance guarantee violations (Requirement 9.2)
          const complianceViolations = result.violations.filter(v => 
            v.type === 'compliance_guarantee'
          );
          
          expect(complianceViolations.length).toBeGreaterThan(0);
          expect(result.isValid).toBe(false);
          
          // Each violation should be properly categorized
          complianceViolations.forEach(violation => {
            expect(violation.description).toBeTruthy();
            expect(violation.violatingText).toBeTruthy();
            expect(violation.severity).toBe('error');
          });
        })
      );
    });

    test('Property 4c: Content validator detects legal interpretations', () => {
      fc.assert(
        fc.property(safeString(10, 500), (content) => {
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          
          // Test content with legal interpretation language
          const legalContent = content + ' The law mandates this approach and legal advice suggests compliance is required.';
          const result = validator.validateContent(legalContent);
          
          // Should detect legal interpretation violations (Requirement 9.3)
          const legalViolations = result.violations.filter(v => 
            v.type === 'legal_interpretation'
          );
          
          expect(legalViolations.length).toBeGreaterThan(0);
          expect(result.isValid).toBe(false);
          
          // Each violation should be properly categorized
          legalViolations.forEach(violation => {
            expect(violation.description).toBeTruthy();
            expect(violation.violatingText).toBeTruthy();
            expect(violation.severity).toBe('error');
          });
        })
      );
    });

    test('Property 4d: Analysis results never contain vendor recommendations', () => {
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
          
          // Validate that no vendor mentions exist
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          const validationResult = validator.validateContent(allContent);
          
          // Should not contain any vendor mention violations (Requirement 1.5)
          const vendorViolations = validationResult.violations.filter(v => 
            v.type === 'vendor_mention' || v.type === 'product_guidance'
          );
          
          expect(vendorViolations).toHaveLength(0);
          
          // Specifically check for prohibited vendor names
          const prohibitedVendors = [
            /\b(Microsoft|Google|Amazon|AWS|Azure|Okta|Ping|CyberArk|SailPoint|Splunk|IBM|Oracle)\b/gi,
            /\b(Active Directory|Office 365|G Suite|Workspace|S3|EC2|Lambda)\b/gi,
          ];
          
          prohibitedVendors.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 4e: Analysis results never contain compliance guarantees', () => {
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
            ...result.detectedConflicts.flatMap(c => [
              c.description,
              ...c.implications,
              ...c.resolutionSuggestions
            ]),
          ].join(' ');
          
          // Validate that no compliance guarantees exist
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          const validationResult = validator.validateContent(allContent);
          
          // Should not contain any compliance guarantee violations (Requirement 9.2)
          const complianceViolations = validationResult.violations.filter(v => 
            v.type === 'compliance_guarantee'
          );
          
          expect(complianceViolations).toHaveLength(0);
          
          // Specifically check for prohibited compliance guarantee phrases
          const prohibitedComplianceLanguage = [
            /\b(guarantees compliance|ensures regulatory|meets all requirements|fully compliant)\b/gi,
            /\b(will pass audit|audit-proof|regulatory approval|compliance certification)\b/gi,
          ];
          
          prohibitedComplianceLanguage.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 4f: Analysis results never contain legal interpretations', () => {
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
            ...result.detectedConflicts.flatMap(c => [
              c.description,
              ...c.implications,
              ...c.resolutionSuggestions
            ]),
          ].join(' ');
          
          // Validate that no legal interpretations exist
          const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
          const validationResult = validator.validateContent(allContent);
          
          // Should not contain any legal interpretation violations (Requirement 9.3)
          const legalViolations = validationResult.violations.filter(v => 
            v.type === 'legal_interpretation'
          );
          
          expect(legalViolations).toHaveLength(0);
          
          // Specifically check for prohibited legal interpretation phrases
          const prohibitedLegalLanguage = [
            /\b(legally required|law mandates|regulation requires|legal obligation)\b/gi,
            /\b(legal advice|attorney|counsel|legal opinion|law firm)\b/gi,
          ];
          
          prohibitedLegalLanguage.forEach(pattern => {
            expect(allContent.match(pattern)).toBeNull();
          });
        })
      );
    });

    test('Property 4g: Conflict resolution suggestions avoid vendor-specific guidance', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test conflict resolution suggestions for vendor neutrality
          const conflictContent = result.detectedConflicts
            .map(conflict => 
              conflict.description + ' ' + 
              conflict.implications.join(' ') + ' ' + 
              conflict.resolutionSuggestions.join(' ')
            )
            .join(' ');
          
          if (conflictContent.trim().length > 0) {
            // Validate that conflict resolution doesn't contain vendor mentions
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(conflictContent);
            
            const vendorViolations = validationResult.violations.filter(v => 
              v.type === 'vendor_mention' || v.type === 'product_guidance'
            );
            
            expect(vendorViolations).toHaveLength(0);
            
            // Should not contain specific vendor or product names
            const vendorPatterns = [
              /\b(Microsoft|Google|Amazon|AWS|Azure|Okta|Ping|CyberArk|SailPoint|Splunk|IBM|Oracle)\b/gi,
              /\b(Active Directory|Office 365|G Suite|Workspace|S3|EC2|Lambda)\b/gi,
            ];
            
            vendorPatterns.forEach(pattern => {
              expect(conflictContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 4h: Assumption disclosures avoid compliance guarantees', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test assumption disclosures for compliance guarantee language
          const assumptionContent = result.assumptions
            .map(assumption => assumption.description + ' ' + assumption.recommendation)
            .join(' ');
          
          if (assumptionContent.trim().length > 0) {
            // Validate assumptions don't contain compliance guarantees
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(assumptionContent);
            
            const complianceViolations = validationResult.violations.filter(v => 
              v.type === 'compliance_guarantee'
            );
            
            expect(complianceViolations).toHaveLength(0);
            
            // Should not contain compliance guarantee language
            const compliancePatterns = [
              /\b(guarantees compliance|ensures regulatory|meets all requirements|fully compliant)\b/gi,
              /\b(will pass audit|audit-proof|regulatory approval|compliance certification)\b/gi,
            ];
            
            compliancePatterns.forEach(pattern => {
              expect(assumptionContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 4i: Tradeoff analysis maintains vendor neutrality', () => {
      fc.assert(
        fc.property(analysisResult, (result) => {
          // Test tradeoff analysis for vendor neutrality
          const tradeoffContent = result.tradeoffSummary.primaryTradeoffs
            .map(tradeoff => tradeoff.description + ' ' + Object.values(tradeoff.architectureImpacts).join(' '))
            .join(' ');
          
          if (tradeoffContent.trim().length > 0) {
            // Validate tradeoff analysis doesn't contain vendor mentions
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(tradeoffContent);
            
            const vendorViolations = validationResult.violations.filter(v => 
              v.type === 'vendor_mention' || v.type === 'product_guidance'
            );
            
            expect(vendorViolations).toHaveLength(0);
            
            // Should not contain specific vendor or product names
            const vendorPatterns = [
              /\b(Microsoft|Google|Amazon|AWS|Azure|Okta|Ping|CyberArk|SailPoint|Splunk|IBM|Oracle)\b/gi,
              /\b(Active Directory|Office 365|G Suite|Workspace|S3|EC2|Lambda)\b/gi,
            ];
            
            vendorPatterns.forEach(pattern => {
              expect(tradeoffContent.match(pattern)).toBeNull();
            });
          }
        })
      );
    });

    test('Property 4j: System consistently maintains content boundaries across all outputs', () => {
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
          
          // Test each output individually for content boundary violations
          allOutputs.forEach(output => {
            if (output && output.length > 0) {
              const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
              const validationResult = validator.validateContent(output);
              
              const boundaryViolations = validationResult.violations.filter(v => 
                v.type === 'vendor_mention' || 
                v.type === 'product_guidance' ||
                v.type === 'compliance_guarantee' ||
                v.type === 'legal_interpretation'
              );
              
              // No output should contain content boundary violations (Requirements 1.5, 1.6, 9.2, 9.3)
              expect(boundaryViolations).toHaveLength(0);
            }
          });
          
          // Test combined output as well
          const combinedOutput = allOutputs.filter(Boolean).join(' ');
          if (combinedOutput.length > 0) {
            const validator = new ContentValidator({ strictMode: true, autoSanitize: false });
            const validationResult = validator.validateContent(combinedOutput);
            
            const boundaryViolations = validationResult.violations.filter(v => 
              v.type === 'vendor_mention' || 
              v.type === 'product_guidance' ||
              v.type === 'compliance_guarantee' ||
              v.type === 'legal_interpretation'
            );
            
            expect(boundaryViolations).toHaveLength(0);
          }
        })
      );
    });

    test('Property 4k: Content sanitization properly removes boundary violations', () => {
      fc.assert(
        fc.property(safeString(10, 500), (baseContent) => {
          // Create content with known boundary violations
          const violatingContent = baseContent + 
            ' Microsoft Azure guarantees compliance with all regulations. ' +
            'The law mandates this approach and Amazon AWS is the best solution. ' +
            'This will pass audit and legal advice suggests this is required.';
          
          const validator = new ContentValidator({ strictMode: true, autoSanitize: true });
          const result = validator.validateContent(violatingContent);
          
          // Original content should have violations
          expect(result.violations.length).toBeGreaterThan(0);
          
          // Sanitized content should not contain the original violations
          const sanitizedResult = validator.validateContent(result.sanitizedContent);
          
          // Check that sanitization reduced violations significantly
          expect(sanitizedResult.violations.length).toBeLessThan(result.violations.length);
          
          // Sanitized content should not contain obvious violation patterns
          const violationPatterns = [
            /\b(Microsoft|Amazon|AWS|Azure)\b/gi,
            /\b(guarantees compliance|will pass audit|law mandates|legal advice)\b/gi,
          ];
          
          violationPatterns.forEach(pattern => {
            const originalMatches = violatingContent.match(pattern) || [];
            const sanitizedMatches = result.sanitizedContent.match(pattern) || [];
            
            // Sanitized content should have fewer matches than original
            expect(sanitizedMatches.length).toBeLessThanOrEqual(originalMatches.length);
          });
        })
      );
    });
  });
});