import { ERROR_MESSAGES } from './messages.js';
import { SUPPORTED_LANGUAGES, isSupportedLanguage } from './languages/index.js';
import type { AnalysisLanguage } from './languages/types.js';

/** Maximum accepted input size, in UTF-16 code units (`string.length`). */
export const MAX_INPUT_CHARS = 1_000_000;

export type AnalysisErrorCode =
  | 'INVALID_TYPE'
  | 'EMPTY_TEXT'
  | 'TEXT_TOO_LONG'
  | 'UNSUPPORTED_LANGUAGE';

const MESSAGE_KEY = {
  INVALID_TYPE: 'errInvalidType',
  EMPTY_TEXT: 'errEmptyText',
  TEXT_TOO_LONG: 'errTextTooLong',
  UNSUPPORTED_LANGUAGE: 'errUnsupportedLanguage',
} as const;

export type AnalysisErrorDetails = Record<string, string | number>;

function format(template: string, params: AnalysisErrorDetails): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in params ? String(params[key]) : m
  );
}

/** Thrown by `analyze`, `analyzeText`, and `findBarriers` for invalid input. */
export class AnalysisError extends Error {
  readonly code: AnalysisErrorCode;
  readonly details: AnalysisErrorDetails;

  constructor(
    code: AnalysisErrorCode,
    lang: AnalysisLanguage = 'en',
    details: AnalysisErrorDetails = {}
  ) {
    super(format(ERROR_MESSAGES[lang][MESSAGE_KEY[code]], details));
    this.name = 'AnalysisError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AnalysisError.prototype);
  }
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Validates analyzer input. Throws `AnalysisError` with a localized message.
 * Error messages use the requested language when it is supported, else English.
 */
export function validateInput(
  text: unknown,
  lang: unknown
): asserts text is string {
  const msgLang: AnalysisLanguage = isSupportedLanguage(lang) ? lang : 'en';

  if (!isSupportedLanguage(lang)) {
    throw new AnalysisError('UNSUPPORTED_LANGUAGE', msgLang, {
      lang: String(lang),
      supported: SUPPORTED_LANGUAGES.join(', '),
    });
  }
  if (typeof text !== 'string') {
    throw new AnalysisError('INVALID_TYPE', msgLang, { type: describeType(text) });
  }
  if (text.trim().length === 0) {
    throw new AnalysisError('EMPTY_TEXT', msgLang);
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new AnalysisError('TEXT_TOO_LONG', msgLang, {
      length: text.length,
      max: MAX_INPUT_CHARS,
    });
  }
}
