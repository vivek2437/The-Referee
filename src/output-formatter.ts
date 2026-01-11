/**
 * Structured Output Formatter
 * 
 * Creates comparison table generation, trade-off summary formatting, conflict warning display,
 * assumption disclosure formatting, and interpretation guidance sections with comprehensive
 * error handling and plain text fallback capabilities.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.6
 */

import { 
  AnalysisResult, 
  ArchitectureScore, 
  ConflictWarning, 
  TradeoffAnalysis, 
  AssumptionDisclosure,
  DimensionScores,
  ArchitectureType,
  OutputPreferences,
  PersonaContext
} from './types';
import { PersonaContentGenerator, PersonaContent } from './persona-content-generator';
import { DecisionSupportMessaging } from './decision-support-messaging';
import { NearTieDetectionResult } from './near-tie-detector';
import { ProcessingErrorHandler, FallbackAnalysisResult } from './error-handling';

/**
 * Formatted output structure for enterprise consumption
 */
export interface FormattedOutput {
  /** Document header with metadata */
  header: OutputHeader;
  /** Executive summary section */
  executiveSummary: string;
  /** Comparison table showing scores across dimensions */
  comparisonTable: ComparisonTable;
  /** Trade-off analysis summary */
  tradeoffSummary: FormattedTradeoffSummary;
  /** Conflict warnings if any detected */
  conflictWarnings: FormattedConflictWarning[];
  /** Persona-specific content sections */
  personaContent: PersonaContent;
  /** Assumption disclosures for transparency */
  assumptionDisclosures: FormattedAssumptionDisclosure[];
  /** Interpretation guidance for proper usage */
  interpretationGuidance: InterpretationGuidance;
  /** Decision support disclaimers and notices */
  disclaimers: DisclaimerSection;
  /** Document footer with metadata */
  footer: OutputFooter;
  /** Whether this is a fallback result due to formatting errors */
  isFallback: boolean;
  /** Fallback information if applicable */
  fallbackInfo?: FallbackAnalysisResult;
}

/**
 * Document header information
 */
export interface OutputHeader {
  title: string;
  subtitle: string;
  analysisDate: string;
  engineVersion: string;
  targetPersona: string;
  documentId: string;
}

/**
 * Structured comparison table
 */
export interface ComparisonTable {
  /** Table headers */
  headers: string[];
  /** Dimension rows with scores */
  dimensionRows: DimensionRow[];
  /** Summary row with weighted totals */
  summaryRow: SummaryRow;
  /** Table notes and explanations */
  notes: string[];
}

export interface DimensionRow {
  dimensionName: string;
  dimensionDescription: string;
  scores: Record<ArchitectureType, number>;
  interpretation: string;
}

export interface SummaryRow {
  label: string;
  weightedScores: Record<ArchitectureType, number>;
  confidenceLevels: Record<ArchitectureType, string>;
  isNearTie: boolean;
}

/**
 * Formatted trade-off analysis
 */
export interface FormattedTradeoffSummary {
  title: string;
  keyDecisionFactors: string[];
  primaryTradeoffs: FormattedTradeoff[];
  nearTieAnalysis?: NearTieAnalysis | undefined;
  recommendations: string[];
}

export interface FormattedTradeoff {
  dimensionName: string;
  description: string;
  architectureImpacts: Record<ArchitectureType, string>;
  businessImplications: string;
}

export interface NearTieAnalysis {
  message: string;
  threshold: number;
  guidance: string[];
}

/**
 * Formatted conflict warning
 */
export interface FormattedConflictWarning {
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  implications: string[];
  resolutionGuidance: string[];
  affectedConstraints: string[];
}

/**
 * Formatted assumption disclosure
 */
export interface FormattedAssumptionDisclosure {
  category: string;
  description: string;
  impact: string;
  recommendation: string;
  businessContext: string;
}

/**
 * Interpretation guidance section
 */
