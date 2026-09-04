/**
 * Spanish passive / impersonal heuristics for product copy.
 *
 * Detects:
 * 1. Analytic passive: *ser* + participle (-ado/-ido/-to/-so/-cho)
 * 2. Se-passive / impersonal se + 3rd-person verb
 *
 * Known misses: rare literary passives, full agreement paradigms,
 * ambiguous se reflexives outside product-copy patterns.
 */

const SER_FORMS =
  "soy|eres|es|somos|sois|son|era|eras|éramos|erais|eran|fui|fuiste|fue|fuimos|fuisteis|fueron|seré|serás|será|seremos|seréis|serán|sería|serías|seríamos|seríais|serían|sea|seas|seamos|seáis|sean|sido|siendo";

const PARTICIPLE =
  "[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+(?:ado|ados|ada|adas|ido|idos|ida|idas|to|tos|ta|tas|so|sos|sa|sas|cho|chos|cha|chas)";

const SER_PASSIVE = new RegExp(
  "\\b(?:" + SER_FORMS + ")\\s+" + PARTICIPLE + "\\b",
  "i"
);

/** se + 3rd person present/past forms common in technical copy */
const SE_PASSIVE = /\bse\s+[a-záéíóúüñ]+(?:a|e|an|en|ó|ió|aron|ieron|aba|ía|aban|ían)\b/i;

export function detectSpanishPassive(sentence: string): boolean {
  if (SER_PASSIVE.test(sentence)) return true;
  if (SE_PASSIVE.test(sentence)) return true;
  return false;
}
