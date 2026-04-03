import type { SentenceAnalysis } from '@/lib/analyzer';
import { type Lang, translations } from '@/lib/i18n';

interface AnnotatedTextProps {
  sentences: SentenceAnalysis[];
  lang: Lang;
}

// Red = long OR passive voice | Amber = complex words only | Cyan = clean
type Severity = 'red' | 'amber' | 'cyan';

function getSeverity(s: SentenceAnalysis): Severity {
  if (s.isLong || s.hasPassiveVoice) return 'red';
  if (s.complexWords.length > 0) return 'amber';
  return 'cyan';
}

const BORDER: Record<Severity, string> = {
  red:   'border-l-error',
  amber: 'border-l-warning',
  cyan:  'border-l-primary',
};

const BG: Record<Severity, string> = {
  red:   'bg-error/5',
  amber: 'bg-warning/5',
  cyan:  'bg-primary/5',
};

const PILL_BASE = 'px-2 py-0.5 text-[10px] font-sans rounded-sm';

const PILL: Record<Severity, string> = {
  red:   `${PILL_BASE} bg-error/10 text-error border border-error/20`,
  amber: `${PILL_BASE} bg-warning/10 text-warning border border-warning/20`,
  cyan:  `${PILL_BASE} bg-primary/10 text-primary border border-primary/20`,
};

function getTags(s: SentenceAnalysis, t: (typeof translations)['en']): string[] {
  const tags: string[] = [];
  if (s.isLong) tags.push(`${s.wordCount} ${t.words}`);
  if (s.hasPassiveVoice) tags.push(t.passiveVoiceLabel);
  for (const w of s.complexWords) tags.push(w.toLowerCase());
  return tags;
}

function SentenceRow({ sentence, lang }: { sentence: SentenceAnalysis; lang: Lang }) {
  const t = translations[lang];
  const severity = getSeverity(sentence);
  const tags = getTags(sentence, t);

  return (
    <div
      className={`highlight-animate border-l-4 px-4 py-3 ${BORDER[severity]} ${BG[severity]}`}
      style={{ animationDelay: `${sentence.index * 0.04}s` }}
    >
      <p className="font-mono text-sm leading-relaxed text-foreground">{sentence.text}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span key={tag} className={PILL[severity]}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const LEGEND = [
  { severity: 'red'  as Severity, label: (t: (typeof translations)['en']) => `${t.legendLong} / ${t.legendPassive}` },
  { severity: 'amber' as Severity, label: (t: (typeof translations)['en']) => t.legendComplex },
  { severity: 'cyan'  as Severity, label: (t: (typeof translations)['en']) => t.legendClean },
];

const DOT_COLOR: Record<Severity, string> = {
  red:   'bg-error',
  amber: 'bg-warning',
  cyan:  'bg-primary',
};

const AnnotatedText = ({ sentences, lang }: AnnotatedTextProps) => {
  const t = translations[lang];

  return (
    <div>
      <h2 className="text-sm font-semibold text-primary tracking-widest uppercase font-sans mb-3">
        {t.annotatedText}
      </h2>

      <div className="bg-card border border-border space-y-px">
        {sentences.map((s) => (
          <SentenceRow key={s.index} sentence={s} lang={lang} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 px-1">
        {LEGEND.map(({ severity, label }) => (
          <span key={severity} className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
            <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLOR[severity]}`} />
            {label(t)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnotatedText;
