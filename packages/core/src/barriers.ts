import { getLanguagePack } from './languages/index.js';
import type { AnalysisLanguage, LanguagePack } from './languages/types.js';
import type { AnalyzeOptions } from './analyzer.js';
import { validateInput } from './validation.js';

export type BarrierType = 'passive' | 'long_sentence' | 'complex_word';

export interface BarrierIssue {
  /** Issue category */
  type: BarrierType;
  /** Inclusive start offset in the normalized input string */
  start: number;
  /** Exclusive end offset in the normalized input string */
  end: number;
  /** Zero-based index of the sentence containing this issue */
  sentenceIndex: number;
  /** Short, deterministic human-readable explanation */
  reason: string;
  /** Analysis language used ('en' | 'es') */
  lang: AnalysisLanguage;
  /** Exact substring (`text.slice(start, end)`) that triggered the issue */
  text: string;
}

interface SentenceSpan {
  text: string;
  start: number;
  end: number;
  index: number;
}

function splitSentenceSpans(text: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  const boundaryRe = /(?<=[.!?])\s+/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  const pushTrimmed = (rawStart: number, rawEnd: number) => {
    let start = rawStart;
    let end = rawEnd;
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    if (end > start) {
      spans.push({
        text: text.slice(start, end),
        start,
        end,
        index: spans.length,
      });
    }
  };

  while ((match = boundaryRe.exec(text)) !== null) {
    pushTrimmed(cursor, match.index);
    cursor = match.index + match[0].length;
  }
  pushTrimmed(cursor, text.length);
  return spans;
}

interface WordSpan {
  clean: string;
  start: number;
  end: number;
}

function extractWordSpans(sentence: string, sentenceStart: number, pack: LanguagePack): WordSpan[] {
  const results: WordSpan[] = [];
  const tokenRe = /\S+/g;
  const singleCharStrip = new RegExp(`^(?:${pack.wordCharsRe.source})+`);
  const trailingCharStrip = new RegExp(`(?:${pack.wordCharsRe.source})+$`);
  let m: RegExpExecArray | null;

  while ((m = tokenRe.exec(sentence)) !== null) {
    const raw = m[0];
    const clean = raw.replace(pack.wordCharsRe, '');
    if (clean.length === 0) continue;

    const lead = singleCharStrip.exec(raw)?.[0].length ?? 0;
    const trail = trailingCharStrip.exec(raw)?.[0].length ?? 0;
    const start = sentenceStart + m.index + lead;
    const end = Math.max(start + 1, sentenceStart + m.index + raw.length - trail);
    results.push({ clean, start, end });
  }
  return results;
}

const EN_PASSIVE_SPAN_RE =
  /\b(?:am|is|are|was|were|be|been|being|get|got|gets|getting)\s+(?:(?:not|never|also|always|often|still|just|already|n't|\w+ly)\s+)?(?:(?:being|been)\s+)?([a-zA-Z']+)/gi;

const ES_SER_SPAN_RE =
  /(?<![a-záéíóúüñ])(?:soy|eres|es|somos|sois|son|era|eras|éramos|erais|eran|fui|fuiste|fue|fuimos|fuisteis|fueron|seré|serás|será|seremos|seréis|serán|sería|serías|seríamos|seríais|serían|sea|seas|seamos|seáis|sean|sido|siendo)\s+[a-záéíóúüñ]+(?:ado|ados|ada|adas|ido|idos|ida|idas|to|tos|ta|tas|so|sos|sa|sas|cho|chos|cha|chas)(?![a-záéíóúüñ])/gi;

const ES_SE_SPAN_RE =
  /(?<![a-záéíóúüñ])se\s+[a-záéíóúüñ]+(?:a|e|an|en|ó|ió|aron|ieron|aba|ía|aban|ían)(?![a-záéíóúüñ])/gi;

function findPassiveSpanInSentence(
  sentence: string,
  pack: LanguagePack
): { start: number; end: number } {
  if (pack.code === 'en') {
    EN_PASSIVE_SPAN_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = EN_PASSIVE_SPAN_RE.exec(sentence)) !== null) {
      const candidate = sentence.slice(m.index);
      if (pack.isPassive(candidate)) {
        return { start: m.index, end: m.index + m[0].length };
      }
    }
  } else {
    for (const re of [ES_SER_SPAN_RE, ES_SE_SPAN_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(sentence)) !== null) {
        if (pack.isPassive(m[0])) {
          return { start: m.index, end: m.index + m[0].length };
        }
      }
    }
  }
  return { start: 0, end: sentence.length };
}

/**
 * Deterministically finds readability barriers (`passive`, `long_sentence`,
 * `complex_word`) with exact character offsets, sentence index, short reason,
 * and language code. No LLM or network calls.
 */
export function findBarriers(text: string, options: AnalyzeOptions = {}): BarrierIssue[] {
  const lang: AnalysisLanguage = options.lang ?? 'en';
  validateInput(text, lang);
  const normalized = text.normalize('NFC');
  const pack = getLanguagePack(lang);
  const sentences = splitSentenceSpans(normalized);
  const issues: BarrierIssue[] = [];

  for (const s of sentences) {
    const wordSpans = extractWordSpans(s.text, s.start, pack);

    if (wordSpans.length > 20) {
      issues.push({
        type: 'long_sentence',
        start: s.start,
        end: s.end,
        sentenceIndex: s.index,
        reason:
          lang === 'es'
            ? `Oración larga (${wordSpans.length} palabras; máximo recomendado: 20).`
            : `Long sentence (${wordSpans.length} words; recommended max is 20).`,
        lang,
        text: s.text,
      });
    }

    if (pack.isPassive(s.text)) {
      const rel = findPassiveSpanInSentence(s.text, pack);
      const start = s.start + rel.start;
      const end = s.start + rel.end;
      issues.push({
        type: 'passive',
        start,
        end,
        sentenceIndex: s.index,
        reason:
          lang === 'es'
            ? 'Voz pasiva o construcción impersonal detectada; considera usar voz activa.'
            : 'Passive voice construction detected; consider rewriting in active voice.',
        lang,
        text: normalized.slice(start, end),
      });
    }

    for (const w of wordSpans) {
      if (pack.isCommonTechnical(w.clean)) continue;
      const syllables = pack.countSyllables(w.clean);
      if (syllables >= pack.complexWordMinSyllables) {
        issues.push({
          type: 'complex_word',
          start: w.start,
          end: w.end,
          sentenceIndex: s.index,
          reason:
            lang === 'es'
              ? `Palabra compleja (${syllables} sílabas; considera un sinónimo más simple).`
              : `Complex word (${syllables} syllables; consider a simpler synonym).`,
          lang,
          text: normalized.slice(w.start, w.end),
        });
      }
    }
  }

  return issues;
}
