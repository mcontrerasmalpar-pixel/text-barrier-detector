import { describe, it, expect } from 'vitest';
import { analyzeText, AnalysisError, MAX_INPUT_CHARS } from '../analyzer';
import { translations } from '../i18n';

function catchError(fn: () => unknown): AnalysisError {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(AnalysisError);
    return e as AnalysisError;
  }
  throw new Error('expected function to throw');
}

describe('input validation', () => {
  it('rejects non-string input with INVALID_TYPE and names the received type', () => {
    const cases: [unknown, string][] = [
      [undefined, 'undefined'],
      [null, 'null'],
      [42, 'number'],
      [{}, 'object'],
      [['a'], 'array'],
      [true, 'boolean'],
    ];
    for (const [value, type] of cases) {
      const err = catchError(() => analyzeText(value as string));
      expect(err.code).toBe('INVALID_TYPE');
      expect(err.details.type).toBe(type);
      expect(err.message).toBe(`Input text must be a string, but received ${type}.`);
      expect(err.name).toBe('AnalysisError');
    }
  });

  it('rejects empty and whitespace-only strings with EMPTY_TEXT', () => {
    for (const text of ['', ' ', '\n\n', '\t \r\n']) {
      const err = catchError(() => analyzeText(text));
      expect(err.code).toBe('EMPTY_TEXT');
      expect(err.message).toBe(translations.en.errEmptyText);
    }
  });

  it('accepts exactly the maximum length and rejects one more character', () => {
    const ok = 'a'.repeat(MAX_INPUT_CHARS);
    expect(analyzeText(ok).totalWords).toBe(1);

    const tooLong = 'a'.repeat(MAX_INPUT_CHARS + 1);
    const err = catchError(() => analyzeText(tooLong));
    expect(err.code).toBe('TEXT_TOO_LONG');
    expect(err.details).toEqual({ length: MAX_INPUT_CHARS + 1, max: MAX_INPUT_CHARS });
    expect(err.message).toContain('1000001');
    expect(err.message).toContain('1000000');
  });

  it('rejects unsupported languages with UNSUPPORTED_LANGUAGE', () => {
    const err = catchError(() => analyzeText('Bonjour le monde.', 'fr' as never));
    expect(err.code).toBe('UNSUPPORTED_LANGUAGE');
    expect(err.message).toBe('Unsupported language "fr". Supported languages: en, es.');
  });

  it('localizes messages to Spanish when lang=es', () => {
    expect(catchError(() => analyzeText('', 'es')).message).toBe(translations.es.errEmptyText);
    expect(catchError(() => analyzeText(5 as never, 'es')).message).toBe(
      'El texto de entrada debe ser una cadena (string), pero se recibió number.'
    );
    const long = catchError(() => analyzeText('a'.repeat(MAX_INPUT_CHARS + 1), 'es'));
    expect(long.message).toContain('demasiado largo');
  });

  it('every error template exists in both languages', () => {
    for (const key of ['errInvalidType', 'errEmptyText', 'errTextTooLong', 'errUnsupportedLanguage'] as const) {
      expect(translations.en[key].length).toBeGreaterThan(0);
      expect(translations.es[key].length).toBeGreaterThan(0);
    }
  });

  it('valid input is unaffected', () => {
    expect(() => analyzeText('Hello world.', 'en')).not.toThrow();
    expect(() => analyzeText('Hola mundo.', 'es')).not.toThrow();
    expect(() => analyzeText('...')).not.toThrow(); // punctuation-only is valid, just 0 words
  });
});
