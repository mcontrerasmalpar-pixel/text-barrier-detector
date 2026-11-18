import { countSpanishSyllables } from '../syllables';
import { detectSpanishPassive } from '../passive/es';
import type { LanguagePack } from './types';

/** Common multi-syllable Spanish product/tech words that are not barriers. */
const COMMON_TECHNICAL = new Set(
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

/** Fernández-Huerta: 206.84 - 1.02*P - 0.60*S (P = words/sentence, S = syllables/word). */
function readingEase(words: number, sentences: number, syllables: number): number {
  const P = words / sentences;
  const S = syllables / words;
  return 206.84 - 1.02 * P - 0.60 * S;
}

export const esPack: LanguagePack = {
  code: 'es',
  formulaName: 'Fernández-Huerta',
  wordCharsRe: /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g,
  countSyllables: countSpanishSyllables,
  isPassive: detectSpanishPassive,
  isCommonTechnical: (word) => COMMON_TECHNICAL.has(word.toLowerCase()),
  complexWordMinSyllables: 4,
  readingEase,
};
