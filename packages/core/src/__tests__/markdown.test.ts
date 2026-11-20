import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  analyze,
  findBarriers,
  isIdentifierLike,
  removeMarkdownNoise,
  stripMarkdown,
} from '../index.js';

const SAMPLE = [
  '---',
  'title: Demo',
  '---',
  '# Release notes',
  '',
  '[![build](https://img.shields.io/badge/ci-passing-green.svg)](https://example.com/ci)',
  '',
  'The report was written by the team. See [the guide](https://example.com/guide) for details.',
  '',
  '| Package | Version |',
  '| --- | --- |',
  '| `@scope/some-package-name` | 1.0.0 |',
  '',
  '```bash',
  'npm install --save @scope/some-package-name',
  '```',
  '',
  '- First item without punctuation',
  '- Second item without punctuation',
  '',
  'Visit https://example.com/very/long/path/to/a/page for more.',
].join('\n');

describe('stripMarkdown', () => {
  it('preserves length so offsets stay valid', () => {
    expect(stripMarkdown(SAMPLE)).toHaveLength(SAMPLE.length);
    expect(removeMarkdownNoise(SAMPLE)).toHaveLength(SAMPLE.length);
  });

  it('preserves length with CRLF line endings', () => {
    const crlf = SAMPLE.replace(/\n/g, '\r\n');
    expect(stripMarkdown(crlf)).toHaveLength(crlf.length);
  });

  it('removes code, tables, front matter, badges and URLs but keeps prose and link text', () => {
    const prose = stripMarkdown(SAMPLE);
    expect(prose).not.toContain('npm install');
    expect(prose).not.toContain('some-package-name');
    expect(prose).not.toContain('shields.io');
    expect(prose).not.toContain('example.com');
    expect(prose).not.toContain('title: Demo');
    expect(prose).toContain('The report was written by the team.');
    expect(prose).toContain('the guide');
    expect(prose).toContain('First item without punctuation');
  });

  it('keeps headings and list markers for structure analysis', () => {
    const noise = removeMarkdownNoise(SAMPLE);
    expect(noise).toContain('# Release notes');
    expect(noise).toContain('- First item');
    expect(noise).not.toContain('npm install');
  });

  it('does not merge headings and list items into one sentence', () => {
    const md = '# Title without period\n\nFirst paragraph here.\n\n- one item\n- another item\n\nLast line.';
    const result = analyze(md, { lang: 'en', markdown: true });
    const texts = result.sentences.map((s) => s.text);
    expect(texts).toContain('First paragraph here.');
    expect(texts.some((t) => t.startsWith('one item'))).toBe(true);
    expect(texts.some((t) => t.startsWith('another item'))).toBe(true);
    expect(texts.every((t) => !t.includes('Title without period'))).toBe(true);
    expect(result.sentences.every((s) => !s.isLong)).toBe(true);
  });
});

describe('markdown option', () => {
  it('defaults to false and leaves plain-text behavior unchanged', () => {
    const text = 'The report was written by the team. It is short.';
    expect(analyze(text, { lang: 'en' })).toEqual(analyze(text, { lang: 'en', markdown: false }));
    expect(findBarriers(text, { lang: 'en' })).toEqual(
      findBarriers(text, { lang: 'en', markdown: false })
    );
  });

  it('gives the same result as plain mode for text without Markdown', () => {
    const text = 'The report was written by the team.\n\nShe wrote a clear and simple summary.';
    const plain = analyze(text, { lang: 'en' });
    const md = analyze(text, { lang: 'en', markdown: true });
    expect(md.totalWords).toBe(plain.totalWords);
    expect(md.passiveCount).toBe(plain.passiveCount);
    expect(md.complexWordCount).toBe(plain.complexWordCount);
  });

  it('reports offsets that match the original Markdown text', () => {
    const issues = findBarriers(SAMPLE, { lang: 'en', markdown: true });
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(SAMPLE.slice(issue.start, issue.end)).toBe(issue.text);
    }
    const passive = issues.find((i) => i.type === 'passive');
    expect(passive?.text).toBe('was written');
  });

  it('does not flag code, URLs or package names as complex words or long sentences', () => {
    const issues = findBarriers(SAMPLE, { lang: 'en', markdown: true });
    for (const issue of issues) {
      expect(issue.text).not.toMatch(/https?:|@scope|npm install/);
    }
    expect(issues.some((i) => i.type === 'long_sentence')).toBe(false);
  });

  it('keeps the structure score based on the document layout', () => {
    const doc = [
      '# Title',
      '',
      'This guide explains the setup in a few short steps for new users of the tool today.',
      '',
      '## Steps',
      '',
      '- Install the package from the registry',
      '- Run the command in your terminal',
      '',
      '```bash',
      'npm install something-long-here another-long-package-name yet-another-package-name',
      '```',
      '',
      'Then check your files and fix the issues that the tool reports for you.',
    ].join('\n');
    const md = analyze(doc, { lang: 'en', markdown: true });
    expect(md.structureScore).toBeGreaterThanOrEqual(50);
  });

  it('works for Spanish', () => {
    const es = '# Notas\n\nEl informe fue escrito por el equipo.\n\n```js\nconst x = 1;\n```\n\nSe registró el usuario.';
    const issues = findBarriers(es, { lang: 'es', markdown: true });
    for (const issue of issues) expect(es.slice(issue.start, issue.end)).toBe(issue.text);
    expect(issues.filter((i) => i.type === 'passive').length).toBeGreaterThanOrEqual(1);
  });
});

describe('isIdentifierLike', () => {
  it('flags identifiers and not normal words', () => {
    for (const t of ['@scope/pkg', 'README.md', 'snake_case', 'camelCase', 'v2', 'a-b-c']) {
      expect(isIdentifierLike(t)).toBe(true);
    }
    for (const t of ['readability', 'plain-language', 'Fernández-Huerta', 'documentation']) {
      expect(isIdentifierLike(t)).toBe(false);
    }
  });
});

describe('regression: the project README', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

  it('scores much fairer in Markdown mode than as raw text', () => {
    const raw = analyze(readme, { lang: 'en' });
    const md = analyze(readme, { lang: 'en', markdown: true });
    expect(md.fleschScore).toBeGreaterThan(raw.fleschScore);
    expect(md.complexWordCount).toBeLessThan(raw.complexWordCount / 3);
    expect(md.totalWords).toBeLessThan(raw.totalWords);
    expect(md.structureScore).toBeGreaterThanOrEqual(raw.structureScore - 10);
    expect(md.sentences.filter((s) => s.isLong).length).toBeLessThan(
      raw.sentences.filter((s) => s.isLong).length
    );
  });

  it('keeps all issue offsets valid against the original file', () => {
    const normalized = readme.normalize('NFC');
    for (const issue of findBarriers(readme, { lang: 'en', markdown: true })) {
      expect(normalized.slice(issue.start, issue.end)).toBe(issue.text);
    }
  });
});
