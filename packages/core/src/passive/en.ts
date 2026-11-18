/**
 * English passive-voice heuristic.
 *
 * Matches a be/get auxiliary + past participle, then filters the most common
 * false positives:
 *   - words that merely end in -en/-ed but are not participles ("is often", "is need")
 *   - adjectival participles ("is interested in", "was tired", "is related to")
 *   - phrasal verbs with a particle and no agent ("is turned on", "was logged in")
 *   - raising constructions ("is said to be", "is known to", "is expected to")
 *
 * Intentionally lightweight (no NLP library) so the detector stays suitable
 * for the browser bundle, the CLI and an MCP server.
 */

const AUXILIARIES = 'am|is|are|was|were|be|been|being|get|got|gets|getting';

/** Optional adverb/negation between the auxiliary and the participle. */
const INTERVENING = "(?:(?:not|never|also|always|often|still|just|already|n't|\\w+ly)\\s+)?";

/** Irregular past participles (not ending in -ed). */
const IRREGULAR_PARTICIPLES = new Set([
  'done', 'gone', 'known', 'seen', 'taken', 'given', 'written', 'spoken',
  'broken', 'chosen', 'driven', 'eaten', 'fallen', 'forgotten', 'frozen',
  'gotten', 'hidden', 'ridden', 'risen', 'shaken', 'stolen', 'thrown',
  'worn', 'built', 'bought', 'caught', 'felt', 'found', 'kept', 'left',
  'lost', 'made', 'meant', 'met', 'paid', 'put', 'read', 'said', 'sent',
  'set', 'sold', 'spent', 'stood', 'taught', 'told', 'thought',
  'understood', 'won', 'brought', 'fought', 'sought', 'begun', 'sung',
  'swum', 'run', 'come', 'become', 'shown', 'drawn', 'grown', 'blown',
  'flown', 'sown', 'torn', 'born', 'borne', 'sworn', 'forgiven', 'beaten',
  'bitten', 'dealt', 'dug', 'fed', 'held', 'hung', 'hurt', 'laid', 'led',
  'lit', 'shot', 'shut', 'slept', 'slain', 'spun', 'struck', 'swept',
  'woven', 'wound', 'bound', 'sunk', 'stuck', 'cut', 'hit', 'let', 'rung',
  'proven', 'overtaken', 'undone', 'withdrawn', 'overcome', 'foreseen',
]);

/** Words ending in -ed / -en that are NOT past participles. */
const NOT_PARTICIPLES = new Set([
  'need', 'indeed', 'speed', 'feed', 'seed', 'weed', 'deed', 'breed',
  'bleed', 'proceed', 'exceed', 'succeed', 'hundred', 'kindred', 'sacred',
  'naked', 'wicked', 'rugged', 'ragged', 'often', 'then', 'when', 'even',
  'seven', 'ten', 'open', 'token', 'women', 'children', 'golden', 'wooden',
  'woolen', 'linen', 'kitchen', 'chicken', 'garden', 'sudden',
  'eleven', 'siren', 'citizen', 'dozen', 'oven',
]);

/**
 * Participles frequently used as adjectives. Skipped when followed by a
 * typical preposition ("is interested in", "is based on").
 */
const ADJECTIVAL_BEFORE_PREP = new Set([
  'interested', 'related', 'supposed', 'used', 'concerned', 'involved',
  'engaged', 'devoted', 'opposed', 'accustomed', 'committed', 'dedicated',
  'married', 'located', 'based', 'situated', 'tired', 'pleased',
  'satisfied', 'disappointed', 'qualified', 'prepared', 'compared',
  'associated', 'connected', 'attached', 'limited',
]);

/**
 * Participles that are almost always stative adjectives. Skipped unless the
 * sentence names an agent with "by".
 */
const ADJECTIVAL_ALWAYS = new Set([
  'tired', 'bored', 'excited', 'worried', 'scared', 'surprised', 'pleased',
  'annoyed', 'confused', 'amazed', 'shocked', 'married', 'gone', 'lost',
  'determined', 'relaxed', 'embarrassed', 'frightened', 'terrified',
]);

