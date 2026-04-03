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
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your text here... Try academic papers, legal docs, emails."
        className="w-full min-h-[280px] bg-card border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:border-primary transition-colors"
      />

      {/* Footer row: word count left, button right */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {words} {words === 1 ? 'word' : 'words'}
        </span>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !value.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnalyzing && (
            <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          )}
          {isAnalyzing ? t.analyzing : t.analyze}
        </button>
      </div>
    </div>
  );
};

export default TextInput;
