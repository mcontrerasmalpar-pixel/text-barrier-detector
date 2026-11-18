import { describe, it, expect } from 'vitest';
import { analyzeText } from '../analyzer';
import { computeStructureScore } from '../structure';

const body =
  'This section explains how the tool works and why each step matters for readers who skim documents quickly.';

describe('structure density scoring', () => {
  it('empty headings and bullets cannot score high', () => {
    const text = '#\n\n-\n\n#\n\n-\n\n#';
    const score = computeStructureScore(text, 0);
    expect(score).toBe(0);
  });

  it('formatting markers with a few words stay low', () => {
    const text = '# A\n\n- b\n- c\n\n# D\n\n- e\n- f';
    const words = 6;
    expect(computeStructureScore(text, words)).toBeLessThanOrEqual(30);
  });

  it('a lone bullet is not a list and a heading without body earns nothing', () => {
    const text = '# Title\n\n- one';
    expect(computeStructureScore(text, 3)).toBeLessThanOrEqual(30);
  });

  it('one word per paragraph is over-fragmented', () => {
    const text = Array.from({ length: 30 }, (_, i) => `w${i}x`).join('\n\n');
    expect(computeStructureScore(text, 30)).toBeLessThanOrEqual(40);
  });

  it('real structure with substantial content scores well', () => {
    const text = [
      '# Overview',
      body,
      body,
      '# Steps',
      '- Open the settings page and read the options.',
      '- Choose the option that fits your team best.',
      body,
    ].join('\n\n');
    const result = analyzeText(text, 'en');
    expect(result.structureScore).toBeGreaterThanOrEqual(70);
    expect(result.structureScore).toBeLessThan(100);
  });

  it('a wall of text scores lower than the same text split into paragraphs', () => {
    const para = Array.from({ length: 8 }, () => body).join(' ');
    const wall = analyzeText(para, 'en').structureScore;
    const split = analyzeText(
      [para.slice(0, para.length / 2), para.slice(para.length / 2)].join('\n\n'),
      'en'
    ).structureScore;
    expect(split).toBeGreaterThan(wall);
  });
});
