export const translations = {
  en: {
    title: 'TEXT BARRIER DETECTOR',
    subtitle: 'Accessibility analysis engine',
    heroTitle: 'Make your writing more accessible',
    heroSubtitle: 'Paste any text to detect readability barriers and get actionable suggestions to fix them.',
    placeholder: 'Paste your text here... Try product docs, onboarding guides, or emails.',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    clear: 'Clear',
    trySample: 'Try a sample:',
    sampleBarriersLabel: 'Complex & passive copy',
    sampleStructuredLabel: 'Structured product guide',
    downloadReport: '↓ Download Report',
    overallScore: 'Overall Score',
    fleschReading: 'Flesch Reading Ease',
    formulaFlesch: 'Flesch Reading Ease',
    formulaFernandezHuerta: 'Fernández-Huerta',
    gradeLevel: 'Grade Level',
    avgSentenceLen: 'Avg. Sentence Length',
    passiveVoice: 'Passive Voice',
    complexWords: 'Complex Words',
    structure: 'Structure Score',
    suggestions: 'Top Suggestions',
    word: 'word',
    words: 'words',
    instances: 'instances',
    detected: 'detected',
    outOf100: '/ 100',
    grade: 'grade',
    aiEnhanced: 'AI-Enhanced',
    apiKeyLabel: 'Claude API Key',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeySave: 'Save',
    enhancing: 'Enhancing with AI...',
    enhance: 'Enhance with AI',
    rewrite: 'Suggested Rewrite',
    reason: 'Why',
    titleSuggestion: 'Suggested Title',
    jargonCheck: 'Jargon Validation',
    longSentence: 'Long sentence',
    longSentenceTip: 'This sentence has over 20 words. Consider breaking it into shorter sentences.',
    complexWord: 'Complex word',
    complexWordTip: 'This word has more than 3 syllables. Consider using a simpler alternative.',
    passiveVoiceTip: 'Passive voice detected. Consider rewriting in active voice.',
    passiveVoiceLabel: 'Passive voice',
    annotatedText: 'Annotated Text',
    metrics: 'Metrics',
    noResults: 'Paste text and click Analyze to see results.',
    legend: 'Legend',
    legendLong: 'Long sentence (>20 words)',
    legendComplex: 'Complex words',
    legendPassive: 'Passive voice',
    legendClean: 'Clean sentence',
    readabilityBand: 'Readability Band (A1–C2)',
    readabilityBandNote: 'CEFR-inspired heuristic, not a certification.',
    levelScore: 'Score',
    errInvalidType: 'Input text must be a string, but received {type}.',
    errEmptyText: 'Input text is empty. Provide at least one word to analyze.',
    errTextTooLong: 'Input text is too long: {length} characters (maximum {max}). Split it into smaller parts.',
    errUnsupportedLanguage: 'Unsupported language "{lang}". Supported languages: {supported}.',
  },
  es: {
    title: 'DETECTOR DE BARRERAS DE TEXTO',
    subtitle: 'Motor de análisis de accesibilidad',
    heroTitle: 'Haz que tu escritura sea más accesible',
    heroSubtitle: 'Pega cualquier texto para detectar barreras de lectura y obtener sugerencias claras para corregirlas.',
    placeholder: 'Pega tu texto aquí... Prueba con documentación técnica, correos o guías.',
    analyze: 'Analizar',
    analyzing: 'Analizando...',
    clear: 'Limpiar',
    trySample: 'Probar un ejemplo:',
    sampleBarriersLabel: 'Texto complejo y pasivo',
    sampleStructuredLabel: 'Guía estructurada de producto',
    downloadReport: '↓ Descargar informe',
    overallScore: 'Puntuación General',
    fleschReading: 'Facilidad de Lectura Flesch',
    formulaFlesch: 'Facilidad de Lectura Flesch',
    formulaFernandezHuerta: 'Fernández-Huerta',
    gradeLevel: 'Nivel de Grado',
    avgSentenceLen: 'Longitud Promedio de Oración',
    passiveVoice: 'Voz Pasiva',
    complexWords: 'Palabras Complejas',
    structure: 'Puntuación de Estructura',
    suggestions: 'Sugerencias Principales',
    word: 'palabra',
    words: 'palabras',
    instances: 'instancias',
    detected: 'detectadas',
    outOf100: '/ 100',
    grade: 'grado',
    aiEnhanced: 'Mejorado con IA',
    apiKeyLabel: 'Clave API de Claude',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeySave: 'Guardar',
    enhancing: 'Mejorando con IA...',
    enhance: 'Mejorar con IA',
    rewrite: 'Reescritura Sugerida',
    reason: 'Por qué',
    titleSuggestion: 'Título Sugerido',
    jargonCheck: 'Validación de Jerga',
    longSentence: 'Oración larga',
    longSentenceTip: 'Esta oración tiene más de 20 palabras. Considere dividirla en oraciones más cortas.',
    complexWord: 'Palabra compleja',
    complexWordTip: 'Esta palabra tiene más de 3 sílabas. Considere usar una alternativa más simple.',
    passiveVoiceTip: 'Voz pasiva detectada. Considere reescribir en voz activa.',
    passiveVoiceLabel: 'Voz pasiva',
    annotatedText: 'Texto Anotado',
    metrics: 'Métricas',
    noResults: 'Pegue texto y haga clic en Analizar para ver resultados.',
    legend: 'Leyenda',
    legendLong: 'Oración larga (>20 palabras)',
    legendComplex: 'Palabras complejas',
    legendPassive: 'Voz pasiva',
    legendClean: 'Oración limpia',
    readabilityBand: 'Banda de legibilidad (A1–C2)',
    readabilityBandNote: 'Heurística inspirada en el MCER, no es una certificación.',
    levelScore: 'Puntuación',
    errInvalidType: 'El texto de entrada debe ser una cadena (string), pero se recibió {type}.',
    errEmptyText: 'El texto de entrada está vacío. Proporcione al menos una palabra para analizar.',
    errTextTooLong: 'El texto de entrada es demasiado largo: {length} caracteres (máximo {max}). Divídalo en partes más pequeñas.',
    errUnsupportedLanguage: 'Idioma no admitido "{lang}". Idiomas admitidos: {supported}.',
  },
} as const;

