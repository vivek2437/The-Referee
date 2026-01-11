/**
 * Persona-Specific Content Generator
 * 
 * Implements CISO-specific strategic and budget content, Enterprise Architect 
 * technical and stakeholder content, and enterprise-appropriate language and formatting.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 10.5
 */

import { 
  UserPersona, 
  PersonaContext, 
  AnalysisResult, 
  ArchitectureScore, 
  ConflictWarning,
  TradeoffAnalysis,
  ArchitectureType 
} from './types';

/**
 * Persona-specific content sections
 */
export interface PersonaContent {
  /** Executive summary tailored to persona */
  executiveSummary: string;
  /** Key insights relevant to persona responsibilities */
  keyInsights: string[];
  /** Strategic considerations for this persona */
  strategicConsiderations: string[];
  /** Budget and resource implications (CISO focus) */
  budgetImplications?: string[];
  /** Technical implementation considerations (Architect focus) */
  technicalConsiderations?: string[];
  /** Stakeholder communication guidance */
  stakeholderGuidance: string[];
  /** Risk and compliance messaging */
  riskCompliance: string[];
}

/**
 * Generates persona-specific content for analysis results
 */
export class PersonaContentGenerator {
  
  /**
   * Generate complete persona-specific content for analysis results
   */
  generatePersonaContent(
    analysisResult: AnalysisResult, 
    personaContext: PersonaContext
  ): PersonaContent {
    switch (personaContext.persona) {
      case 'CISO':
        return this.generateCISOContent(analysisResult, personaContext);
      case 'Enterprise_Security_Architect':
        return this.generateArchitectContent(analysisResult, personaContext);
      default:
        throw new Error(`Unsupported persona: ${personaContext.persona}`);
    }
  }

  /**
   * Generate CISO-specific strategic and budget content
   * Requirements: 2.1 - CISO strategic security decision authority and budget responsibility
   */
  private generateCISOContent(
    analysisResult: AnalysisResult, 
    personaContext: PersonaContext
  ): PersonaContent {
    const topArchitecture = this.getTopScoringArchitecture(analysisResult.architectureScores);
    const hasConflicts = analysisResult.detectedConflicts.length > 0;
    
    return {
      executiveSummary: this.generateCISOExecutiveSummary(analysisResult, topArchitecture, hasConflicts),
      keyInsights: this.generateCISOKeyInsights(analysisResult),
      strategicConsiderations: this.generateCISOStrategicConsiderations(analysisResult),
      budgetImplications: this.generateCISOBudgetImplications(analysisResult),
      stakeholderGuidance: this.generateCISOStakeholderGuidance(analysisResult),
      riskCompliance: this.generateCISORiskCompliance(analysisResult)
    };
  }

  /**
   * Generate Enterprise Architect technical and stakeholder content
   * Requirements: 2.2 - Enterprise Architect technical architecture design and stakeholder management
   */
  private generateArchitectContent(
    analysisResult: AnalysisResult, 
    personaContext: PersonaContext
  ): PersonaContent {
    return {
      executiveSummary: this.generateArchitectExecutiveSummary(analysisResult),
      keyInsights: this.generateArchitectKeyInsights(analysisResult),
      strategicConsiderations: this.generateArchitectStrategicConsiderations(analysisResult),
      technicalConsiderations: this.generateArchitectTechnicalConsiderations(analysisResult),
      stakeholderGuidance: this.generateArchitectStakeholderGuidance(analysisResult),
      riskCompliance: this.generateArchitectRiskCompliance(analysisResult)
    };
  }

  // CISO-specific content generation methods

