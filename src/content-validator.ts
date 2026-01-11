/**
 * Content Validation System
 * 
 * Implements checks to prevent recommendation language, vendor/product mentions,
 * compliance guarantees, and legal interpretations in system outputs.
 * 
 * Requirements: 1.4, 1.5, 1.6, 9.2, 9.3
 */

/**
 * Content validation result
 */
export interface ContentValidationResult {
  /** Whether the content passes all validation checks */
  isValid: boolean;
  /** List of validation violations found */
  violations: ContentViolation[];
  /** Sanitized content with violations removed/replaced */
  sanitizedContent: string;
}

/**
 * Content validation violation
 */
export interface ContentViolation {
  /** Type of violation detected */
  type: ViolationType;
  /** Description of the violation */
  description: string;
  /** The problematic text that was found */
  violatingText: string;
  /** Suggested replacement text (if applicable) */
  suggestedReplacement?: string;
  /** Severity level of the violation */
  severity: 'error' | 'warning';
}

/**
 * Types of content violations
 */
export type ViolationType = 
  | 'recommendation_language'
  | 'vendor_mention'
  | 'product_guidance'
  | 'compliance_guarantee'
  | 'legal_interpretation'
  | 'universal_superiority'
  | 'prescriptive_guidance';

/**
 * Content validation configuration
 */
export interface ValidationConfig {
  /** Whether to perform strict validation (errors) or lenient (warnings) */
  strictMode: boolean;
  /** Whether to automatically sanitize content */
  autoSanitize: boolean;
  /** Custom patterns to check for violations */
  customPatterns?: ValidationPattern[];
}

/**
 * Custom validation pattern
 */
export interface ValidationPattern {
  /** Regular expression pattern to match */
  pattern: RegExp;
  /** Type of violation this pattern detects */
  violationType: ViolationType;
  /** Description of what this pattern catches */
  description: string;
  /** Replacement text for matched content */
  replacement?: string;
}

/**
 * Content Validator class
 */
export class ContentValidator {
  private config: ValidationConfig;
  private recommendationPatterns: ValidationPattern[] = [];
  private vendorPatterns: ValidationPattern[] = [];
  private compliancePatterns: ValidationPattern[] = [];
  private legalPatterns: ValidationPattern[] = [];

  constructor(config: ValidationConfig = { strictMode: true, autoSanitize: true }) {
    this.config = config;
    this.initializePatterns();
  }

  /**
   * Validate content against all violation types
   */
  public validateContent(content: string): ContentValidationResult {
    const violations: ContentViolation[] = [];
    let sanitizedContent = content;

    // Check for recommendation language violations
    const recommendationViolations = this.checkRecommendationLanguage(content);
    violations.push(...recommendationViolations);

    // Check for vendor/product mentions
    const vendorViolations = this.checkVendorMentions(content);
    violations.push(...vendorViolations);

    // Check for compliance guarantees
    const complianceViolations = this.checkComplianceGuarantees(content);
    violations.push(...complianceViolations);

    // Check for legal interpretations
    const legalViolations = this.checkLegalInterpretations(content);
    violations.push(...legalViolations);

    // Check custom patterns if provided
    if (this.config.customPatterns) {
      const customViolations = this.checkCustomPatterns(content);
      violations.push(...customViolations);
    }

    // Sanitize content if auto-sanitization is enabled
    if (this.config.autoSanitize) {
      sanitizedContent = this.sanitizeContent(content, violations);
    }

    return {
      isValid: violations.length === 0,
      violations,
      sanitizedContent,
    };
  }

