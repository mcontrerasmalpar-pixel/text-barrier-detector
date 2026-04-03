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
    <div style={{ background: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #e8e8e5' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '16px', color: '#0891b2', lineHeight: 1 }}>✦</span>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111111', lineHeight: 1.2 }}>
            AI Enhancement
          </div>
          <div style={{ fontSize: '12px', color: '#aaaaaa', marginTop: '2px' }}>
            Plain-language rewrites powered by Claude
          </div>
        </div>
      </div>

      {/* Body */}
      {enhancement && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Rewrites */}
          {enhancement.rewrites.map((rw, i) => (
            <div key={i} style={{
              background: '#f9f9f8', borderRadius: '8px', padding: '14px 16px',
            }}>
              <p style={{ fontSize: '13px', color: '#aaaaaa', textDecoration: 'line-through', lineHeight: 1.6, margin: '0 0 8px' }}>
                {rw.original}
              </p>
              <p style={{ fontSize: '14px', color: '#111111', lineHeight: 1.7, margin: '0 0 8px' }}>
                {rw.rewrite}
              </p>
              <p style={{ fontSize: '11px', color: '#0891b2', lineHeight: 1.5, margin: 0 }}>
                {rw.reason}
              </p>
            </div>
          ))}

          {/* Jargon validation */}
          {enhancement.jargonValidation.length > 0 && (
            <div style={{ background: '#f9f9f8', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaaaaa', marginBottom: '8px' }}>
                {t.jargonCheck}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {enhancement.jargonValidation.map((j, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: j.isJargon ? '#dc2626' : '#0891b2', fontWeight: 600 }}>
                      {j.isJargon ? '✗' : '✓'}
                    </span>
                    <span style={{ color: '#111111' }}>{j.word}</span>
                    {j.simpler && (
                      <span style={{ color: '#aaaaaa' }}>→ {j.simpler}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title suggestion */}
          {enhancement.titleSuggestion && (
            <div style={{ background: '#f9f9f8', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaaaaa', marginBottom: '6px' }}>
                {t.titleSuggestion}
              </div>
              <p style={{ fontSize: '14px', color: '#111111', lineHeight: 1.6, margin: 0 }}>
                {enhancement.titleSuggestion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer button */}
      <button
        onClick={onEnhance}
        disabled={isEnhancing}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px 20px',
          background: '#f0f9ff',
          border: 'none',
          borderTop: '1px solid #bae6fd',
          color: '#0369a1',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isEnhancing ? 'not-allowed' : 'pointer',
          opacity: isEnhancing ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {isEnhancing ? (
          <span style={{
            display: 'inline-block', width: '13px', height: '13px',
            border: '2px solid rgba(3,105,161,0.25)', borderTopColor: '#0369a1',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <span style={{ fontSize: '14px' }}>✦</span>
        )}
        {isEnhancing ? t.enhancing : '✦ Enhance with AI'}
      </button>
    </div>
  );
};

export default SuggestionCard;
