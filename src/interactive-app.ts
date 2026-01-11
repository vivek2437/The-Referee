#!/usr/bin/env node
/**
 * Interactive SecureStack Referee Application
 * 
 * Allows users to input their organizational constraints and receive
 * security architecture analysis and recommendations.
 */

import * as readline from 'readline';
import { performCompleteAnalysis, secureStackReferee } from './index';
import { ConstraintProfileInput } from './constraint-processor';
import { PersonaContentGenerator } from './persona-content-generator';
import { UserPersona } from './types';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input with validation
 */
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Get numeric input with validation
 */
async function getNumericInput(prompt: string, min: number = 1, max: number = 10): Promise<number> {
  while (true) {
    const input = await askQuestion(`${prompt} (${min}-${max}): `);
    const num = parseInt(input);
    
    if (isNaN(num)) {
      console.log('Please enter a valid number.');
      continue;
    }
    
    if (num < min || num > max) {
      console.log(`Please enter a number between ${min} and ${max}.`);
      continue;
    }
    
    return num;
  }
}

/**
 * Get user persona selection
 */
async function selectPersona(): Promise<UserPersona> {
  console.log('\nSelect your role:');
  console.log('1. CISO (Chief Information Security Officer)');
  console.log('2. Enterprise Security Architect');
  
  while (true) {
    const choice = await askQuestion('Enter your choice (1-2): ');
    
    switch (choice) {
      case '1': return 'CISO';
      case '2': return 'Enterprise_Security_Architect';
      default:
        console.log('Please enter a valid choice (1-2).');
    }
  }
}

/**
 * Display analysis results in a user-friendly format
 */
function displayResults(result: any) {
  console.log('\n' + '='.repeat(80));
  console.log('SECURITY ARCHITECTURE ANALYSIS RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 ${result.header.title}`);
  console.log(`📅 Analysis Date: ${result.header.analysisDate}`);
  console.log(`👤 Target Persona: ${result.header.targetPersona}`);
  
  console.log('\n📋 EXECUTIVE SUMMARY:');
  console.log(result.executiveSummary);
  
  console.log('\n🏗️ ARCHITECTURE SCORES:');
  result.comparisonTable.dimensionRows.forEach((row: any) => {
    console.log(`\n  ${row.dimensionName}:`);
    console.log(`    🔐 IRM-Heavy: ${row.scores['IRM-Heavy']}/10`);
    console.log(`    🤖 URM-Heavy: ${row.scores['URM-Heavy']}/10`);
    console.log(`    ⚖️  Hybrid: ${row.scores['Hybrid']}/10`);
  });
  
  console.log('\n🎯 WEIGHTED SCORES:');
  const summary = result.comparisonTable.summaryRow;
  console.log(`  🔐 IRM-Heavy: ${summary.weightedScores['IRM-Heavy']?.toFixed(2)} (${summary.confidenceLevels['IRM-Heavy']} confidence)`);
  console.log(`  🤖 URM-Heavy: ${summary.weightedScores['URM-Heavy']?.toFixed(2)} (${summary.confidenceLevels['URM-Heavy']} confidence)`);
  console.log(`  ⚖️  Hybrid: ${summary.weightedScores['Hybrid']?.toFixed(2)} (${summary.confidenceLevels['Hybrid']} confidence)`);
  
  if (summary.isNearTie) {
    console.log('\n⚠️  NEAR-TIE DETECTED');
    if (result.tradeoffSummary.nearTieAnalysis) {
      console.log(`   ${result.tradeoffSummary.nearTieAnalysis.message}`);
    }
  }
  
  if (result.conflictWarnings.length > 0) {
    console.log('\n🚨 CONSTRAINT CONFLICTS DETECTED:');
    result.conflictWarnings.forEach((conflict: any) => {
      console.log(`   • ${conflict.title}`);
      console.log(`     ${conflict.description}`);
    });
  }
  
  console.log('\n🔑 KEY DECISION FACTORS:');
  result.tradeoffSummary.keyDecisionFactors.forEach((factor: string) => {
    console.log(`   • ${factor}`);
  });
  
  if (result.personaContent.technicalConsiderations && result.personaContent.technicalConsiderations.length > 0) {
    console.log('\n🔧 TECHNICAL CONSIDERATIONS:');
    result.personaContent.technicalConsiderations.forEach((consideration: string) => {
      console.log(`   • ${consideration}`);
    });
  }
  
  console.log('\n📝 ASSUMPTIONS MADE:');
  result.assumptionDisclosures.forEach((assumption: any) => {
    console.log(`   • ${assumption.category}: ${assumption.description}`);
  });
  
  console.log('\n⚖️  DISCLAIMERS:');
  console.log(`   ${result.disclaimers.primaryDisclaimer}`);
  console.log(`   ${result.disclaimers.humanOversightRequirement}`);
}

/**
 * Main application flow
 */
async function runInteractiveApp() {
  console.log('🛡️  Welcome to SecureStack Referee');
  console.log('Enterprise Security Architecture Decision Support System');
  console.log('='.repeat(60));
  
  console.log('\nThis system will analyze your organizational constraints and provide');
  console.log('comparative analysis of security architecture patterns to support');
  console.log('your decision-making process.\n');
  
  try {
    // Collect organizational constraints
    console.log('📊 ORGANIZATIONAL CONSTRAINT ASSESSMENT');
    console.log('Please rate each factor on a scale of 1-10:\n');
    
    const constraints: ConstraintProfileInput = {
      riskTolerance: await getNumericInput('Risk Tolerance (1=Very Low, 10=Very High)'),
      complianceStrictness: await getNumericInput('Compliance Requirements (1=Minimal, 10=Highly Regulated)'),
      costSensitivity: await getNumericInput('Cost Sensitivity (1=Cost No Object, 10=Very Cost Sensitive)'),
      userExperiencePriority: await getNumericInput('User Experience Priority (1=Security First, 10=UX Critical)'),
      operationalMaturity: await getNumericInput('Operational Maturity (1=Basic, 10=Advanced)'),
      businessAgility: await getNumericInput('Business Agility Needs (1=Stable, 10=Rapid Change)')
    };
    
    // Select persona
    const persona = await selectPersona();
    
    console.log('\n🔄 Analyzing your constraints...');
    
    // Perform analysis
    const result = await performCompleteAnalysis(constraints, {
      personaContext: PersonaContentGenerator.getPersonaContext(persona),
      includeDetailedExplanations: true,
      includeCostAnalysis: true,
    });
    
    // Display results
    displayResults(result);
    
    // Ask if user wants to try different scenarios
    console.log('\n' + '='.repeat(80));
    const tryAgain = await askQuestion('Would you like to analyze different constraints? (y/n): ');
    
    if (tryAgain.toLowerCase() === 'y' || tryAgain.toLowerCase() === 'yes') {
      console.log('\n');
      await runInteractiveApp();
    } else {
      console.log('\n✅ Thank you for using SecureStack Referee!');
      console.log('Remember: This analysis provides decision support, not decisions.');
      console.log('Professional validation and human oversight are always required.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Please try again with valid inputs.\n');
  } finally {
    rl.close();
  }
}

// Run the application
if (require.main === module) {
  runInteractiveApp().catch((error) => {
    console.error('Application error:', error);
    process.exit(1);
  });
}

export { runInteractiveApp };