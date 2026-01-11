/**
 * Unit tests for specific conflict scenarios
 * Tests high compliance + low cost, low risk tolerance + high UX priority, and high agility + low maturity conflicts
 * Requirements: 6.1, 6.2
 */

import {
  detectConflicts,
  hasSpecificConflict,
  getConflictExplanation,
  getAvailableConflictTypes,
  validateConflictDetection
} from './conflict-detector';
import { ConstraintProfile } from './types';

describe('Conflict Detector Unit Tests', () => {
  // Helper function to create a base constraint profile
  const createBaseProfile = (): ConstraintProfile => ({
    riskTolerance: 5,
    complianceStrictness: 5,
    costSensitivity: 5,
    userExperiencePriority: 5,
    operationalMaturity: 5,
    businessAgility: 5,
    inputCompleteness: true,
    assumptions: []
  });

  describe('High Compliance + Low Cost Conflict Detection', () => {
    test('should detect conflict when compliance strictness >= 8 and cost sensitivity >= 8', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 8;
      profile.costSensitivity = 8;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]?.conflictId).toBe('compliance-cost-conflict');
      expect(result.conflicts[0]?.title).toBe('High Compliance Requirements vs Cost Sensitivity');
    });

    test('should detect conflict with maximum values', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 10;
      profile.costSensitivity = 10;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(true);
    });

    test('should not detect conflict when compliance is below threshold', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 7;
      profile.costSensitivity = 10;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(false);
    });

    test('should not detect conflict when cost sensitivity is below threshold', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 10;
      profile.costSensitivity = 7;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(false);
    });

    test('should provide comprehensive explanation for compliance-cost conflict', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 9;
      profile.costSensitivity = 9;

      const explanation = getConflictExplanation(profile, 'compliance-cost-conflict');
      
      expect(explanation).not.toBeNull();
      expect(explanation!.description).toContain('compliance controls');
      expect(explanation!.description).toContain('infrastructure investment');
      expect(explanation!.implications).toHaveLength(4);
      expect(explanation!.resolutionSuggestions).toHaveLength(5);
      expect(explanation!.triggeringConstraints.complianceStrictness).toBe(9);
      expect(explanation!.triggeringConstraints.costSensitivity).toBe(9);
    });
  });

  describe('Low Risk Tolerance + High UX Priority Conflict Detection', () => {
    test('should detect conflict when risk tolerance <= 3 and UX priority >= 8', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 3;
      profile.userExperiencePriority = 8;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]?.conflictId).toBe('risk-ux-conflict');
      expect(result.conflicts[0]?.title).toBe('Low Risk Tolerance vs High User Experience Priority');
    });

    test('should detect conflict with minimum risk tolerance and maximum UX priority', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 1;
      profile.userExperiencePriority = 10;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(hasSpecificConflict(profile, 'risk-ux-conflict')).toBe(true);
    });

    test('should not detect conflict when risk tolerance is above threshold', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 4;
      profile.userExperiencePriority = 10;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'risk-ux-conflict')).toBe(false);
    });

    test('should not detect conflict when UX priority is below threshold', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 1;
      profile.userExperiencePriority = 7;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'risk-ux-conflict')).toBe(false);
    });

    test('should provide comprehensive explanation for risk-UX conflict', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 2;
      profile.userExperiencePriority = 9;

      const explanation = getConflictExplanation(profile, 'risk-ux-conflict');
      
      expect(explanation).not.toBeNull();
      expect(explanation!.description).toContain('security controls');
      expect(explanation!.description).toContain('user interaction');
      expect(explanation!.implications).toHaveLength(4);
      expect(explanation!.resolutionSuggestions).toHaveLength(5);
      expect(explanation!.triggeringConstraints.riskTolerance).toBe(2);
      expect(explanation!.triggeringConstraints.userExperiencePriority).toBe(9);
    });
  });

  describe('High Agility + Low Maturity Conflict Detection', () => {
    test('should detect conflict when business agility >= 8 and operational maturity <= 4', () => {
      const profile = createBaseProfile();
      profile.businessAgility = 8;
      profile.operationalMaturity = 4;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]?.conflictId).toBe('agility-maturity-conflict');
      expect(result.conflicts[0]?.title).toBe('High Business Agility vs Low Operational Maturity');
    });

    test('should detect conflict with maximum agility and minimum maturity', () => {
      const profile = createBaseProfile();
      profile.businessAgility = 10;
      profile.operationalMaturity = 1;

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(hasSpecificConflict(profile, 'agility-maturity-conflict')).toBe(true);
    });

    test('should not detect conflict when business agility is below threshold', () => {
      const profile = createBaseProfile();
      profile.businessAgility = 7;
      profile.operationalMaturity = 1;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'agility-maturity-conflict')).toBe(false);
    });

    test('should not detect conflict when operational maturity is above threshold', () => {
      const profile = createBaseProfile();
      profile.businessAgility = 10;
      profile.operationalMaturity = 5;

      const result = detectConflicts(profile);
      
      expect(hasSpecificConflict(profile, 'agility-maturity-conflict')).toBe(false);
    });

    test('should provide comprehensive explanation for agility-maturity conflict', () => {
      const profile = createBaseProfile();
      profile.businessAgility = 9;
      profile.operationalMaturity = 3;

      const explanation = getConflictExplanation(profile, 'agility-maturity-conflict');
      
      expect(explanation).not.toBeNull();
      expect(explanation!.description).toContain('business changes');
      expect(explanation!.description).toContain('operational team capacity');
      expect(explanation!.implications).toHaveLength(4);
      expect(explanation!.resolutionSuggestions).toHaveLength(5);
      expect(explanation!.triggeringConstraints.businessAgility).toBe(9);
      expect(explanation!.triggeringConstraints.operationalMaturity).toBe(3);
    });
  });

  describe('Multiple Conflicts', () => {
    test('should detect multiple conflicts when multiple conditions are met', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 9; // High compliance
      profile.costSensitivity = 9; // High cost sensitivity
      profile.businessAgility = 9; // High agility (conflicts with high compliance)

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(2);
      
      const conflictIds = result.conflicts.map(c => c.conflictId);
      expect(conflictIds).toContain('compliance-cost-conflict');
      expect(conflictIds).toContain('compliance-agility-conflict');
    });

    test('should detect all four conflicts when all conditions are met', () => {
      const profile = createBaseProfile();
      profile.riskTolerance = 2; // Low risk tolerance
      profile.complianceStrictness = 9; // High compliance
      profile.costSensitivity = 9; // High cost sensitivity
      profile.userExperiencePriority = 9; // High UX priority
      profile.operationalMaturity = 3; // Low maturity
      profile.businessAgility = 9; // High agility

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(4);
      
      const conflictIds = result.conflicts.map(c => c.conflictId);
      expect(conflictIds).toContain('compliance-cost-conflict');
      expect(conflictIds).toContain('risk-ux-conflict');
      expect(conflictIds).toContain('agility-maturity-conflict');
      expect(conflictIds).toContain('compliance-agility-conflict');
    });
  });

  describe('No Conflicts', () => {
    test('should not detect conflicts with moderate values', () => {
      const profile = createBaseProfile(); // All values are 5 (moderate)

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
      expect(result.conflictSummary).toHaveLength(0);
    });

    test('should not detect conflicts when thresholds are not met', () => {
      const profile = createBaseProfile();
      profile.complianceStrictness = 7; // Below threshold
      profile.costSensitivity = 7; // Below threshold
      profile.riskTolerance = 4; // Above threshold
      profile.userExperiencePriority = 7; // Below threshold

      const result = detectConflicts(profile);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    test('should return all available conflict types', () => {
      const types = getAvailableConflictTypes();
      
      expect(types).toHaveLength(4);
      expect(types).toContain('compliance-cost-conflict');
      expect(types).toContain('risk-ux-conflict');
      expect(types).toContain('agility-maturity-conflict');
      expect(types).toContain('compliance-agility-conflict');
    });

    test('should validate conflict detection health', () => {
      const health = validateConflictDetection();
      
      expect(health.isHealthy).toBe(true);
      expect(health.ruleCount).toBe(4);
    });

    test('should return null for non-existent conflict explanation', () => {
      const profile = createBaseProfile();
      const explanation = getConflictExplanation(profile, 'non-existent-conflict');
      
      expect(explanation).toBeNull();
    });

    test('should return false for non-existent specific conflict', () => {
      const profile = createBaseProfile();
      const hasConflict = hasSpecificConflict(profile, 'non-existent-conflict');
      
      expect(hasConflict).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle boundary values correctly', () => {
      const profile = createBaseProfile();
      
      // Test exact threshold boundaries
      profile.complianceStrictness = 8; // Exactly at threshold
      profile.costSensitivity = 8; // Exactly at threshold
      
      expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(true);
      
      // Test just below threshold
      profile.complianceStrictness = 7; // Just below threshold
      expect(hasSpecificConflict(profile, 'compliance-cost-conflict')).toBe(false);
    });

    test('should handle minimum and maximum constraint values', () => {
      const profile = createBaseProfile();
      
      // Test with minimum values
      profile.riskTolerance = 1;
      profile.userExperiencePriority = 10;
      
      expect(hasSpecificConflict(profile, 'risk-ux-conflict')).toBe(true);
      
      // Test with maximum operational maturity (should not conflict)
      profile.operationalMaturity = 10;
      profile.businessAgility = 10;
      
      expect(hasSpecificConflict(profile, 'agility-maturity-conflict')).toBe(false);
    });
  });
});