export type Lang = keyof typeof translations;

/** Widened translation record (every key maps to a plain string). */
export type Translation = Record<keyof (typeof translations)['en'], string>;

const EASE_LABEL_ES: Record<string, string> = {
  'Very easy': 'Muy fácil',
  Easy: 'Fácil',
  Moderate: 'Moderado',
  Difficult: 'Difícil',
  'Very difficult': 'Muy difícil',
};

const BAND_LABEL_ES: Record<string, string> = {
  'Very Easy': 'Muy fácil',
  Easy: 'Fácil',
  Standard: 'Estándar',
  'Moderately Complex': 'Moderadamente complejo',
  Complex: 'Complejo',
  'Very Complex': 'Muy complejo',
};

const BAND_AUDIENCE_ES: Record<string, string> = {
  A1: 'Niños, principiantes y hablantes no nativos en nivel básico.',
  A2: 'Público general, hablantes no nativos y lectores con formación básica.',
  B1: 'Mayoría de adultos, audiencia general y estándar de lenguaje claro.',
  B2: 'Adultos con formación superior y profesionales de áreas afines.',
  C1: 'Especialistas, académicos y profesionales altamente especializados.',
  C2: 'Expertos del dominio, investigadores y lectores académicos.',
};

const SUGGESTION_ES: Record<string, string> = {
  'Break long sentences into shorter ones (aim for under 20 words).':
    'Divide las oraciones largas en otras más cortas (apunta a menos de 20 palabras).',
  'Convert passive voice to active voice for clarity.':
    'Convierte la voz pasiva en voz activa para mayor claridad.',
  'Replace complex words with simpler alternatives.':
    'Reemplaza las palabras complejas por alternativas más sencillas.',
  'Add paragraph breaks, headings, or lists to improve structure.':
    'Añade saltos de párrafo, encabezados o listas para mejorar la estructura.',
  'Simplify vocabulary and shorten sentences to improve readability.':
    'Simplifica el vocabulario y acorta las oraciones para mejorar la legibilidad.',
};