export interface InterpretationGuidance {
  title: string;
  usageGuidelines: string[];
  limitations: string[];
  nextSteps: string[];
  validationRequirements: string[];
}

/**
 * Disclaimer section
 */
export interface DisclaimerSection {
  primaryDisclaimer: string;
  additionalNotices: string[];
  humanOversightRequirement: string;
  professionalValidationNotice: string;
}

/**
 * Document footer
 */
export interface OutputFooter {
  generatedBy: string;
  timestamp: string;
  version: string;
  contactInfo: string;
}

/**
 * Main output formatter class with error handling
 */
export class OutputFormatter {
  private personaGenerator: PersonaContentGenerator;
  private messagingService: DecisionSupportMessaging;
  private errorHandler: ProcessingErrorHandler;

  constructor() {
    this.personaGenerator = new PersonaContentGenerator();
    this.messagingService = new DecisionSupportMessaging();
    this.errorHandler = new ProcessingErrorHandler();
  }

  /**
   * Format complete analysis results for enterprise consumption with error handling
   * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.6 - Plain text fallback for formatting errors
   */
  formatAnalysisOutput(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): FormattedOutput {
    try {
      return this.formatAnalysisOutputInternal(analysisResult, outputPreferences);
    } catch (error) {
      // Handle formatting failure with plain text fallback
      const fallbackResult = this.errorHandler.handleFormattingFailure(
        error instanceof Error ? error : new Error('Unknown formatting error'),
        analysisResult
      );
      
      return this.createPlainTextFallback(analysisResult, outputPreferences, fallbackResult);
    }
  }

  /**
   * Internal formatting function
   */
  private formatAnalysisOutputInternal(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): FormattedOutput {
    const personaContent = this.personaGenerator.generatePersonaContent(
      analysisResult, 
      outputPreferences.personaContext
    );

    return {
      header: this.generateHeader(analysisResult, outputPreferences),
      executiveSummary: personaContent.executiveSummary,
      comparisonTable: this.generateComparisonTable(analysisResult, outputPreferences),
      tradeoffSummary: this.generateTradeoffSummary(analysisResult, outputPreferences),
      conflictWarnings: this.generateConflictWarnings(analysisResult.detectedConflicts),
      personaContent: personaContent,
      assumptionDisclosures: this.generateAssumptionDisclosures(analysisResult.assumptions),
      interpretationGuidance: this.generateInterpretationGuidance(analysisResult, outputPreferences),
      disclaimers: this.generateDisclaimers(analysisResult),
      footer: this.generateFooter(analysisResult),
      isFallback: false,
    };
  }

  /**
   * Create plain text fallback when formatting fails
   * Requirements: 9.6 - Plain text output fallback for formatting errors
   */
  private createPlainTextFallback(
    analysisResult: AnalysisResult,
    outputPreferences: OutputPreferences,
    fallbackResult: FallbackAnalysisResult
  ): FormattedOutput {
    const plainTextContent = this.generatePlainTextContent(analysisResult, outputPreferences);
    
    // Create minimal structured output with plain text content
    const fallbackOutput: FormattedOutput = {
      header: {
        title: 'Security Architecture Analysis (Plain Text)',
        subtitle: 'Fallback format due to formatting error',
        analysisDate: analysisResult.analysisTimestamp.toLocaleDateString(),
        engineVersion: analysisResult.engineVersion + '-fallback',
        targetPersona: outputPreferences.personaContext.persona,
        documentId: `FALLBACK-${Date.now()}`,
      },
      executiveSummary: plainTextContent.executiveSummary,
      comparisonTable: plainTextContent.comparisonTable,
      tradeoffSummary: plainTextContent.tradeoffSummary,
      conflictWarnings: plainTextContent.conflictWarnings,
      personaContent: {
        executiveSummary: plainTextContent.executiveSummary,
        keyInsights: ['Formatting error - manual review recommended'],
        strategicConsiderations: ['Formatting error - manual review recommended'],
        stakeholderGuidance: ['Stakeholder communication templates unavailable'],
        riskCompliance: ['Risk analysis unavailable due to formatting error'],
      },
      assumptionDisclosures: plainTextContent.assumptionDisclosures,
      interpretationGuidance: plainTextContent.interpretationGuidance,
      disclaimers: {
        primaryDisclaimer: 'This is a plain text fallback due to formatting error. Manual review recommended.',
        additionalNotices: [
          'Full formatted output unavailable due to system error',
          'All analysis content included but formatting is simplified',
          'Consider retrying analysis for full formatted output',
        ],
        humanOversightRequirement: 'Human oversight required - especially given formatting limitations',
        professionalValidationNotice: 'Professional validation strongly recommended due to formatting error',
      },
      footer: {
        generatedBy: 'SecureStack Referee (Fallback Mode)',
        timestamp: new Date().toISOString(),
        version: analysisResult.engineVersion + '-fallback',
        contactInfo: 'Contact system administrator regarding formatting error',
      },
      isFallback: true,
      fallbackInfo: fallbackResult,
    };

    return fallbackOutput;
  }

