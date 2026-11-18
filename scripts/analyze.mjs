#!/usr/bin/env node
/**
 * CLI for the Text Barrier Detector analyzer (EN + ES).
 *
 * This is a thin wrapper: all analysis lives in the TypeScript core
 * (src/lib/analyzer.ts), built to dist-lib/ by `npm run build:lib`.
 *
 * Usage: node scripts/analyze.mjs [--lang=en|es] <path-to-text-file | ->
 *        ("-" reads the text from stdin)
 * Output: JSON analysis result on stdout (includes the Readability Band,
 *         A1-C2, which is CEFR-inspired and not a certification).
 * Errors: JSON { "error": { code, message, details } } on stderr.
 *         Exit code 2 = invalid input, 1 = usage / unexpected error.
 */

import { readFileSync } from 'node:fs';
import { analyzeText, AnalysisError } from '../packages/core/dist/index.js';

function fail(code, message, exitCode = 1, details = {}) {
  console.error(JSON.stringify({ error: { code, message, details } }));
  process.exit(exitCode);
}

function parseArgs(argv) {
  let lang = 'en';
  let filePath = null;
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--lang=')) {
      lang = arg.slice('--lang='.length).toLowerCase();
    } else if (arg === '--lang') {
      fail('USAGE', 'Usage: --lang=en or --lang=es');
    } else if (arg === '-' || !arg.startsWith('-')) {
      filePath = arg;
    } else {
      fail('USAGE', `Unknown option: ${arg}`);
    }
  }
  return { lang, filePath };
}

const { lang, filePath } = parseArgs(process.argv);
if (!filePath) {
  fail('USAGE', 'Usage: node scripts/analyze.mjs [--lang=en|es] <path-to-text-file | ->');
}

let text;
try {
  text = readFileSync(filePath === '-' ? 0 : filePath, 'utf8');
} catch (err) {
  fail('READ_ERROR', `Cannot read ${filePath}: ${err.message}`);
}

try {
  console.log(JSON.stringify(analyzeText(text, lang), null, 2));
} catch (err) {
  if (err instanceof AnalysisError) {
    fail(err.code, err.message, 2, err.details);
  }
  fail('UNEXPECTED', err instanceof Error ? err.message : String(err));
}