export function localizeEaseLabel(label: string, lang: Lang): string {
  if (lang === 'es') return EASE_LABEL_ES[label] ?? label;
  return label;
}

export function localizeBandLabel(label: string, lang: Lang): string {
  if (lang === 'es') return BAND_LABEL_ES[label] ?? label;
  return label;
}

export function localizeBandAudience(level: string, defaultAudience: string, lang: Lang): string {
  if (lang === 'es') return BAND_AUDIENCE_ES[level] ?? defaultAudience;
  return defaultAudience;
}

export function localizeSuggestion(suggestion: string, lang: Lang): string {
  if (lang === 'es') return SUGGESTION_ES[suggestion] ?? suggestion;
  return suggestion;
}

export function localizeTip(tip: string, lang: Lang): string {
  if (lang !== 'es') return tip;
  if (tip.startsWith('Your text is already in the most accessible band')) {
    return '¡Tu texto ya está en la banda más accesible! Excelente trabajo.';
  }
  if (tip.startsWith('Break long sentences into two shorter ones')) {
    return 'Divide las oraciones largas en dos más cortas (objetivo: menos de 15 palabras cada una).';
  }
  if (tip.startsWith('Rewrite passive-voice sentences in active voice')) {
    return 'Reescribe las oraciones pasivas en voz activa (p. ej., «El informe fue escrito por Ana» → «Ana escribió el informe»).';
  }
  if (tip.startsWith('Replace polysyllabic words with simpler synonyms')) {
    return 'Reemplaza palabras polisílabas por sinónimos más simples (p. ej., «utilizar» → «usar», «demostrar» → «mostrar»).';
  }
  if (tip.startsWith('Aim for a Flesch Reading Ease score above 60')) {
    const match = tip.match(/currently (\d+)/);
    return `Apunta a una puntuación de facilidad de lectura superior a 60 (actualmente ${match ? match[1] : ''}).`;
  }
  if (tip.startsWith('Target a reading grade level below 8')) {
    return 'Apunta a un nivel de grado inferior a 8 para llegar a una audiencia general.';
  }
  if (tip.startsWith('Add headings, bullet lists, or paragraph breaks')) {
    return 'Añade encabezados, listas con viñetas o saltos de párrafo para mejorar la estructura visual.';
  }
  return tip;
}

export const SAMPLE_TEXTS: Record<Lang, { barriers: string; structured: string }> = {
  en: {
    barriers:
      'The quarterly report was written by the compliance committee after numerous counterintuitive discrepancies were identified across the regional ledger. Furthermore, a comprehensive reconciliation is being conducted by external auditors while the legacy terminal is turned on for verification.',
    structured: [
      '# Getting Started',
      'Welcome to the workspace. This guide explains how teams set up their project in a few minutes and keep every release clear for readers.',
      '- Create a new project folder and invite your teammates.',
      '- Paste a draft before you publish so everyone can spot hard sentences early.',
      'Short paragraphs and clear lists help readers scan the page without friction.',
    ].join('\n\n'),
  },
  es: {
    barriers:
      'El informe trimestral fue redactado por el comité supervisor después de que se identificaron múltiples discrepancias contraintuitivas en la contabilidad regional. Además, se registró una incidencia crítica mientras a mí se me olvidó confirmar el respaldo.',
    structured: [
      '# Guía de inicio rápido',
      'Bienvenido al panel del proyecto. Esta guía explica cómo configurar tu espacio en pocos minutos y mantener cada entrega clara para todo el equipo.',
      '- Crea una carpeta nueva e invita a las personas de tu equipo.',
      '- Pega tu borrador antes de publicar para detectar oraciones difíciles a tiempo.',
      'Los párrafos breves y las listas claras ayudan a leer la página sin esfuerzo.',
    ].join('\n\n'),
  },
};
