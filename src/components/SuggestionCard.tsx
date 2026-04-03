import type { ClaudeEnhancement } from '@/lib/claudeEnhancer';
import { type Lang, translations } from '@/lib/i18n';

interface SuggestionCardProps {
  enhancement: ClaudeEnhancement | null;
  isEnhancing: boolean;
  onEnhance: () => void;
  lang: Lang;
}

const SuggestionCard = ({ enhancement, isEnhancing, onEnhance, lang }: SuggestionCardProps) => {
  const t = translations[lang];

  return (
    <div className="border border-primary/30 bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span className="text-xs font-sans font-semibold tracking-widest uppercase text-primary">
          AI Enhancement
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Description */}
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Claude rewrites your hardest sentences in plain language. No login needed.
        </p>

        {/* Rewrites */}
        {enhancement && enhancement.rewrites.length > 0 && (
          <div className="space-y-4">
            {enhancement.rewrites.map((rw, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-xs font-mono text-muted-foreground line-through leading-relaxed">
                  {rw.original}
                </p>
                <p className="text-sm font-sans text-foreground leading-relaxed">
                  {rw.rewrite}
                </p>
                <p className="text-[11px] font-sans text-muted-foreground/70 italic">
                  {rw.reason}
                </p>
                {i < enhancement.rewrites.length - 1 && (
                  <div className="border-t border-border pt-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Jargon validation */}
        {enhancement && enhancement.jargonValidation.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              {t.jargonCheck}
            </p>
            {enhancement.jargonValidation.map((j, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className={j.isJargon ? 'text-error' : 'text-success'}>
                  {j.isJargon ? '✗' : '✓'}
                </span>
                <span className="text-foreground">{j.word}</span>
                {j.simpler && (
                  <span className="text-muted-foreground">→ {j.simpler}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Title suggestion */}
        {enhancement?.titleSuggestion && (
          <div className="space-y-1">
            <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-muted-foreground">
              {t.titleSuggestion}
            </p>
            <p className="text-sm font-sans text-foreground">{enhancement.titleSuggestion}</p>
          </div>
        )}
      </div>

      {/* CTA button */}
      <button
        onClick={onEnhance}
        disabled={isEnhancing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed border-t border-primary/30"
      >
        {isEnhancing && (
          <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        )}
        {isEnhancing ? t.enhancing : 'Enhance with AI →'}
      </button>
    </div>
  );
};

export default SuggestionCard;
