/**
 * Conflict Detection Engine
 * 
 * Detects and explains constraint conflicts in organizational requirements
 * with neutral language and stakeholder alignment suggestions, including
 * comprehensive error handling and fallback capabilities.
 */

import { ConstraintProfile, ConflictWarning } from './types';
import { CONFLICT_DETECTION_RULES } from './constants';
import { ProcessingErrorHandler, FallbackAnalysisResult } from './error-handling';

/**
 * Conflict detection rule interface
 */
interface ConflictRule {
  /** Unique identifier for this conflict type */
  id: string;
  /** Human-readable title for the conflict */
  title: string;
  /** Function to detect if this conflict exists in a profile */
  detector: (profile: ConstraintProfile) => boolean;
  /** Function to generate detailed explanation */
  explainer: (profile: ConstraintProfile) => ConflictExplanation;
}

/**
 * Detailed conflict explanation
 */
interface ConflictExplanation {
  /** Why this conflict exists */
  description: string;
  /** Implications for decision-making */
  implications: string[];
  /** Suggested approaches for resolution */
  resolutionSuggestions: string[];
  /** Constraint values that triggered the conflict */
  triggeringConstraints: Partial<ConstraintProfile>;
}

/**
 * Conflict detection result with error handling
 */
export interface ConflictDetectionResult {
  /** List of detected conflicts */
  conflicts: ConflictWarning[];
  /** Whether any conflicts were found */
  hasConflicts: boolean;
  /** Summary of conflict categories found */
  conflictSummary: string[];
  /** Whether this is a fallback result due to processing errors */
  isFallback: boolean;
  /** Fallback information if applicable */
  fallbackInfo?: FallbackAnalysisResult;
}

/**
 * High Compliance vs Low Cost conflict rule
 */
const highComplianceVsLowCostRule: ConflictRule = {
  id: 'compliance-cost-conflict',
  title: 'High Compliance Requirements vs Cost Sensitivity',
  detector: (profile: ConstraintProfile) => {
    return profile.complianceStrictness >= CONFLICT_DETECTION_RULES.highComplianceVsLowCost.complianceThreshold &&
           profile.costSensitivity >= CONFLICT_DETECTION_RULES.highComplianceVsLowCost.costThreshold;
  },
  explainer: (profile: ConstraintProfile) => ({
    description: 'Comprehensive compliance controls typically require significant security infrastructure investment, which may conflict with cost optimization objectives.',
    implications: [
      'Compliance requirements may drive higher infrastructure and operational costs',
      'Cost constraints may limit available compliance control options',
      'Budget allocation decisions will need to balance regulatory requirements with financial constraints',
      'May require phased implementation to spread costs over time'
    ],
    resolutionSuggestions: [
      'Conduct cost-benefit analysis of compliance requirements to identify high-impact, cost-effective controls',
      'Explore shared services or cloud-based compliance solutions to reduce infrastructure costs',
      'Consider phased compliance implementation to distribute costs across budget cycles',
      'Engage stakeholders to align on compliance priorities and acceptable cost levels',
      'Investigate automation opportunities to reduce ongoing operational compliance costs'
    ],
    triggeringConstraints: {
      complianceStrictness: profile.complianceStrictness,
      costSensitivity: profile.costSensitivity
    }
  })
};

/**
 * Low Risk Tolerance vs High User Experience Priority conflict rule
 */
const lowRiskToleranceVsHighUXRule: ConflictRule = {
  id: 'risk-ux-conflict',
  title: 'Low Risk Tolerance vs High User Experience Priority',
  detector: (profile: ConstraintProfile) => {
    return profile.riskTolerance <= CONFLICT_DETECTION_RULES.lowRiskToleranceVsHighUX.riskToleranceThreshold &&
           profile.userExperiencePriority >= CONFLICT_DETECTION_RULES.lowRiskToleranceVsHighUX.uxPriorityThreshold;
  },
  explainer: (profile: ConstraintProfile) => ({
    description: 'Strong security controls may introduce user interaction and verification steps, potentially creating tension between seamless user experience goals and comprehensive security requirements.',
    implications: [
      'Security controls may introduce friction that impacts user productivity and satisfaction',
      'User experience optimization may reduce the effectiveness of security controls',
      'May drive users toward shadow IT solutions that bypass security controls',
      'Requires careful balance between security effectiveness and user adoption'
    ],
    resolutionSuggestions: [
      'Consider implementing risk-based authentication that applies stronger controls only when needed',
      'Consider investing in user experience design for security controls to minimize friction',
      'Consider single sign-on and passwordless authentication technologies',
      'Engage users in security control design to identify acceptable friction levels',
      'Implement adaptive security that adjusts controls based on context and risk'
    ],
    triggeringConstraints: {
      riskTolerance: profile.riskTolerance,
      userExperiencePriority: profile.userExperiencePriority
    }
  })
};

