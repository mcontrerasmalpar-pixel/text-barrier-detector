/**
 * Structure scoring with density awareness.
 *
 * Formatting alone must not score well: headings need body text under them,
 * lists need real items, and very short or over-fragmented text is capped.
 */

export interface StructureStats {
  paragraphs: number;
  headings: number;
  headingWords: number;
  listItems: number;
  listWords: number;
}

const HAS_WORD = /[\p{L}\p{N}]/u;
const MD_HEADING = /^\s*#{1,6}\s+(\S.*)$/;
const CAPS_HEADING = /^[A-Z][A-Z\s]{3,}$/;
const LIST_ITEM = /^\s*(?:[-•*]|\d+[.)])\s+(\S.*)$/;

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => HAS_WORD.test(w)).length;
}

export function collectStructureStats(text: string): StructureStats {
  const stats: StructureStats = {
    paragraphs: 0,
    headings: 0,
    headingWords: 0,
    listItems: 0,
    listWords: 0,
  };

  stats.paragraphs = text.split(/\n\s*\n/).filter((p) => HAS_WORD.test(p)).length;

  for (const line of text.split(/\r?\n/)) {
    const md = MD_HEADING.exec(line);
    if (md && HAS_WORD.test(md[1])) {
      stats.headings++;
      stats.headingWords += wordCount(md[1]);
      continue;
    }
    const trimmed = line.trim();
    if (CAPS_HEADING.test(trimmed) && wordCount(trimmed) <= 8) {
      stats.headings++;
      stats.headingWords += wordCount(trimmed);
      continue;
    }
    const li = LIST_ITEM.exec(line);
    if (li && HAS_WORD.test(li[1])) {
      stats.listItems++;
      stats.listWords += wordCount(li[1]);
    }
  }
  return stats;
}

/** Below this many words there is not enough content to judge structure. */
export const MIN_WORDS_FOR_FULL_STRUCTURE = 20;
/** Each heading should introduce at least this many words of body text. */
export const MIN_BODY_WORDS_PER_HEADING = 15;

export function computeStructureScore(text: string, totalWords: number): number {
  if (totalWords === 0) return 0;

  const s = collectStructureStats(text);
  const paraCount = Math.max(s.paragraphs, 1);
  const bodyWords = Math.max(totalWords - s.headingWords, 0);
  let score = 0;

  // Paragraph layout: more than one paragraph, each with some substance.
  if (s.paragraphs > 1 && totalWords / paraCount >= 3) score += 20;
  else score += 5;

  // Density: sensible words-per-paragraph (≈ 40–180).
  const wordsPerPara = totalWords / paraCount;
  if (wordsPerPara >= 40 && wordsPerPara <= 180) score += 25;
  else if (wordsPerPara < 40 && paraCount > 1) score += 15; // short but broken up
  else if (wordsPerPara <= 300) score += 10;

  // Lists: need at least two real items with some words each.
  if (s.listItems >= 2 && s.listWords / s.listItems >= 2) score += 25;

  // Headings: each heading must have body text beneath it.
  if (s.headings >= 1 && bodyWords >= s.headings * MIN_BODY_WORDS_PER_HEADING) score += 25;

  // Long wall of text with almost no structure.
  if (totalWords > 120 && paraCount === 1 && score < 30) score = Math.max(0, score - 10);

  // Over-fragmentation: more structural elements than half the word count.
  const elements = s.paragraphs + s.headings + s.listItems;
  if (elements / totalWords > 0.5) score = Math.min(score, 40);

  // Too little content to earn a high structure score.
  if (totalWords < MIN_WORDS_FOR_FULL_STRUCTURE) score = Math.min(score, 30);

  return Math.min(100, Math.max(0, score));
}
