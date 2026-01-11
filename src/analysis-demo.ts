/**
 * SecureStack Referee Analysis Demonstration
 * 
 * Demonstrates the complete end-to-end analysis workflow with sample data
 */

import {
  performCompleteAnalysis,
  analyzeArchitectures,
  formatAnalysisOutput,
  secureStackReferee,
} from './index';
import { UserPersona, ConstraintProfileInput } from './types';
import { PersonaContentGenerator } from './persona-content-generator';

/**
 * Sample constraint profiles for demonstration
 */
const sampleConstraints: Record<string, ConstraintProfileInput> = {
  // High-security financial services organization
  financialServices: {
    riskTolerance: 2,        // Very low risk tolerance
    complianceStrictness: 9, // Highly regulated
    costSensitivity: 6,      // Moderate cost sensitivity
    userExperiencePriority: 4, // Security over UX
    operationalMaturity: 7,  // High maturity
    businessAgility: 5,      // Moderate agility needs
  },
  
  // Fast-growing tech startup
  techStartup: {
    riskTolerance: 7,        // Higher risk tolerance
    complianceStrictness: 3, // Minimal compliance
    costSensitivity: 8,      // Very cost sensitive
    userExperiencePriority: 9, // UX critical
    operationalMaturity: 4,  // Limited maturity
    businessAgility: 9,      // High agility needs
  },
  
  // Large enterprise with mixed requirements
  enterprise: {
    riskTolerance: 4,        // Moderate-low risk tolerance
    complianceStrictness: 7, // Significant compliance
    costSensitivity: 5,      // Balanced cost approach
    userExperiencePriority: 6, // Moderate UX priority
    operationalMaturity: 8,  // High maturity
    businessAgility: 6,      // Moderate agility
  },
  
  // Conflicted organization (demonstrates conflict detection)
  conflicted: {
    riskTolerance: 2,        // Very low risk tolerance
    complianceStrictness: 9, // Highly regulated
    costSensitivity: 9,      // Very cost sensitive (conflict!)
    userExperiencePriority: 9, // UX critical (conflict!)
    operationalMaturity: 3,  // Low maturity
    businessAgility: 9,      // High agility (conflict!)
  },
};

/**
 * Demonstrate complete analysis workflow
 */
export async function demonstrateCompleteAnalysis(): Promise<void> {
  console.log('='.repeat(80));
  console.log('SecureStack Referee - Complete Analysis Demonstration');
  console.log('='.repeat(80));
  console.log();

  for (const [scenarioName, constraints] of Object.entries(sampleConstraints)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SCENARIO: ${scenarioName.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Demonstrate analysis for CISO persona
      const cisoPreferences = {
        personaContext: PersonaContentGenerator.getPersonaContext('CISO'),
        includeDetailedExplanations: true,
        includeCostAnalysis: true,
      };
      
      console.log('\n--- CISO Analysis ---');
      const cisoResult = await performCompleteAnalysis(constraints, cisoPreferences);
      
      console.log(`\nTitle: ${cisoResult.header.title}`);
      console.log(`Analysis Date: ${cisoResult.header.analysisDate}`);
      console.log(`Target Persona: ${cisoResult.header.targetPersona}`);
      
      console.log('\nExecutive Summary:');
      console.log(cisoResult.executiveSummary);
      
      console.log('\nArchitecture Scores:');
      cisoResult.comparisonTable.dimensionRows.forEach((row: any) => {
        console.log(`  ${row.dimensionName}:`);
        console.log(`    IRM-Heavy: ${row.scores['IRM-Heavy']}`);
        console.log(`    URM-Heavy: ${row.scores['URM-Heavy']}`);
        console.log(`    Hybrid: ${row.scores['Hybrid']}`);
      });
      
      console.log('\nWeighted Scores:');
      const summary = cisoResult.comparisonTable.summaryRow;
      console.log(`  IRM-Heavy: ${summary.weightedScores['IRM-Heavy']?.toFixed(2)} (${summary.confidenceLevels['IRM-Heavy']})`);
      console.log(`  URM-Heavy: ${summary.weightedScores['URM-Heavy']?.toFixed(2)} (${summary.confidenceLevels['URM-Heavy']})`);
      console.log(`  Hybrid: ${summary.weightedScores['Hybrid']?.toFixed(2)} (${summary.confidenceLevels['Hybrid']})`);
      
      if (summary.isNearTie) {
        console.log('\n*** NEAR-TIE DETECTED ***');
        if (cisoResult.tradeoffSummary.nearTieAnalysis) {
          console.log(`Message: ${cisoResult.tradeoffSummary.nearTieAnalysis.message}`);
        }
      }
      
      if (cisoResult.conflictWarnings.length > 0) {
        console.log('\n*** CONSTRAINT CONFLICTS DETECTED ***');
        cisoResult.conflictWarnings.forEach((conflict: any) => {
          console.log(`  - ${conflict.title}: ${conflict.description}`);
        });
      }
      
      console.log('\nKey Decision Factors:');
      cisoResult.tradeoffSummary.keyDecisionFactors.forEach((factor: string) => {
        console.log(`  • ${factor}`);
      });
      
      // Demonstrate Enterprise Architect analysis for comparison
      console.log('\n--- Enterprise Architect Analysis ---');
      const architectPreferences = {
        personaContext: PersonaContentGenerator.getPersonaContext('Enterprise_Security_Architect'),
        includeDetailedExplanations: true,
        numericFormat: 'detailed' as const,
      };
      
      const architectResult = await performCompleteAnalysis(constraints, architectPreferences);
      
      console.log('\nTechnical Considerations:');
      if (architectResult.personaContent.technicalConsiderations) {
        architectResult.personaContent.technicalConsiderations.forEach((consideration: string) => {
          console.log(`  • ${consideration}`);
        });
      }
      
    } catch (error) {
      console.error(`Error in ${scenarioName} analysis:`, error);
    }
  }
}

