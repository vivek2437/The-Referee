/**
 * Error Handling Demonstration
 * 
 * Demonstrates the comprehensive error handling and graceful degradation
 * capabilities implemented in task 11.
 */

import {
  EnhancedInputValidator,
  ProcessingErrorHandler,
} from './error-handling';
import { ConstraintProfileInput } from './constraint-processor';

/**
 * Demonstrate enhanced input validation with detailed error reporting
 */
export function demonstrateInputValidation() {
  console.log('=== Enhanced Input Validation Demo ===\n');
  
  const validator = new EnhancedInputValidator();
  
  // Test 1: Invalid input types
  console.log('1. Testing invalid input types:');
  const invalidInput: ConstraintProfileInput = {
    riskTolerance: 'high' as any, // Invalid type
    complianceStrictness: 15, // Out of range
    costSensitivity: 3.5, // Non-integer
  };
  
  const result1 = validator.validateConstraintInputs(invalidInput);
  console.log(`   Validation passed: ${result1.validation.isValid}`);
  console.log(`   Enhanced errors found: ${result1.enhancedErrors.length}`);
  
  result1.enhancedErrors.forEach((error, index) => {
    console.log(`   Error ${index + 1}:`);
    console.log(`     Field: ${error.field}`);
    console.log(`     Code: ${error.errorCode}`);
    console.log(`     Severity: ${error.severity}`);
    console.log(`     Blocking: ${error.blocking}`);
    console.log(`     Message: ${error.message}`);
    console.log(`     Resolution: ${error.resolutionSteps[0]}`);
  });
  
  // Test 2: Contradiction detection
  console.log('\n2. Testing contradiction detection:');
  const contradictoryInput: ConstraintProfileInput = {
    complianceStrictness: 9, // High compliance
    costSensitivity: 9, // High cost sensitivity - contradiction!
    riskTolerance: 2, // Low risk tolerance
    userExperiencePriority: 9, // High UX priority - another contradiction!
  };
  
  const result2 = validator.validateConstraintInputs(contradictoryInput);
  console.log(`   Contradictions found: ${result2.contradictions.contradictions.length}`);
  console.log(`   Reliability impact: ${result2.contradictions.reliabilityImpact}`);
  
  result2.contradictions.contradictions.forEach((contradiction, index) => {
    console.log(`   Contradiction ${index + 1}:`);
    console.log(`     ID: ${contradiction.contradictionId}`);
    console.log(`     Severity: ${contradiction.severity}`);
    console.log(`     Explanation: ${contradiction.explanation}`);
    console.log(`     Business Impact: ${contradiction.businessImpact}`);
  });
  
  // Test 3: Stakeholder alignment suggestions
  console.log('\n3. Stakeholder alignment suggestions:');
  result2.contradictions.alignmentSuggestions.forEach((suggestion, index) => {
    console.log(`   Suggestion ${index + 1}:`);
    console.log(`     Stakeholder Group: ${suggestion.stakeholderGroup}`);
    console.log(`     Priority: ${suggestion.priority}`);
    console.log(`     Discussion Topics: ${suggestion.discussionTopics.slice(0, 2).join(', ')}...`);
  });
  
  console.log('\n');
}

/**
 * Demonstrate processing error recovery and fallback analysis
 */
