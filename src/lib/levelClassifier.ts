/**
 * levelClassifier.ts
 * CEFR-inspired text level classifier (A1 → C2).
 * Derived entirely from the existing AnalysisResult metrics — no extra API calls.
 */

import type { AnalysisResult } from './analyzer';

export type TextLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelResult {
  level: TextLevel;
  label: string;
  description: string;
  audience: string;
  score: number;
  dimensions: LevelDimensions;
  tips: string[];
}

export interface LevelDimensions {
  readabilityScore: number;
  gradeLevelScore: number;
  sentenceLengthScore: number;
  passiveVoiceScore: number;
  complexityScore: number;
  structureScore: number;
}

const LEVEL_MAP: Record<TextLevel, { label: string; description: string; audience: string; minScore: number }> = {
  A1: { label: 'Beginner',           description: 'Very simple text. Short sentences, basic vocabulary, clear structure.', audience: 'Children, early learners, non-native speakers at basic level.', minScore: 85 },
  A2: { label: 'Elementary',         description: 'Simple text. Common everyday vocabulary, mostly short sentences.',       audience: 'General public, non-native speakers, readers with limited education.', minScore: 70 },
  B1: { label: 'Intermediate',       description: 'Accessible text. Mix of simple and moderate complexity.',                audience: 'Most adults, general audience, plain-language standard.', minScore: 55 },
  B2: { label: 'Upper Intermediate', description: 'Moderately complex. Longer sentences, some passive voice.',             audience: 'Educated adults, professionals in related fields.', minScore: 40 },
  C1: { label: 'Advanced',           description: 'Complex text. Dense vocabulary, frequent passive voice, long sentences.', audience: 'Specialists, academics, highly educated professionals.', minScore: 25 },
  C2: { label: 'Mastery / Expert',   description: 'Very complex text. Academic or technical writing. High cognitive load.', audience: 'Domain experts, researchers, academic readers only.', minScore: 0 },
};

function normalizeFleschScore(flesch: number): number { return Math.min(100, Math.max(0, flesch)); }
function normalizeGradeLevel(grade: number): number   { return Math.min(100, Math.max(0, 100 - (grade - 4) * (100 / 12))); }
function normalizeSentenceLength(avg: number): number  { return Math.min(100, Math.max(0, 100 - (avg - 10) * (100 / 25))); }
function normalizePassiveVoice(p: number, t: number): number { return t > 0 ? Math.min(100, Math.max(0, 100 - (p / t) * 200)) : 100; }
function normalizeComplexity(c: number, w: number): number   { return w > 0 ? Math.min(100, Math.max(0, 100 - (c / w) * 500)) : 100; }

function generateTips(level: TextLevel, dims: LevelDimensions): string[] {
  if (level === 'A1') return ['Your text is already at the most accessible level. Great work!'];
  const tips: string[] = [];
  if (dims.sentenceLengthScore < 70) tips.push('Break long sentences into two shorter ones (target: under 15 words each).');
  if (dims.passiveVoiceScore < 70)   tips.push('Rewrite passive-voice sentences in active voice (e.g. "The report was written by Ana" → "Ana wrote the report").');
  if (dims.complexityScore < 70)     tips.push('Replace polysyllabic words with simpler synonyms (e.g. "utilise" → "use", "demonstrate" → "show").');
  if (dims.readabilityScore < 60)    tips.push('Aim for a Flesch Reading Ease score above 60 (currently ' + Math.round(dims.readabilityScore) + ').');
  if (dims.structureScore < 60)      tips.push('Add headings, bullet lists, or paragraph breaks to improve visual structure.');
  return tips.slice(0, 3);
}

export function classifyLevel(analysis: AnalysisResult): LevelResult {
  const dims: LevelDimensions = {
    readabilityScore:    normalizeFleschScore(analysis.fleschScore),
    gradeLevelScore:     normalizeGradeLevel(analysis.gradeLevel),
    sentenceLengthScore: normalizeSentenceLength(analysis.avgSentenceLength),
    passiveVoiceScore:   normalizePassiveVoice(analysis.passiveCount, analysis.totalSentences),
    complexityScore:     normalizeComplexity(analysis.complexWordCount, analysis.totalWords),
    structureScore:      analysis.structureScore,
  };
  const score = Math.round(
    dims.readabilityScore    * 0.35 +
    dims.sentenceLengthScore * 0.20 +
    dims.passiveVoiceScore   * 0.15 +
    dims.complexityScore     * 0.15 +
    dims.structureScore      * 0.15
  );
  const levelKeys: TextLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const level = levelKeys.find(l => score >= LEVEL_MAP[l].minScore) ?? 'C2';
  const meta = LEVEL_MAP[level];
  return { level, label: meta.label, description: meta.description, audience: meta.audience, score, dimensions: dims, tips: generateTips(level, dims) };
}

export function getLevelColor(level: TextLevel): string {
  const colors: Record<TextLevel, string> = { A1: '#22c55e', A2: '#84cc16', B1: '#eab308', B2: '#f97316', C1: '#ef4444', C2: '#7f1d1d' };
  return colors[level];
}

export function getNextLevel(level: TextLevel): TextLevel | null {
  const order: TextLevel[] = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
  const idx = order.indexOf(level);
  return idx > 0 ? order[idx - 1] : null;
}