  /**
   * Generate plain text content for fallback scenarios
   */
  private generatePlainTextContent(
    analysisResult: AnalysisResult,
    outputPreferences: OutputPreferences
  ) {
    const executiveSummary = `
SECURITY ARCHITECTURE ANALYSIS (PLAIN TEXT FALLBACK)

Analysis Date: ${analysisResult.analysisTimestamp.toLocaleDateString()}
Target Persona: ${outputPreferences.personaContext.persona}

IMPORTANT: This is a simplified plain text version due to formatting error.

ARCHITECTURE SCORES:
${analysisResult.architectureScores.map(score => 
  `${score.architectureType}: ${score.weightedScore} (${score.confidenceLevel} confidence)`
).join('\n')}

KEY FINDINGS:
- Full analysis completed but formatting unavailable
- Manual review of detailed results recommended
- Consider retrying analysis for complete formatted output
    `.trim();

    const comparisonTable: ComparisonTable = {
      headers: ['Architecture', 'Score', 'Confidence'],
      dimensionRows: [],
      summaryRow: {
        label: 'Weighted Scores',
        weightedScores: {} as Record<ArchitectureType, number>,
        confidenceLevels: {} as Record<ArchitectureType, string>,
        isNearTie: analysisResult.tradeoffSummary.isNearTie,
      },
      notes: ['Plain text fallback - detailed comparison unavailable'],
    };

    const tradeoffSummary: FormattedTradeoffSummary = {
      title: 'Trade-off Analysis (Simplified)',
      keyDecisionFactors: [
        'Formatting error prevents detailed trade-off analysis',
        'Manual evaluation recommended',
        'Consult with security architecture professionals',
      ],
      primaryTradeoffs: [],
      recommendations: [
        'Retry analysis for complete trade-off details',
        'Manual architecture comparison recommended',
        'Professional consultation advised',
      ],
    };

    const conflictWarnings: FormattedConflictWarning[] = analysisResult.detectedConflicts.map(conflict => ({
      title: conflict.title,
      severity: 'Medium' as const,
      description: conflict.description,
      implications: conflict.implications,
      resolutionGuidance: conflict.resolutionSuggestions,
      affectedConstraints: Object.keys(conflict.triggeringConstraints),
    }));

    const assumptionDisclosures: FormattedAssumptionDisclosure[] = analysisResult.assumptions.map(assumption => ({
      category: assumption.category,
      description: assumption.description,
      impact: assumption.impact,
      recommendation: assumption.recommendation,
      businessContext: 'Plain text fallback - detailed context unavailable',
    }));

    const interpretationGuidance: InterpretationGuidance = {
      title: 'Usage Guidance (Plain Text)',
      usageGuidelines: [
        'This is a fallback plain text version due to formatting error',
        'All analysis content is included but presentation is simplified',
        'Consider retrying analysis for full formatted output',
        'Manual review and professional validation strongly recommended',
      ],
      limitations: [
        'Formatting error limits presentation quality',
        'Detailed tables and structured content unavailable',
        'Visual elements and advanced formatting not available',
      ],
      nextSteps: [
        'Retry analysis to resolve formatting issues',
        'Manual review of analysis content',
        'Professional consultation recommended',
      ],
      validationRequirements: [
        'Professional validation required due to formatting limitations',
        'Manual verification of all analysis content',
        'Consider alternative analysis methods if errors persist',
      ],
    };

    return {
      executiveSummary,
      comparisonTable,
      tradeoffSummary,
      conflictWarnings,
      assumptionDisclosures,
      interpretationGuidance,
    };
  }

