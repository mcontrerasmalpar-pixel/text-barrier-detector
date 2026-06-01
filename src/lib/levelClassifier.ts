/**
 * levelClassifier.ts
 * CEFR-inspired text level classifier (A1 → C2).
 * Derived entirely from the existing AnalysisResult metrics — no extra API calls.
 */

import type { AnalysisResult } from './analyzer';

export type TextLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelResult {
  /** CEFR-style level code */
  level: TextLevel;
  /** Human-readable label */
  label: string;
  /** Short description of what this level means for readers */
  description: string;
  /** Recommended audience */
  audience: string;
  /** 0-100 numeric score used to derive the level */
  score: number;
  /** Individual dimension scores used in classification */
  dimensions: LevelDimensions;
  /** Actionable tips to move the text to the next level up */
  tips: string[];
}

export interface LevelDimensions {
  /** Based on Flesch Reading Ease (0-100) */
  readabilityScore: number;
  /** Based on Flesch-Kincaid Grade Level (inverted, 0-100) */
  gradeLevelScore: number;
  /** Based on avg sentence length (inverted, 0-100) */
  sentenceLengthScore: number;
  /** Based on passive voice ratio (inverted, 0-100) */
  passiveVoiceScore: number;
  /** Based on complex word density (inverted, 0-100) */
  complexityScore: number;
  /** Structure score (already 0-100) */
  structureScore: number;
}

const LEVEL_MAP: Record<TextLevel, { label: string; description: string; audience: string; minScore: number }> = {
  A1: {
    label: 'Beginner',
    description: 'Very simple text. Short sentences, basic vocabulary, clear structure.',
    audience: 'Children, early learners, non-native speakers at basic level.',
    minScore: 85,
  },
  A2: {
    label: 'Elementary',
    description: 'Simple text. Common everyday vocabulary, mostly short sentences.',
    audience: 'General public, non-native speakers, readers with limited education.',
    minScore: 70,
  },
  B1: {
    label: 'Intermediate',
    description: 'Accessible text. Mix of simple and moderate complexity. Some technical terms.',
    audience: 'Most adults, general audience, plain-language standard.',
    minScore: 55,
  },
  B2: {
    label: 'Upper Intermediate',
    description: 'Moderately complex. Longer sentences, some passive voice, occasional jargon.',
    audience: 'Educated adults, professionals in related fields.',
    minScore: 40,
  },
  C1: {
    label: 'Advanced',
    description: 'Complex text. Dense vocabulary, frequent passive voice, long sentences.',
    audience: 'Specialists, academics, highly educated professionals.',
    minScore: 25,
  },
  C2: {
    label: 'Mastery / Expert',
    description: 'Very complex text. Academic or technical writing. High cognitive load.',
    audience: 'Domain experts, researchers, academic readers only.',
    minScore: 0,
  },
};

/**
 * Maps a Flesch score (0-100) to a normalized 0-100 accessibility score.
 * Higher Flesch = more accessible = higher score.
 */
function normalizeFleschScore(flesch: number): number {
  return Math.min(100, Math.max(0, flesch));
}

/**
 * Maps grade level (0-20+) to 0-100 accessibility score.
 * Grade 4 or below → 100, Grade 16+ → 0.
 */
function normalizeGradeLevel(grade: number): number {
  return Math.min(100, Math.max(0, 100 - (grade - 4) * (100 / 12)));
}

/**
 * Maps avg sentence length to 0-100 accessibility score.
 * <=10 words → 100, >=35 words → 0.
 */
function normalizeSentenceLength(avg: number): number {
  return Math.min(100, Math.max(0, 100 - (avg - 10) * (100 / 25)));
}

/**
 * Maps passive voice ratio (0-1) to 0-100 accessibility score.
 * 0% passive → 100, 50%+ → 0.
 */
function normalizePassiveVoice(passiveCount: number, totalSentences: number): number {
  const ratio = totalSentences > 0 ? passiveCount / totalSentences : 0;
  return Math.min(100, Math.max(0, 100 - ratio * 200));
}

