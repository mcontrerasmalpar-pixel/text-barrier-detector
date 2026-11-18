import { detectEnglishPassive } from './en.js';
import { detectSpanishPassive } from './es.js';

export type PassiveLanguage = 'en' | 'es';

export function detectPassiveVoice(sentence: string, lang: PassiveLanguage = 'en'): boolean {
  return lang === 'es' ? detectSpanishPassive(sentence) : detectEnglishPassive(sentence);
}

export { detectEnglishPassive, detectSpanishPassive };
