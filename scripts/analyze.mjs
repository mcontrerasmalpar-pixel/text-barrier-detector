#!/usr/bin/env node
/**
 * CLI wrapper for the Text Barrier Detector readability engine.
 * Used by the GitHub Action to analyze text files.
 *
 * Usage: node scripts/analyze.mjs [--lang=en|es] <path-to-text-file>
 * Output: JSON with readability metrics + CEFR level to stdout
 */

import { readFileSync } from 'fs';

// ── Args ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  let lang = 'en';
  let filePath = null;
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--lang=')) {
      const v = arg.slice('--lang='.length).toLowerCase();
      if (v !== 'en' && v !== 'es') {
        console.error('Invalid --lang. Use en or es.');
        process.exit(1);
      }
      lang = v;
    } else if (arg === '--lang') {
      console.error('Usage: --lang=en or --lang=es');
      process.exit(1);
    } else if (!arg.startsWith('-')) {
      filePath = arg;
    }
  }
  return { lang, filePath };
}

// ── Syllable counters ────────────────────────────────────────────────────────
function countEnglishSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 2) return 1;
  word = word.replace(/e$/, '');
  const matches = word.match(/[aeiouy]+/g);
  return Math.max(1, matches ? matches.length : 1);
}

function countSpanishSyllables(word) {
  const w = word.toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ]/g, '');
  if (!w) return 0;
  if (w.length <= 2) return 1;
  const isVowel = (c) => 'aeiouáéíóúü'.includes(c);
  const isStrong = (c) => 'aeoáéó'.includes(c);
  const isWeak = (c) => 'iuü'.includes(c);
  const isAccentedWeak = (c) => 'íú'.includes(c);
  let count = 0;
  let i = 0;
  while (i < w.length) {
    if (!isVowel(w[i])) { i++; continue; }
    count++;
    let j = i + 1;
    while (j < w.length && isVowel(w[j])) {
      const a = w[j - 1];
      const b = w[j];
      if ((isStrong(a) && isStrong(b)) || isAccentedWeak(a) || isAccentedWeak(b)) break;
      if ((isStrong(a) && isWeak(b)) || (isWeak(a) && isStrong(b)) || (isWeak(a) && isWeak(b))) {
        j++;
        continue;
      }
      break;
    }
    i = j;
  }
  return Math.max(1, count);
}

function countSyllables(word, lang) {
  return lang === 'es' ? countSpanishSyllables(word) : countEnglishSyllables(word);
}

// ── Passive detectors ────────────────────────────────────────────────────────
function detectEnglishPassive(sentence) {
  return /\b(is|are|was|were|been|being|be)\s+(\w+ed|(\w+en))\b/i.test(sentence);
}

const SER_FORMS =
  'soy|eres|es|somos|sois|son|era|eras|éramos|erais|eran|fui|fuiste|fue|fuimos|fuisteis|fueron|seré|serás|será|seremos|seréis|serán|sería|serías|seríamos|seríais|serían|sea|seas|seamos|seáis|sean|sido|siendo';
const PARTICIPLE =
  '[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+(?:ado|ados|ada|adas|ido|idos|ida|idas|to|tos|ta|tas|so|sos|sa|sas|cho|chos|cha|chas)';
const SER_PASSIVE = new RegExp('\\b(?:' + SER_FORMS + ')\\s+' + PARTICIPLE + '\\b', 'i');
const SE_PASSIVE = /\bse\s+[a-záéíóúüñ]+(?:a|e|an|en|ó|ió|aron|ieron|aba|ía|aban|ían)\b/i;

function detectSpanishPassive(sentence) {
  return SER_PASSIVE.test(sentence) || SE_PASSIVE.test(sentence);
}

function detectPassiveVoice(sentence, lang) {
  return lang === 'es' ? detectSpanishPassive(sentence) : detectEnglishPassive(sentence);
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
function wordCleanRegex(lang) {
  return lang === 'es' ? /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g : /[^a-zA-Z]/g;
}
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}
function getWords(text, lang) {
  const re = wordCleanRegex(lang);
  return text.split(/\s+/).filter(w => w.replace(re, '').length > 0);
}
function cleanWord(word, lang) {
  return word.replace(wordCleanRegex(lang), '');
}
function findComplexWords(words, lang) {
  return words.map(w => cleanWord(w, lang)).filter(w => w.length > 0 && countSyllables(w, lang) >= 4);
}
function computeStructureScore(text) {
  let score = 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  score += paragraphs.length > 1 ? 40 : 10;
  if (/^[\s]*[-•*]\s/m.test(text) || /^[\s]*\d+[.)]\s/m.test(text)) score += 30;
  if (/^#{1,6}\s/m.test(text) || /^[A-Z][A-Z\s]{3,}$/m.test(text)) score += 30;
  return Math.min(100, score);
}
function getEaseLabel(score) {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

function analyzeText(text, lang = 'en') {
  const sentences = splitSentences(text);
  const allWords = getWords(text, lang);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce((sum, w) => sum + countSyllables(cleanWord(w, lang), lang), 0);
  const avgSentenceLength = totalWords / totalSentences;

  const formulaName = lang === 'es' ? 'Fernández-Huerta' : 'Flesch';
  let rawEase = 0;
  if (totalWords > 0) {
    const P = totalWords / totalSentences;
    const S = totalSyllables / totalWords;
    rawEase = lang === 'es'
      ? 206.84 - 1.02 * P - 0.60 * S
      : 206.835 - 1.015 * P - 84.6 * S;
  }
  const fleschScore = Math.max(0, Math.min(100, rawEase));
  const gradeLevel = totalWords === 0 ? 0 : Math.max(0,
    0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
  );

  let passiveCount = 0;
  let complexWordCount = 0;
  sentences.forEach(s => {
    const words = getWords(s, lang);
    if (detectPassiveVoice(s, lang)) passiveCount++;
    complexWordCount += findComplexWords(words, lang).length;
  });

  const structureScore = computeStructureScore(text);
  const sentenceLengthScore = Math.max(0, 100 - (sentences.filter(s => getWords(s, lang).length > 20).length / totalSentences) * 100);
  const passiveScore  = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const complexScore  = Math.max(0, 100 - (complexWordCount / Math.max(totalWords, 1)) * 200);
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

  return { ...partial, level: classifyLevel(partial) };
}

// ── Entry point ───────────────────────────────────────────────────────────────
const { lang, filePath } = parseArgs(process.argv);
if (!filePath) {
  console.error('Usage: node scripts/analyze.mjs [--lang=en|es] <path-to-text-file>');
  process.exit(1);
}

const text = readFileSync(filePath, 'utf8');
const result = analyzeText(text, lang);
console.log(JSON.stringify(result, null, 2));
