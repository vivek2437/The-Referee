/**
 * Property-based tests for constraint input processing
 * Feature: securestack-referee, Property 11: Input Validation and Consistency
 * Validates: Requirements 5.1, 5.2, 5.4
 */

import fc from 'fast-check';
import {
  processConstraintProfile,
  validateProfileConsistency,
  ConstraintProfileInput,
} from './constraint-processor';
import { ConstraintProfile } from './types/core';

describe('Property-Based Tests: Input Validation and Consistency', () => {
  /**
   * Property 11: Input Validation and Consistency
   * For any constraint input, the system shall validate format (1-10 scale), 
   * completeness, and flag contradictory combinations.
   * Validates: Requirements 5.1, 5.2, 5.4
   */
  describe('Property 11: Input Validation and Consistency', () => {
    // Generator for valid constraint values (1-10 integers)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for invalid constraint values (outside 1-10 range)
    const invalidConstraintValue = fc.oneof(
      fc.integer({ max: 0 }), // Below minimum
      fc.integer({ min: 11 }), // Above maximum
      fc.double({ min: 1.1, max: 9.9 }).filter(n => !Number.isInteger(n)), // Non-integer
      fc.string(), // Non-numeric
      fc.constant(null) // Null
    );

    // Generator for complete valid constraint profiles
    const validCompleteProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
    });

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
      validConstraintValue
    ).map(dict => dict as ConstraintProfileInput);

    test('Property 11a: Valid inputs always produce valid results', () => {
      fc.assert(
        fc.property(validCompleteProfile, (input) => {
          const result = processConstraintProfile(input);
          
          // Validation should succeed for valid inputs
          expect(result.validation.isValid).toBe(true);
          expect(result.validation.errors).toHaveLength(0);
          
          // Profile should have all values in valid range
          expect(result.profile.riskTolerance).toBeValidConstraintValue();
          expect(result.profile.complianceStrictness).toBeValidConstraintValue();
          expect(result.profile.costSensitivity).toBeValidConstraintValue();
          expect(result.profile.userExperiencePriority).toBeValidConstraintValue();
          expect(result.profile.operationalMaturity).toBeValidConstraintValue();
          expect(result.profile.businessAgility).toBeValidConstraintValue();
          
          // Complete inputs should have no assumptions
          expect(result.profile.inputCompleteness).toBe(true);
          expect(result.assumptions).toHaveLength(0);
        })
      );
    });

    test('Property 11b: Invalid inputs always produce validation errors', () => {
      fc.assert(
        fc.property(
          fc.record({
            riskTolerance: invalidConstraintValue,
          }),
          (input) => {
            const result = processConstraintProfile(input as any);
            
            // Should detect validation errors for invalid inputs
            expect(result.validation.isValid).toBe(false);
            expect(result.validation.errors.length).toBeGreaterThan(0);
            
            // Should have error for the invalid field
            const riskToleranceError = result.validation.errors.find(
              error => error.field === 'riskTolerance'
            );
            expect(riskToleranceError).toBeDefined();
            expect(riskToleranceError?.message).toBeTruthy();
            expect(riskToleranceError?.expectedFormat).toBeTruthy();
          }
        )
      );
    });

    test('Property 11c: Partial inputs generate appropriate assumptions', () => {
      fc.assert(
        fc.property(partialProfile, (input) => {
          // Count provided fields
          const providedFieldCount = Object.keys(input).length;
          const missingFieldCount = 6 - providedFieldCount;
          
          // Skip if all fields are provided (no assumptions expected)
          fc.pre(missingFieldCount > 0);
          
          const result = processConstraintProfile(input);
          
          // Should be valid even with missing inputs
          expect(result.validation.isValid).toBe(true);
          
          // Should indicate incomplete input
          expect(result.profile.inputCompleteness).toBe(false);
          
          // Should generate assumptions for missing fields
          expect(result.assumptions).toHaveLength(missingFieldCount);
          expect(result.profile.assumptions).toHaveLength(missingFieldCount);
          
          // All assumptions should be meaningful strings
          result.assumptions.forEach(assumption => {
            expect(assumption.description).toBeTruthy();
            expect(typeof assumption.description).toBe('string');
            expect(assumption.category).toBe('input');
          });
        })
      );
    });

    test('Property 11d: Contradictory combinations are flagged consistently', () => {
      // Generator for known conflicting combinations
      const conflictingProfiles = fc.oneof(
        // Low risk tolerance + High UX priority
        fc.record({
          riskTolerance: fc.integer({ min: 1, max: 3 }),
          userExperiencePriority: fc.integer({ min: 8, max: 10 }),
        }),
        // High compliance + High cost sensitivity
        fc.record({
          complianceStrictness: fc.integer({ min: 8, max: 10 }),
          costSensitivity: fc.integer({ min: 8, max: 10 }),
        }),
        // High agility + Low maturity
        fc.record({
          businessAgility: fc.integer({ min: 8, max: 10 }),
          operationalMaturity: fc.integer({ min: 1, max: 4 }),
        }),
        // High compliance + High agility
        fc.record({
          complianceStrictness: fc.integer({ min: 8, max: 10 }),
          businessAgility: fc.integer({ min: 8, max: 10 }),
        })
      );

      fc.assert(
        fc.property(conflictingProfiles, (input) => {
          const result = processConstraintProfile(input);
          
          // Should still be valid (conflicts are warnings, not errors)
          expect(result.validation.isValid).toBe(true);
          
          // Should detect conflicts either in validation warnings or consistency check
          const hasValidationWarnings = result.validation.warnings.length > 0;
          const consistencyWarnings = validateProfileConsistency(result.profile);
          const hasConsistencyWarnings = consistencyWarnings.length > 0;
          
          // At least one type of conflict detection should trigger
          expect(hasValidationWarnings || hasConsistencyWarnings).toBe(true);
          
          // If warnings exist, they should have meaningful content
          if (hasValidationWarnings) {
            result.validation.warnings.forEach(warning => {
              expect(warning.message).toBeTruthy();
              expect(warning.suggestion).toBeTruthy();
              expect(warning.field).toContain('/'); // Conflict warnings have compound field names
            });
          }
          
          if (hasConsistencyWarnings) {
            consistencyWarnings.forEach(warning => {
              expect(warning.message).toBeTruthy();
              expect(warning.suggestion).toBeTruthy();
              expect(warning.field).toContain('/'); // Conflict warnings have compound field names
            });
          }
        })
      );
    });

    test('Property 11e: Input format validation is comprehensive', () => {
      fc.assert(
        fc.property(
          fc.record({
            fieldName: fc.constantFrom(
              'riskTolerance',
              'complianceStrictness', 
              'costSensitivity',
              'userExperiencePriority',
              'operationalMaturity',
              'businessAgility'
            ),
            invalidValue: fc.oneof(
              fc.double({ min: 1.1, max: 9.9 }).filter(n => !Number.isInteger(n)), // Non-integer in valid range
              fc.integer({ max: 0 }), // Below range
              fc.integer({ min: 11 }), // Above range
              fc.string(), // Wrong type
              fc.boolean(), // Wrong type
              fc.array(fc.integer()), // Wrong type
              fc.constant(null) // Null value
            )
          }),
          ({ fieldName, invalidValue }) => {
            const input = { [fieldName]: invalidValue } as any;
            const result = processConstraintProfile(input);
            
            // Should always detect format violations
            expect(result.validation.isValid).toBe(false);
            expect(result.validation.errors.length).toBeGreaterThan(0);
            
            // Should have specific error for the invalid field
            const fieldError = result.validation.errors.find(
              error => error.field === fieldName
            );
            expect(fieldError).toBeDefined();
            expect(fieldError?.providedValue).toBe(invalidValue);
            expect(fieldError?.expectedFormat).toContain('1');
            expect(fieldError?.expectedFormat).toContain('10');
          }
        )
      );
    });

    test('Property 11f: Boundary values are handled correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            riskTolerance: fc.constantFrom(1, 10), // Boundary values
            complianceStrictness: fc.constantFrom(1, 10),
            costSensitivity: fc.constantFrom(1, 10),
          }),
          (input) => {
            const result = processConstraintProfile(input);
            
            // Boundary values should be valid
            expect(result.validation.isValid).toBe(true);
            expect(result.validation.errors).toHaveLength(0);
            
            // Values should be preserved exactly
            expect(result.profile.riskTolerance).toBe(input.riskTolerance);
            expect(result.profile.complianceStrictness).toBe(input.complianceStrictness);
            expect(result.profile.costSensitivity).toBe(input.costSensitivity);
          }
        )
      );
    });

    test('Property 11g: Consistency validation is deterministic', () => {
      fc.assert(
        fc.property(validCompleteProfile, (input) => {
          const result1 = processConstraintProfile(input);
          const result2 = processConstraintProfile(input);
          
          // Same input should produce identical validation results
          expect(result1.validation.isValid).toBe(result2.validation.isValid);
          expect(result1.validation.errors).toEqual(result2.validation.errors);
          expect(result1.validation.warnings).toEqual(result2.validation.warnings);
          
          // Profile consistency should be deterministic
          const consistency1 = validateProfileConsistency(result1.profile);
          const consistency2 = validateProfileConsistency(result2.profile);
          expect(consistency1).toEqual(consistency2);
        })
      );
    });
  });
});