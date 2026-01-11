/**
 * Property-based tests for conflict detection and explanation
 * Feature: securestack-referee, Property 6: Conflict Detection and Explanation
 * Validates: Requirements 1.2, 6.1, 6.2, 6.3
 */

import fc from 'fast-check';
import {
  detectConflicts,
  hasSpecificConflict,
  getConflictExplanation,
  getAvailableConflictTypes,
  ConflictDetectionResult
} from './conflict-detector';
import { ConstraintProfile } from './types';
import { CONFLICT_DETECTION_RULES } from './constants';

describe('Property-Based Tests: Conflict Detection and Explanation', () => {
  /**
   * Property 6: Conflict Detection and Explanation
   * For any constraint profile with known conflicts (such as high compliance + low cost), 
   * the system shall detect the conflict and provide neutral explanation of why it exists and its implications.
   * Validates: Requirements 1.2, 6.1, 6.2, 6.3
   */
  describe('Property 6: Conflict Detection and Explanation', () => {
    // Generator for valid constraint values (1-10 integers)
    const validConstraintValue = fc.integer({ min: 1, max: 10 });
    
    // Generator for complete constraint profiles
    const constraintProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 6 })
    });

    // Generator for high compliance + high cost sensitivity conflict
    const highComplianceLowCostProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: fc.integer({ min: 8, max: 10 }), // High compliance
      costSensitivity: fc.integer({ min: 8, max: 10 }), // High cost sensitivity
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 6 })
    });

    // Generator for low risk tolerance + high UX priority conflict
    const lowRiskHighUXProfile = fc.record({
      riskTolerance: fc.integer({ min: 1, max: 3 }), // Low risk tolerance
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: fc.integer({ min: 8, max: 10 }), // High UX priority
      operationalMaturity: validConstraintValue,
      businessAgility: validConstraintValue,
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 6 })
    });

    // Generator for high agility + low maturity conflict
    const highAgilityLowMaturityProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: validConstraintValue,
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: fc.integer({ min: 1, max: 4 }), // Low maturity
      businessAgility: fc.integer({ min: 8, max: 10 }), // High agility
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 6 })
    });

    // Generator for high compliance + high agility conflict
    const highComplianceHighAgilityProfile = fc.record({
      riskTolerance: validConstraintValue,
      complianceStrictness: fc.integer({ min: 8, max: 10 }), // High compliance
      costSensitivity: validConstraintValue,
      userExperiencePriority: validConstraintValue,
      operationalMaturity: validConstraintValue,
      businessAgility: fc.integer({ min: 8, max: 10 }), // High agility
      inputCompleteness: fc.boolean(),
      assumptions: fc.array(fc.string(), { maxLength: 6 })
    });

    test('Property 6a: Known conflicts are always detected', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            highComplianceLowCostProfile,
            lowRiskHighUXProfile,
            highAgilityLowMaturityProfile,
            highComplianceHighAgilityProfile
          ),
          (profile) => {
            const result = detectConflicts(profile);
            
            // Requirement 6.1: System SHALL detect common constraint conflicts
            expect(result.hasConflicts).toBe(true);
            expect(result.conflicts.length).toBeGreaterThan(0);
            expect(result.conflictSummary.length).toBeGreaterThan(0);
            
            // Each detected conflict should have proper structure
            result.conflicts.forEach(conflict => {
              expect(conflict.conflictId).toBeTruthy();
              expect(conflict.title).toBeTruthy();
              expect(conflict.description).toBeTruthy();
              expect(conflict.implications).toBeInstanceOf(Array);
              expect(conflict.implications.length).toBeGreaterThan(0);
              expect(conflict.resolutionSuggestions).toBeInstanceOf(Array);
              expect(conflict.resolutionSuggestions.length).toBeGreaterThan(0);
              expect(conflict.triggeringConstraints).toBeTruthy();
            });
          }
        )
      );
    });

    test('Property 6b: Conflict explanations are neutral and non-judgmental', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // Requirement 6.3: System SHALL communicate conflicts using neutral, non-judgmental language
          result.conflicts.forEach(conflict => {
            // Check for neutral language - no judgmental words
            const judgmentalWords = ['wrong', 'bad', 'poor', 'terrible', 'stupid', 'foolish', 'mistake'];
            const allText = [
              conflict.title,
              conflict.description,
              ...conflict.implications,
              ...conflict.resolutionSuggestions
            ].join(' ').toLowerCase();
            
            judgmentalWords.forEach(word => {
              expect(allText).not.toContain(word);
            });
            
            // Should use neutral descriptive language
            expect(conflict.description).toMatch(/may|might|can|could|typically|often|potential/i);
            
            // Should explain objectively why conflicts exist
            expect(conflict.description.length).toBeGreaterThan(50); // Meaningful explanation
          });
        })
      );
    });

    test('Property 6c: Conflict implications are comprehensive and actionable', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // Requirement 6.2: System SHALL explain why each conflict exists and its implications
          result.conflicts.forEach(conflict => {
            // Should have multiple implications
            expect(conflict.implications.length).toBeGreaterThan(0);
            
            // Each implication should be meaningful
            conflict.implications.forEach(implication => {
              expect(implication.length).toBeGreaterThan(20);
              expect(typeof implication).toBe('string');
            });
            
            // Should have resolution suggestions
            expect(conflict.resolutionSuggestions.length).toBeGreaterThan(0);
            
            // Resolution suggestions should be actionable
            conflict.resolutionSuggestions.forEach(suggestion => {
              expect(suggestion.length).toBeGreaterThan(30);
              expect(typeof suggestion).toBe('string');
              // Should contain action words
              expect(suggestion).toMatch(/consider|implement|establish|engage|explore|conduct|create|develop|invest/i);
            });
          });
        })
      );
    });

    test('Property 6d: Triggering constraints are accurately identified', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result = detectConflicts(profile);
          
          result.conflicts.forEach(conflict => {
            // Should identify which constraints triggered the conflict
            expect(conflict.triggeringConstraints).toBeTruthy();
            expect(Object.keys(conflict.triggeringConstraints).length).toBeGreaterThan(0);
            
            // Triggering constraint values should match profile values
            Object.entries(conflict.triggeringConstraints).forEach(([key, value]) => {
              expect(profile[key as keyof ConstraintProfile]).toBe(value);
            });
            
            // Should only include relevant constraints for the conflict
            expect(Object.keys(conflict.triggeringConstraints).length).toBeLessThanOrEqual(4);
          });
        })
      );
    });

    test('Property 6e: Specific conflict detection is consistent', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result = detectConflicts(profile);
          const availableTypes = getAvailableConflictTypes();
          
          // Check consistency between general and specific detection
          availableTypes.forEach(conflictType => {
            const hasConflictGeneral = result.conflicts.some(c => c.conflictId === conflictType);
            const hasConflictSpecific = hasSpecificConflict(profile, conflictType);
            
            expect(hasConflictGeneral).toBe(hasConflictSpecific);
            
            // If conflict exists, explanation should be available
            if (hasConflictSpecific) {
              const explanation = getConflictExplanation(profile, conflictType);
              expect(explanation).not.toBeNull();
              expect(explanation!.conflictId).toBe(conflictType);
            }
          });
        })
      );
    });

    test('Property 6f: High compliance + high cost sensitivity always conflicts', () => {
      fc.assert(
        fc.property(highComplianceLowCostProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // This specific combination should always trigger conflict
          expect(result.hasConflicts).toBe(true);
          expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(true);
          
          const conflict = result.conflicts.find(c => c.conflictId === 'compliance-cost-conflict');
          expect(conflict).toBeTruthy();
          expect(conflict!.triggeringConstraints.complianceStrictness).toBeGreaterThanOrEqual(8);
          expect(conflict!.triggeringConstraints.costSensitivity).toBeGreaterThanOrEqual(8);
        })
      );
    });

    test('Property 6g: Low risk tolerance + high UX priority always conflicts', () => {
      fc.assert(
        fc.property(lowRiskHighUXProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // This specific combination should always trigger conflict
          expect(result.hasConflicts).toBe(true);
          expect(hasSpecificConflict(profile, 'risk-ux-conflict')).toBe(true);
          
          const conflict = result.conflicts.find(c => c.conflictId === 'risk-ux-conflict');
          expect(conflict).toBeTruthy();
          expect(conflict!.triggeringConstraints.riskTolerance).toBeLessThanOrEqual(3);
          expect(conflict!.triggeringConstraints.userExperiencePriority).toBeGreaterThanOrEqual(8);
        })
      );
    });

    test('Property 6h: High agility + low maturity always conflicts', () => {
      fc.assert(
        fc.property(highAgilityLowMaturityProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // This specific combination should always trigger conflict
          expect(result.hasConflicts).toBe(true);
          expect(hasSpecificConflict(profile, 'agility-maturity-conflict')).toBe(true);
          
          const conflict = result.conflicts.find(c => c.conflictId === 'agility-maturity-conflict');
          expect(conflict).toBeTruthy();
          expect(conflict!.triggeringConstraints.businessAgility).toBeGreaterThanOrEqual(8);
          expect(conflict!.triggeringConstraints.operationalMaturity).toBeLessThanOrEqual(4);
        })
      );
    });

    test('Property 6i: High compliance + high agility always conflicts', () => {
      fc.assert(
        fc.property(highComplianceHighAgilityProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // This specific combination should always trigger conflict
          expect(result.hasConflicts).toBe(true);
          expect(hasSpecificConflict(profile, 'compliance-agility-conflict')).toBe(true);
          
          const conflict = result.conflicts.find(c => c.conflictId === 'compliance-agility-conflict');
          expect(conflict).toBeTruthy();
          expect(conflict!.triggeringConstraints.complianceStrictness).toBeGreaterThanOrEqual(8);
          expect(conflict!.triggeringConstraints.businessAgility).toBeGreaterThanOrEqual(8);
        })
      );
    });

    test('Property 6j: Conflict detection is deterministic', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result1 = detectConflicts(profile);
          const result2 = detectConflicts(profile);
          
          // Same input should produce identical results
          expect(result1.hasConflicts).toBe(result2.hasConflicts);
          expect(result1.conflicts).toEqual(result2.conflicts);
          expect(result1.conflictSummary).toEqual(result2.conflictSummary);
        })
      );
    });

    test('Property 6k: Stakeholder alignment suggestions are provided', () => {
      fc.assert(
        fc.property(constraintProfile, (profile) => {
          const result = detectConflicts(profile);
          
          // Requirement 6.5: System SHALL suggest when stakeholder alignment may be needed
          if (result.hasConflicts) {
            result.conflicts.forEach(conflict => {
              const hasAlignmentSuggestion = conflict.resolutionSuggestions.some(suggestion =>
                suggestion.toLowerCase().includes('stakeholder') ||
                suggestion.toLowerCase().includes('align') ||
                suggestion.toLowerCase().includes('engage')
              );
              expect(hasAlignmentSuggestion).toBe(true);
            });
          }
        })
      );
    });

    test('Property 6l: All conflict types are covered by detection rules', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const availableTypes = getAvailableConflictTypes();
          
          // Should cover all expected conflict types from requirements
          const expectedTypes = [
            'compliance-cost-conflict',
            'risk-ux-conflict', 
            'agility-maturity-conflict',
            'compliance-agility-conflict'
          ];
          
          expectedTypes.forEach(expectedType => {
            expect(availableTypes).toContain(expectedType);
          });
          
          // Should have at least the minimum expected conflicts
          expect(availableTypes.length).toBeGreaterThanOrEqual(4);
        })
      );
    });
  });
});