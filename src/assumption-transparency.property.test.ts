/**
 * Property-based tests for assumption transparency
 * Feature: securestack-referee, Property 2: Assumption Transparency
 * Validates: Requirements 1.3, 5.3, 8.4, 10.3
 */

import fc from 'fast-check';
import {
  processConstraintProfile,
  ConstraintProfileInput,
} from './constraint-processor';

describe('Property-Based Tests: Assumption Transparency', () => {
  /**
   * Property 2: Assumption Transparency
   * For any analysis with missing or incomplete inputs, all assumptions made by the system 
   * shall be explicitly documented and easily identifiable in the output.
   * Validates: Requirements 1.3, 5.3, 8.4, 10.3
   */
  describe('Property 2: Assumption Transparency', () => {
    // Generator for valid constraint values (1-10 integers)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for partial constraint profiles (some fields missing)
    const partialProfile = fc.dictionary(
      fc.constantFrom(
        'riskTolerance',
        'complianceStrictness', 
        'costSensitivity',
        'userExperiencePriority',
        'operationalMaturity',
        'businessAgility'
      ),
      validConstraintValue,
      { minKeys: 0, maxKeys: 5 } // Ensure at least one field is missing
    ).map(dict => dict as ConstraintProfileInput);

    // Generator for complete constraint profiles (no missing fields)
    const completeProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
    });

    test('Property 2a: Missing inputs always generate explicit assumptions', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          // Count provided fields
          const providedFieldCount = Object.keys(input).length;
          const totalFields = 6;
          const missingFieldCount = totalFields - providedFieldCount;
          
          // Skip if all fields are provided (no assumptions expected)
          fc.pre(missingFieldCount > 0);
          
          const result = processConstraintProfile(input);
          
          // Requirement 5.3: WHEN inputs are missing, THE System SHALL generate explicit assumptions
          expect(result.assumptions).toHaveLength(missingFieldCount);
          expect(result.profile.assumptions).toHaveLength(missingFieldCount);
          
          // Requirement 1.3 & 10.3: Assumptions must be explicit and easily identifiable
          result.assumptions.forEach(assumption => {
            expect(assumption.description).toBeTruthy();
            expect(typeof assumption.description).toBe('string');
            expect(assumption.description.length).toBeGreaterThan(10); // Meaningful description
            expect(assumption.category).toBe('input'); // Categorized for easy identification
            expect(assumption.impact).toMatch(/^(low|medium|high)$/); // Impact level specified
            expect(assumption.recommendation).toBeTruthy(); // Actionable recommendation provided
          });
          
          // Profile should track assumption transparency
          expect(result.profile.inputCompleteness).toBe(false);
          
          // Assumptions should be accessible in multiple ways (Requirements 8.4, 10.3)
          expect(result.profile.assumptions).toEqual(
            result.assumptions.map(a => a.description)
          );
        })
      );
    });

    test('Property 2b: Complete inputs have no assumptions', () => {
      fc.assert(
        fc.property(completeProfile, (input) => {
          const result = processConstraintProfile(input);
          
          // Complete inputs should not generate assumptions
          expect(result.assumptions).toHaveLength(0);
          expect(result.profile.assumptions).toHaveLength(0);
          expect(result.profile.inputCompleteness).toBe(true);
        })
      );
    });

    test('Property 2c: Assumptions are transparent and traceable', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          const providedFields = Object.keys(input);
          const allFields = [
            'riskTolerance',
            'complianceStrictness', 
            'costSensitivity',
            'userExperiencePriority',
            'operationalMaturity',
            'businessAgility'
          ];
          const missingFields = allFields.filter(field => !providedFields.includes(field));
          
          // Skip if no fields are missing
          fc.pre(missingFields.length > 0);
          
          const result = processConstraintProfile(input);
          
          // Each missing field should have a corresponding assumption
          missingFields.forEach(missingField => {
            const hasAssumption = result.assumptions.some(assumption => 
              assumption.description.toLowerCase().includes(missingField.toLowerCase())
            );
            expect(hasAssumption).toBe(true);
          });
          
          // Assumptions should be traceable to specific fields
          result.assumptions.forEach(assumption => {
            expect(assumption.description).toMatch(/defaulted to \d+/); // Shows default value
            expect(assumption.description).toMatch(/\(.*\)/); // Shows reasoning in parentheses
          });
        })
      );
    });

    test('Property 2d: Assumption content is meaningful and actionable', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          const missingFieldCount = 6 - Object.keys(input).length;
          
          // Skip if no fields are missing
          fc.pre(missingFieldCount > 0);
          
          const result = processConstraintProfile(input);
          
          // Each assumption should provide meaningful guidance
          result.assumptions.forEach(assumption => {
            // Should explain what was assumed (Requirement 1.3)
            expect(assumption.description).toContain('defaulted to');
            
            // Should provide actionable recommendation (Requirement 10.3)
            expect(assumption.recommendation).toContain('Consider providing');
            expect(assumption.recommendation).toContain('organizational assessment');
            
            // Should categorize the assumption type for easy identification
            expect(assumption.category).toBe('input');
            
            // Should indicate impact level for prioritization
            expect(['low', 'medium', 'high']).toContain(assumption.impact);
          });
        })
      );
    });

    test('Property 2e: Assumptions are consistently formatted and accessible', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          const missingFieldCount = 6 - Object.keys(input).length;
          
          // Skip if no fields are missing
          fc.pre(missingFieldCount > 0);
          
          const result = processConstraintProfile(input);
          
          // Assumptions should be accessible in multiple formats (Requirement 8.4)
          expect(result.assumptions.length).toBe(missingFieldCount);
          expect(result.profile.assumptions.length).toBe(missingFieldCount);
          
          // Both formats should contain the same information
          result.assumptions.forEach((fullAssumption, index) => {
            expect(result.profile.assumptions[index]).toBe(fullAssumption.description);
          });
          
          // Assumptions should follow consistent format for easy identification
          result.assumptions.forEach(assumption => {
            expect(assumption.description).toMatch(/^[a-zA-Z]+ was not provided, defaulted to \d+ \(.+\)$/);
          });
        })
      );
    });

    test('Property 2f: Empty input generates maximum assumptions', () => {
      fc.assert(
        fc.property(fc.constant({}), (input) => {
          const result = processConstraintProfile(input);
          
          // Empty input should generate assumptions for all 6 fields
          expect(result.assumptions).toHaveLength(6);
          expect(result.profile.assumptions).toHaveLength(6);
          expect(result.profile.inputCompleteness).toBe(false);
          
          // Should cover all constraint fields
          const fieldNames = [
            'riskTolerance',
            'complianceStrictness', 
            'costSensitivity',
            'userExperiencePriority',
            'operationalMaturity',
            'businessAgility'
          ];
          
          fieldNames.forEach(fieldName => {
            const hasAssumption = result.assumptions.some(assumption => 
              assumption.description.toLowerCase().includes(fieldName.toLowerCase())
            );
            expect(hasAssumption).toBe(true);
          });
        })
      );
    });

    test('Property 2g: Assumption transparency is deterministic', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          const result1 = processConstraintProfile(input);
          const result2 = processConstraintProfile(input);
          
          // Same input should produce identical assumptions
          expect(result1.assumptions).toEqual(result2.assumptions);
          expect(result1.profile.assumptions).toEqual(result2.profile.assumptions);
          expect(result1.profile.inputCompleteness).toBe(result2.profile.inputCompleteness);
        })
      );
    });
  });
});