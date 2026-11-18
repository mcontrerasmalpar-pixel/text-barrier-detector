import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import type { AnalysisLanguage } from '../analyzer';

function assertFinite(value: unknown, path = 'result'): void {
  if (typeof value === 'number') {
    expect(Number.isFinite(value), `${path} must be finite, got ${value}`).toBe(true);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => assertFinite(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) assertFinite(v, `${path}.${k}`);
  }
}

const LANGS: AnalysisLanguage[] = ['en', 'es'];

describe('edge cases', () => {
  for (const lang of LANGS) {
    describe(`lang=${lang}`, () => {
      it('empty text yields zeroed, finite metrics', () => {
        const r = analyzeText('', lang);
        assertFinite(r);
        expect(r.totalWords).toBe(0);
        expect(r.passiveCount).toBe(0);
        expect(r.sentences).toEqual([]);
        expect(r.structureScore).toBe(0);
      });

      it('whitespace-only text behaves like empty text', () => {
        const r = analyzeText('  \n\t \n\n  ', lang);
        assertFinite(r);
        expect(r.totalWords).toBe(0);
      });

      it('punctuation-only text has no words and no NaN', () => {
        const r = analyzeText('...!!! ??? -- ,,, ;;; (( )) ¿¡', lang);
        assertFinite(r);
        expect(r.totalWords).toBe(0);
        expect(r.complexWordCount).toBe(0);
      });

      it('handles emoji, CJK and RTL without throwing', () => {
        const text = 'Hello 👋 world 🌍. 你好，世界。 مرحبا بالعالم. Привет мир!';
        const r = analyzeText(text, lang);
        assertFinite(r);
        expect(r.totalWords).toBeGreaterThan(0);
      });

      it('handles digits, URLs and code-like tokens', () => {
        const r = analyzeText('Visit https://example.com/a?b=1 now. Version 2.0.1 is out!', lang);
        assertFinite(r);
        expect(r.totalSentences).toBeGreaterThan(0);
      });

      it('handles a single very long word', () => {
        const r = analyzeText('a'.repeat(5000), lang);
        assertFinite(r);
        expect(r.totalWords).toBe(1);
      });
    });
  }

  it('Spanish accents: composed (NFC) and decomposed (NFD) give identical results', () => {
    const nfc = 'La evaluación automática fue modificada por el administrador. Se registró.'.normalize('NFC');
    const nfd = nfc.normalize('NFD');
    expect(nfd).not.toBe(nfc);
    const a = analyzeText(nfc, 'es');
    const b = analyzeText(nfd, 'es');
    expect(b.totalWords).toBe(a.totalWords);
    expect(b.totalSyllables).toBe(a.totalSyllables);
    expect(b.passiveCount).toBe(a.passiveCount);
    expect(b.fleschScore).toBe(a.fleschScore);
  });

  it('Spanish ñ, ü and inverted punctuation count as word characters', () => {
    const r = analyzeText('¿Cuánto cuesta el pingüino? ¡Mañana lo sabremos!', 'es');
    assertFinite(r);
    expect(r.totalWords).toBe(7);
    expect(r.totalSentences).toBe(2);
  });
});

describe('large inputs (100k words)', () => {
  const unit =
    'The report was written by the team. She is turned on. We shipped the feature yesterday. ';
  const unitWords = 16; // words per `unit`

  it('analyzes 100,000 words of English in reasonable time', () => {
    const text = unit.repeat(Math.ceil(100_000 / unitWords)).trim();
    const t0 = performance.now();
    const r = analyzeText(text, 'en');
    const ms = performance.now() - t0;
    assertFinite(r);
    expect(r.totalWords).toBeGreaterThanOrEqual(100_000);
    expect(r.passiveCount).toBeGreaterThan(0);
    expect(ms).toBeLessThan(10_000);
  });

  it('analyzes 100,000 words of Spanish in reasonable time', () => {
    const esUnit = 'El informe fue escrito por el equipo. Se registró el usuario. Se me olvidó. ';
    const esWords = 14;
    const text = esUnit.repeat(Math.ceil(100_000 / esWords)).trim();
    const t0 = performance.now();
    const r = analyzeText(text, 'es');
    const ms = performance.now() - t0;
    assertFinite(r);
    expect(r.totalWords).toBeGreaterThanOrEqual(100_000);
    expect(ms).toBeLessThan(10_000);
  });

  it('does not blow up on 100,000 words with no sentence punctuation', () => {
    const text = 'was written is turned on and then we went home '.repeat(100_000 / 10);
    const t0 = performance.now();
    const r = analyzeText(text, 'en');
    const ms = performance.now() - t0;
    assertFinite(r);
    expect(r.totalSentences).toBe(1);
    expect(ms).toBeLessThan(10_000);
  });
});
