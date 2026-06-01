#!/usr/bin/env node
import { readFileSync } from 'fs';

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

const LEVEL_MAP = {
  A1: { label: 'Beginner',           description: 'Very simple text.',          audience: 'Children, early learners.',          minScore: 85 },
  A2: { label: 'Elementary',         description: 'Simple, everyday text.',      audience: 'General public.',                   minScore: 70 },
  B1: { label: 'Intermediate',       description: 'Accessible, moderate text.',  audience: 'Most adults.',                      minScore: 55 },
  B2: { label: 'Upper Intermediate', description: 'Moderately complex text.',    audience: 'Educated adults, professionals.',    minScore: 40 },
  C1: { label: 'Advanced',           description: 'Complex, dense text.',        audience: 'Specialists, academics.',            minScore: 25 },
  C2: { label: 'Mastery / Expert',   description: 'Very complex, technical.',    audience: 'Domain experts, researchers.',       minScore: 0  },
};

function classifyLevel(a) {
  const dims = {
    readabilityScore:    Math.min(100, Math.max(0, a.fleschScore)),
    gradeLevelScore:     Math.min(100, Math.max(0, 100 - (a.gradeLevel - 4) * (100 / 12))),
    sentenceLengthScore: Math.min(100, Math.max(0, 100 - (a.avgSentenceLength - 10) * (100 / 25))),
    passiveVoiceScore:   a.totalSentences > 0 ? Math.min(100, Math.max(0, 100 - (a.passiveCount / a.totalSentences) * 200)) : 100,
    complexityScore:     a.totalWords > 0 ? Math.min(100, Math.max(0, 100 - (a.complexWordCount / a.totalWords) * 500)) : 100,
    structureScore:      a.structureScore,
  };
  const score = Math.round(dims.readabilityScore*0.35 + dims.sentenceLengthScore*0.20 + dims.passiveVoiceScore*0.15 + dims.complexityScore*0.15 + dims.structureScore*0.15);
  const level = ['A1','A2','B1','B2','C1','C2'].find(l => score >= LEVEL_MAP[l].minScore) ?? 'C2';
  const tips = [];
  if (dims.sentenceLengthScore < 70) tips.push('Break long sentences into shorter ones (target: under 15 words).');
  if (dims.passiveVoiceScore < 70)   tips.push('Rewrite passive-voice sentences in active voice.');
  if (dims.complexityScore < 70)     tips.push('Replace complex words with simpler synonyms.');
  if (dims.structureScore < 60)      tips.push('Add headings, bullet lists, or paragraph breaks.');
  return { level, ...LEVEL_MAP[level], score, dimensions: dims, tips: tips.slice(0, 3) };
}

function splitSentences(text) { return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean); }
function getWords(text) { return text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, '').length > 0); }
function detectPassive(s) { return /\b(is|are|was|were|been|being|be)\s+(\w+ed|(\w+en))\b/i.test(s); }
function complexWords(words) { return words.map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 0 && countSyllables(w) > 3); }
function structureScore(text) {
  let s = text.split(/\n\s*\n/).filter(p => p.trim()).length > 1 ? 40 : 10;
  if (/^[\s]*[-•*]\s/m.test(text) || /^[\s]*\d+[.)]\s/m.test(text)) s += 30;
  if (/^#{1,6}\s/m.test(text) || /^[A-Z][A-Z\s]{3,}$/m.test(text)) s += 30;
  return Math.min(100, s);
}
function fleschLabel(f) { return f>=90?'Very easy':f>=70?'Easy':f>=50?'Moderate':f>=30?'Difficult':'Very difficult'; }

function analyzeText(text) {
  const sentences = splitSentences(text);
  const allWords = getWords(text);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce((s, w) => s + countSyllables(w.replace(/[^a-zA-Z]/g, '')), 0);
  const avgSentenceLength = totalWords / totalSentences;
  const fleschScore = Math.max(0, Math.min(100, 206.835 - 1.015*(totalWords/totalSentences) - 84.6*(totalSyllables/totalWords)));
  const gradeLevel = Math.max(0, 0.39*(totalWords/totalSentences) + 11.8*(totalSyllables/totalWords) - 15.59);
  let passiveCount = 0, complexWordCount = 0;
  sentences.forEach(s => { if (detectPassive(s)) passiveCount++; complexWordCount += complexWords(getWords(s)).length; });
  const ss = structureScore(text);
  const slScore = Math.max(0, 100 - (sentences.filter(s => getWords(s).length > 20).length / totalSentences) * 100);
  const psScore = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const cxScore = Math.max(0, 100 - (complexWordCount / totalWords) * 200);
  const overallScore = Math.min(100, Math.max(0, Math.round(fleschScore*0.35 + slScore*0.2 + psScore*0.15 + Math.max(0,cxScore)*0.15 + ss*0.15)));
  const suggestions = [];
  if (avgSentenceLength > 20)  suggestions.push('Break long sentences into shorter ones.');
  if (passiveCount > 0)        suggestions.push('Convert passive voice to active voice.');
  if (complexWordCount > 3)    suggestions.push('Replace complex words with simpler alternatives.');
  if (ss < 50)                 suggestions.push('Add paragraph breaks, headings, or lists.');
  if (fleschScore < 50)        suggestions.push('Simplify vocabulary and shorten sentences.');
  const partial = { fleschScore: Math.round(fleschScore*10)/10, fleschLabel: fleschLabel(fleschScore), gradeLevel: Math.round(gradeLevel*10)/10, avgSentenceLength: Math.round(avgSentenceLength*10)/10, passiveCount, complexWordCount, structureScore: ss, overallScore, totalWords, totalSentences, suggestions: suggestions.slice(0,3) };
  return { ...partial, level: classifyLevel(partial) };
}

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node scripts/analyze.mjs <file>'); process.exit(1); }
console.log(JSON.stringify(analyzeText(readFileSync(filePath, 'utf8')), null, 2));
