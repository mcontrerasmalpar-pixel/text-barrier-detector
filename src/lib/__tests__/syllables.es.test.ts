import { describe, it, expect } from 'vitest';
import { countSyllables, countSpanishSyllables, isComplexWord } from '../syllables';

describe('Spanish syllables', () => {
  it('counts accented vowels and diphthongs', () => {
    expect(countSpanishSyllables('casa')).toBe(2);
    expect(countSpanishSyllables('causa')).toBe(2); // cau-sa
    expect(countSpanishSyllables('computadora')).toBe(5); // com-pu-ta-do-ra
    expect(countSpanishSyllables('evaluación')).toBeGreaterThanOrEqual(4);
  });

  it('marks complex words at >=4 syllables', () => {
    expect(isComplexWord('casa', 'es')).toBe(false);
    expect(isComplexWord('computadora', 'es')).toBe(true);
    expect(isComplexWord('evaluación', 'es')).toBe(true);
  });

  it('keeps English path unchanged', () => {
    expect(countSyllables('documentation', 'en')).toBe(countSyllables('documentation'));
    expect(countSyllables('cat', 'en')).toBe(1);
  });
});
