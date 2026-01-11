/**
 * Unit tests for Content Validation System
 */

import { ContentValidator, validateContent, ValidationConfig } from './content-validator';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('Recommendation Language Detection', () => {
    test('should detect recommendation language violations', () => {
      const content = 'You should choose the IRM-heavy architecture as it is the best option.';
      const result = validator.validateContent(content);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
      expect(result.violations[0]?.type).toBe('recommendation_language');
      expect(result.violations.some(v => v.type === 'recommendation_language')).toBe(true);
    });

    test('should sanitize recommendation language', () => {
      const content = 'We recommend the hybrid approach as the optimal choice.';
      const result = validator.validateContent(content);

      expect(result.sanitizedContent).toContain('may consider');
      expect(result.sanitizedContent).not.toContain('recommend');
      expect(result.sanitizedContent).not.toContain('optimal');
    });

    test('should detect universal directive language', () => {
      const content = 'Always use strong authentication and never use weak passwords.';
      const result = validator.validateContent(content);

      // Should detect violations (may be caught by recommendation_language patterns)
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => 
        v.type === 'universal_superiority' || v.type === 'recommendation_language'
      )).toBe(true);
    });
  });

  describe('Vendor and Product Mention Detection', () => {
    test('should detect vendor mentions', () => {
      const content = 'Microsoft Azure and Amazon AWS provide excellent security features.';
      const result = validator.validateContent(content);

      expect(result.violations.some(v => v.type === 'vendor_mention')).toBe(true);
      expect(result.sanitizedContent).toContain('[vendor name]');
    });

    test('should detect product mentions', () => {
      const content = 'Active Directory and Office 365 integration is seamless.';
      const result = validator.validateContent(content);

      // Products are detected as vendor mentions in this implementation
      expect(result.violations.some(v => v.type === 'vendor_mention')).toBe(true);
      expect(result.sanitizedContent).toContain('[product name]');
    });
  });

  describe('Compliance Guarantee Detection', () => {
    test('should detect compliance guarantee language', () => {
      const content = 'This architecture guarantees compliance with all regulations.';
      const result = validator.validateContent(content);

      expect(result.violations.some(v => v.type === 'compliance_guarantee')).toBe(true);
      expect(result.sanitizedContent).toContain('may support compliance efforts');
    });

    test('should detect audit guarantee language', () => {
      const content = 'This solution will pass audit and is audit-proof.';
      const result = validator.validateContent(content);

      expect(result.violations.some(v => v.type === 'compliance_guarantee')).toBe(true);
    });
  });

  describe('Legal Interpretation Detection', () => {
    test('should detect legal requirement language', () => {
      const content = 'The law mandates strong encryption for all data.';
      const result = validator.validateContent(content);

      expect(result.violations.some(v => v.type === 'legal_interpretation')).toBe(true);
      expect(result.sanitizedContent).toContain('regulatory frameworks may indicate');
    });

    test('should detect legal advice language', () => {
      const content = 'Consult your attorney for legal advice on this matter.';
      const result = validator.validateContent(content);

      expect(result.violations.some(v => v.type === 'legal_interpretation')).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    test('should respect strict mode configuration', () => {
      const strictValidator = new ContentValidator({ strictMode: true, autoSanitize: false });
      const lenientValidator = new ContentValidator({ strictMode: false, autoSanitize: false });
      
      const content = 'You should choose this option.';
      
      const strictResult = strictValidator.validateContent(content);
      const lenientResult = lenientValidator.validateContent(content);

      expect(strictResult.violations[0]?.severity).toBe('error');
      expect(lenientResult.violations[0]?.severity).toBe('warning');
    });

    test('should respect auto-sanitize configuration', () => {
      const sanitizeValidator = new ContentValidator({ strictMode: true, autoSanitize: true });
      const noSanitizeValidator = new ContentValidator({ strictMode: true, autoSanitize: false });
      
      const content = 'You should choose this option.';
      
      const sanitizeResult = sanitizeValidator.validateContent(content);
      const noSanitizeResult = noSanitizeValidator.validateContent(content);

      expect(sanitizeResult.sanitizedContent).not.toBe(content);
      expect(noSanitizeResult.sanitizedContent).toBe(content);
    });
  });

  describe('Custom Patterns', () => {
    test('should support custom validation patterns', () => {
      const config: ValidationConfig = {
        strictMode: true,
        autoSanitize: true,
        customPatterns: [{
          pattern: /\bcustom-violation\b/gi,
          violationType: 'recommendation_language',
          description: 'Custom test pattern',
          replacement: 'custom-replacement',
        }],
      };

      const customValidator = new ContentValidator(config);
      const content = 'This contains a custom-violation that should be detected.';
      const result = customValidator.validateContent(content);

      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]?.description).toBe('Custom test pattern');
      expect(result.sanitizedContent).toContain('custom-replacement');
    });
  });

  describe('Validation Statistics', () => {
    test('should provide validation statistics', () => {
      const content = 'You should choose Microsoft Azure as it guarantees compliance.';
      const stats = validator.getValidationStats(content);

      expect(stats.totalChecks).toBeGreaterThan(0);
      expect(stats.violationsByType.recommendation_language).toBeGreaterThan(0);
      expect(stats.violationsByType.vendor_mention).toBeGreaterThan(0);
      expect(stats.violationsByType.compliance_guarantee).toBeGreaterThan(0);
      expect(stats.overallRisk).toBe('high');
    });

    test('should calculate risk levels correctly', () => {
      const lowRiskContent = 'This analysis provides comparative insights for decision support.';
      const highRiskContent = 'You should always choose Microsoft Azure as it guarantees compliance and is legally required.';

      const lowStats = validator.getValidationStats(lowRiskContent);
      const highStats = validator.getValidationStats(highRiskContent);

      expect(lowStats.overallRisk).toBe('low');
      expect(highStats.overallRisk).toBe('high');
    });
  });

  describe('Utility Functions', () => {
    test('validateContent utility function should work', () => {
      const content = 'You should choose this option.';
      const result = validateContent(content);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    test('validateContent with custom config should work', () => {
      const content = 'You should choose this option.';
      const config: ValidationConfig = { strictMode: false, autoSanitize: false };
      const result = validateContent(content, config);

      expect(result.violations[0]?.severity).toBe('warning');
      expect(result.sanitizedContent).toBe(content);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty content', () => {
      const result = validator.validateContent('');
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.sanitizedContent).toBe('');
    });

    test('should handle content with no violations', () => {
      const content = 'This analysis provides comparative insights to support decision-making processes.';
      const result = validator.validateContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.sanitizedContent).toBe(content);
    });

    test('should handle multiple violations of the same type', () => {
      const content = 'You should choose Microsoft over Amazon and always use Azure.';
      const result = validator.validateContent(content);
      
      expect(result.violations.length).toBeGreaterThan(3);
      expect(result.violations.filter(v => v.type === 'vendor_mention')).toHaveLength(3);
    });
  });
});