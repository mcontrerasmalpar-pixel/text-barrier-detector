/**
 * Markdown-aware preprocessing.
 *
 * Readability formulas are meant for running prose. Markdown files also contain
 * code, tables, badges, URLs and link targets that are not prose and would
 * otherwise be counted as very long sentences and "complex words".
 *
 * Every function here is length-preserving: non-prose characters are replaced
 * by spaces (never deleted), and sentence terminators replace existing line
 * breaks. Character offsets in the processed string therefore point to the same
 * positions in the original string.
 */

const blank = (s: string): string => s.replace(/[^\r\n]/g, ' ');

const FENCE_RE = /^\s{0,3}(`{3,}|~{3,})/;
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/;
const HR_RE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const SETEXT_RE = /^\s{0,3}=+\s*$/;
const HTML_LINE_RE = /^\s*<\/?[A-Za-z!][^>]*>\s*$/;
const REF_DEF_RE = /^\s{0,3}\[[^\]]+\]:\s+\S+.*$/;
const HEADING_RE = /^(\s{0,3}#{1,6}\s+)(.*)$/;
const LIST_RE = /^(\s*(?:[-+*]|\d{1,9}[.)])\s+)(.*)$/;
const QUOTE_RE = /^(\s*(?:>[ \t]?)+)/;
const END_PUNCT_RE = /[.!?…]\s*$/;

type LineKind = 'prose' | 'blank' | 'heading' | 'list' | 'removed';

interface ProcessedLine {
  text: string;
  kind: LineKind;
  /** Length of a leading marker (heading or list bullet) to blank in prose mode. */
  markerLen: number;
}

/** Blanks inline non-prose spans while keeping visible link text. */
function blankInline(line: string): string {
  return line
    .replace(/(`+)[^`]*?\1/g, (m) => blank(m))
    .replace(/!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])/g, (m) => blank(m))
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m, t: string) => ' ' + t + blank(m.slice(1 + t.length)))
    .replace(/\[([^\]]*)\]\[([^\]]*)\]/g, (m, t: string) => ' ' + t + blank(m.slice(1 + t.length)))
    .replace(/<(?:https?:\/\/|mailto:)[^>]+>/gi, (m) => blank(m))
    .replace(/\b(?:https?:\/\/|www\.)[^\s)>\]]+/gi, (m) => blank(m))
    .replace(/<\/?[A-Za-z][^>]*>/g, (m) => blank(m));
}

function processLines(text: string): ProcessedLine[] {
  const raw = text.split('\n');
  const out: ProcessedLine[] = [];
  let fence: string | null = null;
  let inFrontMatter = false;

  for (let i = 0; i < raw.length; i++) {
    const line = raw[i];
    const trimmed = line.replace(/\r$/, '');

    // YAML front matter at the very top of the file.
    if (i === 0 && /^---\s*$/.test(trimmed)) {
      inFrontMatter = true;
      out.push({ text: blank(line), kind: 'removed', markerLen: 0 });
      continue;
    }
    if (inFrontMatter) {
      if (/^(?:---|\.\.\.)\s*$/.test(trimmed)) inFrontMatter = false;
      out.push({ text: blank(line), kind: 'removed', markerLen: 0 });
      continue;
    }

    // Fenced code blocks.
    const fenceMatch = FENCE_RE.exec(trimmed);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null;
      out.push({ text: blank(line), kind: 'removed', markerLen: 0 });
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      out.push({ text: blank(line), kind: 'removed', markerLen: 0 });
      continue;
    }

    if (
      TABLE_SEP_RE.test(trimmed) ||
      TABLE_ROW_RE.test(trimmed) ||
      HR_RE.test(trimmed) ||
      SETEXT_RE.test(trimmed) ||
      HTML_LINE_RE.test(trimmed) ||
      REF_DEF_RE.test(trimmed)
    ) {
      out.push({ text: blank(line), kind: 'removed', markerLen: 0 });
      continue;
    }

    if (!/\S/.test(trimmed)) {
      out.push({ text: line, kind: 'blank', markerLen: 0 });
      continue;
    }

    // Blockquote markers are never prose.
    let working = line;
    const quote = QUOTE_RE.exec(working);
    if (quote) working = blank(quote[1]) + working.slice(quote[1].length);

    const heading = HEADING_RE.exec(working.replace(/\r$/, ''));
    if (heading) {
      const cleaned = blankInline(working);
      const kind: LineKind = /[\p{L}\p{N}]/u.test(cleaned.slice(heading[1].length)) ? 'heading' : 'blank';
      out.push({ text: cleaned, kind, markerLen: heading[1].length });
      continue;
    }

    const list = LIST_RE.exec(working.replace(/\r$/, ''));
    if (list) {
      const cleaned = blankInline(working);
      const kind: LineKind = /[\p{L}\p{N}]/u.test(cleaned.slice(list[1].length)) ? 'list' : 'blank';
      out.push({ text: cleaned, kind, markerLen: list[1].length });
      continue;
    }

    const cleaned = blankInline(working);
    out.push({ text: cleaned, kind: /\S/.test(cleaned) ? 'prose' : 'blank', markerLen: 0 });
  }
  return out;
}

/**
 * Removes non-prose Markdown (code, tables, badges, URLs, link targets, front
 * matter, HTML) but keeps headings and list markers, so structure analysis
 * (paragraphs, headings, lists) still sees the document layout.
 */
export function removeMarkdownNoise(text: string): string {
  return processLines(text)
    .map((l) => l.text)
    .join('\n');
}

/**
 * Returns a prose-only view of Markdown text for sentence, word, passive-voice
 * and complex-word analysis. Same length as the input. Headings are dropped,
 * list bullets are blanked, and a "." replaces the line break that ends a
 * heading, list item or paragraph without its own punctuation, so separate
 * blocks never merge into one giant sentence.
 */
export function stripMarkdown(text: string): string {
  const lines = processLines(text);
  const pieces: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    let t = l.text;
    if (l.kind === 'heading') t = blank(t);
    else if (l.kind === 'list') t = blank(t.slice(0, l.markerLen)) + t.slice(l.markerLen);
    pieces.push(t);

    if (i < lines.length - 1) {
      const hasContent = l.kind === 'prose' || l.kind === 'list';
      const next = lines[i + 1];
      const endsBlock = next.kind !== 'prose';
      const needsTerminator = hasContent && endsBlock && !END_PUNCT_RE.test(t.replace(/\r$/, ''));
      pieces.push(needsTerminator ? '.' : '\n');
    }
  }
  return pieces.join('');
}

/**
 * True for tokens that look like identifiers rather than prose: package names,
 * file names, paths, snake_case/camelCase, anything with digits or symbols.
 * They are never reported as "complex words" in Markdown mode.
 */
export function isIdentifierLike(raw: string): boolean {
  if (/[@/\\_#=<>{}|]/.test(raw)) return true;
  if (/\d/.test(raw)) return true;
  if (/[a-z][A-Z]/.test(raw)) return true;
  if (/\w\.\w/.test(raw)) return true;
  return (raw.match(/-/g)?.length ?? 0) >= 2;
}
