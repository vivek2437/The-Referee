/**
 * Simple integration test to verify all components work together
 */

import { performCompleteAnalysis } from './index';
import { ConstraintProfileInput } from './constraint-processor';
import { PersonaContentGenerator } from './persona-content-generator';

async function testIntegration() {
  console.log('Testing SecureStack Referee Integration...');
  
  // Test with sample constraints
  const constraints: ConstraintProfileInput = {
    riskTolerance: 3,
    complianceStrictness: 8,
    costSensitivity: 6,
    userExperiencePriority: 5,
    operationalMaturity: 7,
    businessAgility: 6,
  };
  
  try {
    // Test complete analysis workflow
    const result = await performCompleteAnalysis(constraints, {
      personaContext: PersonaContentGenerator.getPersonaContext('CISO'),
      includeDetailedExplanations: true,
    });
    
    console.log('✓ Analysis completed successfully');
    console.log(`✓ Generated ${result.comparisonTable.dimensionRows.length} dimension comparisons`);
    console.log(`✓ Detected ${result.conflictWarnings.length} conflicts`);
    console.log(`✓ Created ${result.assumptionDisclosures.length} assumption disclosures`);
    console.log(`✓ Near-tie detection: ${result.comparisonTable.summaryRow.isNearTie ? 'Yes' : 'No'}`);
    
    // Test architecture scores
    const scores = result.comparisonTable.summaryRow.weightedScores;
    console.log('✓ Architecture scores:');
    console.log(`  - IRM-Heavy: ${scores['IRM-Heavy']?.toFixed(2)}`);
    console.log(`  - URM-Heavy: ${scores['URM-Heavy']?.toFixed(2)}`);
    console.log(`  - Hybrid: ${scores['Hybrid']?.toFixed(2)}`);
    
    console.log('\n✅ Integration test passed - all components working together!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration().catch(console.error);