  private generateCISOExecutiveSummary(
    analysisResult: AnalysisResult, 
    topArchitecture: ArchitectureScore | null,
    hasConflicts: boolean
  ): string {
    const conflictNote = hasConflicts 
      ? " Critical constraint conflicts require stakeholder alignment before proceeding." 
      : "";
    
    if (analysisResult.tradeoffSummary.isNearTie) {
      return `Security architecture analysis reveals no clear winner among the evaluated options, indicating that trade-off considerations should drive the decision rather than numeric scores.${conflictNote} This analysis provides the comparative framework needed for board-level discussion and strategic alignment.`;
    }
    
    const topType = topArchitecture?.architectureType || 'Unknown';
    return `Security architecture analysis indicates ${topType} architecture aligns most closely with current organizational constraints, though significant trade-offs exist across all options.${conflictNote} This analysis supports data-driven decision making for the security investment strategy.`;
  }

  private generateCISOKeyInsights(analysisResult: AnalysisResult): string[] {
    const insights: string[] = [];
    
    // Budget and ROI insights
    const costScores = analysisResult.architectureScores.map(score => ({
      type: score.architectureType,
      cost: score.dimensionScores.costEfficiency
    }));
    const mostCostEfficient = costScores.reduce((prev, current) => 
      current.cost > prev.cost ? current : prev
    );
    
    insights.push(`${mostCostEfficient.type} architecture offers the highest cost efficiency rating, supporting budget optimization objectives.`);
    
    // Compliance and risk insights
    const complianceScores = analysisResult.architectureScores.map(score => ({
      type: score.architectureType,
      compliance: score.dimensionScores.complianceAuditability
    }));
    const mostCompliant = complianceScores.reduce((prev, current) => 
      current.compliance > prev.compliance ? current : prev
    );
    
    insights.push(`${mostCompliant.type} architecture provides strongest compliance auditability, reducing regulatory risk exposure.`);
    
    // Strategic alignment insight
    if (analysisResult.detectedConflicts.length > 0) {
      insights.push(`${analysisResult.detectedConflicts.length} constraint conflicts identified require executive-level resolution to ensure strategic alignment.`);
    }
    
    return insights;
  }

  private generateCISOStrategicConsiderations(analysisResult: AnalysisResult): string[] {
    const considerations: string[] = [];
    
    considerations.push("Security architecture decision will impact 3-5 year strategic roadmap and budget allocation cycles.");
    considerations.push("Board reporting requirements necessitate clear justification for architecture choice and associated risk trade-offs.");
    considerations.push("Regulatory compliance implications must be validated with legal and compliance teams before final decision.");
    
    if (analysisResult.tradeoffSummary.isNearTie) {
      considerations.push("Near-tie results suggest that non-technical factors (organizational readiness, vendor relationships, timeline) may be decisive.");
    }
    
    return considerations;
  }

  private generateCISOBudgetImplications(analysisResult: AnalysisResult): string[] {
    const implications: string[] = [];
    
    // Analyze cost efficiency across architectures
    const costAnalysis = analysisResult.architectureScores.map(score => ({
      type: score.architectureType,
      cost: score.dimensionScores.costEfficiency,
      operational: score.dimensionScores.operationalComplexity
    }));
    
    implications.push("Initial implementation costs vary significantly across architecture options, requiring multi-year budget planning.");
    implications.push("Operational complexity differences translate to ongoing staffing and training investment requirements.");
    
    // Identify highest and lowest cost options
    const sortedByCost = costAnalysis.sort((a, b) => b.cost - a.cost);
    if (sortedByCost.length >= 2) {
      const highest = sortedByCost[0];
      const lowest = sortedByCost[sortedByCost.length - 1];
      if (highest && lowest) {
        implications.push(`${highest.type} architecture offers highest cost efficiency but may require different skill investments than ${lowest.type} approach.`);
      }
    }
    
    return implications;
  }

  private generateCISOStakeholderGuidance(analysisResult: AnalysisResult): string[] {
    const guidance: string[] = [];
    
    guidance.push("Present analysis results to board with emphasis on risk trade-offs rather than technical implementation details.");
    guidance.push("Engage business unit leaders to validate user experience impact assumptions before final architecture selection.");
    guidance.push("Coordinate with legal and compliance teams to confirm regulatory interpretation accuracy.");
    
    if (analysisResult.detectedConflicts.length > 0) {
      guidance.push("Schedule executive alignment session to resolve identified constraint conflicts before proceeding with implementation planning.");
    }
    
    return guidance;
  }

