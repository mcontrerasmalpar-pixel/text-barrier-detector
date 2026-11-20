/**
 * @makitaki/text-barrier-core
 * Pure TypeScript readability & plain-language barrier detector (EN + ES).
 * Zero React, DOM, or network dependencies.
 */

export { analyze, analyzeText } from './analyzer.js';
export type { AnalyzeOptions, AnalysisResult, SentenceAnalysis } from './analyzer.js';

export { findBarriers } from './barriers.js';
export { isIdentifierLike, removeMarkdownNoise, stripMarkdown } from './markdown.js';
export type { BarrierIssue, BarrierType } from './barriers.js';

export { AnalysisError, MAX_INPUT_CHARS, validateInput } from './validation.js';
export type { AnalysisErrorCode, AnalysisErrorDetails } from './validation.js';

export {
  SUPPORTED_LANGUAGES,
  enPack,
  esPack,
  getLanguagePack,
  isSupportedLanguage,
} from './languages/index.js';
export type { AnalysisLanguage, FormulaName, LanguagePack } from './languages/index.js';

export {
  READABILITY_BAND_DISCLAIMER,
  READABILITY_BAND_NAME,
  classifyLevel,
  getLevelColor,
  getNextLevel,
} from './levelClassifier.js';
export type { LevelDimensions, LevelResult, TextLevel } from './levelClassifier.js';

export {
  countEnglishSyllables,
  countSpanishSyllables,
  countSyllables,
  isComplexWord,
} from './syllables.js';
export type { SyllableLanguage } from './syllables.js';

export {
  detectEnglishPassive,
  detectPassiveVoice,
  detectSpanishPassive,
} from './passive/index.js';
export type { PassiveLanguage } from './passive/index.js';

export {
  MIN_BODY_WORDS_PER_HEADING,
  MIN_WORDS_FOR_FULL_STRUCTURE,
  collectStructureStats,
  computeStructureScore,
} from './structure.js';
export type { StructureStats } from './structure.js';
