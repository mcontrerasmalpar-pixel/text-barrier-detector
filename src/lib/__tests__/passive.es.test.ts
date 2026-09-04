import { describe, it, expect } from 'vitest';
import { detectSpanishPassive, detectEnglishPassive, detectPassiveVoice } from '../passive';
import { esFixtures } from '../__fixtures__/es';

describe('Spanish passive detection', () => {
  it('flags analytic ser + participle', () => {
    expect(detectSpanishPassive(esFixtures.analyticPassive)).toBe(true);
  });

  it('flags se-passive / impersonal', () => {
    expect(detectSpanishPassive(esFixtures.sePassive)).toBe(true);
    expect(detectSpanishPassive(esFixtures.seImpersonal)).toBe(true);
  });

  it('does not flag clear active sentence', () => {
    expect(detectSpanishPassive(esFixtures.activeClean)).toBe(false);
    expect(detectSpanishPassive(esFixtures.shortClean)).toBe(false);
  });

  it('English-only regex is not the sole detector for Spanish fixtures', () => {
    expect(detectEnglishPassive(esFixtures.analyticPassive)).toBe(false);
    expect(detectEnglishPassive(esFixtures.sePassive)).toBe(false);
    expect(detectPassiveVoice(esFixtures.analyticPassive, 'es')).toBe(true);
    expect(detectPassiveVoice(esFixtures.sePassive, 'es')).toBe(true);
  });
});