  private generateCISORiskCompliance(analysisResult: AnalysisResult): string[] {
    const riskCompliance: string[] = [];
    
    riskCompliance.push("All architecture options require ongoing risk assessment and compliance validation as regulatory landscape evolves.");
    riskCompliance.push("Security architecture choice impacts audit scope, control testing requirements, and regulatory reporting obligations.");
    
    // Analyze risk tolerance alignment
    const riskTolerance = analysisResult.constraintProfile.riskTolerance;
    if (riskTolerance >= 8) {
      riskCompliance.push("Low risk tolerance environment requires additional validation of security control effectiveness across all architecture options.");
    }
    
    return riskCompliance;
  }

  // Enterprise Architect-specific content generation methods

  private generateArchitectExecutiveSummary(analysisResult: AnalysisResult): string {
    const topArchitecture = this.getTopScoringArchitecture(analysisResult.architectureScores);
    const hasConflicts = analysisResult.detectedConflicts.length > 0;
    
    if (analysisResult.tradeoffSummary.isNearTie) {
      return `Technical architecture analysis reveals balanced trade-offs across security patterns, requiring detailed implementation planning to determine optimal approach. ${hasConflicts ? 'Constraint conflicts require stakeholder alignment. ' : ''}Focus should shift to implementation feasibility and organizational readiness factors.`;
    }
    
    const topType = topArchitecture?.architectureType || 'Unknown';
    return `Technical analysis indicates ${topType} architecture pattern best aligns with current constraints, though implementation complexity and stakeholder coordination requirements vary significantly across options. ${hasConflicts ? 'Identified constraint conflicts require resolution before detailed design. ' : ''}`;
  }

  private generateArchitectKeyInsights(analysisResult: AnalysisResult): string[] {
    const insights: string[] = [];
    
    // Technical complexity insights
    const complexityScores = analysisResult.architectureScores.map(score => ({
      type: score.architectureType,
      complexity: score.dimensionScores.operationalComplexity
    }));
    const leastComplex = complexityScores.reduce((prev, current) => 
      current.complexity < prev.complexity ? current : prev
    );
    
    insights.push(`${leastComplex.type} architecture offers lowest operational complexity, reducing implementation and maintenance overhead.`);
    
    // Scalability insights
    const scalabilityScores = analysisResult.architectureScores.map(score => ({
      type: score.architectureType,
      scalability: score.dimensionScores.scalabilityPerformance
    }));
    const mostScalable = scalabilityScores.reduce((prev, current) => 
      current.scalability > prev.scalability ? current : prev
    );
    
    insights.push(`${mostScalable.type} architecture provides superior scalability characteristics for enterprise growth requirements.`);
    
    // Integration insights
    insights.push("All architecture patterns require significant integration planning with existing identity and security infrastructure.");
    
    return insights;
  }

  private generateArchitectStrategicConsiderations(analysisResult: AnalysisResult): string[] {
    const considerations: string[] = [];
    
    considerations.push("Architecture selection impacts enterprise integration patterns, API design, and data flow architectures.");
    considerations.push("Implementation timeline varies significantly across options, affecting project planning and resource allocation.");
    considerations.push("Technology stack implications require evaluation of current team skills and training requirements.");
    
    return considerations;
  }

