import { type Lang, translations } from '@/lib/i18n';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  lang: Lang;
}

const TextInput = ({ value, onChange, onAnalyze, isAnalyzing, lang }: TextInputProps) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.placeholder}
        className="w-full min-h-[200px] bg-secondary border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:border-primary transition-colors"
      />
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !value.trim()}
        className="self-start px-6 py-2 bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-wider uppercase border border-primary hover:bg-transparent hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? t.analyzing : t.analyze}
      </button>
    </div>
  );
};

export default TextInput;
