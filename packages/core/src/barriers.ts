import type { AnalysisLanguage } from './languages/types.js';
import type { AnalyzeOptions } from './analyzer.js';
import { validateInput } from './validation.js';

export type BarrierType = 'passive' | 'long_sentence' | 'complex_word';

export interface BarrierIssue {
  type: BarrierType;
  start: number;
  end: number;
  sentenceIndex: number;
  reason: string;
  lang: AnalysisLanguage;
  text: string;
}

/**
 * Deterministic barrier detector (passive | long_sentence | complex_word).
 * Full implementation added in Step 1.
 */
export function findBarriers(text: string, options: AnalyzeOptions = {}): BarrierIssue[] {
  const lang = options.lang ?? 'en';
  validateInput(text, lang);
  return [];
}
