/**
 * levelClassifier.ts
 * Readability Band (A1–C2): a CEFR-inspired text classifier.
 * The A1–C2 codes borrow the CEFR scale for familiarity only. This is a
 * heuristic readability composite, NOT a CEFR assessment or certification.
 * Derived entirely from the existing AnalysisResult metrics — no extra API calls.
 */

import type { AnalysisResult } from './analyzer';

/** Display name of the band system, used by UI, README and specs. */
export const READABILITY_BAND_NAME = 'Readability Band (A1–C2)';

/** Standard disclaimer to show wherever a band is presented. */
export const READABILITY_BAND_DISCLAIMER =
  'CEFR-inspired readability heuristic, not a CEFR assessment or certification.';

export type TextLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelResult {
  /** Band code (A1–C2). CEFR-inspired, not a certification. */
  level: TextLevel;
  /** Human-readable label */
  label: string;
  /** Short description of what this band means for readers */
  description: string;
  /** Recommended audience */
  audience: string;
  /** 0-100 numeric score used to derive the band */
  score: number;
  /** Always states that the band is CEFR-inspired and not a certification */
  disclaimer: string;
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
    label: 'Very Easy',
    description: 'Very simple text. Short sentences, basic vocabulary, clear structure.',
    audience: 'Children, early learners, non-native speakers at basic level.',
    minScore: 85,
  },
  A2: {
    label: 'Easy',
    description: 'Simple text. Common everyday vocabulary, mostly short sentences.',
    audience: 'General public, non-native speakers, readers with limited education.',
    minScore: 70,
  },
  B1: {
    label: 'Standard',
    description: 'Accessible text. Mix of simple and moderate complexity. Some technical terms.',
    audience: 'Most adults, general audience, plain-language standard.',
    minScore: 55,
  },
  B2: {
    label: 'Moderately Complex',
    description: 'Moderately complex. Longer sentences, some passive voice, occasional jargon.',
    audience: 'Educated adults, professionals in related fields.',
    minScore: 40,
  },
  C1: {
    label: 'Complex',
    description: 'Complex text. Dense vocabulary, frequent passive voice, long sentences.',
    audience: 'Specialists, academics, highly educated professionals.',
    minScore: 25,
  },
  C2: {
    label: 'Very Complex',
    description: 'Very complex text. Academic or technical writing. High cognitive load.',
    audience: 'Domain experts, researchers, academic readers only.',
    minScore: 0,
  },
};

function normalizeFleschScore(flesch: number): number {
  return Math.min(100, Math.max(0, flesch));
}

function normalizeGradeLevel(grade: number): number {
  return Math.min(100, Math.max(0, 100 - (grade - 4) * (100 / 12)));
}

function normalizeSentenceLength(avg: number): number {
  return Math.min(100, Math.max(0, 100 - (avg - 10) * (100 / 25)));
}

function normalizePassiveVoice(passiveCount: number, totalSentences: number): number {
  const ratio = totalSentences > 0 ? passiveCount / totalSentences : 0;
  return Math.min(100, Math.max(0, 100 - ratio * 200));
}

function normalizeComplexity(complexCount: number, totalWords: number): number {
  if (totalWords === 0) return 100;
  const ratio = complexCount / totalWords;
  return Math.min(100, Math.max(0, 100 - ratio * 500));
}

function generateTips(level: TextLevel, dims: LevelDimensions): string[] {
  const tips: string[] = [];

  if (level === 'A1') return ['Your text is already in the most accessible band. Great work!'];

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
    disclaimer: READABILITY_BAND_DISCLAIMER,
    dimensions: dims,
    tips,
  };
}

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


export function getNextLevel(level: TextLevel): TextLevel | null {
  const order: TextLevel[] = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
  const idx = order.indexOf(level);
  return idx > 0 ? order[idx - 1] : null;
}
