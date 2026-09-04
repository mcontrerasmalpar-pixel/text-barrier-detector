import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import { esFixtures } from '../__fixtures__/es';

describe('Spanish analysis (lang=es)', () => {
  it('uses Fernández-Huerta and language metadata', () => {
    const result = analyzeText(esFixtures.shortClean, 'es');
    expect(result.language).toBe('es');
    expect(result.formulaName).toBe('Fernández-Huerta');
    expect(result.fleschScore).toBeGreaterThanOrEqual(0);
    expect(result.fleschScore).toBeLessThanOrEqual(100);
  });

  it('flags Spanish analytic passive', () => {
    const result = analyzeText(esFixtures.analyticPassive, 'es');
    expect(result.passiveCount).toBeGreaterThanOrEqual(1);
    expect(result.sentences[0].hasPassiveVoice).toBe(true);
  });

  it('flags se-passive', () => {
    const result = analyzeText(esFixtures.sePassive, 'es');
    expect(result.passiveCount).toBeGreaterThanOrEqual(1);
  });

  it('marks long sentences over 20 words', () => {
    const result = analyzeText(esFixtures.longSentence, 'es');
    expect(result.sentences[0].isLong).toBe(true);
    expect(result.avgSentenceLength).toBeGreaterThan(20);
  });

  it('keeps short clean sentences clean', () => {
    const result = analyzeText(esFixtures.shortClean, 'es');
    expect(result.sentences[0].isLong).toBe(false);
    expect(result.passiveCount).toBe(0);
  });

  it('counts complex words with Spanish syllables (>=4)', () => {
    const result = analyzeText(esFixtures.accentedVowels, 'es');
    const joined = result.sentences.flatMap(s => s.complexWords).map(w => w.toLowerCase());
    expect(joined.some(w => w.includes('computadora') || w.includes('evaluacion') || w.includes('evaluación'))).toBe(true);
    expect(result.complexWordCount).toBeGreaterThanOrEqual(1);
  });

  it('handles product-doc style paragraph', () => {
    const result = analyzeText(esFixtures.productDoc, 'es');
    expect(result.totalSentences).toBeGreaterThanOrEqual(3);
    expect(result.passiveCount).toBeGreaterThanOrEqual(1);
    expect(result.structureScore).toBeGreaterThan(10);
    expect(result.formulaName).toBe('Fernández-Huerta');
  });

  it('Fernández-Huerta fields are present and clamped', () => {
    const result = analyzeText(esFixtures.diphthongs, 'es');
    expect(result.formulaName).toBe('Fernández-Huerta');
    expect(result.fleschLabel).toMatch(/easy|Moderate|Difficult/i);
    expect(result.totalSyllables).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });
});
