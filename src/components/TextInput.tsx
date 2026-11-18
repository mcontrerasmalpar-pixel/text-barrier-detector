import { type Lang, SAMPLE_TEXTS, translations } from '@/lib/i18n';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onSelectSample?: (sampleText: string) => void;
  isAnalyzing: boolean;
  lang: Lang;
}

const wordCount = (text: string) =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

const TextInput = ({ value, onChange, onAnalyze, onSelectSample, isAnalyzing, lang }: TextInputProps) => {
  const t = translations[lang];
  const words = wordCount(value);
  const samples = SAMPLE_TEXTS[lang];

  const handleSampleClick = (sampleText: string) => {
    if (onSelectSample) {
      onSelectSample(sampleText);
    } else {
      onChange(sampleText);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: '140px',
            padding: '18px 20px',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            display: 'block',
            fontFamily: 'inherit',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#111111',
            background: 'transparent',
          }}
          className="placeholder:text-[#bbbbbb]"
        />

        {/* Footer row inside card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid #e8e8e5',
            background: '#fafaf9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#888888' }}>
              {words} {words === 1 ? t.word : t.words}
            </span>
            {value.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onChange('')}
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t.clear}
              </button>
            )}
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !value.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              background: '#0891b2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isAnalyzing || !value.trim() ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing || !value.trim() ? 0.45 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isAnalyzing && (
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            )}
            {isAnalyzing ? t.analyzing : `${t.analyze} →`}
          </button>
        </div>
      </div>

      {/* Quick sample pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#888888' }}>{t.trySample}</span>
        <button
          type="button"
          onClick={() => handleSampleClick(samples.barriers)}
          style={{
            fontSize: '12px',
            color: '#0891b2',
            background: 'rgba(8,145,178,0.08)',
            border: '1px solid rgba(8,145,178,0.25)',
            borderRadius: '999px',
            padding: '3px 10px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {t.sampleBarriersLabel}
        </button>
        <button
          type="button"
          onClick={() => handleSampleClick(samples.structured)}
          style={{
            fontSize: '12px',
            color: '#0891b2',
            background: 'rgba(8,145,178,0.08)',
            border: '1px solid rgba(8,145,178,0.25)',
            borderRadius: '999px',
            padding: '3px 10px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {t.sampleStructuredLabel}
        </button>
      </div>
    </div>
  );
};

export default TextInput;
