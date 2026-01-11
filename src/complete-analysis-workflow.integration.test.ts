/**
 * Integration tests for complete analysis workflow
 * 
 * Tests end-to-end analysis with various constraint combinations,
 * persona-specific output generation, and conflict detection across
 * multiple constraint conflicts.
 * 
 * Requirements: All requirements
 */

import { performCompleteAnalysis, analyzeArchitectures, formatAnalysisOutput } from './index';
import { ConstraintProfileInput, UserPersona } from './types';
import { PersonaContentGenerator } from './persona-content-generator';

// Helper function to extract all text content from FormattedOutput
function extractAllTextContent(result: any): string {
  const textParts: string[] = [];
  
  // Extract text from all sections
  if (result.executiveSummary) textParts.push(result.executiveSummary);
  if (result.disclaimers?.primaryDisclaimer) textParts.push(result.disclaimers.primaryDisclaimer);
  if (result.disclaimers?.additionalNotices) textParts.push(...result.disclaimers.additionalNotices);
  if (result.personaContent?.executiveSummary) textParts.push(result.personaContent.executiveSummary);
  if (result.personaContent?.keyInsights) textParts.push(...result.personaContent.keyInsights);
  if (result.personaContent?.strategicConsiderations) textParts.push(...result.personaContent.strategicConsiderations);
  
  return textParts.join(' ');
}

