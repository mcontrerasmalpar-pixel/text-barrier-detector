/**
 * Public API of the Text Barrier Detector analyzer (EN + ES).
 *
 * The UI, the CLI and any MCP server must all go through this entry point so
 * the TypeScript analyzer stays the single source of truth.
 */

export { analyzeText } from './lib/analyzer';
export type { AnalysisResult, SentenceAnalysis } from './lib/analyzer';

export { AnalysisError, MAX_INPUT_CHARS, validateInput } from './lib/validation';
export type { AnalysisErrorCode, AnalysisErrorDetails } from './lib/validation';

export {
  SUPPORTED_LANGUAGES,
  getLanguagePack,
  isSupportedLanguage,
} from './lib/languages';
export type { AnalysisLanguage, FormulaName, LanguagePack } from './lib/languages';

export {
  READABILITY_BAND_DISCLAIMER,
  READABILITY_BAND_NAME,
} from './lib/levelClassifier';
export type { LevelDimensions, LevelResult, TextLevel } from './lib/levelClassifier';
