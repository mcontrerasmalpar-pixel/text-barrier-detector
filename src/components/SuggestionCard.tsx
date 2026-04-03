import { useState } from 'react';
import type { ClaudeEnhancement } from '@/lib/claudeEnhancer';
import { type Lang, translations } from '@/lib/i18n';

interface SuggestionCardProps {
  enhancement: ClaudeEnhancement;
  lang: Lang;
}

const SuggestionCard = ({ enhancement, lang }: SuggestionCardProps) => {
  const t = translations[lang];
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3 mt-4">
      {enhancement.titleSuggestion && (
        <div className="border border-border bg-secondary p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 font-mono">
              {t.aiEnhanced}
            </span>
            <span className="text-xs text-muted-foreground font-sans">{t.titleSuggestion}</span>
          </div>
          <p className="text-sm text-foreground font-sans">{enhancement.titleSuggestion}</p>
        </div>
      )}

      {enhancement.rewrites.map((rw, i) => (
        <div key={i} className="border border-border bg-secondary p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 font-mono">
              {t.aiEnhanced}
            </span>
            <span className="text-xs text-muted-foreground font-sans">{t.rewrite}</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-1 line-through">{rw.original}</p>
          <p className="text-sm text-foreground font-sans">{rw.rewrite}</p>
          <button
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            className="text-xs text-primary mt-1 hover:underline font-sans"
          >
            {expandedIdx === i ? '▲' : '▼'} {t.reason}
          </button>
          {expandedIdx === i && (
            <p className="text-xs text-muted-foreground mt-1 font-sans">{rw.reason}</p>
          )}
        </div>
      ))}

      {enhancement.jargonValidation.length > 0 && (
        <div className="border border-border bg-secondary p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 font-mono">
              {t.aiEnhanced}
            </span>
            <span className="text-xs text-muted-foreground font-sans">{t.jargonCheck}</span>
          </div>
          <div className="space-y-1">
            {enhancement.jargonValidation.map((j, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className={j.isJargon ? 'text-highlight-complex' : 'text-gauge-green'}>
                  {j.isJargon ? '✗' : '✓'}
                </span>
                <span className="text-foreground">{j.word}</span>
                {j.simpler && (
                  <span className="text-muted-foreground">→ {j.simpler}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
