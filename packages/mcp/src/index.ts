import { readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  AnalysisError,
  MAX_INPUT_CHARS,
  SUPPORTED_LANGUAGES,
  analyze,
  findBarriers,
  isSupportedLanguage,
} from '@maky/text-barrier-core';
import type {
  AnalysisLanguage,
  AnalysisResult,
  BarrierIssue,
} from '@maky/text-barrier-core';

export const ALLOWED_FILE_EXTENSIONS = ['.md', '.txt'] as const;
/** Maximum file size in bytes (4 bytes per UTF-8 char upper bound for 1,000,000 chars). */
export const MAX_FILE_BYTES = MAX_INPUT_CHARS * 4;

export const langSchema = z
  .string()
  .optional()
  .default('en')
  .describe(
    'Analysis language code: "en" (English, Flesch Reading Ease) or "es" (Spanish, Fernández-Huerta). Defaults to "en".'
  );

export const analyzeTextInputShape = {
  text: z
    .string()
    .describe(
      `Plain text or Markdown to analyze (non-empty, up to ${MAX_INPUT_CHARS.toLocaleString('en-US')} characters).`
    ),
  lang: langSchema,
};

export const findBarriersInputShape = {
  text: z
    .string()
    .describe(
      `Plain text or Markdown to scan for readability barriers (non-empty, up to ${MAX_INPUT_CHARS.toLocaleString('en-US')} characters).`
    ),
  lang: langSchema,
};

export const checkFileInputShape = {
  path: z
    .string()
    .describe(
      'Path to a local .md or .txt file to analyze for readability metrics and barriers.'
    ),
  lang: langSchema,
};

export interface FindBarriersOutput {
  lang: AnalysisLanguage;
  count: number;
  issues: BarrierIssue[];
}

export interface CheckFileOutput {
  path: string;
  lang: AnalysisLanguage;
  analysis: AnalysisResult;
  issues: BarrierIssue[];
}

function toJsonResult(payload: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function toErrorResult(
  code: string,
  message: string,
  details: Record<string, unknown> = {}
): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: { code, message, details } }, null, 2),
      },
    ],
  };
}

function normalizeLang(lang?: string): AnalysisLanguage {
  const normalized = (lang ?? 'en').toLowerCase();
  if (!isSupportedLanguage(normalized)) {
    throw new AnalysisError('UNSUPPORTED_LANGUAGE', 'en', {
      lang: String(lang),
      supported: SUPPORTED_LANGUAGES.join(', '),
    });
  }
  return normalized;
}

/**
 * Handler for `analyze_text(text, lang?)`.
 * Never logs user text or makes network calls.
 */
export function handleAnalyzeText(args: {
  text: unknown;
  lang?: string;
}): CallToolResult {
  try {
    const lang = normalizeLang(args.lang);
    const result = analyze(args.text as string, { lang });
    return toJsonResult(result);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return toErrorResult(err.code, err.message, err.details);
    }
    return toErrorResult(
      'INTERNAL_ERROR',
      err instanceof Error ? err.message : 'Unexpected analysis error.'
    );
  }
}

/**
 * Handler for `find_barriers(text, lang?)`.
 * Returns deterministic barrier issues (`passive`, `long_sentence`, `complex_word`).
 */
export function handleFindBarriers(args: {
  text: unknown;
  lang?: string;
}): CallToolResult {
  try {
    const lang = normalizeLang(args.lang);
    const issues = findBarriers(args.text as string, { lang });
    const output: FindBarriersOutput = {
      lang,
      count: issues.length,
      issues,
    };
    return toJsonResult(output);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return toErrorResult(err.code, err.message, err.details);
    }
    return toErrorResult(
      'INTERNAL_ERROR',
      err instanceof Error ? err.message : 'Unexpected barrier detection error.'
    );
  }
}

/**
 * Handler for `check_file(path, lang?)`.
 * Reads a local `.md` or `.txt` file and returns both full analysis and barrier issues.
 */
export function handleCheckFile(args: {
  path: unknown;
  lang?: string;
}): CallToolResult {
  try {
    const lang = normalizeLang(args.lang);
    if (typeof args.path !== 'string' || args.path.trim().length === 0) {
      return toErrorResult(
        'INVALID_PATH',
        'File path must be a non-empty string pointing to a .md or .txt file.'
      );
    }

    const ext = extname(args.path).toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext as '.md' | '.txt')) {
      return toErrorResult(
        'UNSUPPORTED_FILE_TYPE',
        `Unsupported file extension "${ext || '(none)'}". Only .md and .txt files are allowed.`,
        { ext: ext || '', allowed: [...ALLOWED_FILE_EXTENSIONS] }
      );
    }

    const resolvedPath = resolve(args.path);
    let stats;
    try {
      stats = statSync(resolvedPath);
    } catch {
      return toErrorResult(
        'FILE_NOT_FOUND',
        `File not found or inaccessible: ${args.path}`,
        { path: args.path }
      );
    }

    if (!stats.isFile()) {
      return toErrorResult(
        'NOT_A_FILE',
        `Path is not a regular file: ${args.path}`,
        { path: args.path }
      );
    }

    if (stats.size > MAX_FILE_BYTES) {
      return toErrorResult(
        'TEXT_TOO_LONG',
        `File size (${stats.size} bytes) exceeds the maximum allowed size (${MAX_FILE_BYTES} bytes / ${MAX_INPUT_CHARS} characters). Split the file into smaller parts.`,
        { bytes: stats.size, maxBytes: MAX_FILE_BYTES, maxChars: MAX_INPUT_CHARS }
      );
    }

    const content = readFileSync(resolvedPath, 'utf8');
    const analysis = analyze(content, { lang });
    const issues = findBarriers(content, { lang });

    const output: CheckFileOutput = {
      path: args.path,
      lang,
      analysis,
      issues,
    };
    return toJsonResult(output);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return toErrorResult(err.code, err.message, err.details);
    }
    return toErrorResult(
      'FILE_READ_ERROR',
      err instanceof Error ? err.message : 'Failed to read or analyze file.'
    );
  }
}

/**
 * Creates a configured `@maky/text-barrier-mcp` `McpServer` instance with
 * `analyze_text`, `find_barriers`, and `check_file` registered.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: '@maky/text-barrier-mcp',
    version: '0.1.0',
  });

  const readOnlyAnnotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  } as const;

  server.registerTool(
    'analyze_text',
    {
      title: 'Analyze Text Readability',
      description:
        'Computes deterministic readability metrics (Flesch Reading Ease for EN, Fernández-Huerta for ES, Grade Level, structure score, overall score) and a CEFR-inspired Readability Band (A1–C2, not a certification).',
      inputSchema: analyzeTextInputShape,
      annotations: readOnlyAnnotations,
    },
    async ({ text, lang }) => handleAnalyzeText({ text, lang })
  );

  server.registerTool(
    'find_barriers',
    {
      title: 'Find Text Readability Barriers',
      description:
        'Returns a deterministic list of readability barriers (passive, long_sentence, complex_word) with start/end character offsets, sentence index, short reason, and language code.',
      inputSchema: findBarriersInputShape,
      annotations: readOnlyAnnotations,
    },
    async ({ text, lang }) => handleFindBarriers({ text, lang })
  );

  server.registerTool(
    'check_file',
    {
      title: 'Check Markdown or Text File Readability',
      description:
        'Reads a local .md or .txt file and returns both the full readability analysis and the list of detected barrier issues.',
      inputSchema: checkFileInputShape,
      annotations: readOnlyAnnotations,
    },
    async ({ path, lang }) => handleCheckFile({ path, lang })
  );

  return server;
}
