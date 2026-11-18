import { classifyLevel } from './levelClassifier';
import type { LevelResult } from './levelClassifier';
import { computeStructureScore } from './structure';
import { getLanguagePack } from './languages';
import { validateInput } from './validation';
export { AnalysisError, MAX_INPUT_CHARS } from './validation';
export type { AnalysisErrorCode } from './validation';
import type { AnalysisLanguage, FormulaName, LanguagePack } from './languages';

export type { AnalysisLanguage, FormulaName, LanguagePack } from './languages';

export interface SentenceAnalysis {
  text: string;
  wordCount: number;
  isLong: boolean;
  hasPassiveVoice: boolean;
  complexWords: string[];
  index: number;
}

export interface AnalysisResult {
  sentences: SentenceAnalysis[];
  fleschScore: number;
  fleschLabel: string;
  gradeLevel: number;
  avgSentenceLength: number;
  passiveCount: number;
  complexWordCount: number;
  structureScore: number;
  overallScore: number;
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  suggestions: string[];
  /** Readability Band (A1–C2): CEFR-inspired, not a certification */
  level: LevelResult;
  /** Analysis language used for heuristics */
  language: AnalysisLanguage;
  /** Readability formula applied to fleschScore */
  formulaName: FormulaName;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}

function getWords(text: string, pack: LanguagePack): string[] {
  return text.split(/\s+/).filter(w => w.replace(pack.wordCharsRe, '').length > 0);
}

function cleanWord(word: string, pack: LanguagePack): string {
  return word.replace(pack.wordCharsRe, '');
}

function findComplexWords(words: string[], pack: LanguagePack): string[] {
  return words
    .map(w => cleanWord(w, pack))
    .filter(w => {
      if (w.length === 0) return false;
      if (pack.isCommonTechnical(w)) return false;
      return pack.countSyllables(w) >= pack.complexWordMinSyllables;
    });
}

function getEaseLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

/**
 * Analyze text readability. Throws `AnalysisError` (localized message) when the
 * input is not a string, is empty/whitespace-only, exceeds MAX_INPUT_CHARS, or
 * when `lang` is not supported.
 */
export function analyzeText(text: string, lang: AnalysisLanguage = 'en'): AnalysisResult {
  validateInput(text, lang);
  const pack = getLanguagePack(lang);
  // Compose combining marks so "o" + U+0301 and "ó" are analyzed identically.
  text = text.normalize('NFC');
  const sentences = splitSentences(text);
  const allWords = getWords(text, pack);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce(
    (sum, w) => sum + pack.countSyllables(cleanWord(w, pack)),
    0
  );
  const avgSentenceLength = totalWords / totalSentences;

  const rawEase =
    totalWords === 0 ? 0 : pack.readingEase(totalWords, totalSentences, totalSyllables);

  const fleschScore = Math.max(0, Math.min(100, rawEase));

  const gradeLevel =
    totalWords === 0
      ? 0
      : Math.max(
          0,
          0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
        );

  let passiveCount = 0;
  let complexWordCount = 0;

  const sentenceAnalyses: SentenceAnalysis[] = sentences.map((s, i) => {
    const words = getWords(s, pack);
    const isLong = words.length > 20;
    const hasPassive = pack.isPassive(s);
    const complex = findComplexWords(words, pack);
    if (hasPassive) passiveCount++;
    complexWordCount += complex.length;
    return { text: s, wordCount: words.length, isLong, hasPassiveVoice: hasPassive, complexWords: complex, index: i };
  });

  const structureScore = computeStructureScore(text, totalWords);

  const sentenceLengthScore = Math.max(0, 100 - (sentenceAnalyses.filter(s => s.isLong).length / totalSentences) * 100);
  const passiveScore = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const complexScore = Math.max(0, 100 - (complexWordCount / Math.max(totalWords, 1)) * 200);
  const overallScore = Math.round(
    fleschScore * 0.35 + sentenceLengthScore * 0.2 + passiveScore * 0.15 +
    Math.max(0, complexScore) * 0.15 + structureScore * 0.15
  );

  const suggestions: string[] = [];
  if (avgSentenceLength > 20) suggestions.push('Break long sentences into shorter ones (aim for under 20 words).');
  if (passiveCount > 0) suggestions.push('Convert passive voice to active voice for clarity.');
  if (complexWordCount > 3) suggestions.push('Replace complex words with simpler alternatives.');
  if (structureScore < 50) suggestions.push('Add paragraph breaks, headings, or lists to improve structure.');
  if (fleschScore < 50) suggestions.push('Simplify vocabulary and shorten sentences to improve readability.');

  const partial = {
    sentences: sentenceAnalyses,
    fleschScore: Math.round(fleschScore * 10) / 10,
    fleschLabel: getEaseLabel(fleschScore),
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    passiveCount,
    complexWordCount,
    structureScore,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    totalWords,
    totalSentences,
    totalSyllables,
    suggestions: suggestions.slice(0, 3),
    language: lang,
    formulaName: pack.formulaName,
  };

  return {
    ...partial,
    level: classifyLevel(partial as AnalysisResult),
  };
}
