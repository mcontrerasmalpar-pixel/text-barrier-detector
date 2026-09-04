import { detectEnglishPassive } from './en';
import { detectSpanishPassive } from './es';

export type PassiveLanguage = 'en' | 'es';

export function detectPassiveVoice(sentence: string, lang: PassiveLanguage = 'en'): boolean {
  return lang === 'es' ? detectSpanishPassive(sentence) : detectEnglishPassive(sentence);
}

export { detectEnglishPassive, detectSpanishPassive };
