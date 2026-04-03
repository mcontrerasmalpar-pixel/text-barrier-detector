import type { AnalysisResult } from './analyzer';

export interface ClaudeEnhancement {
  rewrites: { original: string; rewrite: string; reason: string }[];
  titleSuggestion?: string;
  jargonValidation: { word: string; isJargon: boolean; simpler?: string }[];
}

export async function enhanceWithClaude(
  text: string,
  analysis: AnalysisResult
): Promise<ClaudeEnhancement> {
  const complexSentences = analysis.sentences
    .filter(s => s.isLong || s.complexWords.length > 0 || s.hasPassiveVoice)
    .sort((a, b) => {
      const scoreA = (a.isLong ? 2 : 0) + a.complexWords.length + (a.hasPassiveVoice ? 1 : 0);
      const scoreB = (b.isLong ? 2 : 0) + b.complexWords.length + (b.hasPassiveVoice ? 1 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  const allComplexWords = [...new Set(analysis.sentences.flatMap(s => s.complexWords))].slice(0, 10);

  const prompt = `You are a plain-language writing expert. Analyze this text for accessibility barriers.

TEXT:
"""
${text.slice(0, 3000)}
"""

DETECTED COMPLEX WORDS: ${allComplexWords.join(', ')}

TOP 3 MOST COMPLEX SENTENCES:
${complexSentences.map((s, i) => `${i + 1}. "${s.text}"`).join('\n')}

METRICS: Flesch score ${analysis.fleschScore}, Grade level ${analysis.gradeLevel}, ${analysis.passiveCount} passive voice instances.

Please respond with valid JSON only (no markdown):
{
  "rewrites": [
    { "original": "exact sentence", "rewrite": "simpler version", "reason": "why this is clearer" }
  ],
  "titleSuggestion": "simpler title if text appears to have one, or null",
  "jargonValidation": [
    { "word": "word", "isJargon": true/false, "simpler": "alternative or null" }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '{}';
  
  try {
    return JSON.parse(content);
  } catch {
    return { rewrites: [], jargonValidation: [] };
  }
}
