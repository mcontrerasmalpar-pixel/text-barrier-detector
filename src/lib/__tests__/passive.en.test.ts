import { describe, it, expect } from 'vitest';
import { detectEnglishPassive } from '../passive/en';

describe('EN passive: true positives', () => {
  const positives = [
    'The report was written by the team.',
    'The file was modified by an admin.',
    'The bug has been fixed.',
    'Mistakes were made.',
    'The cake is being baked.',
    'The window was broken by the storm.',
    'The email was not sent.',
    'The package was quickly delivered.',
    'The lights were turned on by Ana.',
    'He got fired.',
    'It is often broken into parts.',
    'The book is read by thousands.',
    'Dinner was eaten before noon.',
  ];
  for (const s of positives) {
    it(`flags: ${s}`, () => expect(detectEnglishPassive(s)).toBe(true));
  }
});

describe('EN passive: false positives', () => {
  const negatives = [
    'She is turned on.',
    'The light is turned on.',
    'The device is turned off at night.',
    'He is said to be a genius.',
    'The tool is known to fail.',
    'It is expected to rain.',
    'She is interested in music.',
    'The code is based on a standard.',
    'He was tired.',
    'They are excited.',
    'I am logged in.',
    'You are signed out.',
    'It is open.',
    'There are seven files.',
    'It is indeed useful.',
    'This is a need.',
  ];
  for (const s of negatives) {
    it(`ignores: ${s}`, () => expect(detectEnglishPassive(s)).toBe(false));
  }
});