  /**
   * Generate document header
   * Requirements: 8.1 - Professional format suitable for enterprise decision-making
   */
  private generateHeader(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): OutputHeader {
    const personaName = outputPreferences.personaContext.persona === 'CISO' 
      ? 'Chief Information Security Officer' 
      : 'Enterprise Security Architect';

    return {
      title: 'Security Architecture Decision Support Analysis',
      subtitle: `Comparative Analysis of IRM-Heavy, URM-Heavy, and Hybrid Security Architectures`,
      analysisDate: analysisResult.analysisTimestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      engineVersion: analysisResult.engineVersion,
      targetPersona: personaName,
      documentId: `SSR-${analysisResult.analysisTimestamp.getTime().toString(36).toUpperCase()}`
    };
  }

  /**
   * Generate comparison table showing scores across all dimensions
   * Requirements: 8.1 - Comparison table showing scores across all dimensions
   */
  private generateComparisonTable(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): ComparisonTable {
    const dimensionNames: (keyof DimensionScores)[] = [
      'identityVerification',
      'behavioralAnalytics', 
      'operationalComplexity',
      'userExperience',
      'complianceAuditability',
      'scalabilityPerformance',
      'costEfficiency'
    ];

    const dimensionLabels: Record<keyof DimensionScores, string> = {
      identityVerification: 'Identity Verification Strength',
      behavioralAnalytics: 'Behavioral Analytics Sophistication',
      operationalComplexity: 'Operational Complexity',
      userExperience: 'User Experience Friction',
      complianceAuditability: 'Compliance Auditability',
      scalabilityPerformance: 'Scalability & Performance',
      costEfficiency: 'Cost Efficiency'
    };

    const dimensionDescriptions: Record<keyof DimensionScores, string> = {
      identityVerification: 'Confidence in user authentication and authorization decisions',
      behavioralAnalytics: 'Detection of anomalous behavior and insider threats through pattern analysis',
      operationalComplexity: 'Team capability requirements, maintenance overhead, and system reliability',
      userExperience: 'User adoption, productivity impact, and shadow IT risk',
      complianceAuditability: 'Regulatory requirements support and audit cost reduction',
      scalabilityPerformance: 'System ability to handle growth and peak loads without degradation',
      costEfficiency: 'Budget allocation optimization and ROI on security investments'
    };

    const dimensionRows: DimensionRow[] = dimensionNames.map(dimension => {
      const scores: Record<ArchitectureType, number> = {} as Record<ArchitectureType, number>;
      
      analysisResult.architectureScores.forEach(score => {
        scores[score.architectureType] = score.dimensionScores[dimension];
      });

      return {
        dimensionName: dimensionLabels[dimension],
        dimensionDescription: dimensionDescriptions[dimension],
        scores: scores,
        interpretation: this.generateDimensionInterpretation(dimension, scores)
      };
    });

    const summaryRow = this.generateSummaryRow(analysisResult.architectureScores, analysisResult.tradeoffSummary, analysisResult.nearTieDetection);

    return {
      headers: ['Dimension', 'IRM-Heavy', 'URM-Heavy', 'Hybrid', 'Interpretation'],
      dimensionRows: dimensionRows,
      summaryRow: summaryRow,
      notes: [
        'Scores are comparative (1-10 scale) and reflect relative strengths across architecture options.',
        'Higher scores indicate better performance in that dimension for the given architecture type.',
        'Weighted scores incorporate organizational constraint priorities.',
        'Near-tie results (within threshold) indicate trade-off analysis should drive decisions over numeric scores.'
      ]
    };
  }

