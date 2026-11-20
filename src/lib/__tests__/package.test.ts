import { describe, it, expect } from 'vitest';
import * as core from '@makitaki/text-barrier-core';

describe('@makitaki/text-barrier-core package API', () => {
  it('exports the typed core API (analyze, findBarriers, validators, language packs)', () => {
    for (const name of [
      'analyze',
      'analyzeText',
      'findBarriers',
      'AnalysisError',
      'MAX_INPUT_CHARS',
      'validateInput',
      'SUPPORTED_LANGUAGES',
      'getLanguagePack',
      'isSupportedLanguage',
      'READABILITY_BAND_NAME',
      'READABILITY_BAND_DISCLAIMER',
    ]) {
      expect(core, `missing export ${name}`).toHaveProperty(name);
    }
  });

  it('analyze(text, { lang }) works for English and Spanish', () => {
    const en = core.analyze('The report was written by the team. She is turned on.', { lang: 'en' });
    expect(en.language).toBe('en');
    expect(en.formulaName).toBe('Flesch');
    expect(en.passiveCount).toBe(1);

    const es = core.analyze('El informe fue escrito por el equipo.', { lang: 'es' });
    expect(es.language).toBe('es');
    expect(es.formulaName).toBe('Fernández-Huerta');
    expect(es.passiveCount).toBe(1);
    expect(es.level.disclaimer).toBe(core.READABILITY_BAND_DISCLAIMER);
  });

  it('findBarriers(text, { lang }) is callable and validates input', () => {
    const issues = core.findBarriers('The cat sat on the mat.', { lang: 'en' });
    expect(Array.isArray(issues)).toBe(true);
    expect(() => core.findBarriers('', { lang: 'en' })).toThrow(core.AnalysisError);
  });
});
