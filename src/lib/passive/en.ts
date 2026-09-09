/**
 * English passive-voice heuristic.
 *
 * Matches auxiliary (be-forms) + past participle.
 * Uses a cache of common irregular participles and a small exclusion
 * list for frequent adjectival uses that produce false positives
 * ("is interested in", "is related to", "is supposed to", "is used to").
 *
 * Intentionally lightweight (no NLP library) so the detector stays
 * suitable for the browser bundle and the GitHub Action CLI.
 */

const AUXILIARIES =
  'am|is|are|was|were|be|been|being|get|got|gets|getting';

/** Common irregular past participles (not ending in -ed / -en). */
const IRREGULAR_PARTICIPLES = new Set(
  [
    'done',
    'gone',
    'known',
    'seen',
    'taken',
    'given',
    'written',
    'spoken',
    'broken',
    'chosen',
    'driven',
    'eaten',
    'fallen',
    'forgotten',
    'frozen',
    'gotten',
    'hidden',
    'ridden',
    'risen',
    'shaken',
    'stolen',
    'thrown',
    'worn',
    'built',
    'bought',
    'caught',
    'felt',
    'found',
    'kept',
    'left',
    'lost',
    'made',
    'meant',
    'met',
    'paid',
    'put',
    'read',
    'said',
    'sent',
    'set',
    'sold',
    'spent',
    'stood',
    'taught',
    'told',
    'thought',
    'understood',
    'won',
    'brought',
    'fought',
    'sought',
    'begun',
    'sung',
    'swum',
    'run',
    'come',
    'become',
    'shown',
    'drawn',
    'grown',
    'blown',
    'flown',
    'sown',
    'torn',
    'born',
    'borne',
    'sworn',
  ].map((w) => w.toLowerCase())
);

/**
 * Participles that are very often used as adjectives / fixed phrases
 * and create noise when matched by a naive aux + participle pattern.
 * Only excluded when followed by a typical preposition/particle.
 */
const ADJECTIVAL_EXCLUSIONS = new Set([
  'interested',
  'related',
  'supposed',
  'used',
  'concerned',
  'involved',
  'engaged',
  'devoted',
  'opposed',
  'accustomed',
  'committed',
  'dedicated',
  'married',
  'located',
  'based',
  'situated',
]);

const FOLLOWED_BY_PREP =
  /^(?:to|in|on|with|by|for|about|of|at|from|into|onto|upon)\b/i;

const AUX_PARTICIPLE_RE = new RegExp(
  `\\b(?:${AUXILIARIES})\\s+([a-zA-Z]+(?:ed|en|[a-zA-Z]*))\\b`,
  'gi'
);

function isPastParticiple(token: string): boolean {
  const lower = token.toLowerCase();
  if (IRREGULAR_PARTICIPLES.has(lower)) return true;
  // regular -ed / -en
  if (/(?:ed|en)$/i.test(lower) && lower.length > 3) return true;
  return false;
}

/**
 * Returns true when the sentence contains at least one plausible
 * passive construction (aux + past participle), after filtering
 * common adjectival false positives.
 */
export function detectEnglishPassive(sentence: string): boolean {
  // Reset lastIndex for global regex safety
  AUX_PARTICIPLE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = AUX_PARTICIPLE_RE.exec(sentence)) !== null) {
    const participle = match[1];
    if (!isPastParticiple(participle)) continue;

    const lower = participle.toLowerCase();
    if (ADJECTIVAL_EXCLUSIONS.has(lower)) {
      // Look at the remainder after the match
      const after = sentence.slice(match.index + match[0].length).trimStart();
      if (FOLLOWED_BY_PREP.test(after)) {
        // e.g. "is interested in", "is used to", "is related to"
        continue;
      }
    }

    return true;
  }
  return false;
}