  /**
   * Generate trade-off summary highlighting key decision factors
   * Requirements: 8.2 - Trade-off summary highlighting key decision factors
   */
  private generateTradeoffSummary(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): FormattedTradeoffSummary {
    const tradeoffSummary = analysisResult.tradeoffSummary;
    
    const formattedTradeoffs: FormattedTradeoff[] = tradeoffSummary.primaryTradeoffs.map(tradeoff => ({
      dimensionName: this.getDimensionDisplayName(tradeoff.dimension),
      description: tradeoff.description,
      architectureImpacts: tradeoff.architectureImpacts,
      businessImplications: this.generateBusinessImplications(tradeoff.dimension, outputPreferences.personaContext)
    }));

    // Use enhanced near-tie detection if available
    const nearTieAnalysis = analysisResult.nearTieDetection?.isNearTie ? {
      message: analysisResult.nearTieDetection.messaging.primaryMessage,
      threshold: analysisResult.nearTieDetection.thresholdUsed,
      guidance: analysisResult.nearTieDetection.messaging.decisionGuidance
    } : (tradeoffSummary.isNearTie ? {
      message: `Architecture scores are within ${tradeoffSummary.nearTieThreshold} points, indicating no clear winner.`,
      threshold: tradeoffSummary.nearTieThreshold,
      guidance: [
        'Focus on qualitative trade-offs rather than numeric score differences.',
        'Consider organizational readiness, implementation timeline, and team capabilities.',
        'Evaluate non-technical factors such as vendor relationships and support requirements.',
        'Conduct proof-of-concept validation to inform final decision.'
      ]
    } : undefined);

    return {
      title: 'Key Trade-offs and Decision Factors',
      keyDecisionFactors: tradeoffSummary.keyDecisionFactors,
      primaryTradeoffs: formattedTradeoffs,
      nearTieAnalysis: nearTieAnalysis,
      recommendations: [
        'Validate assumptions through stakeholder consultation and technical proof-of-concept.',
        'Consider implementation timeline and organizational change management requirements.',
        'Assess team readiness and training requirements for each architecture option.',
        'Evaluate integration complexity with existing security infrastructure.'
      ]
    };
  }

  /**
   * Generate conflict warnings when constraint tensions are detected
   * Requirements: 8.3 - Conflict warnings when constraint tensions are detected
   */
  private generateConflictWarnings(conflicts: ConflictWarning[]): FormattedConflictWarning[] {
    return conflicts.map(conflict => ({
      title: conflict.title,
      severity: this.determineConflictSeverity(conflict),
      description: conflict.description,
      implications: conflict.implications,
      resolutionGuidance: conflict.resolutionSuggestions,
      affectedConstraints: this.extractConstraintNames(conflict.triggeringConstraints)
    }));
  }

  /**
   * Generate assumption disclosures for transparency
   * Requirements: 8.4 - Assumption disclosures for transparency
   */
  private generateAssumptionDisclosures(assumptions: AssumptionDisclosure[]): FormattedAssumptionDisclosure[] {
    return assumptions.map(assumption => ({
      category: this.formatAssumptionCategory(assumption.category),
      description: assumption.description,
      impact: this.formatImpactLevel(assumption.impact),
      recommendation: assumption.recommendation,
      businessContext: this.generateBusinessContext(assumption)
    }));
  }

