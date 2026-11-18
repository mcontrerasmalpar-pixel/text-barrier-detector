import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import {
  READABILITY_BAND_DISCLAIMER,
  READABILITY_BAND_NAME,
} from '../levelClassifier';
import { translations } from '../i18n';

describe('Readability Band (CEFR-inspired, not a certification)', () => {
  it('uses the new band name and disclaimer', () => {
    expect(READABILITY_BAND_NAME).toBe('Readability Band (A1–C2)');
    expect(READABILITY_BAND_DISCLAIMER).toMatch(/CEFR-inspired/);
    expect(READABILITY_BAND_DISCLAIMER).toMatch(/not a CEFR assessment or certification/);
  });

  it('every analysis result carries the disclaimer and a non-CEFR-proficiency label', () => {
    const r = analyzeText('The cat sat on the mat.', 'en');
    expect(r.level.disclaimer).toBe(READABILITY_BAND_DISCLAIMER);
    expect(r.level.label).not.toMatch(/Intermediate|Beginner|Mastery/);
  });

  it('i18n exposes the band heading and note in EN and ES', () => {
    expect(translations.en.readabilityBand).toBe('Readability Band (A1–C2)');
    expect(translations.es.readabilityBand).toContain('A1–C2');
    expect(translations.en.readabilityBandNote).toMatch(/not a certification/);
    expect(translations.es.readabilityBandNote).toMatch(/no es una certificación/);
  });
});
