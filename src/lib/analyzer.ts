import { countSyllables } from './syllables';
import { detectPassiveVoice } from './passive';
import { classifyLevel } from './levelClassifier';
import { computeStructureScore } from './structure';
import type { LevelResult } from './levelClassifier';

export type AnalysisLanguage = 'en' | 'es';
export type FormulaName = 'Flesch' | 'Fernández-Huerta';

export interface SentenceAnalysis {
  text: string;
  wordCount: number;
  isLong: boolean;
  hasPassiveVoice: boolean;
  complexWords: string[];
  index: number;
}

export interface AnalysisResult {
  sentences: SentenceAnalysis[];
  fleschScore: number;
  fleschLabel: string;
  gradeLevel: number;
  avgSentenceLength: number;
  passiveCount: number;
  complexWordCount: number;
  structureScore: number;
  overallScore: number;
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  suggestions: string[];
  /** CEFR-style level classification (A1–C2) */
  level: LevelResult;
  /** Analysis language used for heuristics */
  language: AnalysisLanguage;
  /** Readability formula applied to fleschScore */
  formulaName: FormulaName;
}

const WORD_CHARS_EN = /[^a-zA-Z]/g;
const WORD_CHARS_ES = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g;

function wordCleanRegex(lang: AnalysisLanguage): RegExp {
  return lang === 'es' ? WORD_CHARS_ES : WORD_CHARS_EN;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}

function getWords(text: string, lang: AnalysisLanguage): string[] {
  const re = wordCleanRegex(lang);
  return text.split(/\s+/).filter(w => w.replace(re, '').length > 0);
}

function cleanWord(word: string, lang: AnalysisLanguage): string {
  return word.replace(wordCleanRegex(lang), '');
}

/**
 * Common multi-syllable words that are everyday / technical for product &
 * tech audiences. They satisfy ≥4 syllables but should not count as
 * "readability barriers". Prepares the path for future domain jargon packs.
 */
const COMMON_TECHNICAL_EN = new Set(
  [
    'information', 'communication', 'technology', 'application', 'development',
    'organization', 'organisational', 'organizational', 'infrastructure',
    'configuration', 'documentation', 'implementation', 'functionality',
    'availability', 'reliability', 'compatibility', 'integration',
    'authentication', 'authorization', 'environment', 'performance',
    'experience', 'interface', 'repository', 'component', 'parameter',
    'operation', 'management', 'administration', 'security', 'analysis',
    'evaluation', 'calculation', 'generation', 'distribution', 'collaboration',
    'notification', 'subscription', 'accessibility', 'scalability',
    'optimization', 'optimisation', 'visualization', 'visualisation',
    'algorithm', 'database', 'software', 'hardware', 'network', 'protocol',
    'framework', 'library', 'module', 'service', 'process', 'system',
    'user', 'users', 'account', 'accounts', 'settings', 'options', 'features',
    'product', 'products', 'version', 'versions', 'update', 'updates',
    'error', 'errors', 'message', 'messages', 'report', 'reports', 'data',
    'file', 'files', 'folder', 'folders', 'document', 'documents', 'page',
    'pages', 'section', 'sections', 'chapter', 'chapters', 'article',
    'articles', 'content', 'contents', 'text', 'texts', 'language',
    'languages', 'example', 'examples', 'tutorial', 'tutorials', 'guide',
    'guides', 'manual', 'manuals', 'reference', 'references', 'description',
    'descriptions', 'summary', 'summaries', 'introduction', 'conclusion',
    'conclusions', 'recommendation', 'recommendations', 'requirement',
    'requirements', 'specification', 'specifications', 'limitation',
    'limitations', 'advantage', 'advantages', 'disadvantage', 'disadvantages',
    'benefit', 'benefits', 'challenge', 'challenges', 'solution', 'solutions',
    'problem', 'problems', 'issue', 'issues', 'question', 'questions',
    'answer', 'answers', 'response', 'responses', 'request', 'requests',
    'result', 'results', 'outcome', 'outcomes', 'impact', 'impacts', 'effect',
    'effects', 'cause', 'causes', 'reason', 'reasons', 'purpose', 'purposes',
    'goal', 'goals', 'objective', 'objectives', 'strategy', 'strategies',
    'method', 'methods', 'approach', 'approaches', 'technique', 'techniques',
    'procedure', 'procedures', 'workflow', 'workflows', 'pipeline', 'pipelines',
    'architecture', 'architectures', 'design', 'designs', 'pattern', 'patterns',
    'model', 'models', 'structure', 'structures', 'format', 'formats',
    'standard', 'standards', 'policy', 'policies', 'guideline', 'guidelines',
    'practice', 'practices', 'extraordinary', 'computational', 'capabilities',
  ].map((w) => w.toLowerCase())
);