  /**
   * Generate interpretation guidance explaining how to use results appropriately
   * Requirements: 8.5 - Interpretation guidance explaining how to use results appropriately
   */
  private generateInterpretationGuidance(
    analysisResult: AnalysisResult, 
    outputPreferences: OutputPreferences
  ): InterpretationGuidance {
    const usageGuidelines = [
      'This analysis provides decision support, not decisions. Human judgment and professional validation are required.',
      'Scores are comparative and relative to the three architecture options evaluated, not absolute measures.',
      'Trade-off analysis should be weighted more heavily than numeric scores in decision-making.',
      'All assumptions should be validated with organizational stakeholders before proceeding.',
      'Consider implementation timeline, team readiness, and organizational change management in final decisions.'
    ];

    const limitations = [
      'Analysis is based on generalized architecture patterns and may not reflect organization-specific implementations.',
      'Scoring methodology uses standardized weights that may not perfectly align with unique organizational priorities.',
      'Technology vendor selection, specific product capabilities, and implementation details are not addressed.',
      'Regulatory compliance interpretation requires validation with legal and compliance professionals.',
      'Cost estimates are relative and do not include specific vendor pricing or implementation costs.'
    ];

    const nextSteps = outputPreferences.personaContext.persona === 'CISO' ? [
      'Present findings to executive team and board for strategic alignment discussion.',
      'Engage legal and compliance teams to validate regulatory assumptions.',
      'Schedule stakeholder alignment sessions to resolve any identified constraint conflicts.',
      'Develop business case and budget justification for preferred architecture option.',
      'Plan proof-of-concept validation to confirm technical assumptions.'
    ] : [
      'Conduct technical proof-of-concept to validate architecture assumptions.',
      'Engage application and infrastructure teams for detailed integration planning.',
      'Develop implementation roadmap with timeline and resource requirements.',
      'Create technical risk assessment and mitigation strategies.',
      'Establish success criteria and validation checkpoints for implementation.'
    ];

    const validationRequirements = [
      'Stakeholder review and approval of constraint assumptions and priorities.',
      'Technical validation through proof-of-concept implementation.',
      'Legal and compliance review of regulatory interpretation.',
      'Business case development and budget approval process.',
      'Risk assessment and mitigation planning with security operations team.'
    ];

    return {
      title: 'Interpretation and Usage Guidance',
      usageGuidelines: usageGuidelines,
      limitations: limitations,
      nextSteps: nextSteps,
      validationRequirements: validationRequirements
    };
  }

  /**
   * Generate disclaimers and decision support messaging
   */
  private generateDisclaimers(analysisResult: AnalysisResult): DisclaimerSection {
    const messages = this.messagingService.getMessagesForAnalysis(analysisResult);
    
    return {
      primaryDisclaimer: 'This system provides decision support analysis, not decisions. All architectural choices require human oversight, professional validation, and consideration of organization-specific factors not captured in this analysis.',
      additionalNotices: messages.map(msg => msg.content),
      humanOversightRequirement: 'Human oversight and professional judgment are required for all security architecture decisions. This analysis serves as input to, not replacement for, expert evaluation.',
      professionalValidationNotice: 'All findings should be validated by qualified security professionals, legal counsel, and compliance experts before implementation decisions.'
    };
  }

  /**
   * Generate document footer
   */
  private generateFooter(analysisResult: AnalysisResult): OutputFooter {
    return {
      generatedBy: 'SecureStack Referee Decision Support System',
      timestamp: analysisResult.analysisTimestamp.toISOString(),
      version: analysisResult.engineVersion,
      contactInfo: 'For questions about this analysis, consult with your security architecture team.'
    };
  }

  // Utility methods

