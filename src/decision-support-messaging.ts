/**
 * Decision Support Messaging System
 * 
 * Implements consistent decision support disclaimers, human oversight requirements,
 * and uncertainty/limitation communication for all system outputs.
 * 
 * Requirements: 1.7, 9.1, 9.4, 9.5, 9.6
 */

import { UserPersona, AnalysisResult } from './types';

/**
 * Decision support message types
 */
export type MessageType = 
  | 'disclaimer'
  | 'human_oversight'
  | 'uncertainty'
  | 'limitation'
  | 'validation_requirement'
  | 'professional_guidance';

/**
 * Decision support message
 */
export interface DecisionSupportMessage {
  /** Type of message */
  type: MessageType;
  /** Message content */
  content: string;
  /** Importance level */
  importance: 'critical' | 'high' | 'medium' | 'low';
  /** Whether this message should always be displayed */
  alwaysShow: boolean;
  /** Persona-specific variations */
  personaVariations?: Partial<Record<UserPersona, string>>;
}

/**
 * Messaging configuration
 */
export interface MessagingConfig {
  /** Whether to include all messages or only critical ones */
  verbosity: 'minimal' | 'standard' | 'comprehensive';
  /** Target persona for message customization */
  targetPersona?: UserPersona;
  /** Whether to include technical details in messages */
  includeTechnicalDetails: boolean;
  /** Whether to emphasize limitations */
  emphasizeLimitations: boolean;
}

/**
 * Message placement in output
 */
export type MessagePlacement = 
  | 'header'
  | 'footer'
  | 'inline'
  | 'sidebar'
  | 'popup';

/**
 * Formatted message for output
 */
export interface FormattedMessage {
  /** Message content */
  content: string;
  /** Suggested placement in output */
  placement: MessagePlacement;
  /** CSS class or styling hint */
  styleHint: string;
  /** Priority for display order */
  priority: number;
}

/**
 * Decision Support Messaging Manager
 */
export class DecisionSupportMessaging {
  private config: MessagingConfig;
  private coreMessages: DecisionSupportMessage[] = [];

  constructor(config: MessagingConfig = {
    verbosity: 'standard',
    includeTechnicalDetails: false,
    emphasizeLimitations: true,
  }) {
    this.config = config;
    this.initializeCoreMessages();
  }

  /**
   * Get all applicable messages for an analysis result
   */
  public getMessagesForAnalysis(analysisResult: AnalysisResult): FormattedMessage[] {
    const messages: FormattedMessage[] = [];

    // Always include core disclaimer
    messages.push(this.formatMessage(this.getCoreDisclaimer()));

    // Add human oversight requirement
    messages.push(this.formatMessage(this.getHumanOversightMessage()));

    // Add uncertainty messages based on analysis confidence
    const uncertaintyMessages = this.getUncertaintyMessages(analysisResult);
    messages.push(...uncertaintyMessages.map(msg => this.formatMessage(msg)));

    // Add limitation messages
    const limitationMessages = this.getLimitationMessages(analysisResult);
    messages.push(...limitationMessages.map(msg => this.formatMessage(msg)));

    // Add validation requirement messages
    if (this.config.verbosity !== 'minimal') {
      messages.push(this.formatMessage(this.getValidationRequirementMessage()));
    }

    // Add professional guidance message
    if (this.config.verbosity === 'comprehensive') {
      messages.push(this.formatMessage(this.getProfessionalGuidanceMessage()));
    }

    return this.sortMessagesByPriority(messages);
  }

  /**
   * Get core system disclaimer
   */
  public getCoreDisclaimer(): DecisionSupportMessage {
    const baseContent = 'This system provides decision support analysis, not decisions. ' +
      'All architectural choices require human oversight, professional validation, ' +
      'and consideration of organization-specific factors not captured in this analysis.';

    const personaVariations: Partial<Record<UserPersona, string>> = {
      'CISO': 'This analysis supports your strategic decision-making process but does not replace ' +
        'executive judgment, stakeholder consultation, or board-level review of security architecture choices.',
      'Enterprise_Security_Architect': 'This comparative analysis provides technical insights to inform ' +
        'your architecture decisions but requires integration with organizational context, ' +
        'stakeholder requirements, and implementation constraints not captured in this model.',
    };

    return {
      type: 'disclaimer',
      content: baseContent,
      importance: 'critical',
      alwaysShow: true,
      personaVariations,
    };
  }

