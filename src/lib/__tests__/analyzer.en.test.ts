import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import { enBaselines, enFixtures } from '../__fixtures__/es';

describe('English regression (lang=en default)', () => {
  for (const key of Object.keys(enFixtures) as (keyof typeof enFixtures)[]) {
    it('preserves baseline metrics for ' + key, () => {
      const result = analyzeText(enFixtures[key], 'en');
      const expected = enBaselines[key];
      expect(result.language).toBe('en');
      expect(result.formulaName).toBe('Flesch');
      expect(result.fleschScore).toBe(expected.fleschScore);
      expect(result.fleschLabel).toBe(expected.fleschLabel);
      expect(result.gradeLevel).toBe(expected.gradeLevel);
      expect(result.avgSentenceLength).toBe(expected.avgSentenceLength);
      expect(result.passiveCount).toBe(expected.passiveCount);
      expect(result.complexWordCount).toBe(expected.complexWordCount);
      expect(result.structureScore).toBe(expected.structureScore);
      expect(result.overallScore).toBe(expected.overallScore);
      expect(result.totalWords).toBe(expected.totalWords);
      expect(result.totalSentences).toBe(expected.totalSentences);
      expect(result.totalSyllables).toBe(expected.totalSyllables);
    });
  }

  it('defaults to English when lang omitted', () => {
    const result = analyzeText(enFixtures.passive);
    expect(result.language).toBe('en');
    expect(result.formulaName).toBe('Flesch');
    expect(result.passiveCount).toBe(1);
  });
});
