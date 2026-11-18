/** Language codes supported by the analyzer. Only EN and ES are shipped. */
export type AnalysisLanguage = 'en' | 'es';
export type FormulaName = 'Flesch' | 'Fernández-Huerta';

/**
 * Everything the analyzer needs to know about one language.
 * Implement this interface to add a language pack (none beyond en/es are
 * planned for this release).
 */
export interface LanguagePack {
  readonly code: AnalysisLanguage;
  /** Readability formula applied by `readingEase`. */
  readonly formulaName: FormulaName;
  /** Global regex matching characters to strip when extracting a word. */
  readonly wordCharsRe: RegExp;
  /** Syllable estimate for a single cleaned word. */
  countSyllables(word: string): number;
  /** True if the sentence contains a plausible passive/impersonal construction. */
  isPassive(sentence: string): boolean;
  /** True for common product/tech words that should not count as complex. */
  isCommonTechnical(word: string): boolean;
  /** A word with at least this many syllables is "complex". */
  readonly complexWordMinSyllables: number;
  /** Raw (unclamped) reading-ease score for the language's formula. */
  readingEase(words: number, sentences: number, syllables: number): number;
}
