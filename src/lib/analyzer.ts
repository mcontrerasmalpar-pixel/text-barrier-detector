import { countSyllables } from './syllables';
import { detectPassiveVoice } from './passive';
import { classifyLevel } from './levelClassifier';
import type { LevelResult } from './levelClassifier';

export type AnalysisLanguage = 'en' | 'es';
export type FormulaName = 'Flesch' | 'Fernández-Huerta';

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
  /** CEFR-style level classification (A1–C2) */
  level: LevelResult;
  /** Analysis language used for heuristics */
  language: AnalysisLanguage;
  /** Readability formula applied to fleschScore */
  formulaName: FormulaName;
}

const WORD_CHARS_EN = /[^a-zA-Z]/g;
const WORD_CHARS_ES = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g;

function wordCleanRegex(lang: AnalysisLanguage): RegExp {
  return lang === 'es' ? WORD_CHARS_ES : WORD_CHARS_EN;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}

function getWords(text: string, lang: AnalysisLanguage): string[] {
  const re = wordCleanRegex(lang);
  return text.split(/\s+/).filter(w => w.replace(re, '').length > 0);
}

function cleanWord(word: string, lang: AnalysisLanguage): string {
  return word.replace(wordCleanRegex(lang), '');
}

function findComplexWords(words: string[], lang: AnalysisLanguage): string[] {
  return words
    .map(w => cleanWord(w, lang))
    .filter(w => w.length > 0 && countSyllables(w, lang) >= 4);
}

function computeStructureScore(text: string): number {
  let score = 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) score += 40;
  else score += 10;
  if (/^[\s]*[-•*]\s/m.test(text) || /^[\s]*\d+[.)]\s/m.test(text)) score += 30;
  if (/^#{1,6}\s/m.test(text) || /^[A-Z][A-Z\s]{3,}$/m.test(text)) score += 30;
  return Math.min(100, score);
}

function getEaseLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

/** Flesch Reading Ease (English). */
function fleschReadingEase(words: number, sentences: number, syllables: number): number {
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

/** Fernández-Huerta (Spanish): 206.84 - 1.02*P - 0.60*S */
function fernandezHuerta(words: number, sentences: number, syllables: number): number {
  const P = words / sentences;
  const S = syllables / words;
  return 206.84 - 1.02 * P - 0.60 * S;
}

export function analyzeText(text: string, lang: AnalysisLanguage = 'en'): AnalysisResult {
  const sentences = splitSentences(text);
  const allWords = getWords(text, lang);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce(
    (sum, w) => sum + countSyllables(cleanWord(w, lang), lang),
    0
  );
  const avgSentenceLength = totalWords / totalSentences;

  const formulaName: FormulaName = lang === 'es' ? 'Fernández-Huerta' : 'Flesch';
  const rawEase =
    totalWords === 0
      ? 0
      : lang === 'es'
        ? fernandezHuerta(totalWords, totalSentences, totalSyllables)
        : fleschReadingEase(totalWords, totalSentences, totalSyllables);

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
    const words = getWords(s, lang);
    const isLong = words.length > 20;
    const hasPassive = detectPassiveVoice(s, lang);
    const complex = findComplexWords(words, lang);
    if (hasPassive) passiveCount++;
    complexWordCount += complex.length;
    return { text: s, wordCount: words.length, isLong, hasPassiveVoice: hasPassive, complexWords: complex, index: i };
  });

  const structureScore = computeStructureScore(text);

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
    formulaName,
  };

  return {
    ...partial,
    level: classifyLevel(partial as AnalysisResult),
  };
}
