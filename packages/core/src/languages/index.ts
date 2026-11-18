import { enPack } from './en.js';
import { esPack } from './es.js';
import type { AnalysisLanguage, LanguagePack } from './types.js';

export type { AnalysisLanguage, FormulaName, LanguagePack } from './types.js';
export { enPack, esPack };

const PACKS: Record<AnalysisLanguage, LanguagePack> = { en: enPack, es: esPack };

export const SUPPORTED_LANGUAGES: readonly AnalysisLanguage[] = ['en', 'es'];

export function isSupportedLanguage(value: unknown): value is AnalysisLanguage {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PACKS, value);
}

/** Returns the pack for a language code. Throws on unsupported codes. */
export function getLanguagePack(code: AnalysisLanguage): LanguagePack {
  const pack = PACKS[code];
  if (!pack) throw new Error(`Unsupported language: ${String(code)}`);
  return pack;
}
