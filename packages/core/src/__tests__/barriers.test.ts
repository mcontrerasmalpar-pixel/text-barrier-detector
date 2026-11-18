import { describe, it, expect } from 'vitest';
import { findBarriers, AnalysisError } from '../index.js';

describe('findBarriers (deterministic issue detector)', () => {
  it('detects passive, long_sentence, and complex_word in English with exact offsets', () => {
    const text =
      'The report was written by the team. She is turned on. The juxtaposition of extraordinary counterintuitive methodologies is clear despite the unnecessary complication that we observed yesterday in our daily product review.';
    const issues = findBarriers(text, { lang: 'en' });

    for (const issue of issues) {
      expect(issue.lang).toBe('en');
      expect(issue.start).toBeGreaterThanOrEqual(0);
      expect(issue.end).toBeGreaterThan(issue.start);
      expect(text.slice(issue.start, issue.end)).toBe(issue.text);
      expect(issue.reason.length).toBeGreaterThan(10);
    }

    // Sentence 0: passive ("was written")
    const passives = issues.filter((i) => i.type === 'passive');
    expect(passives).toHaveLength(1);
    expect(passives[0].sentenceIndex).toBe(0);
    expect(passives[0].text).toBe('was written');

    // Sentence 1 ("She is turned on.") has no issues
    expect(issues.filter((i) => i.sentenceIndex === 1)).toHaveLength(0);

    // Sentence 2: long_sentence + complex_word(s)
    const longIssues = issues.filter((i) => i.type === 'long_sentence');
    expect(longIssues).toHaveLength(1);
    expect(longIssues[0].sentenceIndex).toBe(2);

    const complexWords = issues.filter((i) => i.type === 'complex_word').map((i) => i.text);
    expect(complexWords).toContain('juxtaposition');
    expect(complexWords).toContain('counterintuitive');
  });

  it('detects Spanish barriers and ignores false positives ("Se me olvidó")', () => {
    const text = 'Se registró el usuario. Se me olvidó la contraseña.';
    const issues = findBarriers(text, { lang: 'es' });

    const passives = issues.filter((i) => i.type === 'passive');
    expect(passives).toHaveLength(1);
    expect(passives[0].sentenceIndex).toBe(0);
    expect(passives[0].text).toBe('Se registró');
    expect(passives[0].lang).toBe('es');
    expect(text.slice(passives[0].start, passives[0].end)).toBe('Se registró');

    const complex = issues.filter((i) => i.type === 'complex_word');
    expect(complex).toHaveLength(1);
    expect(complex[0].sentenceIndex).toBe(1);
    expect(complex[0].text).toBe('contraseña');
    expect(text.slice(complex[0].start, complex[0].end)).toBe('contraseña');
  });

  it('defaults to English when options or lang are omitted', () => {
    const issues = findBarriers('The report was written.');
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('passive');
    expect(issues[0].lang).toBe('en');
  });

  it('validates input and throws AnalysisError on invalid input', () => {
    expect(() => findBarriers('')).toThrow(AnalysisError);
    expect(() => findBarriers('Hola', { lang: 'fr' as never })).toThrow(AnalysisError);
  });
});