describe('Complete Analysis Workflow Integration Tests', () => {
  
  /**
   * Test end-to-end analysis with various constraint combinations
   */
  describe('End-to-End Analysis with Various Constraint Combinations', () => {
    
    it('should handle high compliance + low cost conflict scenario', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 2,        // Low risk tolerance
        complianceStrictness: 9, // High compliance
        costSensitivity: 9,      // High cost sensitivity (conflict!)
        userExperiencePriority: 5,
        operationalMaturity: 6,
        businessAgility: 4,
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should detect the compliance vs cost conflict
      expect(result.conflictWarnings.length).toBeGreaterThan(0);
      expect(result.conflictWarnings.some(warning => 
        warning.description.toLowerCase().includes('compliance') &&
        warning.description.toLowerCase().includes('cost')
      )).toBe(true);
      
      // Should have complete output structure
      expect(result.comparisonTable).toBeDefined();
      expect(result.tradeoffSummary).toBeDefined();
      expect(result.assumptionDisclosures).toBeDefined();
      expect(result.interpretationGuidance).toBeDefined();
      
      // Should include all three architectures
      expect(result.comparisonTable.summaryRow.weightedScores).toHaveProperty('IRM-Heavy');
      expect(result.comparisonTable.summaryRow.weightedScores).toHaveProperty('URM-Heavy');
      expect(result.comparisonTable.summaryRow.weightedScores).toHaveProperty('Hybrid');
    });
    
    it('should handle low risk tolerance + high UX priority conflict', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 2,        // Low risk tolerance
        complianceStrictness: 6,
        costSensitivity: 5,
        userExperiencePriority: 9, // High UX priority (conflict!)
        operationalMaturity: 7,
        businessAgility: 6,
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should detect the risk vs UX conflict
      expect(result.conflictWarnings.length).toBeGreaterThan(0);
      expect(result.conflictWarnings.some(warning => 
        (warning.description.toLowerCase().includes('risk') || 
         warning.description.toLowerCase().includes('security')) &&
        (warning.description.toLowerCase().includes('user experience') ||
         warning.description.toLowerCase().includes('ux'))
      )).toBe(true);
      
      // Should provide balanced analysis
      expect(result.tradeoffSummary.primaryTradeoffs.length).toBeGreaterThan(0);
    });
    
    it('should handle high agility + low maturity conflict', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 5,
        complianceStrictness: 4,
        costSensitivity: 6,
        userExperiencePriority: 7,
        operationalMaturity: 3,  // Low maturity
        businessAgility: 9,      // High agility (conflict!)
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should detect the maturity vs agility conflict
      expect(result.conflictWarnings.length).toBeGreaterThan(0);
      // Check for any conflict that mentions both agility and maturity/capability concepts
      const hasAgilityMaturityConflict = result.conflictWarnings.some(warning => 
        (warning.description.toLowerCase().includes('agility') ||
         warning.description.toLowerCase().includes('business') ||
         warning.description.toLowerCase().includes('rapid')) &&
        (warning.description.toLowerCase().includes('maturity') ||
         warning.description.toLowerCase().includes('capability') ||
         warning.description.toLowerCase().includes('operational'))
      );
      expect(hasAgilityMaturityConflict).toBe(true);
    });
    
    it('should handle balanced constraints without conflicts', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should have minimal or no conflicts
      expect(result.conflictWarnings.length).toBeLessThanOrEqual(1);
      
      // Should still provide complete analysis
      expect(result.comparisonTable.dimensionRows.length).toBe(7); // All 7 dimensions
      expect(result.tradeoffSummary.primaryTradeoffs.length).toBeGreaterThan(0);
    });
    
    it('should handle missing inputs with explicit assumptions', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 3,
        complianceStrictness: 8,
        // Missing other inputs
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should generate assumptions for missing inputs
      expect(result.assumptionDisclosures.length).toBeGreaterThan(0);
      expect(result.assumptionDisclosures.some(assumption => 
        assumption.description.toLowerCase().includes('default') ||
        assumption.description.toLowerCase().includes('assumed')
      )).toBe(true);
      
      // Should still provide complete analysis
      expect(result.comparisonTable).toBeDefined();
      expect(result.tradeoffSummary).toBeDefined();
    });
  });
  
  /**
   * Test persona-specific output generation
   */
  describe('Persona-Specific Output Generation', () => {
    
    const testConstraints: ConstraintProfileInput = {
      riskTolerance: 4,
      complianceStrictness: 7,
      costSensitivity: 6,
      userExperiencePriority: 5,
      operationalMaturity: 6,
      businessAgility: 7,
    };
    
    it('should generate CISO-appropriate content', async () => {
      const result = await performCompleteAnalysis(testConstraints, {
        personaContext: PersonaContentGenerator.getPersonaContext('CISO'),
      });
      
      const allContent = extractAllTextContent(result);
      
      // Should include strategic and budget-focused content
      expect(allContent.toLowerCase()).toMatch(/(strategic|budget|investment|board|executive)/);
      
      // Should be suitable for enterprise reporting
      expect(allContent).toMatch(/Security architecture|Human oversight|This system|Board reporting/); // Professional content
      expect(allContent.length).toBeGreaterThan(1000); // Substantial content
    });
    
    it('should generate Enterprise Architect-appropriate content', async () => {
      const result = await performCompleteAnalysis(testConstraints, {
        personaContext: PersonaContentGenerator.getPersonaContext('Enterprise_Security_Architect'),
      });
      
      const allContent = extractAllTextContent(result);
      
      // Should include technical and stakeholder management content
      expect(allContent.toLowerCase()).toMatch(/(technical|architecture|implementation|stakeholder)/);
      
      // Should provide detailed technical analysis
      expect(result.comparisonTable.dimensionRows.length).toBe(7);
      expect(result.tradeoffSummary.primaryTradeoffs.length).toBeGreaterThan(0);
    });
  });
  
  /**
   * Test conflict detection across multiple constraint conflicts
   */
  describe('Multiple Constraint Conflicts Detection', () => {
    
    it('should detect and explain multiple simultaneous conflicts', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 1,        // Very low risk tolerance
        complianceStrictness: 9, // High compliance
        costSensitivity: 9,      // High cost sensitivity
        userExperiencePriority: 9, // High UX priority
        operationalMaturity: 2,  // Low maturity
        businessAgility: 9,      // High agility
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // Should detect multiple conflicts
      expect(result.conflictWarnings.length).toBeGreaterThanOrEqual(2);
      
      // Each conflict should have clear explanation
      result.conflictWarnings.forEach(warning => {
        expect(warning.description).toBeDefined();
        expect(warning.description.length).toBeGreaterThan(50); // Substantial explanation
        expect(warning.severity).toMatch(/^(High|Medium|Low)$/);
      });
      
      // Should provide stakeholder alignment suggestions
      expect(result.conflictWarnings.some(warning => 
        warning.resolutionGuidance.some(guidance => 
          guidance.toLowerCase().includes('stakeholder') ||
          guidance.toLowerCase().includes('alignment')
        )
      )).toBe(true);
    });
  });
  
  /**
   * Test component integration and data flow
   */
  describe('Component Integration and Data Flow', () => {
    
    it('should properly integrate constraint processing, scoring, and formatting', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 6,
        complianceStrictness: 7,
        costSensitivity: 4,
        userExperiencePriority: 8,
        operationalMaturity: 6,
        businessAgility: 7,
      };
      
      // Test step-by-step integration
      const analysisResult = await analyzeArchitectures(constraints);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.constraintProfile).toBeDefined();
      expect(analysisResult.architectureScores).toBeDefined();
      expect(analysisResult.detectedConflicts).toBeDefined();
      
      const formattedOutput = await formatAnalysisOutput(analysisResult);
      expect(formattedOutput).toBeDefined();
      expect(formattedOutput.comparisonTable).toBeDefined();
      
      // Test complete workflow
      const completeResult = await performCompleteAnalysis(constraints);
      expect(completeResult).toBeDefined();
      
      // Results should be consistent
      expect(completeResult.comparisonTable.summaryRow.weightedScores).toEqual(
        formattedOutput.comparisonTable.summaryRow.weightedScores
      );
    });
    
    it('should maintain data consistency across all components', async () => {
      const constraints: ConstraintProfileInput = {
        riskTolerance: 3,
        complianceStrictness: 8,
        costSensitivity: 7,
        userExperiencePriority: 4,
        operationalMaturity: 6,
        businessAgility: 5,
      };
      
      const result = await performCompleteAnalysis(constraints);
      
      // All architectures should have scores
      const scores = result.comparisonTable.summaryRow.weightedScores;
      expect(typeof scores['IRM-Heavy']).toBe('number');
      expect(typeof scores['URM-Heavy']).toBe('number');
      expect(typeof scores['Hybrid']).toBe('number');
      
      // Scores should be within valid range (0-10)
      Object.values(scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });
      
      // Dimension rows should match summary
      expect(result.comparisonTable.dimensionRows.length).toBe(7);
      result.comparisonTable.dimensionRows.forEach(row => {
        expect(row.scores).toHaveProperty('IRM-Heavy');
        expect(row.scores).toHaveProperty('URM-Heavy');
        expect(row.scores).toHaveProperty('Hybrid');
      });
    });
  });
});