/**
 * High Business Agility vs Low Operational Maturity conflict rule
 */
const highAgilityVsLowMaturityRule: ConflictRule = {
  id: 'agility-maturity-conflict',
  title: 'High Business Agility vs Low Operational Maturity',
  detector: (profile: ConstraintProfile) => {
    return profile.businessAgility >= CONFLICT_DETECTION_RULES.highAgilityVsLowMaturity.agilityThreshold &&
           profile.operationalMaturity <= CONFLICT_DETECTION_RULES.highAgilityVsLowMaturity.maturityThreshold;
  },
  explainer: (profile: ConstraintProfile) => ({
    description: 'Rapid business changes require sophisticated, flexible security architectures that may exceed current operational team capacity for managing adaptive security systems.',
    implications: [
      'Current operational capabilities may not support rapid security architecture changes',
      'Business agility goals may be constrained by security operational limitations',
      'May require significant investment in team skills and tooling',
      'Risk of security gaps during rapid business changes'
    ],
    resolutionSuggestions: [
      'Develop operational maturity roadmap aligned with business agility goals',
      'Consider investing in automation and orchestration tools to reduce manual operational overhead',
      'Consider managed security services to supplement internal capabilities',
      'Implement gradual capability building while supporting immediate business needs',
      'Establish clear operational readiness criteria for new security capabilities'
    ],
    triggeringConstraints: {
      businessAgility: profile.businessAgility,
      operationalMaturity: profile.operationalMaturity
    }
  })
};

/**
 * High Compliance vs High Business Agility conflict rule
 */
const highComplianceVsHighAgilityRule: ConflictRule = {
  id: 'compliance-agility-conflict',
  title: 'High Compliance Requirements vs High Business Agility',
  detector: (profile: ConstraintProfile) => {
    return profile.complianceStrictness >= CONFLICT_DETECTION_RULES.highComplianceVsHighAgility.complianceThreshold &&
           profile.businessAgility >= CONFLICT_DETECTION_RULES.highComplianceVsHighAgility.agilityThreshold;
  },
  explainer: (profile: ConstraintProfile) => ({
    description: 'Regulatory requirements often impose process constraints and approval workflows that can slow business process adaptation and innovation cycles.',
    implications: [
      'Compliance approval processes may slow business change implementation',
      'Regulatory constraints may limit architectural flexibility and innovation',
      'May require additional governance overhead for business changes',
      'Risk of compliance gaps during rapid business evolution'
    ],
    resolutionSuggestions: [
      'Implement compliance-by-design principles in business processes',
      'Establish pre-approved architectural patterns that support both compliance and agility',
      'Create streamlined compliance review processes for low-risk changes',
      'Engage compliance teams early in business change planning',
      'Consider regulatory sandboxes or innovation frameworks where available'
    ],
    triggeringConstraints: {
      complianceStrictness: profile.complianceStrictness,
      businessAgility: profile.businessAgility
    }
  })
};

/**
 * All conflict detection rules
 */
const CONFLICT_RULES: ConflictRule[] = [
  highComplianceVsLowCostRule,
  lowRiskToleranceVsHighUXRule,
  highAgilityVsLowMaturityRule,
  highComplianceVsHighAgilityRule
];

/**
 * Converts a conflict rule result to a ConflictWarning
 */
function createConflictWarning(rule: ConflictRule, explanation: ConflictExplanation): ConflictWarning {
  return {
    conflictId: rule.id,
    title: rule.title,
    description: explanation.description,
    implications: explanation.implications,
    resolutionSuggestions: explanation.resolutionSuggestions,
    triggeringConstraints: explanation.triggeringConstraints
  };
}

/**
 * Detects all conflicts in a constraint profile with error handling
 * 
 * @param profile - The constraint profile to analyze
 * @returns Complete conflict detection results with fallback support
 */