  private generateSummaryRow(
    architectureScores: ArchitectureScore[], 
    tradeoffSummary: TradeoffAnalysis,
    nearTieDetection?: NearTieDetectionResult
  ): SummaryRow {
    const weightedScores: Record<ArchitectureType, number> = {} as Record<ArchitectureType, number>;
    const confidenceLevels: Record<ArchitectureType, string> = {} as Record<ArchitectureType, string>;

    architectureScores.forEach(score => {
      weightedScores[score.architectureType] = score.weightedScore;
      confidenceLevels[score.architectureType] = score.confidenceLevel;
    });

    // Use enhanced near-tie detection if available
    const isNearTie = nearTieDetection?.isNearTie ?? tradeoffSummary.isNearTie;

    return {
      label: 'Weighted Total Score',
      weightedScores: weightedScores,
      confidenceLevels: confidenceLevels,
      isNearTie: isNearTie
    };
  }

  private generateDimensionInterpretation(
    dimension: keyof DimensionScores, 
    scores: Record<ArchitectureType, number>
  ): string {
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    if (sortedScores.length === 0) {
      return 'No scores available for comparison.';
    }
    
    const highest = sortedScores[0];
    const lowest = sortedScores[sortedScores.length - 1];
    
    if (!highest || !lowest) {
      return 'Insufficient data for comparison.';
    }
    
    return `${highest[0]} architecture scores highest (${highest[1]}) while ${lowest[0]} scores lowest (${lowest[1]}) in this dimension.`;
  }

  private getDimensionDisplayName(dimension: keyof DimensionScores): string {
    const displayNames: Record<keyof DimensionScores, string> = {
      identityVerification: 'Identity Verification Strength',
      behavioralAnalytics: 'Behavioral Analytics Sophistication',
      operationalComplexity: 'Operational Complexity',
      userExperience: 'User Experience Friction',
      complianceAuditability: 'Compliance Auditability',
      scalabilityPerformance: 'Scalability & Performance',
      costEfficiency: 'Cost Efficiency'
    };
    return displayNames[dimension];
  }

  private generateBusinessImplications(
    dimension: keyof DimensionScores, 
    personaContext: PersonaContext
  ): string {
    const implications: Record<keyof DimensionScores, Record<string, string>> = {
      identityVerification: {
        CISO: 'Strong identity verification reduces security risk but may impact user productivity and support costs.',
        Enterprise_Security_Architect: 'Identity verification strength affects integration complexity and user experience design requirements.'
      },
      behavioralAnalytics: {
        CISO: 'Advanced behavioral analytics improve threat detection but require significant infrastructure investment and specialized skills.',
        Enterprise_Security_Architect: 'Behavioral analytics sophistication impacts data architecture, privacy controls, and operational monitoring requirements.'
      },
      operationalComplexity: {
        CISO: 'Operational complexity directly affects staffing costs, training requirements, and operational risk exposure.',
        Enterprise_Security_Architect: 'Operational complexity influences team structure, automation requirements, and maintenance overhead.'
      },
      userExperience: {
        CISO: 'User experience friction affects business productivity, shadow IT risk, and change management success.',
        Enterprise_Security_Architect: 'User experience design impacts application integration patterns and authentication flow architecture.'
      },
      complianceAuditability: {
        CISO: 'Compliance auditability affects regulatory risk, audit costs, and board reporting requirements.',
        Enterprise_Security_Architect: 'Compliance auditability influences logging architecture, control implementation, and evidence collection systems.'
      },
      scalabilityPerformance: {
        CISO: 'Scalability and performance affect business growth support and infrastructure investment requirements.',
        Enterprise_Security_Architect: 'Scalability and performance impact architecture design patterns, infrastructure sizing, and capacity planning.'
      },
      costEfficiency: {
        CISO: 'Cost efficiency directly impacts budget allocation, ROI justification, and long-term sustainability.',
        Enterprise_Security_Architect: 'Cost efficiency influences technology selection, implementation approach, and operational model design.'
      }
    };

    return implications[dimension][personaContext.persona] || 'Business implications vary by organizational context and implementation approach.';
  }

