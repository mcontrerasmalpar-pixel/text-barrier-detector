import { type Lang, translations } from '@/lib/i18n';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  lang: Lang;
}

const wordCount = (text: string) =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

const TextInput = ({ value, onChange, onAnalyze, isAnalyzing, lang }: TextInputProps) => {
  const t = translations[lang];
  const words = wordCount(value);

  return (
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
        placeholder="Paste your text here... Try academic papers, legal docs, emails."
        style={{
          width: '100%',
          height: '140px',
          padding: '18px 20px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
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
        <span style={{ fontSize: '12px', color: '#aaaaaa' }}>
          {words} {words === 1 ? 'word' : 'words'}
        </span>

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
            cursor: 'pointer',
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
          {isAnalyzing ? t.analyzing : 'Analyze →'}
        </button>
      </div>
    </div>
  );
};

export default TextInput;