  /**
   * Check for recommendation language that suggests universal superiority
   */
  private checkRecommendationLanguage(content: string): ContentViolation[] {
    const violations: ContentViolation[] = [];

    for (const pattern of this.recommendationPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          violations.push({
            type: 'recommendation_language',
            description: pattern.description,
            violatingText: match,
            ...(pattern.replacement && { suggestedReplacement: pattern.replacement }),
            severity: this.config.strictMode ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check for vendor or product mentions
   */
  private checkVendorMentions(content: string): ContentViolation[] {
    const violations: ContentViolation[] = [];

    for (const pattern of this.vendorPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          violations.push({
            type: 'vendor_mention',
            description: pattern.description,
            violatingText: match,
            ...(pattern.replacement && { suggestedReplacement: pattern.replacement }),
            severity: this.config.strictMode ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check for compliance guarantees
   */
  private checkComplianceGuarantees(content: string): ContentViolation[] {
    const violations: ContentViolation[] = [];

    for (const pattern of this.compliancePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          violations.push({
            type: 'compliance_guarantee',
            description: pattern.description,
            violatingText: match,
            ...(pattern.replacement && { suggestedReplacement: pattern.replacement }),
            severity: this.config.strictMode ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check for legal interpretations
   */
  private checkLegalInterpretations(content: string): ContentViolation[] {
    const violations: ContentViolation[] = [];

    for (const pattern of this.legalPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          violations.push({
            type: 'legal_interpretation',
            description: pattern.description,
            violatingText: match,
            ...(pattern.replacement && { suggestedReplacement: pattern.replacement }),
            severity: this.config.strictMode ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check custom validation patterns
   */
  private checkCustomPatterns(content: string): ContentViolation[] {
    const violations: ContentViolation[] = [];

    if (!this.config.customPatterns) return violations;

    for (const pattern of this.config.customPatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          violations.push({
            type: pattern.violationType,
            description: pattern.description,
            violatingText: match,
            ...(pattern.replacement && { suggestedReplacement: pattern.replacement }),
            severity: this.config.strictMode ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Sanitize content by replacing violations with appropriate alternatives
   */
  private sanitizeContent(content: string, violations: ContentViolation[]): string {
    let sanitized = content;

    for (const violation of violations) {
      if (violation.suggestedReplacement) {
        sanitized = sanitized.replace(violation.violatingText, violation.suggestedReplacement);
      } else {
        // Remove the violating text if no replacement is provided
        sanitized = sanitized.replace(violation.violatingText, '');
      }
    }

    return sanitized;
  }

  /**
   * Initialize validation patterns for different violation types
   */
  private initializePatterns(): void {
    // Recommendation language patterns
    this.recommendationPatterns = [
      {
        pattern: /\b(should choose|recommend|best option|optimal choice|superior|better than|preferred|ideal)\b/gi,
        violationType: 'recommendation_language',
        description: 'Contains recommendation language suggesting universal superiority',
        replacement: 'may consider',
      },
      {
        pattern: /\b(you should|we recommend|it is recommended|the best approach)\b/gi,
        violationType: 'recommendation_language',
        description: 'Contains prescriptive recommendation language',
        replacement: 'organizations may evaluate',
      },
      {
        pattern: /\b(always use|never use|must implement|required approach)\b/gi,
        violationType: 'universal_superiority',
        description: 'Contains universal directive language',
        replacement: 'may consider',
      },
    ];

    // Vendor/product mention patterns
    this.vendorPatterns = [
      {
        pattern: /\b(Microsoft|Google|Amazon|AWS|Azure|Okta|Ping|CyberArk|SailPoint|Splunk|IBM|Oracle)\b/gi,
        violationType: 'vendor_mention',
        description: 'Contains specific vendor mention',
        replacement: '[vendor name]',
      },
      {
        pattern: /\b(Active Directory|Office 365|G Suite|Workspace|S3|EC2|Lambda)\b/gi,
        violationType: 'product_guidance',
        description: 'Contains specific product mention',
        replacement: '[product name]',
      },
    ];

    // Compliance guarantee patterns
    this.compliancePatterns = [
      {
        pattern: /\b(guarantees compliance|ensures regulatory|meets all requirements|fully compliant)\b/gi,
        violationType: 'compliance_guarantee',
        description: 'Contains compliance guarantee language',
        replacement: 'may support compliance efforts',
      },
      {
        pattern: /\b(will pass audit|audit-proof|regulatory approval|compliance certification)\b/gi,
        violationType: 'compliance_guarantee',
        description: 'Contains audit or certification guarantee',
        replacement: 'may assist with audit preparation',
      },
    ];

    // Legal interpretation patterns
    this.legalPatterns = [
      {
        pattern: /\b(legally required|law mandates|regulation requires|legal obligation)\b/gi,
        violationType: 'legal_interpretation',
        description: 'Contains legal interpretation or requirement statement',
        replacement: 'regulatory frameworks may indicate',
      },
      {
        pattern: /\b(legal advice|attorney|counsel|legal opinion|law firm)\b/gi,
        violationType: 'legal_interpretation',
        description: 'Contains legal advice language',
        replacement: 'professional guidance',
      },
    ];
  }

  /**
   * Update validation configuration
   */
  public updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Add custom validation pattern
   */
  public addCustomPattern(pattern: ValidationPattern): void {
    if (!this.config.customPatterns) {
      this.config.customPatterns = [];
    }
    this.config.customPatterns.push(pattern);
  }

  /**
   * Get current validation statistics
   */
  public getValidationStats(content: string): {
    totalChecks: number;
    violationsByType: Record<ViolationType, number>;
    overallRisk: 'low' | 'medium' | 'high';
  } {
    const result = this.validateContent(content);
    const violationsByType: Record<ViolationType, number> = {
      recommendation_language: 0,
      vendor_mention: 0,
      product_guidance: 0,
      compliance_guarantee: 0,
      legal_interpretation: 0,
      universal_superiority: 0,
      prescriptive_guidance: 0,
    };

    result.violations.forEach(violation => {
      violationsByType[violation.type]++;
    });

    const totalViolations = result.violations.length;
    const overallRisk = totalViolations === 0 ? 'low' : 
                       totalViolations <= 3 ? 'medium' : 'high';

    return {
      totalChecks: Object.keys(violationsByType).length,
      violationsByType,
      overallRisk,
    };
  }
}

/**
 * Default content validator instance
 */
export const defaultContentValidator = new ContentValidator({
  strictMode: true,
  autoSanitize: true,
});

/**
 * Utility function to quickly validate content
 */
export function validateContent(content: string, config?: ValidationConfig): ContentValidationResult {
  const validator = config ? new ContentValidator(config) : defaultContentValidator;
  return validator.validateContent(content);
}