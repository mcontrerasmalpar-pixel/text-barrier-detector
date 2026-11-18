/**
 * Spanish passive / impersonal heuristics for product copy.
 *
 * Detects:
 * 1. Analytic passive: *ser* + participle (-ado/-ido/-to/-so/-cho)
 * 2. Se-passive / impersonal se + 3rd-person verb ("Se registró", "Se requiere")
 *
 * Filters common false positives:
 * - se + clitic = accidental/reflexive se ("Se me olvidó", "Se le cayó")
 * - frequent reflexive/pronominal verbs ("se fue", "se llama", "se sentó")
 * - ser + demonstrative/quantifier that merely looks like a participle ("es esto", "es todo")
 *
 * Known misses: rare literary passives, full agreement paradigms,
 * ambiguous se reflexives outside product-copy patterns.
 */

const SER_FORMS =
  "soy|eres|es|somos|sois|son|era|eras|éramos|erais|eran|fui|fuiste|fue|fuimos|fuisteis|fueron|seré|serás|será|seremos|seréis|serán|sería|serías|seríamos|seríais|serían|sea|seas|seamos|seáis|sean|sido|siendo";

const LETTER = "a-záéíóúüñ";

const PARTICIPLE =
  "[a-záéíóúüñ]+(?:ado|ados|ada|adas|ido|idos|ida|idas|to|tos|ta|tas|so|sos|sa|sas|cho|chos|cha|chas)";

/** Words that match the participle shape but are demonstratives/quantifiers/nouns. */
const NOT_PARTICIPLES = new Set([
  'esto', 'esta', 'estos', 'estas', 'esa', 'esas', 'eso', 'aquello',
  'todo', 'toda', 'todos', 'todas', 'tanto', 'tanta', 'tantos', 'tantas',
  'cierto', 'cierta', 'ciertos', 'ciertas', 'nota', 'notas', 'casa', 'cosa',
  'cosas', 'punto', 'puntos', 'cuenta', 'cuentas', 'texto', 'textos',
  'asunto', 'tema', 'resto', 'costa', 'basta', 'lista', 'listas',
]);

/** Clitics that turn "se + verb" into reflexive / accidental se, not passive. */
const CLITICS = new Set(['me', 'te', 'le', 'les', 'nos', 'os', 'lo', 'la', 'los', 'las']);

/** Very common pronominal / reflexive verbs (3rd person) that are not passives. */
const REFLEXIVE_VERBS = new Set([
  'fue', 'fueron', 'va', 'van', 'iba', 'iban', 'llama', 'llaman', 'llamó',
  'sentó', 'sentaron', 'levantó', 'levantaron', 'despertó', 'despertaron',
  'acostó', 'acostaron', 'duchó', 'vistió', 'quedó', 'quedaron', 'queda',
  'quedan', 'cayó', 'cayeron', 'cansó', 'enojó', 'enfadó', 'sintió',
  'sintieron', 'dio', 'dieron', 'puso', 'pusieron', 'echó', 'fijó',
  'trata', 'tratan', 'trató', 'trataba', 'encuentra', 'encuentran', 'encontró',
]);

const SER_PASSIVE = new RegExp(
  `(?<![${LETTER}])(?:${SER_FORMS})\\s+(${PARTICIPLE})(?![${LETTER}])`,
  'gi'
);

/** se + word ending like a 3rd-person verb form. */
const SE_PASSIVE = new RegExp(
  `(?<![${LETTER}])se\\s+([${LETTER}]+(?:a|e|an|en|ó|ió|aron|ieron|aba|ía|aban|ían))(?![${LETTER}])`,
  'gi'
);

export function detectSpanishPassive(sentence: string): boolean {
  SER_PASSIVE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SER_PASSIVE.exec(sentence)) !== null) {
    if (!NOT_PARTICIPLES.has(m[1].toLowerCase())) return true;
  }

  SE_PASSIVE.lastIndex = 0;
  while ((m = SE_PASSIVE.exec(sentence)) !== null) {
    const word = m[1].toLowerCase();
    if (CLITICS.has(word)) continue; // "se me olvidó", "se lo dije"
    if (REFLEXIVE_VERBS.has(word)) continue;
    return true;
  }
  return false;
}