  private generateArchitectTechnicalConsiderations(analysisResult: AnalysisResult): string[] {
    const considerations: string[] = [];
    
    considerations.push("Identity federation patterns and protocol selection (SAML, OIDC, OAuth) vary by architecture approach.");
    considerations.push("Behavioral analytics implementation requires data pipeline architecture and machine learning infrastructure decisions.");
    considerations.push("Hybrid approaches introduce additional integration complexity but provide implementation flexibility.");
    considerations.push("Performance and scalability requirements must be validated through proof-of-concept implementations.");
    
    // Add specific technical considerations based on top architecture
    const topArchitecture = this.getTopScoringArchitecture(analysisResult.architectureScores);
    if (topArchitecture) {
      switch (topArchitecture.architectureType) {
        case 'IRM-Heavy':
          considerations.push("IRM-heavy implementation requires robust directory services, privileged access management, and identity governance platforms.");
          break;
        case 'URM-Heavy':
          considerations.push("URM-heavy implementation requires user behavior analytics platforms, risk scoring engines, and adaptive authentication systems.");
          break;
        case 'Hybrid':
          considerations.push("Hybrid implementation requires careful orchestration between traditional identity controls and behavioral analytics systems.");
          break;
      }
    }
    
    return considerations;
  }

  private generateArchitectStakeholderGuidance(analysisResult: AnalysisResult): string[] {
    const guidance: string[] = [];
    
    guidance.push("Engage application teams early to understand integration requirements and user experience constraints.");
    guidance.push("Coordinate with infrastructure teams to validate performance and scalability assumptions.");
    guidance.push("Work with security operations teams to ensure monitoring and incident response capabilities align with chosen architecture.");
    guidance.push("Establish proof-of-concept validation criteria with business stakeholders before full implementation commitment.");
    
    return guidance;
  }

  private generateArchitectRiskCompliance(analysisResult: AnalysisResult): string[] {
    const riskCompliance: string[] = [];
    
    riskCompliance.push("Technical architecture must support compliance control implementation and audit evidence collection.");
    riskCompliance.push("Security control effectiveness varies by architecture pattern and requires validation through security testing.");
    riskCompliance.push("Data privacy and protection requirements impact architecture design decisions and technology selection.");
    
    return riskCompliance;
  }

  // Utility methods

  private getTopScoringArchitecture(architectureScores: ArchitectureScore[]): ArchitectureScore | null {
    if (architectureScores.length === 0) return null;
    
    return architectureScores.reduce((prev, current) => 
      current.weightedScore > prev.weightedScore ? current : prev
    );
  }

  /**
   * Get persona context for supported personas
   * Requirements: 2.3, 2.4 - Enterprise-appropriate language and multi-stakeholder support
   */
  static getPersonaContext(persona: UserPersona): PersonaContext {
    switch (persona) {
      case 'CISO':
        return {
          persona: 'CISO',
          responsibilities: [
            'Strategic security decision authority',
            'Security budget management ($5M-100M+)',
            'Board and executive reporting',
            'Regulatory compliance oversight',
            'Risk management and governance'
          ],
          painPoints: [
            'Justifying architecture decisions with data',
            'Communicating trade-offs to non-technical stakeholders',
            'Balancing security requirements with business enablement',
            'Managing regulatory compliance complexity'
          ],
          successCriteria: [
            'Defensible recommendations backed by analysis',
            'Improved stakeholder confidence in security decisions',
            'Clear ROI justification for security investments',
            'Reduced regulatory and audit risk exposure'
          ]
        };
      
      case 'Enterprise_Security_Architect':
        return {
          persona: 'Enterprise_Security_Architect',
          responsibilities: [
            'Technical architecture design and implementation',
            'Cross-functional stakeholder coordination',
            'Security integration with business systems',
            'Technology evaluation and selection',
            'Implementation oversight and validation'
          ],
          painPoints: [
            'Balancing competing technical requirements',
            'Managing implementation complexity',
            'Ensuring scalability and performance',
            'Coordinating across multiple technical teams'
          ],
          successCriteria: [
            'Comprehensive trade-off analysis for technical decisions',
            'Reduced architecture decision time',
            'Improved architecture quality and maintainability',
            'Successful stakeholder alignment on technical approach'
          ]
        };
      
      default:
        throw new Error(`Unsupported persona: ${persona}`);
    }
  }
}