  private determineConflictSeverity(conflict: ConflictWarning): 'High' | 'Medium' | 'Low' {
    // Determine severity based on conflict implications and constraints
    if (conflict.implications.length >= 3 || conflict.conflictId.includes('compliance')) {
      return 'High';
    } else if (conflict.implications.length >= 2) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  private extractConstraintNames(constraints: Partial<any>): string[] {
    return Object.keys(constraints).map(key => {
      // Convert camelCase to readable names
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    });
  }

  private formatAssumptionCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private formatImpactLevel(impact: string): string {
    return impact.charAt(0).toUpperCase() + impact.slice(1) + ' Impact';
  }

  private generateBusinessContext(assumption: AssumptionDisclosure): string {
    switch (assumption.category) {
      case 'input':
        return 'Missing organizational input required assumption about constraint priorities or values.';
      case 'calculation':
        return 'Scoring methodology required assumption about relative importance or weighting factors.';
      case 'interpretation':
        return 'Analysis interpretation required assumption about organizational context or implementation approach.';
      default:
        return 'Assumption made during analysis process affects result interpretation and validation requirements.';
    }
  }
}

/**
 * Utility functions for output formatting
 */
export class OutputFormattingUtils {
  
  /**
   * Convert formatted output to plain text for fallback scenarios
   */
  static toPlainText(formattedOutput: FormattedOutput): string {
    const sections: string[] = [];
    
    // Header
    sections.push(`${formattedOutput.header.title}`);
    sections.push(`${formattedOutput.header.subtitle}`);
    sections.push(`Analysis Date: ${formattedOutput.header.analysisDate}`);
    sections.push(`Target Persona: ${formattedOutput.header.targetPersona}`);
    sections.push('');
    
    // Executive Summary
    sections.push('EXECUTIVE SUMMARY');
    sections.push(formattedOutput.executiveSummary);
    sections.push('');
    
    // Comparison Table
    sections.push('ARCHITECTURE COMPARISON');
    sections.push(this.formatComparisonTableAsText(formattedOutput.comparisonTable));
    sections.push('');
    
    // Trade-offs
    sections.push('KEY TRADE-OFFS');
    sections.push(...formattedOutput.tradeoffSummary.keyDecisionFactors.map(factor => `• ${factor}`));
    sections.push('');
    
    // Conflicts
    if (formattedOutput.conflictWarnings.length > 0) {
      sections.push('CONSTRAINT CONFLICTS');
      formattedOutput.conflictWarnings.forEach(conflict => {
        sections.push(`${conflict.title}: ${conflict.description}`);
      });
      sections.push('');
    }
    
    // Disclaimers
    sections.push('IMPORTANT DISCLAIMERS');
    sections.push(formattedOutput.disclaimers.primaryDisclaimer);
    sections.push('');
    
    return sections.join('\n');
  }
  
  private static formatComparisonTableAsText(table: ComparisonTable): string {
    const lines: string[] = [];
    
    // Headers
    lines.push(table.headers.join(' | '));
    lines.push(table.headers.map(() => '---').join(' | '));
    
    // Dimension rows
    table.dimensionRows.forEach(row => {
      const scores = [
        row.scores['IRM-Heavy']?.toString() || 'N/A',
        row.scores['URM-Heavy']?.toString() || 'N/A', 
        row.scores['Hybrid']?.toString() || 'N/A'
      ];
      lines.push(`${row.dimensionName} | ${scores.join(' | ')} | ${row.interpretation}`);
    });
    
    // Summary row
    const summaryScores = [
      table.summaryRow.weightedScores['IRM-Heavy']?.toFixed(1) || 'N/A',
      table.summaryRow.weightedScores['URM-Heavy']?.toFixed(1) || 'N/A',
      table.summaryRow.weightedScores['Hybrid']?.toFixed(1) || 'N/A'
    ];
    lines.push(`${table.summaryRow.label} | ${summaryScores.join(' | ')} | ${table.summaryRow.isNearTie ? 'Near-tie result' : 'Clear differentiation'}`);
    
    return lines.join('\n');
  }
}