export function detectConflicts(profile: ConstraintProfile): ConflictDetectionResult {
  const errorHandler = new ProcessingErrorHandler();
  
  try {
    return detectConflictsInternal(profile);
  } catch (error) {
    // Handle conflict detection failure with fallback
    const fallbackResult = errorHandler.handleConflictDetectionFailure(
      error instanceof Error ? error : new Error('Unknown conflict detection error'),
      profile
    );
    
    return createFallbackConflictResult(profile, fallbackResult);
  }
}

/**
 * Internal conflict detection function
 */
function detectConflictsInternal(profile: ConstraintProfile): ConflictDetectionResult {
  const conflicts: ConflictWarning[] = [];
  const conflictSummary: string[] = [];

  // Check each conflict rule
  for (const rule of CONFLICT_RULES) {
    if (rule.detector(profile)) {
      const explanation = rule.explainer(profile);
      const warning = createConflictWarning(rule, explanation);
      conflicts.push(warning);
      conflictSummary.push(rule.title);
    }
  }

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    conflictSummary,
    isFallback: false,
  };
}

/**
 * Create fallback conflict detection result when processing fails
 */
function createFallbackConflictResult(
  profile: ConstraintProfile,
  fallbackResult: FallbackAnalysisResult
): ConflictDetectionResult {
  // Create basic conflict warnings based on simple heuristics
  const fallbackConflicts: ConflictWarning[] = [];
  
  // Simple heuristic: if any constraints are at extreme values, flag for manual review
  const extremeConstraints = [];
  if (profile.complianceStrictness >= 8 && profile.costSensitivity >= 8) {
    extremeConstraints.push('High compliance and cost sensitivity');
  }
  if (profile.riskTolerance <= 3 && profile.userExperiencePriority >= 8) {
    extremeConstraints.push('Low risk tolerance and high UX priority');
  }
  
  if (extremeConstraints.length > 0) {
    fallbackConflicts.push({
      conflictId: 'fallback-manual-review',
      title: 'Manual Conflict Review Required',
      description: 'Automated conflict detection unavailable - manual review recommended for potential constraint conflicts',
      implications: [
        'Constraint combinations may create implementation challenges',
        'Stakeholder alignment may be needed to resolve competing priorities',
        'Professional consultation recommended for conflict resolution',
      ],
      resolutionSuggestions: [
        'Conduct manual review of constraint combinations',
        'Engage stakeholders to discuss competing priorities',
        'Consider professional consultation for conflict resolution',
        'Retry automated analysis after addressing system issues',
      ],
      triggeringConstraints: {
        complianceStrictness: profile.complianceStrictness,
        costSensitivity: profile.costSensitivity,
        riskTolerance: profile.riskTolerance,
        userExperiencePriority: profile.userExperiencePriority,
      },
    });
  }
  
  return {
    conflicts: fallbackConflicts,
    hasConflicts: fallbackConflicts.length > 0,
    conflictSummary: fallbackConflicts.map(c => c.title),
    isFallback: true,
    fallbackInfo: fallbackResult,
  };
}

/**
 * Checks if a specific conflict type exists in a profile
 * 
 * @param profile - The constraint profile to check
 * @param conflictId - The specific conflict ID to look for
 * @returns Whether the conflict exists
 */
export function hasSpecificConflict(profile: ConstraintProfile, conflictId: string): boolean {
  const rule = CONFLICT_RULES.find(r => r.id === conflictId);
  return rule ? rule.detector(profile) : false;
}

/**
 * Gets explanation for a specific conflict if it exists
 * 
 * @param profile - The constraint profile to analyze
 * @param conflictId - The specific conflict ID to explain
 * @returns Conflict warning if conflict exists, null otherwise
 */
export function getConflictExplanation(profile: ConstraintProfile, conflictId: string): ConflictWarning | null {
  const rule = CONFLICT_RULES.find(r => r.id === conflictId);
  if (!rule || !rule.detector(profile)) {
    return null;
  }

  const explanation = rule.explainer(profile);
  return createConflictWarning(rule, explanation);
}

/**
 * Gets all available conflict rule IDs
 * 
 * @returns Array of all conflict rule identifiers
 */
export function getAvailableConflictTypes(): string[] {
  return CONFLICT_RULES.map(rule => rule.id);
}

/**
 * Validates that conflict detection is working properly
 * 
 * @returns Basic health check result
 */
export function validateConflictDetection(): { isHealthy: boolean; ruleCount: number } {
  return {
    isHealthy: CONFLICT_RULES.length > 0,
    ruleCount: CONFLICT_RULES.length
  };
}