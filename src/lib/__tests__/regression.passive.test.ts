import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import { enPassiveCases, esPassiveCases } from '../__fixtures__/passive';

describe('passive regression: EN', () => {
  for (const c of enPassiveCases) {
    it(`${c.passive ? 'flags' : 'ignores'}: ${c.text}`, () => {
      expect(analyzeText(c.text, 'en').passiveCount).toBe(c.passive ? 1 : 0);
    });
  }

  it('real vs false positive side by side', () => {
    expect(analyzeText('The report was written.', 'en').passiveCount).toBe(1);
    expect(analyzeText('She is turned on.', 'en').passiveCount).toBe(0);
  });
});

describe('passive regression: ES', () => {
  for (const c of esPassiveCases) {
    it(`${c.passive ? 'flags' : 'ignores'}: ${c.text}`, () => {
      expect(analyzeText(c.text, 'es').passiveCount).toBe(c.passive ? 1 : 0);
    });
  }

  it('real vs false positive side by side', () => {
    expect(analyzeText('Se registró.', 'es').passiveCount).toBe(1);
    expect(analyzeText('Se me olvidó.', 'es').passiveCount).toBe(0);
  });
});
