import { countEnglishSyllables } from '../syllables';
import { detectEnglishPassive } from '../passive/en';
import type { LanguagePack } from './types';

/**
 * Common multi-syllable words that are everyday / technical for product and
 * tech audiences. They have 4+ syllables but are not "readability barriers".
 */
const COMMON_TECHNICAL = new Set(
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

/** Flesch Reading Ease. */
function readingEase(words: number, sentences: number, syllables: number): number {
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

export const enPack: LanguagePack = {
  code: 'en',
  formulaName: 'Flesch',
  wordCharsRe: /[^a-zA-Z]/g,
  countSyllables: countEnglishSyllables,
  isPassive: detectEnglishPassive,
  isCommonTechnical: (word) => COMMON_TECHNICAL.has(word.toLowerCase()),
  complexWordMinSyllables: 4,
  readingEase,
};
