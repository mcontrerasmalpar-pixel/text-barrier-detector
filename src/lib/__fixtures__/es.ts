/**
 * Spanish fixtures for Feature 01 heuristics.
 * Cover: ser-passive, se-passive/impersonal, long, short clean,
 * accented vowels/diphthongs, product-doc style.
 */
export const esFixtures = {
  analyticPassive:
    'El archivo fue modificado por el administrador.',
  sePassive:
    'Se requiere una clave de API.',
  seImpersonal:
    'Se necesita confirmar el correo electrónico.',
  longSentence:
    'La documentación del producto explica cómo los usuarios pueden configurar opciones avanzadas en sus cuentas cuando necesitan personalizar la experiencia más allá de los valores predeterminados disponibles en el sistema.',
  shortClean:
    'El gato duerme en la casa.',
  accentedVowels:
    'La computadora completa la evaluación de la causa principal.',
  diphthongs:
    'La causa del ruido fue la evaluación automática del sistema.',
  productDoc: [
    '## Configuración',
    '',
    'Para activar la integración, sigue estos pasos:',
    '',
    '1. Abre el panel de ajustes.',
    '2. Introduce tu clave de API.',
    '',
    'Se requiere una clave de API válida. El archivo fue modificado por el administrador tras el cambio.',
    'La evaluación automática revisa la computadora del usuario y reporta la causa del error en menos de un minuto.',
  ].join('\n'),
  activeClean:
    'El equipo escribió el informe ayer.',
  mixedParagraph:
    'Primero guarda el borrador. Se publicó el artículo anoche. Luego revisa los comentarios.',
} as const;

export type EsFixtureKey = keyof typeof esFixtures;

export const enFixtures = {
  shortClean: 'The cat sat on the mat.',
  passive: 'The report was written by the team.',
  long:
    'The product documentation explains how users can configure advanced settings for their accounts when they need to customize the experience beyond the default options provided.',
  complex:
    'The organizational infrastructure demonstrates extraordinary computational capabilities.',
  multi:
    'We shipped the feature yesterday. The file was modified by an admin. Please review carefully.',
} as const;

/** Locked English baselines from main analyzer behavior (pre Feature 01). */
export const enBaselines = {
  shortClean: {
    fleschScore: 100,
    fleschLabel: 'Very easy',
    gradeLevel: 0,
    avgSentenceLength: 6,
    passiveCount: 0,
    complexWordCount: 0,
    structureScore: 10,
    overallScore: 87,
    totalWords: 6,
    totalSentences: 1,
    totalSyllables: 6,
  },
  passive: {
    fleschScore: 91,
    fleschLabel: 'Very easy',
    gradeLevel: 2.3,
    avgSentenceLength: 7,
    passiveCount: 1,
    complexWordCount: 0,
    structureScore: 10,
    overallScore: 68,
    totalWords: 7,
    totalSentences: 1,
    totalSyllables: 9,
  },
  long: {
    fleschScore: 25.8,
    fleschLabel: 'Very difficult',
    gradeLevel: 15.9,
    avgSentenceLength: 25,
    passiveCount: 0,
    complexWordCount: 1,
    structureScore: 10,
    overallScore: 39,
    totalWords: 25,
    totalSentences: 1,
    totalSyllables: 46,
  },
  complex: {
    fleschScore: 0,
    fleschLabel: 'Very difficult',
    gradeLevel: 37.7,
    avgSentenceLength: 7,
    passiveCount: 0,
    complexWordCount: 6,
    structureScore: 10,
    overallScore: 37,
    totalWords: 7,
    totalSentences: 1,
    totalSyllables: 30,
  },
  multi: {
    fleschScore: 55.1,
    fleschLabel: 'Moderate',
    gradeLevel: 6.8,
    avgSentenceLength: 5,
    passiveCount: 1,
    complexWordCount: 1,
    structureScore: 10,
    overallScore: 64,
    totalWords: 15,
    totalSentences: 3,
    totalSyllables: 26,
  },
} as const;
