import { countSyllables } from './syllables';

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
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function getWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, '').length > 0);
}

function detectPassiveVoice(sentence: string): boolean {
  const pattern = /\b(is|are|was|were|been|being|be)\s+(\w+ed|(\w+en))\b/i;
  return pattern.test(sentence);
}

function findComplexWords(words: string[]): string[] {
  return words
    .map(w => w.replace(/[^a-zA-Z]/g, ''))
    .filter(w => w.length > 0 && countSyllables(w) > 3);
}

function computeStructureScore(text: string): number {
  let score = 0;
  // Paragraph breaks
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) score += 40;
  else score += 10;

  // Lists (bullet or numbered)
  if (/^[\s]*[-•*]\s/m.test(text) || /^[\s]*\d+[.)]\s/m.test(text)) score += 30;

  // Headers (lines that are short and possibly uppercase or followed by newline)
  if (/^#{1,6}\s/m.test(text) || /^[A-Z][A-Z\s]{3,}$/m.test(text)) score += 30;

  return Math.min(100, score);
}

function getFleschLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

export function analyzeText(text: string): AnalysisResult {
  const sentences = splitSentences(text);
  const allWords = getWords(text);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce((sum, w) => sum + countSyllables(w.replace(/[^a-zA-Z]/g, '')), 0);

  const avgSentenceLength = totalWords / totalSentences;

  // Flesch Reading Ease
  const fleschScore = Math.max(0, Math.min(100,
    206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords)
  ));

  // Flesch-Kincaid Grade Level
  const gradeLevel = Math.max(0,
    0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
  );

  let passiveCount = 0;
  let complexWordCount = 0;

  const sentenceAnalyses: SentenceAnalysis[] = sentences.map((s, i) => {
    const words = getWords(s);
    const isLong = words.length > 20;
    const hasPassive = detectPassiveVoice(s);
    const complex = findComplexWords(words);

    if (hasPassive) passiveCount++;
    complexWordCount += complex.length;

    return {
      text: s,
      wordCount: words.length,
      isLong,
      hasPassiveVoice: hasPassive,
      complexWords: complex,
      index: i,
    };
  });

  const structureScore = computeStructureScore(text);

  // Overall score: weighted average
  const fleschNorm = fleschScore; // already 0-100
  const sentenceLengthScore = Math.max(0, 100 - (sentenceAnalyses.filter(s => s.isLong).length / totalSentences) * 100);
  const passiveScore = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const complexScore = Math.max(0, 100 - (complexWordCount / totalWords) * 200);

  const overallScore = Math.round(
    fleschNorm * 0.35 +
    sentenceLengthScore * 0.2 +
    passiveScore * 0.15 +
    Math.max(0, complexScore) * 0.15 +
    structureScore * 0.15
  );

  // Generate suggestions
  const suggestions: string[] = [];
  if (avgSentenceLength > 20) {
    suggestions.push('Break long sentences into shorter ones (aim for under 20 words).');
  }
  if (passiveCount > 0) {
    suggestions.push('Convert passive voice to active voice for clarity.');
  }
  if (complexWordCount > 3) {
    suggestions.push('Replace complex words with simpler alternatives.');
  }
  if (structureScore < 50) {
    suggestions.push('Add paragraph breaks, headings, or lists to improve structure.');
  }
  if (fleschScore < 50) {
    suggestions.push('Simplify vocabulary and shorten sentences to improve readability.');
  }

  return {
    sentences: sentenceAnalyses,
    fleschScore: Math.round(fleschScore * 10) / 10,
    fleschLabel: getFleschLabel(fleschScore),
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
  };
}