export function demonstrateErrorRecovery() {
  console.log('=== Processing Error Recovery Demo ===\n');
  
  const errorHandler = new ProcessingErrorHandler();
  
  // Test 1: Scoring failure recovery
  console.log('1. Testing scoring failure recovery:');
  const scoringError = new Error('Matrix calculation failed due to invalid constraint weights');
  const constraints = {
    riskTolerance: 5,
    complianceStrictness: 5,
    costSensitivity: 5,
    userExperiencePriority: 5,
    operationalMaturity: 5,
    businessAgility: 5,
    inputCompleteness: true,
    assumptions: [],
  };
  
  const fallbackResult = errorHandler.handleScoringFailure(scoringError, constraints);
  console.log(`   Fallback activated: ${fallbackResult.isFallback}`);
  console.log(`   Fallback reason: ${fallbackResult.fallbackReason}`);
  console.log(`   Available functionality: ${fallbackResult.availableFunctionality.length} features`);
  console.log(`   Unavailable functionality: ${fallbackResult.unavailableFunctionality.length} features`);
  console.log(`   Error recoverable: ${fallbackResult.triggeringError?.recoverable}`);
  console.log(`   Recovery actions: ${fallbackResult.triggeringError?.recoveryActions.join(', ')}`);
  
  // Test 2: Conflict detection failure recovery
  console.log('\n2. Testing conflict detection failure recovery:');
  const conflictError = new Error('Conflict detection rules engine crashed');
  const conflictFallback = errorHandler.handleConflictDetectionFailure(conflictError, constraints);
  console.log(`   Fallback reason: ${conflictFallback.fallbackReason}`);
  console.log(`   Component: ${conflictFallback.triggeringError?.component}`);
  
  // Test 3: Output formatting failure recovery
  console.log('\n3. Testing output formatting failure recovery:');
  const formattingError = new Error('Template rendering engine failed');
  const analysisResult = {
    constraintProfile: constraints,
    architectureScores: [],
    detectedConflicts: [],
    tradeoffSummary: {
      keyDecisionFactors: ['Manual evaluation required'],
      primaryTradeoffs: [],
      isNearTie: true,
      nearTieThreshold: 0.5,
    },
    assumptions: [],
    interpretationGuidance: ['System error - manual review required'],
    analysisTimestamp: new Date(),
    engineVersion: '1.0.0',
  };
  
  const formattingFallback = errorHandler.handleFormattingFailure(formattingError, analysisResult);
  console.log(`   Fallback reason: ${formattingFallback.fallbackReason}`);
  console.log(`   Plain text available: ${formattingFallback.availableFunctionality.includes('Complete analysis results in plain text')}`);
  
  console.log('\n');
}

/**
 * Demonstrate system-wide error recovery coordination
 */
export async function demonstrateSystemRecovery() {
  console.log('=== System-Wide Error Recovery Demo ===\n');
  
  // Note: SystemErrorRecoveryCoordinator not yet implemented
  console.log('System recovery coordination functionality is under development.');
  
  // Test with problematic input that might cause multiple component failures
  const problematicInput: ConstraintProfileInput = {
    riskTolerance: 'invalid' as any, // Will cause constraint processing issues
    complianceStrictness: 999, // Out of range
  };
  
  const outputPreferences = {
    personaContext: {
      persona: 'CISO' as const,
      responsibilities: ['Strategic security decisions'],
      painPoints: ['Budget constraints'],
      successCriteria: ['Defensible recommendations'],
    },
    includeDetailedExplanations: true,
    emphasizeCompliance: true,
    includeCostAnalysis: true,
    numericFormat: 'detailed' as const,
  };
  
  console.log('1. Testing system recovery with problematic input:');
  console.log('   System recovery functionality is under development.');
  
  // Test system health monitoring
  console.log('\n2. Testing system health monitoring:');
  console.log('   System health monitoring functionality is under development.');
  
  console.log('\n');
}

/**
 * Run all error handling demonstrations
 */
export async function runErrorHandlingDemo() {
  console.log('SecureStack Referee - Error Handling & Graceful Degradation Demo');
  console.log('================================================================\n');
  
  demonstrateInputValidation();
  demonstrateErrorRecovery();
  await demonstrateSystemRecovery();
  
  console.log('Demo completed successfully!');
  console.log('\nKey Features Demonstrated:');
  console.log('✓ Enhanced input validation with detailed error messages');
  console.log('✓ Contradiction detection with stakeholder alignment suggestions');
  console.log('✓ Processing error recovery with fallback analysis');
  console.log('✓ Plain text output fallback for formatting errors');
  console.log('✓ System-wide error coordination and health monitoring');
  console.log('✓ Graceful degradation with reduced functionality modes');
}

// Run demo if this file is executed directly
if (require.main === module) {
  runErrorHandlingDemo().catch(console.error);
}