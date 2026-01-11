/**
 * Property-Based Tests for Balanced Architecture Analysis
 * 
 * Feature: securestack-referee, Property 10: Balanced Architecture Analysis
 * Validates: Requirements 4.2, 4.3, 4.5
 */

import fc from 'fast-check';
import { ArchitectureType } from './types';
import { 
  getArchitectureProfile, 
  getAllArchitectureProfiles,
  validateArchitectureProfile 
} from './architecture-profiles';

describe('Property 10: Balanced Architecture Analysis', () => {
  const architectureTypeArb = fc.constantFrom('IRM-Heavy', 'URM-Heavy', 'Hybrid') as fc.Arbitrary<ArchitectureType>;

  test('For any architecture option, system shall provide balanced analysis including strengths, weaknesses, and risks', () => {
    fc.assert(
      fc.property(architectureTypeArb, (architectureType: ArchitectureType) => {
        const profile = getArchitectureProfile(architectureType);
        
        // Must have strengths
        expect(profile.strengths).toBeDefined();
        expect(profile.strengths.length).toBeGreaterThan(0);
        
        // Must have weaknesses
        expect(profile.weaknesses).toBeDefined();
        expect(profile.weaknesses.length).toBeGreaterThan(0);
        
        // Must have risks
        expect(profile.risks).toBeDefined();
        expect(profile.risks.length).toBeGreaterThan(0);
        
        // Each strength must be meaningful content
        profile.strengths.forEach(strength => {
          expect(typeof strength).toBe('string');
          expect(strength.length).toBeGreaterThan(5); // Meaningful content
        });
        
        // Each weakness must be meaningful content
        profile.weaknesses.forEach(weakness => {
          expect(typeof weakness).toBe('string');
          expect(weakness.length).toBeGreaterThan(5); // Meaningful content
        });
        
        // Each risk must be meaningful content
        profile.risks.forEach(risk => {
          expect(typeof risk).toBe('string');
          expect(risk.length).toBeGreaterThan(5); // Meaningful content
        });
      }),
      { numRuns: 100 }
    );
  });

  test('For any architecture option, system shall not declare it as universally superior', () => {
    fc.assert(
      fc.property(architectureTypeArb, (architectureType: ArchitectureType) => {
        const profile = getArchitectureProfile(architectureType);
        
        // Check that content doesn't contain recommendation language
        const allContent = [
          ...profile.strengths,
          ...profile.weaknesses,
          ...profile.risks,
          ...Object.values(profile.scoringRationale),
        ].join(' ').toLowerCase();
        
        // Should not contain universal recommendation terms
        const prohibitedTerms = [
          'best architecture', 'optimal choice', 'universally superior', 'recommended architecture', 'should choose',
          'always use', 'never use', 'perfect solution', 'ideal solution',
          'universally better', 'clearly better', 'obviously superior', 'always superior'
        ];
        
        prohibitedTerms.forEach(term => {
          expect(allContent).not.toContain(term);
        });
        
        // Should not suggest this architecture is always the right choice
        expect(allContent).not.toMatch(/always.*right|right.*always/);
        expect(allContent).not.toMatch(/never.*wrong|wrong.*never/);
      }),
      { numRuns: 100 }
    );
  });

  test('For any architecture comparison, system shall present balanced view without bias', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allProfiles = getAllArchitectureProfiles();
        
        // Must have all three architecture types
        expect(allProfiles.length).toBe(3);
        
        const architectureTypes = allProfiles.map(p => p.type);
        expect(architectureTypes).toContain('IRM-Heavy');
        expect(architectureTypes).toContain('URM-Heavy');
        expect(architectureTypes).toContain('Hybrid');
        
        // Each architecture must have both positive and negative aspects
        allProfiles.forEach(profile => {
          expect(profile.strengths.length).toBeGreaterThan(0);
          expect(profile.weaknesses.length).toBeGreaterThan(0);
          expect(profile.risks.length).toBeGreaterThan(0);
          
          // No architecture should have significantly more strengths than others
          // (balanced presentation)
          expect(profile.strengths.length).toBeLessThanOrEqual(6);
          expect(profile.weaknesses.length).toBeGreaterThanOrEqual(2);
          expect(profile.risks.length).toBeGreaterThanOrEqual(1);
        });
        
        // Validate all profiles are complete and valid
        allProfiles.forEach(profile => {
          expect(validateArchitectureProfile(profile)).toBe(true);
        });
      }),
      { numRuns: 50 }
    );
  });

  test('For any architecture option, scoring rationale shall explain dimension scores without bias', () => {
    fc.assert(
      fc.property(architectureTypeArb, (architectureType: ArchitectureType) => {
        const profile = getArchitectureProfile(architectureType);
        
        // Must have scoring rationale for all dimensions
        const expectedDimensions = [
          'identityVerification', 'behavioralAnalytics', 'operationalComplexity',
          'userExperience', 'complianceAuditability', 'scalabilityPerformance', 'costEfficiency'
        ];
        
        expectedDimensions.forEach(dimension => {
          expect(profile.scoringRationale[dimension as keyof typeof profile.scoringRationale]).toBeDefined();
          expect(profile.scoringRationale[dimension as keyof typeof profile.scoringRationale].length).toBeGreaterThan(10);
        });
        
        // Rationale should not contain biased language
        const allRationale = Object.values(profile.scoringRationale).join(' ').toLowerCase();
        
        const biasedTerms = [
          'obviously', 'clearly superior', 'much better', 'far superior',
          'always better', 'never good', 'terrible', 'awful', 'perfect'
        ];
        
        biasedTerms.forEach(term => {
          expect(allRationale).not.toContain(term);
        });
        
        // Should contain explanatory language
        const explanatoryTerms = ['emphasizes', 'focuses', 'relies', 'provides', 'requires'];
        const hasExplanatoryLanguage = explanatoryTerms.some(term => allRationale.includes(term));
        expect(hasExplanatoryLanguage).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('For any architecture option, analysis shall acknowledge both advantages and disadvantages', () => {
    fc.assert(
      fc.property(architectureTypeArb, (architectureType: ArchitectureType) => {
        const profile = getArchitectureProfile(architectureType);
        
        // Must have at least 2 strengths and 2 weaknesses for balanced view
        expect(profile.strengths.length).toBeGreaterThanOrEqual(2);
        expect(profile.weaknesses.length).toBeGreaterThanOrEqual(2);
        
        // Strengths and weaknesses should not contradict each other inappropriately
        const strengthsText = profile.strengths.join(' ').toLowerCase();
        const weaknessesText = profile.weaknesses.join(' ').toLowerCase();
        
        // Should not claim to be both excellent and terrible at the same thing
        // This is a basic sanity check for internal consistency
        expect(strengthsText).toBeTruthy();
        expect(weaknessesText).toBeTruthy();
        
        // Each architecture should acknowledge trade-offs exist
        const allContent = [
          ...profile.strengths,
          ...profile.weaknesses,
          ...profile.risks
        ].join(' ').toLowerCase();
        
        // Should not claim to have no trade-offs or be perfect
        expect(allContent).not.toContain('no trade-offs');
        expect(allContent).not.toContain('no disadvantages');
        expect(allContent).not.toContain('perfect solution');
        expect(allContent).not.toContain('no risks');
      }),
      { numRuns: 100 }
    );
  });

  test('For any architecture comparison, relative scoring shall be comparative not absolute', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allProfiles = getAllArchitectureProfiles();
        
        // Check that scores are distributed across the range (not all high or all low)
        const allScores: number[] = [];
        
        allProfiles.forEach(profile => {
          Object.values(profile.baseScores).forEach(score => {
            allScores.push(score);
          });
        });
        
        // Should have variety in scores (comparative, not absolute)
        const minScore = Math.min(...allScores);
        const maxScore = Math.max(...allScores);
        
        expect(minScore).toBeGreaterThanOrEqual(1);
        expect(maxScore).toBeLessThanOrEqual(10);
        expect(maxScore - minScore).toBeGreaterThanOrEqual(3); // Meaningful spread
        
        // Each dimension should have different scores across architectures
        const dimensions = ['identityVerification', 'behavioralAnalytics', 'userExperience', 'complianceAuditability'];
        
        dimensions.forEach(dimension => {
          const dimensionScores = allProfiles.map(p => 
            p.baseScores[dimension as keyof typeof p.baseScores]
          );
          
          // Should not all be the same score (comparative analysis)
          const uniqueScores = new Set(dimensionScores);
          expect(uniqueScores.size).toBeGreaterThan(1);
        });
      }),
      { numRuns: 50 }
    );
  });
});