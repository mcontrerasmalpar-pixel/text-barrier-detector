import type { AnalysisLanguage } from './languages/types.js';

export const ERROR_MESSAGES: Record<
  AnalysisLanguage,
  {
    errInvalidType: string;
    errEmptyText: string;
    errTextTooLong: string;
    errUnsupportedLanguage: string;
  }
> = {
  en: {
    errInvalidType: 'Input text must be a string, but received {type}.',
    errEmptyText: 'Input text is empty. Provide at least one word to analyze.',
    errTextTooLong:
      'Input text is too long: {length} characters (maximum {max}). Split it into smaller parts.',
    errUnsupportedLanguage:
      'Unsupported language "{lang}". Supported languages: {supported}.',
  },
  es: {
    errInvalidType:
      'El texto de entrada debe ser una cadena (string), pero se recibió {type}.',
    errEmptyText:
      'El texto de entrada está vacío. Proporcione al menos una palabra para analizar.',
    errTextTooLong:
      'El texto de entrada es demasiado largo: {length} caracteres (máximo {max}). Divídalo en partes más pequeñas.',
    errUnsupportedLanguage:
      'Idioma no admitido "{lang}". Idiomas admitidos: {supported}.',
  },
};