const COMMON_TECHNICAL_ES = new Set(
  [
    'información', 'comunicación', 'tecnología', 'aplicación', 'desarrollo',
    'organización', 'infraestructura', 'configuración', 'documentación',
    'implementación', 'funcionalidad', 'disponibilidad', 'confiabilidad',
    'compatibilidad', 'integración', 'autenticación', 'autorización',
    'entorno', 'rendimiento', 'experiencia', 'interfaz', 'repositorio',
    'componente', 'parámetro', 'operación', 'administración', 'seguridad',
    'análisis', 'evaluación', 'cálculo', 'generación', 'distribución',
    'colaboración', 'notificación', 'suscripción', 'accesibilidad',
    'escalabilidad', 'optimización', 'visualización', 'algoritmo',
    'software', 'hardware', 'protocolo', 'framework', 'biblioteca', 'módulo',
    'servicio', 'proceso', 'sistema', 'usuario', 'usuarios', 'cuenta',
    'cuentas', 'ajustes', 'opciones', 'características', 'producto',
    'productos', 'versión', 'versiones', 'actualización', 'actualizaciones',
    'error', 'errores', 'mensaje', 'mensajes', 'informe', 'informes',
    'archivo', 'archivos', 'carpeta', 'carpetas', 'documento', 'documentos',
    'página', 'páginas', 'sección', 'secciones', 'capítulo', 'capítulos',
    'artículo', 'artículos', 'contenido', 'contenidos', 'texto', 'textos',
    'idioma', 'idiomas', 'ejemplo', 'ejemplos', 'tutorial', 'tutoriales',
    'guía', 'guías', 'manual', 'manuales', 'referencia', 'referencias',
    'descripción', 'descripciones', 'resumen', 'resúmenes', 'introducción',
    'conclusión', 'conclusiones', 'recomendación', 'recomendaciones',
    'requisito', 'requisitos', 'especificación', 'especificaciones',
    'limitación', 'limitaciones', 'ventaja', 'ventajas', 'desventaja',
    'desventajas', 'beneficio', 'beneficios', 'desafío', 'desafíos',
    'solución', 'soluciones', 'problema', 'problemas', 'pregunta',
    'preguntas', 'respuesta', 'respuestas', 'solicitud', 'solicitudes',
    'resultado', 'resultados', 'impacto', 'impactos', 'efecto', 'efectos',
    'causa', 'causas', 'razón', 'razones', 'propósito', 'propósitos',
    'objetivo', 'objetivos', 'estrategia', 'estrategias', 'método', 'métodos',
    'enfoque', 'enfoques', 'técnica', 'técnicas', 'procedimiento',
    'procedimientos', 'flujo', 'flujos', 'arquitectura', 'arquitecturas',
    'diseño', 'diseños', 'patrón', 'patrones', 'modelo', 'modelos',
    'estructura', 'estructuras', 'formato', 'formatos', 'estándar',
    'estándares', 'política', 'políticas', 'directriz', 'directrices',
    'práctica', 'prácticas',
  ].map((w) => w.toLowerCase())
);