/** Verbs of saying/thinking used in raising constructions ("is said to be"). */
const RAISING_VERBS = new Set([
  'said', 'thought', 'believed', 'known', 'reported', 'considered',
  'expected', 'supposed', 'understood', 'alleged', 'rumored', 'rumoured',
  'assumed', 'estimated', 'felt', 'seen', 'found',
]);

/**
 * Phrasal verbs that read as a state, not an action ("is turned on",
 * "was logged in"). Keyed by participle; value = particles that complete the
 * phrasal verb. Treated as non-passive unless a "by" agent is present.
 * Kept per-verb on purpose: a generic particle list would also swallow real
 * passives like "is stored in the cloud".
 */
const PHRASAL_VERBS: Record<string, RegExp> = {
  turned: /^(?:on|off|up|down|out|over|around)\b/i,
  switched: /^(?:on|off|over)\b/i,
  powered: /^(?:on|off|up|down)\b/i,
  shut: /^(?:down|off|up)\b/i,
  logged: /^(?:in|out|on|off)\b/i,
  signed: /^(?:in|out|up|off)\b/i,
  checked: /^(?:in|out)\b/i,
  opted: /^(?:in|out)\b/i,
  plugged: /^in\b/i,
  set: /^(?:up|off|out|aside)\b/i,
  fed: /^up\b/i,
  worn: /^(?:out|down)\b/i,
  burned: /^out\b/i,
  burnt: /^out\b/i,
  stressed: /^out\b/i,
  dressed: /^up\b/i,
  booked: /^up\b/i,
  tied: /^up\b/i,
  locked: /^out\b/i,
  sold: /^out\b/i,
};

const PREPOSITION =
  /^(?:to|in|on|with|by|for|about|of|at|from|into|onto|upon)\b/i;

const AUX_ONLY_RE = new RegExp(`^(?:${AUXILIARIES})$`, 'i');

const AUX_PARTICIPLE_RE = new RegExp(
  `\\b(?:${AUXILIARIES})\\s+${INTERVENING}([a-zA-Z']+)\\b`,
  'gi'
);

function isPastParticiple(token: string): boolean {
  const lower = token.toLowerCase();
  if (NOT_PARTICIPLES.has(lower)) return false;
  if (IRREGULAR_PARTICIPLES.has(lower)) return true;
  // Regular participles end in -ed. A bare -en suffix is only trusted via the
  // irregular list above (otherwise "often", "seven", "open" would match).
  return lower.length > 3 && lower.endsWith('ed');
}

/** True when the sentence names an agent ("... by the team"). */
function hasAgent(sentence: string): boolean {
  return /\bby\s+(?:the|a|an|my|our|their|his|her|its|this|that|[A-Z]\w*|\w+ing)\b/.test(sentence);
}

/**
 * Returns true when the sentence contains at least one plausible
 * passive construction, after filtering the false positives above.
 */
export function detectEnglishPassive(sentence: string): boolean {
  AUX_PARTICIPLE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let agentCache: boolean | undefined;
  while ((match = AUX_PARTICIPLE_RE.exec(sentence)) !== null) {
    const participle = match[1];
    if (!isPastParticiple(participle)) {
      // Let "is being baked" / "has been done" re-match from the next token
      // when the captured word is itself an auxiliary.
      if (AUX_ONLY_RE.test(participle)) {
        AUX_PARTICIPLE_RE.lastIndex = match.index + match[0].length - participle.length;
      }
      continue;
    }

    const lower = participle.toLowerCase();
    const after = sentence.slice(match.index + match[0].length, match.index + match[0].length + 40).trimStart();
    const agent = () => (agentCache ??= hasAgent(sentence));

    // "is said to be", "is expected to": raising constructions
    if (RAISING_VERBS.has(lower) && /^to\b/i.test(after)) continue;

    // "is interested in", "is based on"
    if (ADJECTIVAL_BEFORE_PREP.has(lower) && PREPOSITION.test(after) && !/^by\b/i.test(after)) {
      continue;
    }

    // "was tired.", "is excited"
    if (ADJECTIVAL_ALWAYS.has(lower) && !agent()) continue;

    // "is turned on", "was logged in", "was set up"
    const phrasal = Object.prototype.hasOwnProperty.call(PHRASAL_VERBS, lower)
      ? PHRASAL_VERBS[lower]
      : undefined;
    if (phrasal && phrasal.test(after) && !agent()) continue;

    return true;
  }
  return false;
}
