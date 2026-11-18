import { describe, it, expect } from 'vitest';
import * as api from '../../index';

describe('package entry point (src/index.ts)', () => {
  it('exports the documented public API', () => {
    for (const name of [
      'analyzeText',
      'AnalysisError',
      'MAX_INPUT_CHARS',
      'validateInput',
      'SUPPORTED_LANGUAGES',
      'getLanguagePack',
      'isSupportedLanguage',
      'READABILITY_BAND_NAME',
      'READABILITY_BAND_DISCLAIMER',
    ]) {
      expect(api, `missing export ${name}`).toHaveProperty(name);
    }
  });

  it('does not leak UI or React modules', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'AnalysisError',
        'MAX_INPUT_CHARS',
        'READABILITY_BAND_DISCLAIMER',
        'READABILITY_BAND_NAME',
        'SUPPORTED_LANGUAGES',
        'analyzeText',
        'getLanguagePack',
        'isSupportedLanguage',
        'validateInput',
      ].sort()
    );
  });

  it('end-to-end: analyzeText through the public entry', () => {
    const r = api.analyzeText('El informe fue escrito por el equipo.', 'es');
    expect(r.language).toBe('es');
    expect(r.passiveCount).toBe(1);
    expect(r.level.disclaimer).toBe(api.READABILITY_BAND_DISCLAIMER);
  });
});
