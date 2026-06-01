#!/usr/bin/env node
/**
 * CLI wrapper for the Text Barrier Detector readability engine.
 * Used by the GitHub Action to analyze text files.
 *
 * Usage: node scripts/analyze.mjs <path-to-text-file>
 * Output: JSON with readability metrics + CEFR level to stdout
 */

import { readFileSync } from 'fs';

// ── Syllable counter ──────────────────────────────────────────────────────────
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// ── Level classifier ────────────────────────────────────────────────────────
const LEVEL_MAP = {
  A1: { label: 'Beginner',            description: 'Very simple text. Short sentences, basic vocabulary.',          audience: 'Children, early learners, non-native speakers.',             minScore: 85 },
  A2: { label: 'Elementary',          description: 'Simple text. Common everyday vocabulary.',                       audience: 'General public, non-native speakers.',                      minScore: 70 },
  B1: { label: 'Intermediate',        description: 'Accessible text. Mix of simple and moderate complexity.',        audience: 'Most adults, general audience.',                            minScore: 55 },
  B2: { label: 'Upper Intermediate',  description: 'Moderately complex. Longer sentences, some passive voice.',     audience: 'Educated adults, professionals.',                           minScore: 40 },
  C1: { label: 'Advanced',            description: 'Complex text. Dense vocabulary, frequent passive voice.',        audience: 'Specialists, academics.',                                   minScore: 25 },
  C2: { label: 'Mastery / Expert',    description: 'Very complex. Academic or technical writing.',                  audience: 'Domain experts, researchers.',                              minScore: 0  },
};

function normalizeFleschScore(f)    { return Math.min(100, Math.max(0, f)); }
function normalizeGradeLevel(g)     { return Math.min(100, Math.max(0, 100 - (g - 4) * (100 / 12))); }
function normalizeSentenceLength(a) { return Math.min(100, Math.max(0, 100 - (a - 10) * (100 / 25))); }
function normalizePassive(p, t)     { return t > 0 ? Math.min(100, Math.max(0, 100 - (p / t) * 200)) : 100; }
function normalizeComplexity(c, w)  { return w > 0 ? Math.min(100, Math.max(0, 100 - (c / w) * 500)) : 100; }

function classifyLevel(analysis) {
  const dims = {
    readabilityScore:    normalizeFleschScore(analysis.fleschScore),
    gradeLevelScore:     normalizeGradeLevel(analysis.gradeLevel),
    sentenceLengthScore: normalizeSentenceLength(analysis.avgSentenceLength),
    passiveVoiceScore:   normalizePassive(analysis.passiveCount, analysis.totalSentences),
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

  const levelKeys = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const level = levelKeys.find(l => score >= LEVEL_MAP[l].minScore) ?? 'C2';
  const meta = LEVEL_MAP[level];


  const tips = [];
  if (dims.sentenceLengthScore < 70) tips.push('Break long sentences into shorter ones (target: under 15 words).');
  if (dims.passiveVoiceScore < 70)   tips.push('Rewrite passive-voice sentences in active voice.');
  if (dims.complexityScore < 70)     tips.push('Replace complex words with simpler synonyms.');
  if (dims.structureScore < 60)      tips.push('Add headings, bullet lists, or paragraph breaks.');

  return { level, label: meta.label, description: meta.description, audience: meta.audience, score, dimensions: dims, tips: tips.slice(0, 3) };
}

// ── Core analyzer ───────────────────────────────────────────────────────────
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}
function getWords(text) {
  return text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, '').length > 0);
}
function detectPassiveVoice(sentence) {
  return /\b(is|are|was|were|been|being|be)\s+(\w+ed|(\w+en))\b/i.test(sentence);
}
function findComplexWords(words) {
  return words.map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 0 && countSyllables(w) > 3);
}
function computeStructureScore(text) {
  let score = 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  score += paragraphs.length > 1 ? 40 : 10;
  if (/^[\s]*[-•*]\s/m.test(text) || /^[\s]*\d+[.)]\s/m.test(text)) score += 30;
  if (/^#{1,6}\s/m.test(text) || /^[A-Z][A-Z\s]{3,}$/m.test(text)) score += 30;
  return Math.min(100, score);
}
function getFleschLabel(score) {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

function analyzeText(text) {
  const sentences = splitSentences(text);
  const allWords = getWords(text);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce((sum, w) => sum + countSyllables(w.replace(/[^a-zA-Z]/g, '')), 0);
  const avgSentenceLength = totalWords / totalSentences;

  const fleschScore = Math.max(0, Math.min(100,
    206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords)
  ));
  const gradeLevel = Math.max(0,
    0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
  );

  let passiveCount = 0;
  let complexWordCount = 0;
  sentences.forEach(s => {
    const words = getWords(s);
    if (detectPassiveVoice(s)) passiveCount++;
    complexWordCount += findComplexWords(words).length;
  });

  const structureScore = computeStructureScore(text);
  const sentenceLengthScore = Math.max(0, 100 - (sentences.filter(s => getWords(s).length > 20).length / totalSentences) * 100);
  const passiveScore  = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const complexScore  = Math.max(0, 100 - (complexWordCount / totalWords) * 200);
  const overallScore  = Math.round(
    fleschScore * 0.35 + sentenceLengthScore * 0.2 +
    passiveScore * 0.15 + Math.max(0, complexScore) * 0.15 + structureScore * 0.15
  );

  const suggestions = [];
  if (avgSentenceLength > 20)  suggestions.push('Break long sentences into shorter ones (aim for under 20 words).');
  if (passiveCount > 0)        suggestions.push('Convert passive voice to active voice for clarity.');
  if (complexWordCount > 3)    suggestions.push('Replace complex words with simpler alternatives.');
  if (structureScore < 50)     suggestions.push('Add paragraph breaks, headings, or lists to improve structure.');
  if (fleschScore < 50)        suggestions.push('Simplify vocabulary and shorten sentences to improve readability.');

  const partial = {
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
    suggestions: suggestions.slice(0, 3),
  };

  return { ...partial, level: classifyLevel(partial) };
}

// ── Entry point ───────────────────────────────────────────────────────────────
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/analyze.mjs <path-to-text-file>');
  process.exit(1);
}

const text = readFileSync(filePath, 'utf8');
const result = analyzeText(text);
console.log(JSON.stringify(result, null, 2));