/**
 * Maps complex word ratio to 0-100 accessibility score.
 * 0% complex words → 100, 20%+ complex words → 0.
 */
function normalizeComplexity(complexCount: number, totalWords: number): number {
  if (totalWords === 0) return 100;
  const ratio = complexCount / totalWords;
  return Math.min(100, Math.max(0, 100 - ratio * 500));
}

/**
 * Generates tips to improve the text toward the next level.
 */
function generateTips(level: TextLevel, dims: LevelDimensions): string[] {
  const tips: string[] = [];

  if (level === 'A1') return ['Your text is already at the most accessible level. Great work!'];

  if (dims.sentenceLengthScore < 70) {
    tips.push('Break long sentences into two shorter ones (target: under 15 words each).');
  }
  if (dims.passiveVoiceScore < 70) {
    tips.push('Rewrite passive-voice sentences in active voice (e.g. "The report was written by Ana" → "Ana wrote the report").');
  }
  if (dims.complexityScore < 70) {
    tips.push('Replace polysyllabic words with simpler synonyms (e.g. "utilise" → "use", "demonstrate" → "show").');
  }
  if (dims.readabilityScore < 60) {
    tips.push('Aim for a Flesch Reading Ease score above 60 (currently ' + Math.round(dims.readabilityScore) + ').');
  }
  if (dims.gradeLevelScore < 60) {
    tips.push('Target a reading grade level below 8 to reach a general audience.');
  }
  if (dims.structureScore < 60) {
    tips.push('Add headings, bullet lists, or paragraph breaks to improve visual structure.');
  }

  return tips.slice(0, 3);
}

/**
 * Classifies text into a CEFR-inspired level based on AnalysisResult.
 */
export function classifyLevel(analysis: AnalysisResult): LevelResult {
  const dims: LevelDimensions = {
    readabilityScore: normalizeFleschScore(analysis.fleschScore),
    gradeLevelScore: normalizeGradeLevel(analysis.gradeLevel),
    sentenceLengthScore: normalizeSentenceLength(analysis.avgSentenceLength),
    passiveVoiceScore: normalizePassiveVoice(analysis.passiveCount, analysis.totalSentences),
    complexityScore: normalizeComplexity(analysis.complexWordCount, analysis.totalWords),
    structureScore: analysis.structureScore,
  };

  // Weighted composite score (same weights as analyzer overall score)
  const score = Math.round(
    dims.readabilityScore    * 0.35 +
    dims.sentenceLengthScore * 0.20 +
    dims.passiveVoiceScore   * 0.15 +
    dims.complexityScore     * 0.15 +
    dims.structureScore      * 0.15
  );

  // Determine level from score thresholds
  const levelKeys: TextLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const level = levelKeys.find(l => score >= LEVEL_MAP[l].minScore) ?? 'C2';

  const meta = LEVEL_MAP[level];
  const tips = generateTips(level, dims);

  return {
    level,
    label: meta.label,
    description: meta.description,
    audience: meta.audience,
    score,
    dimensions: dims,
    tips,
  };
}

/**
 * Returns a color associated with each level for UI rendering.
 * Palette follows traffic-light convention: green (easy) → red (hard).
 */
export function getLevelColor(level: TextLevel): string {
  const colors: Record<TextLevel, string> = {
    A1: '#22c55e', // green-500
    A2: '#84cc16', // lime-500
    B1: '#eab308', // yellow-500
    B2: '#f97316', // orange-500
    C1: '#ef4444', // red-500
    C2: '#7f1d1d', // red-900
  };
  return colors[level];
}

/**
 * Returns the next target level (one step easier).
 * Returns null if already at A1.
 */
export function getNextLevel(level: TextLevel): TextLevel | null {
  const order: TextLevel[] = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
  const idx = order.indexOf(level);
  return idx > 0 ? order[idx - 1] : null;
}
