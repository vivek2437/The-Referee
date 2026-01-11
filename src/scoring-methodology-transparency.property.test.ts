/**
 * Property-Based Tests for Scoring Methodology Transparency
 * 
 * Feature: securestack-referee, Property 13: Transparent Scoring Methodology
 * Validates: Requirements 7.1, 10.1, 10.2
 */

import fc from 'fast-check';
import { ConstraintProfile } from './types';
import { calculateWeightedScores } from './scoring-calculator';

describe('Property 13: Transparent Scoring Methodology', () => {
  // Generator for valid constraint profiles
  const constraintProfileArb = fc.record({
    riskTolerance: fc.integer({ min: 1, max: 10 }),
    complianceStrictness: fc.integer({ min: 1, max: 10 }),
    costSensitivity: fc.integer({ min: 1, max: 10 }),
    userExperiencePriority: fc.integer({ min: 1, max: 10 }),
    operationalMaturity: fc.integer({ min: 1, max: 10 }),
    businessAgility: fc.integer({ min: 1, max: 10 }),
    inputCompleteness: fc.boolean(),
    assumptions: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
  });

  test('For any constraint profile, scoring methodology shall provide step-by-step calculation process', () => {
    fc.assert(
      fc.property(constraintProfileArb, (constraints: ConstraintProfile) => {
        const results = calculateWeightedScores(constraints);
        
        // Methodology must exist
        expect(results.methodology).toBeDefined();
        
        // Must have calculation steps
        expect(results.methodology.calculationSteps).toBeDefined();
        expect(results.methodology.calculationSteps.length).toBeGreaterThan(0);
        
        // Each step must have required fields
        results.methodology.calculationSteps.forEach((step, index) => {
          expect(step.stepNumber).toBe(index + 1);
          expect(step.description).toBeTruthy();
          expect(step.inputs).toBeDefined();
          expect(step.calculation).toBeTruthy();
          expect(step.result).toBeDefined();
          expect(step.rationale).toBeTruthy();
        });
        
        // Must explain weight influence
        expect(results.methodology.weightInfluence).toBeDefined();
        expect(results.methodology.weightInfluence.length).toBeGreaterThan(0);
        
        // Each weight influence must be complete
        results.methodology.weightInfluence.forEach(influence => {
          expect(influence.constraint).toBeTruthy();
          expect(influence.weight).toBeGreaterThanOrEqual(1);
          expect(influence.weight).toBeLessThanOrEqual(10);
          expect(influence.affectedDimensions).toBeDefined();
          expect(influence.affectedDimensions.length).toBeGreaterThan(0);
          expect(influence.influence).toBeTruthy();
          expect(['low', 'medium', 'high']).toContain(influence.impactMagnitude);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('For any constraint profile, methodology shall document assumptions and limitations', () => {
    fc.assert(
      fc.property(constraintProfileArb, (constraints: ConstraintProfile) => {
        const results = calculateWeightedScores(constraints);
        
        // Must have assumptions documented
        expect(results.methodology.assumptions).toBeDefined();
        expect(results.methodology.assumptions.length).toBeGreaterThan(0);
        
        // Each assumption must be a non-empty string
        results.methodology.assumptions.forEach(assumption => {
          expect(typeof assumption).toBe('string');
          expect(assumption.length).toBeGreaterThan(0);
        });
        
        // Must have confidence factors
        expect(results.methodology.confidenceFactors).toBeDefined();
        
        // Each confidence factor must be complete
        results.methodology.confidenceFactors.forEach(factor => {
          expect(factor.factor).toBeTruthy();
          expect(['increases', 'decreases']).toContain(factor.impact);
          expect(['low', 'medium', 'high']).toContain(factor.magnitude);
          expect(factor.explanation).toBeTruthy();
        });
      }),
      { numRuns: 100 }
    );
  });

  test('For any constraint profile, methodology shall show how constraints influence results', () => {
    fc.assert(
      fc.property(constraintProfileArb, (constraints: ConstraintProfile) => {
        const results = calculateWeightedScores(constraints);
        
        // Must have weight influence explanations
        expect(results.methodology.weightInfluence).toBeDefined();
        expect(results.methodology.weightInfluence.length).toBeGreaterThan(0);
        
        // Weight influence must reference actual constraint values
        results.methodology.weightInfluence.forEach(influence => {
          const constraintValue = constraints[influence.constraint as keyof ConstraintProfile];
          if (typeof constraintValue === 'number') {
            expect(influence.weight).toBe(constraintValue);
          }
        });
        
        // Must provide interpretation guidance
        expect(results.interpretationGuidance).toBeDefined();
        expect(results.interpretationGuidance.length).toBeGreaterThan(0);
        
        // Each guidance item must be meaningful
        results.interpretationGuidance.forEach(guidance => {
          expect(typeof guidance).toBe('string');
          expect(guidance.length).toBeGreaterThan(10); // Meaningful content
        });
      }),
      { numRuns: 100 }
    );
  });

  test('For any constraint profile, scoring calculation shall be reproducible', () => {
    fc.assert(
      fc.property(constraintProfileArb, (constraints: ConstraintProfile) => {
        // Calculate scores twice with same inputs
        const results1 = calculateWeightedScores(constraints);
        const results2 = calculateWeightedScores(constraints);
        
        // Results must be identical
        expect(results1.architectureScores.length).toBe(results2.architectureScores.length);
        
        results1.architectureScores.forEach((score1, index) => {
          const score2 = results2.architectureScores[index];
          expect(score2).toBeDefined();
          expect(score1.architectureType).toBe(score2!.architectureType);
          expect(score1.weightedScore).toBe(score2!.weightedScore);
          expect(score1.confidenceLevel).toBe(score2!.confidenceLevel);
        });
        
        // Methodology must be consistent
        expect(results1.methodology.calculationSteps.length).toBe(results2.methodology.calculationSteps.length);
        expect(results1.methodology.assumptions.length).toBe(results2.methodology.assumptions.length);
      }),
      { numRuns: 50 }
    );
  });

  test('For any constraint profile, methodology shall provide traceable calculation steps', () => {
    fc.assert(
      fc.property(constraintProfileArb, (constraints: ConstraintProfile) => {
        const results = calculateWeightedScores(constraints);
        
        // Must have sequential step numbers
        results.methodology.calculationSteps.forEach((step, index) => {
          expect(step.stepNumber).toBe(index + 1);
        });
        
        // Steps must form a logical progression
        const stepDescriptions = results.methodology.calculationSteps.map(s => s.description);
        expect(stepDescriptions.some(desc => desc.toLowerCase().includes('base'))).toBe(true);
        expect(stepDescriptions.some(desc => desc.toLowerCase().includes('weight'))).toBe(true);
        expect(stepDescriptions.some(desc => desc.toLowerCase().includes('calculate'))).toBe(true);
        
        // Each step must have meaningful inputs and outputs
        results.methodology.calculationSteps.forEach(step => {
          expect(Object.keys(step.inputs).length).toBeGreaterThan(0);
          expect(step.result).toBeTruthy();
        });
      }),
      { numRuns: 100 }
    );
  });
});