  /**
   * Get human oversight requirement message
   */
  public getHumanOversightMessage(): DecisionSupportMessage {
    return {
      type: 'human_oversight',
      content: 'Human oversight is required for all architectural decisions. This analysis must be ' +
        'reviewed by qualified security professionals and validated against your specific ' +
        'organizational context, regulatory requirements, and business objectives.',
      importance: 'critical',
      alwaysShow: true,
      personaVariations: {
        'CISO': 'Executive review and stakeholder alignment are essential before proceeding with ' +
          'any architectural decisions based on this analysis.',
        'Enterprise_Security_Architect': 'Technical review by senior architects and validation with ' +
          'implementation teams are required before architectural commitments.',
      },
    };
  }

  /**
   * Get uncertainty messages based on analysis confidence
   */
  public getUncertaintyMessages(analysisResult: AnalysisResult): DecisionSupportMessage[] {
    const messages: DecisionSupportMessage[] = [];

    // Check for low confidence scores
    const lowConfidenceArchitectures = analysisResult.architectureScores
      .filter(score => score.confidenceLevel === 'Low');

    if (lowConfidenceArchitectures.length > 0) {
      messages.push({
        type: 'uncertainty',
        content: `Analysis confidence is reduced for ${lowConfidenceArchitectures.map(a => a.architectureType).join(', ')} ` +
          'due to limited input data or constraint conflicts. Additional stakeholder input may improve accuracy.',
        importance: 'high',
        alwaysShow: true,
      });
    }

    // Check for near-tie situations
    if (analysisResult.tradeoffSummary.isNearTie) {
      messages.push({
        type: 'uncertainty',
        content: 'Architecture scores are within the near-tie threshold, indicating no clear winner. ' +
          'Focus on trade-off analysis rather than numeric scores for decision-making.',
        importance: 'high',
        alwaysShow: true,
      });
    }

    // Check for assumption-heavy analysis
    const highImpactAssumptions = analysisResult.assumptions
      .filter(assumption => assumption.impact === 'high');

    if (highImpactAssumptions.length > 0) {
      messages.push({
        type: 'uncertainty',
        content: `This analysis relies on ${highImpactAssumptions.length} high-impact assumptions. ` +
          'Validating these assumptions with stakeholders may significantly change results.',
        importance: 'medium',
        alwaysShow: false,
      });
    }

    return messages;
  }

  /**
   * Get limitation messages
   */
  public getLimitationMessages(analysisResult: AnalysisResult): DecisionSupportMessage[] {
    const messages: DecisionSupportMessage[] = [];

    // General analysis limitations
    messages.push({
      type: 'limitation',
      content: 'This analysis is based on generalized architecture patterns and may not account for ' +
        'organization-specific requirements, existing infrastructure constraints, or emerging threats.',
      importance: 'high',
      alwaysShow: this.config.emphasizeLimitations,
    });

    // Scoring methodology limitations
    if (this.config.includeTechnicalDetails) {
      messages.push({
        type: 'limitation',
        content: 'Scoring methodology uses weighted averages across standardized dimensions. ' +
          'Real-world architecture decisions involve qualitative factors not captured in numeric scores.',
        importance: 'medium',
        alwaysShow: false,
      });
    }

    // Temporal limitations
    messages.push({
      type: 'limitation',
      content: 'Analysis reflects current architecture patterns and threat landscapes. ' +
        'Regular reassessment is recommended as security requirements and technologies evolve.',
      importance: 'medium',
      alwaysShow: false,
    });

    // Conflict detection limitations
    if (analysisResult.detectedConflicts.length === 0) {
      messages.push({
        type: 'limitation',
        content: 'No constraint conflicts were automatically detected, but manual review may identify ' +
          'additional organizational tensions not captured by the conflict detection algorithms.',
        importance: 'low',
        alwaysShow: false,
      });
    }

    return messages;
  }

  /**
   * Get validation requirement message
   */
  public getValidationRequirementMessage(): DecisionSupportMessage {
    return {
      type: 'validation_requirement',
      content: 'All analysis results must be validated against your specific organizational context, ' +
        'regulatory environment, existing infrastructure, and stakeholder requirements before implementation.',
      importance: 'high',
      alwaysShow: false,
      personaVariations: {
        'CISO': 'Board presentation and stakeholder validation are recommended before architectural commitments.',
        'Enterprise_Security_Architect': 'Technical validation with implementation teams and infrastructure ' +
          'assessment are required before proceeding.',
      },
    };
  }

  /**
   * Get professional guidance message
   */
  public getProfessionalGuidanceMessage(): DecisionSupportMessage {
    return {
      type: 'professional_guidance',
      content: 'Consider engaging qualified security consultants, enterprise architects, or legal counsel ' +
        'for validation of analysis results, especially for high-risk or highly regulated environments.',
      importance: 'medium',
      alwaysShow: false,
    };
  }

