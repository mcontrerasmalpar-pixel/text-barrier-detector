import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  handleAnalyzeText,
  handleFindBarriers,
  handleCheckFile,
} from '../index.js';
import { MAX_INPUT_CHARS } from '@maky/text-barrier-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseToolText(res: ReturnType<typeof handleAnalyzeText>): Record<string, any> {
  const block = res.content[0];
  if (block.type !== 'text') throw new Error('Expected text content block');
  return JSON.parse(block.text);
}

describe('@maky/text-barrier-mcp tool unit tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'tbd-mcp-unit-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('analyze_text', () => {
    it('defaults lang to "en" and returns full readability metrics + Readability Band', () => {
      const res = handleAnalyzeText({
        text: 'The report was written by the team. She is turned on.',
      });
      expect(res.isError).toBeUndefined();
      const data = parseToolText(res);
      expect(data.language).toBe('en');
      expect(data.formulaName).toBe('Flesch');
      expect(data.passiveCount).toBe(1);
      expect(data.level.level).toBe('A2');
      expect(data.level.disclaimer).toMatch(/CEFR-inspired/);
    });

    it('supports explicit lang="es"', () => {
      const res = handleAnalyzeText({
        text: 'Se registró el usuario. Se me olvidó la contraseña.',
        lang: 'es',
      });
      expect(res.isError).toBeUndefined();
      const data = parseToolText(res);
      expect(data.language).toBe('es');
      expect(data.formulaName).toBe('Fernández-Huerta');
      expect(data.passiveCount).toBe(1);
    });

    it('returns informative errors on empty text, >1M chars, and unsupported language without logging user text', () => {
      const logSpy = vi.spyOn(console, 'log');
      const errSpy = vi.spyOn(console, 'error');

      const empty = handleAnalyzeText({ text: '   ' });
      expect(empty.isError).toBe(true);
      expect(parseToolText(empty).error.code).toBe('EMPTY_TEXT');

      const badLang = handleAnalyzeText({ text: 'Secret user text', lang: 'fr' });
      expect(badLang.isError).toBe(true);
      expect(parseToolText(badLang).error.code).toBe('UNSUPPORTED_LANGUAGE');

      const tooLong = handleAnalyzeText({ text: 'a'.repeat(MAX_INPUT_CHARS + 1) });
      expect(tooLong.isError).toBe(true);
      expect(parseToolText(tooLong).error.code).toBe('TEXT_TOO_LONG');

      expect(logSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });
  });

  describe('find_barriers', () => {
    it('returns deterministic barrier issues for EN and ES', () => {
      const enRes = handleFindBarriers({
        text: 'The report was written by the team. She is turned on.',
      });
      expect(enRes.isError).toBeUndefined();
      const enData = parseToolText(enRes);
      expect(enData.lang).toBe('en');
      expect(enData.count).toBe(1);
      expect(enData.issues[0]).toMatchObject({
        type: 'passive',
        sentenceIndex: 0,
        lang: 'en',
        text: 'was written',
      });

      const esRes = handleFindBarriers({
        text: 'Se registró el usuario. Se me olvidó.',
        lang: 'es',
      });
      const esData = parseToolText(esRes);
      expect(esData.lang).toBe('es');
      expect(esData.count).toBe(1);
      expect(esData.issues[0].type).toBe('passive');
      expect(esData.issues[0].text).toBe('Se registró');
    });
  });

  describe('check_file', () => {
    it('reads .md and .txt files and returns analysis + issues', () => {
      const mdPath = join(tempDir, 'sample.md');
      writeFileSync(
        mdPath,
        '# Overview\n\nThe report was written by the team. She is turned on.\n',
        'utf8'
      );

      const res = handleCheckFile({ path: mdPath });
      expect(res.isError).toBeUndefined();
      const data = parseToolText(res);
      expect(data.lang).toBe('en');
      expect(data.analysis.passiveCount).toBe(1);
      expect(data.issues).toHaveLength(1);
      expect(data.issues[0].type).toBe('passive');
    });

    it('rejects non-.md/.txt extensions and missing files with informative errors', () => {
      const jsPath = join(tempDir, 'index.js');
      writeFileSync(jsPath, 'console.log(1);', 'utf8');

      const badExt = handleCheckFile({ path: jsPath });
      expect(badExt.isError).toBe(true);
      expect(parseToolText(badExt).error.code).toBe('UNSUPPORTED_FILE_TYPE');

      const missing = handleCheckFile({ path: join(tempDir, 'missing.md') });
      expect(missing.isError).toBe(true);
      expect(parseToolText(missing).error.code).toBe('FILE_NOT_FOUND');
    });
  });
});