function isCommonTechnical(word: string, lang: AnalysisLanguage): boolean {
  const lower = word.toLowerCase();
  return lang === 'es' ? COMMON_TECHNICAL_ES.has(lower) : COMMON_TECHNICAL_EN.has(lower);
}

function findComplexWords(words: string[], lang: AnalysisLanguage): string[] {
  return words
    .map(w => cleanWord(w, lang))
    .filter(w => {
      if (w.length === 0) return false;
      if (isCommonTechnical(w, lang)) return false;
      return countSyllables(w, lang) >= 4;
    });
}

function getEaseLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

/** Flesch Reading Ease (English). */
function fleschReadingEase(words: number, sentences: number, syllables: number): number {
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

/** Fernández-Huerta (Spanish): 206.84 - 1.02*P - 0.60*S */
function fernandezHuerta(words: number, sentences: number, syllables: number): number {
  const P = words / sentences;
  const S = syllables / words;
  return 206.84 - 1.02 * P - 0.60 * S;
}

export function analyzeText(text: string, lang: AnalysisLanguage = 'en'): AnalysisResult {
  const sentences = splitSentences(text);
  const allWords = getWords(text, lang);
  const totalWords = allWords.length;
  const totalSentences = Math.max(sentences.length, 1);
  const totalSyllables = allWords.reduce(
    (sum, w) => sum + countSyllables(cleanWord(w, lang), lang),
    0
  );
  const avgSentenceLength = totalWords / totalSentences;

  const formulaName: FormulaName = lang === 'es' ? 'Fernández-Huerta' : 'Flesch';
  const rawEase =
    totalWords === 0
      ? 0
      : lang === 'es'
        ? fernandezHuerta(totalWords, totalSentences, totalSyllables)
        : fleschReadingEase(totalWords, totalSentences, totalSyllables);

  const fleschScore = Math.max(0, Math.min(100, rawEase));

  const gradeLevel =
    totalWords === 0
      ? 0
      : Math.max(
          0,
          0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
        );

  let passiveCount = 0;
  let complexWordCount = 0;

  const sentenceAnalyses: SentenceAnalysis[] = sentences.map((s, i) => {
    const words = getWords(s, lang);
    const isLong = words.length > 20;
    const hasPassive = detectPassiveVoice(s, lang);
    const complex = findComplexWords(words, lang);
    if (hasPassive) passiveCount++;
    complexWordCount += complex.length;
    return { text: s, wordCount: words.length, isLong, hasPassiveVoice: hasPassive, complexWords: complex, index: i };
  });

  const structureScore = computeStructureScore(text, totalWords);

  const sentenceLengthScore = Math.max(0, 100 - (sentenceAnalyses.filter(s => s.isLong).length / totalSentences) * 100);
  const passiveScore = Math.max(0, 100 - (passiveCount / totalSentences) * 100);
  const complexScore = Math.max(0, 100 - (complexWordCount / Math.max(totalWords, 1)) * 200);
  const overallScore = Math.round(
    fleschScore * 0.35 + sentenceLengthScore * 0.2 + passiveScore * 0.15 +
    Math.max(0, complexScore) * 0.15 + structureScore * 0.15
  );

  const suggestions: string[] = [];
  if (avgSentenceLength > 20) suggestions.push('Break long sentences into shorter ones (aim for under 20 words).');
  if (passiveCount > 0) suggestions.push('Convert passive voice to active voice for clarity.');
  if (complexWordCount > 3) suggestions.push('Replace complex words with simpler alternatives.');
  if (structureScore < 50) suggestions.push('Add paragraph breaks, headings, or lists to improve structure.');
  if (fleschScore < 50) suggestions.push('Simplify vocabulary and shorten sentences to improve readability.');

  const partial = {
    sentences: sentenceAnalyses,
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

  return {
    ...partial,
    level: classifyLevel(partial as AnalysisResult),
  };
}
