/**
 * Unit tests for constraint input processing and validation
 */

import {
  processConstraintProfile,
  hasIncompleteInputs,
  getAssumptionDescriptions,
  validateProfileConsistency,
  ConstraintProfileInput,
} from './constraint-processor';
import { DEFAULT_CONSTRAINT_VALUES } from './constants';

describe('Constraint Profile Input Handler', () => {
  describe('processConstraintProfile', () => {
    test('should accept valid complete input', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 3,
        complianceStrictness: 8,
        costSensitivity: 6,
        userExperiencePriority: 4,
        operationalMaturity: 7,
        businessAgility: 5,
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors).toHaveLength(0);
      expect(result.profile.inputCompleteness).toBe(true);
      expect(result.assumptions).toHaveLength(0);
      expect(result.profile.riskTolerance).toBe(3);
      expect(result.profile.complianceStrictness).toBe(8);
    });

    test('should handle partial input with defaults and assumptions', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 2,
        complianceStrictness: 9,
        // Missing: costSensitivity, userExperiencePriority, operationalMaturity, businessAgility
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.profile.inputCompleteness).toBe(false);
      expect(result.assumptions).toHaveLength(4); // 4 missing fields
      expect(result.profile.riskTolerance).toBe(2);
      expect(result.profile.complianceStrictness).toBe(9);
      expect(result.profile.costSensitivity).toBe(DEFAULT_CONSTRAINT_VALUES.costSensitivity);
      expect(result.profile.userExperiencePriority).toBe(DEFAULT_CONSTRAINT_VALUES.userExperiencePriority);
    });

    test('should handle completely empty input with all defaults', () => {
      const input: ConstraintProfileInput = {};

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.profile.inputCompleteness).toBe(false);
      expect(result.assumptions).toHaveLength(6); // All 6 fields defaulted
      expect(result.profile.riskTolerance).toBe(DEFAULT_CONSTRAINT_VALUES.riskTolerance);
      expect(result.profile.complianceStrictness).toBe(DEFAULT_CONSTRAINT_VALUES.complianceStrictness);
    });

    test('should reject invalid values outside 1-10 range', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 0, // Invalid: below minimum
        complianceStrictness: 11, // Invalid: above maximum
        costSensitivity: 5, // Valid
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(2);
      expect(result.validation.errors[0]?.field).toBe('riskTolerance');
      expect(result.validation.errors[1]?.field).toBe('complianceStrictness');
    });

    test('should reject non-numeric values', () => {
      const input = {
        riskTolerance: 'high', // Invalid: not a number
        complianceStrictness: 7, // Valid
      } as any;

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(1);
      expect(result.validation.errors[0]?.field).toBe('riskTolerance');
      expect(result.validation.errors[0]?.message).toContain('must be a number');
    });

    test('should reject non-integer values', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 5.5, // Invalid: not an integer
        complianceStrictness: 7, // Valid
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(1);
      expect(result.validation.errors[0]?.field).toBe('riskTolerance');
      expect(result.validation.errors[0]?.message).toContain('must be a whole number');
    });

    test('should generate warnings for potential conflicts', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 2, // Low risk tolerance
        userExperiencePriority: 9, // High UX priority - potential conflict
        complianceStrictness: 9, // High compliance
        costSensitivity: 9, // High cost sensitivity - potential conflict
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.warnings.length).toBeGreaterThan(0);
      
      const conflictWarnings = result.validation.warnings.filter(w => 
        w.field.includes('/') // Conflict warnings have compound field names
      );
      expect(conflictWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('hasIncompleteInputs', () => {
    test('should return true for profiles with missing inputs', () => {
      const input: ConstraintProfileInput = { riskTolerance: 5 };
      const result = processConstraintProfile(input);
      
      expect(hasIncompleteInputs(result.profile)).toBe(true);
    });

    test('should return false for complete profiles', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 3,
        complianceStrictness: 8,
        costSensitivity: 6,
        userExperiencePriority: 4,
        operationalMaturity: 7,
        businessAgility: 5,
      };
      const result = processConstraintProfile(input);
      
      expect(hasIncompleteInputs(result.profile)).toBe(false);
    });
  });

  describe('getAssumptionDescriptions', () => {
    test('should return assumption descriptions for defaulted values', () => {
      const input: ConstraintProfileInput = { riskTolerance: 5 };
      const result = processConstraintProfile(input);
      
      const descriptions = getAssumptionDescriptions(result.profile);
      expect(descriptions.length).toBeGreaterThan(0);
      expect(descriptions.every(desc => typeof desc === 'string')).toBe(true);
    });
  });

  describe('validateProfileConsistency', () => {
    test('should detect risk tolerance vs UX priority conflict', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 2, // Low risk tolerance
        userExperiencePriority: 9, // High UX priority
      };
      const result = processConstraintProfile(input);
      
      const warnings = validateProfileConsistency(result.profile);
      const conflictWarning = warnings.find(w => 
        w.field === 'riskTolerance/userExperiencePriority'
      );
      expect(conflictWarning).toBeDefined();
    });

    test('should detect compliance vs cost conflict', () => {
      const input: ConstraintProfileInput = {
        complianceStrictness: 9, // High compliance
        costSensitivity: 9, // High cost sensitivity
      };
      const result = processConstraintProfile(input);
      
      const warnings = validateProfileConsistency(result.profile);
      const conflictWarning = warnings.find(w => 
        w.field === 'complianceStrictness/costSensitivity'
      );
      expect(conflictWarning).toBeDefined();
    });

    test('should detect agility vs maturity conflict', () => {
      const input: ConstraintProfileInput = {
        businessAgility: 9, // High agility
        operationalMaturity: 3, // Low maturity
      };
      const result = processConstraintProfile(input);
      
      const warnings = validateProfileConsistency(result.profile);
      const conflictWarning = warnings.find(w => 
        w.field === 'businessAgility/operationalMaturity'
      );
      expect(conflictWarning).toBeDefined();
    });

    test('should detect compliance vs agility conflict', () => {
      const input: ConstraintProfileInput = {
        complianceStrictness: 9, // High compliance
        businessAgility: 9, // High agility
      };
      const result = processConstraintProfile(input);
      
      const warnings = validateProfileConsistency(result.profile);
      const conflictWarning = warnings.find(w => 
        w.field === 'complianceStrictness/businessAgility'
      );
      expect(conflictWarning).toBeDefined();
    });

    test('should return no warnings for consistent profile', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 5,
        complianceStrictness: 5,
        costSensitivity: 5,
        userExperiencePriority: 5,
        operationalMaturity: 5,
        businessAgility: 5,
      };
      const result = processConstraintProfile(input);
      
      const warnings = validateProfileConsistency(result.profile);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    test('should handle boundary values correctly', () => {
      const input: ConstraintProfileInput = {
        riskTolerance: 1, // Minimum valid
        complianceStrictness: 10, // Maximum valid
      };

      const result = processConstraintProfile(input);

      expect(result.validation.isValid).toBe(true);
      expect(result.profile.riskTolerance).toBe(1);
      expect(result.profile.complianceStrictness).toBe(10);
    });

    test('should handle null and undefined values', () => {
      const input = {
        riskTolerance: null,
        complianceStrictness: undefined,
        costSensitivity: 5,
      } as any;

      const result = processConstraintProfile(input);

      // null should be treated as invalid, undefined should be defaulted
      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.validation.errors[0]?.field).toBe('riskTolerance');
    });
  });
});