import { describe, it, expect } from 'vitest';
import { getLanguagePack, isSupportedLanguage, SUPPORTED_LANGUAGES } from '../languages';
import { analyzeText } from '../analyzer';

describe('language packs', () => {
  it('ships exactly en and es', () => {
    expect([...SUPPORTED_LANGUAGES]).toEqual(['en', 'es']);
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('es')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });

  it('throws on an unsupported language', () => {
    // @ts-expect-error deliberately invalid
    expect(() => getLanguagePack('fr')).toThrow(/Unsupported language/);
  });

  it('en pack exposes passive, syllables and complex words', () => {
    const en = getLanguagePack('en');
    expect(en.formulaName).toBe('Flesch');
    expect(en.isPassive('The report was written by the team.')).toBe(true);
    expect(en.isPassive('She is turned on.')).toBe(false);
    expect(en.countSyllables('readability')).toBeGreaterThanOrEqual(4);
    expect(en.isCommonTechnical('Information')).toBe(true);
    expect(en.isCommonTechnical('juxtaposition')).toBe(false);
    expect(en.complexWordMinSyllables).toBe(4);
  });

  it('es pack exposes passive, syllables and complex words', () => {
    const es = getLanguagePack('es');
    expect(es.formulaName).toBe('Fernández-Huerta');
    expect(es.isPassive('El archivo fue modificado por el administrador.')).toBe(true);
    expect(es.countSyllables('automática')).toBe(5);
    expect(es.isCommonTechnical('información')).toBe(true);
  });

  it('analyzeText selects the pack from the language code', () => {
    expect(analyzeText('El gato duerme.', 'es').formulaName).toBe('Fernández-Huerta');
    expect(analyzeText('The cat sleeps.', 'en').formulaName).toBe('Flesch');
  });
});
