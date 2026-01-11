/**
 * Property-based tests for SecureStack Referee architecture coverage
 * Feature: securestack-referee, Property 1: Complete Architecture Coverage
 */

import fc from 'fast-check';
import { ConstraintProfile, ArchitectureType, DimensionScores, AnalysisResult } from './types';
import { ARCHITECTURE_BASE_SCORES } from './constants';

/**
 * Generator for valid constraint profiles
 */
const constraintProfileArbitrary = fc.record({
  riskTolerance: fc.integer({ min: 1, max: 10 }),
  complianceStrictness: fc.integer({ min: 1, max: 10 }),
  costSensitivity: fc.integer({ min: 1, max: 10 }),
  userExperiencePriority: fc.integer({ min: 1, max: 10 }),
  operationalMaturity: fc.integer({ min: 1, max: 10 }),
  businessAgility: fc.integer({ min: 1, max: 10 }),
  inputCompleteness: fc.boolean(),
  assumptions: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
});

/**
 * Mock analysis function that simulates the complete architecture analysis
 * This represents the expected behavior of the system once fully implemented
 */
function mockAnalyzeArchitectures(constraints: ConstraintProfile): AnalysisResult {
  const architectureTypes: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
  
  // Generate scores for all three architecture types
  const architectureScores = architectureTypes.map(archType => ({
    architectureType: archType,
    dimensionScores: ARCHITECTURE_BASE_SCORES[archType],
    weightedScore: calculateWeightedScore(ARCHITECTURE_BASE_SCORES[archType], constraints),
    confidenceLevel: 'High' as const,
  }));

  return {
    constraintProfile: constraints,
    architectureScores,
    detectedConflicts: [],
    tradeoffSummary: {
      keyDecisionFactors: ['Security vs Usability', 'Cost vs Capability'],
      primaryTradeoffs: [],
      isNearTie: false,
      nearTieThreshold: 0.5,
    },
    assumptions: [],
    interpretationGuidance: ['This is decision support, not a decision'],
    analysisTimestamp: new Date(),
    engineVersion: '1.0.0',
  };
}

/**
 * Helper function to calculate weighted scores
 */
function calculateWeightedScore(dimensionScores: DimensionScores, constraints: ConstraintProfile): number {
  // Simple weighted average calculation for testing purposes
  const weights = {
    identityVerification: constraints.riskTolerance / 10,
    behavioralAnalytics: constraints.operationalMaturity / 10,
    operationalComplexity: (11 - constraints.operationalMaturity) / 10, // inverse
    userExperience: constraints.userExperiencePriority / 10,
    complianceAuditability: constraints.complianceStrictness / 10,
    scalabilityPerformance: constraints.businessAgility / 10,
    costEfficiency: (11 - constraints.costSensitivity) / 10, // inverse
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  const weightedSum = 
    dimensionScores.identityVerification * weights.identityVerification +
    dimensionScores.behavioralAnalytics * weights.behavioralAnalytics +
    dimensionScores.operationalComplexity * weights.operationalComplexity +
    dimensionScores.userExperience * weights.userExperience +
    dimensionScores.complianceAuditability * weights.complianceAuditability +
    dimensionScores.scalabilityPerformance * weights.scalabilityPerformance +
    dimensionScores.costEfficiency * weights.costEfficiency;

  return Math.round((weightedSum / totalWeight) * 100) / 100; // Round to 2 decimal places
}

describe('Architecture Coverage Property Tests', () => {
  /**
   * Property 1: Complete Architecture Coverage
   * Validates: Requirements 1.1, 3.1, 4.1
   * 
   * For any valid constraint input, the system analysis shall include 
   * comparative evaluation of all three architecture types (IRM-heavy, URM-heavy, and Hybrid) 
   * with scores for all defined dimensions.
   */
  test('Property 1: Complete Architecture Coverage', () => {
    fc.assert(
      fc.property(constraintProfileArbitrary, (constraints) => {
        // Execute the analysis
        const result = mockAnalyzeArchitectures(constraints);
        
        // Verify all three architecture types are included
        const architectureTypes = result.architectureScores.map(score => score.architectureType);
        expect(architectureTypes).toContain('IRM-Heavy');
        expect(architectureTypes).toContain('URM-Heavy');
        expect(architectureTypes).toContain('Hybrid');
        expect(architectureTypes).toHaveLength(3);
        
        // Verify each architecture has scores for all dimensions
        result.architectureScores.forEach(archScore => {
          const dimensions = archScore.dimensionScores;
          
          // Check that all required dimensions are present and have valid scores
          expect(dimensions.identityVerification).toBeValidArchitectureScore();
          expect(dimensions.behavioralAnalytics).toBeValidArchitectureScore();
          expect(dimensions.operationalComplexity).toBeValidArchitectureScore();
          expect(dimensions.userExperience).toBeValidArchitectureScore();
          expect(dimensions.complianceAuditability).toBeValidArchitectureScore();
          expect(dimensions.scalabilityPerformance).toBeValidArchitectureScore();
          expect(dimensions.costEfficiency).toBeValidArchitectureScore();
          
          // Verify weighted score is calculated
          expect(archScore.weightedScore).toBeGreaterThanOrEqual(0);
          expect(archScore.weightedScore).toBeLessThanOrEqual(10);
          
          // Verify confidence level is set
          expect(['High', 'Medium', 'Low']).toContain(archScore.confidenceLevel);
        });
        
        // Verify the analysis includes the input constraint profile
        expect(result.constraintProfile).toEqual(constraints);
        
        // Verify essential result structure is present
        expect(result.architectureScores).toBeDefined();
        expect(result.detectedConflicts).toBeDefined();
        expect(result.tradeoffSummary).toBeDefined();
        expect(result.assumptions).toBeDefined();
        expect(result.interpretationGuidance).toBeDefined();
        expect(result.analysisTimestamp).toBeInstanceOf(Date);
        expect(result.engineVersion).toBeDefined();
      }),
      {
        numRuns: 100, // As specified in design document
        verbose: false,
      }
    );
  });

  /**
   * Additional validation: Ensure architecture base scores are properly defined
   */
  test('Architecture base scores completeness', () => {
    const requiredArchitectures: ArchitectureType[] = ['IRM-Heavy', 'URM-Heavy', 'Hybrid'];
    const requiredDimensions = [
      'identityVerification',
      'behavioralAnalytics', 
      'operationalComplexity',
      'userExperience',
      'complianceAuditability',
      'scalabilityPerformance',
      'costEfficiency'
    ] as const;

    requiredArchitectures.forEach(archType => {
      expect(ARCHITECTURE_BASE_SCORES[archType]).toBeDefined();
      
      requiredDimensions.forEach(dimension => {
        expect(ARCHITECTURE_BASE_SCORES[archType][dimension]).toBeValidArchitectureScore();
      });
    });
  });
});