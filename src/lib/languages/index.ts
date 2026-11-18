import { enPack } from './en';
import { esPack } from './es';
import type { AnalysisLanguage, LanguagePack } from './types';

export type { AnalysisLanguage, FormulaName, LanguagePack } from './types';
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