  /**
   * Format a message for output display
   */
  private formatMessage(message: DecisionSupportMessage): FormattedMessage {
    let content = message.content;

    // Use persona-specific variation if available and configured
    if (this.config.targetPersona && message.personaVariations?.[this.config.targetPersona]) {
      const personaContent = message.personaVariations[this.config.targetPersona];
      if (personaContent) {
        content = personaContent;
      }
    }

    // Determine placement based on message type and importance
    let placement: MessagePlacement;
    let styleHint: string;
    let priority: number;

    switch (message.type) {
      case 'disclaimer':
        placement = 'header';
        styleHint = 'disclaimer-critical';
        priority = 1;
        break;
      case 'human_oversight':
        placement = 'header';
        styleHint = 'oversight-required';
        priority = 2;
        break;
      case 'uncertainty':
        placement = 'inline';
        styleHint = 'uncertainty-warning';
        priority = 3;
        break;
      case 'limitation':
        placement = 'footer';
        styleHint = 'limitation-notice';
        priority = 4;
        break;
      case 'validation_requirement':
        placement = 'footer';
        styleHint = 'validation-required';
        priority = 5;
        break;
      case 'professional_guidance':
        placement = 'footer';
        styleHint = 'professional-guidance';
        priority = 6;
        break;
      default:
        placement = 'inline';
        styleHint = 'general-notice';
        priority = 7;
    }

    return {
      content,
      placement,
      styleHint,
      priority,
    };
  }

  /**
   * Sort messages by priority for consistent display order
   */
  private sortMessagesByPriority(messages: FormattedMessage[]): FormattedMessage[] {
    return messages.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Initialize core system messages
   */
  private initializeCoreMessages(): void {
    this.coreMessages = [
      this.getCoreDisclaimer(),
      this.getHumanOversightMessage(),
      this.getValidationRequirementMessage(),
      this.getProfessionalGuidanceMessage(),
    ];
  }

  /**
   * Update messaging configuration
   */
  public updateConfig(newConfig: Partial<MessagingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get messages filtered by verbosity level
   */
  public getMessagesByVerbosity(messages: DecisionSupportMessage[]): DecisionSupportMessage[] {
    switch (this.config.verbosity) {
      case 'minimal':
        return messages.filter(msg => msg.alwaysShow && msg.importance === 'critical');
      case 'standard':
        return messages.filter(msg => msg.alwaysShow || msg.importance === 'critical' || msg.importance === 'high');
      case 'comprehensive':
        return messages;
      default:
        return messages.filter(msg => msg.alwaysShow || msg.importance === 'critical' || msg.importance === 'high');
    }
  }

  /**
   * Generate a complete disclaimer block for output
   */
  public generateDisclaimerBlock(analysisResult: AnalysisResult): string {
    const messages = this.getMessagesForAnalysis(analysisResult);
    const disclaimerMessages = messages.filter(msg => 
      msg.placement === 'header' || msg.styleHint.includes('disclaimer') || msg.styleHint.includes('oversight')
    );

    let block = '='.repeat(80) + '\n';
    block += 'DECISION SUPPORT SYSTEM - IMPORTANT DISCLAIMERS\n';
    block += '='.repeat(80) + '\n\n';

    disclaimerMessages.forEach(msg => {
      block += `${msg.content}\n\n`;
    });

    block += '='.repeat(80) + '\n';
    return block;
  }

  /**
   * Generate footer notices for output
   */
  public generateFooterNotices(analysisResult: AnalysisResult): string {
    const messages = this.getMessagesForAnalysis(analysisResult);
    const footerMessages = messages.filter(msg => msg.placement === 'footer');

    if (footerMessages.length === 0) return '';

    let footer = '\n' + '-'.repeat(80) + '\n';
    footer += 'IMPORTANT LIMITATIONS AND REQUIREMENTS\n';
    footer += '-'.repeat(80) + '\n\n';

    footerMessages.forEach((msg, index) => {
      footer += `${index + 1}. ${msg.content}\n\n`;
    });

    return footer;
  }
}

/**
 * Default messaging instance
 */
export const defaultMessaging = new DecisionSupportMessaging();

/**
 * Utility function to get formatted messages for analysis
 */
export function getDecisionSupportMessages(
  analysisResult: AnalysisResult, 
  config?: MessagingConfig
): FormattedMessage[] {
  const messaging = config ? new DecisionSupportMessaging(config) : defaultMessaging;
  return messaging.getMessagesForAnalysis(analysisResult);
}

/**
 * Utility function to generate complete disclaimer text
 */
export function generateCompleteDisclaimer(
  analysisResult: AnalysisResult,
  config?: MessagingConfig
): string {
  const messaging = config ? new DecisionSupportMessaging(config) : defaultMessaging;
  return messaging.generateDisclaimerBlock(analysisResult);
}