/**
 * Demonstrate individual component integration
 */
export async function demonstrateComponentIntegration(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('Component Integration Demonstration');
  console.log('='.repeat(80));
  
  const constraints: ConstraintProfileInput = sampleConstraints.enterprise!;
  
  console.log('\n1. Constraint Processing...');
  const analysisResult = await analyzeArchitectures(constraints);
  
  console.log(`   - Processed ${Object.keys(constraints).length} constraint inputs`);
  console.log(`   - Generated ${analysisResult.assumptions.length} assumptions`);
  console.log(`   - Detected ${analysisResult.detectedConflicts.length} conflicts`);
  
  console.log('\n2. Architecture Scoring...');
  console.log(`   - Scored ${analysisResult.architectureScores.length} architecture options`);
  console.log(`   - Near-tie detection: ${analysisResult.nearTieDetection?.isNearTie ? 'Yes' : 'No'}`);
  
  console.log('\n3. Output Formatting...');
  const formattedOutput = await formatAnalysisOutput(analysisResult);
  console.log(`   - Generated ${formattedOutput.comparisonTable.dimensionRows.length} dimension comparisons`);
  console.log(`   - Created ${formattedOutput.tradeoffSummary.primaryTradeoffs.length} trade-off analyses`);
  console.log(`   - Included ${formattedOutput.assumptionDisclosures.length} assumption disclosures`);
  
  console.log('\n4. Decision Support Messaging...');
  console.log(`   - Primary disclaimer: ${formattedOutput.disclaimers.primaryDisclaimer.substring(0, 100)}...`);
  console.log(`   - Human oversight required: ${formattedOutput.disclaimers.humanOversightRequirement.substring(0, 100)}...`);
}

/**
 * Demonstrate error handling and fallback capabilities
 */
export async function demonstrateErrorHandling(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('Error Handling and Fallback Demonstration');
  console.log('='.repeat(80));
  
  // Test with invalid constraints
  console.log('\n1. Testing invalid constraint handling...');
  try {
    const invalidConstraints = {
      riskTolerance: 15, // Invalid: outside 1-10 range
      complianceStrictness: -5, // Invalid: negative
      costSensitivity: 'high' as any, // Invalid: not a number
    };
    
    const result = await analyzeArchitectures(invalidConstraints);
    console.log('   - Invalid constraints handled gracefully');
    console.log(`   - Generated ${result.assumptions.length} assumptions for missing/invalid inputs`);
  } catch (error) {
    console.log(`   - Error caught and handled: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test with minimal constraints (lots of defaults)
  console.log('\n2. Testing minimal constraint input...');
  const minimalConstraints = {
    riskTolerance: 3,
    // All other constraints will use defaults
  };
  
  const minimalResult = await analyzeArchitectures(minimalConstraints);
  console.log(`   - Analysis completed with ${minimalResult.assumptions.length} assumptions`);
  console.log(`   - Input completeness: ${minimalResult.constraintProfile.inputCompleteness}`);
}

/**
 * Run all demonstrations
 */
export async function runAllDemonstrations(): Promise<void> {
  try {
    await demonstrateCompleteAnalysis();
    await demonstrateComponentIntegration();
    await demonstrateErrorHandling();
    
    console.log('\n' + '='.repeat(80));
    console.log('All demonstrations completed successfully!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Demonstration failed:', error);
  }
}

// Export for use in other modules
export { sampleConstraints };

// Run demonstrations if this file is executed directly
if (require.main === module) {
  runAllDemonstrations().catch(console.error);
}