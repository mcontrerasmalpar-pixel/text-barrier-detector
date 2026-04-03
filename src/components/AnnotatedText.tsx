import type { SentenceAnalysis } from '@/lib/analyzer';
import { countSyllables } from '@/lib/syllables';
import { type Lang, translations } from '@/lib/i18n';

interface AnnotatedTextProps {
  sentences: SentenceAnalysis[];
  lang: Lang;
}

type Category = 'long' | 'passive' | 'complex' | 'clean';

function getCategory(sentence: SentenceAnalysis): Category {
  if (sentence.isLong) return 'long';
  if (sentence.hasPassiveVoice) return 'passive';
  if (sentence.complexWords.length > 0) return 'complex';
  return 'clean';
}

const CATEGORY_STYLES: Record<Category, { bg: string; border: string }> = {
  long:    { bg: 'rgba(220,38,38,0.12)',  border: 'hsl(0 70% 50%)' },
  passive: { bg: 'rgba(234,88,12,0.12)',  border: 'hsl(25 95% 50%)' },
  complex: { bg: 'rgba(202,138,4,0.12)',  border: 'hsl(45 100% 45%)' },
  clean:   { bg: 'rgba(22,163,74,0.10)',  border: 'hsl(145 70% 45%)' },
};

function buildTooltip(sentence: SentenceAnalysis, t: (typeof translations)['en']): string {
  const parts: string[] = [];
  if (sentence.isLong) parts.push(`${t.longSentence} (${sentence.wordCount} ${t.words}) — ${t.longSentenceTip}`);
  if (sentence.hasPassiveVoice) parts.push(`${t.passiveVoiceLabel} — ${t.passiveVoiceTip}`);
  return parts.join(' | ');
}

function renderWords(sentence: SentenceAnalysis, t: (typeof translations)['en']) {
  const complexSet = new Set(sentence.complexWords.map(w => w.toLowerCase()));
  return sentence.text.split(/(\s+)/).map((word, wi) => {
    const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (complexSet.has(clean)) {
      return (
        <span key={wi} className="custom-tooltip" style={{ textDecoration: 'underline', textDecorationColor: 'hsl(45 100% 55%)', textUnderlineOffset: '3px' }}>
          {word}
          <span className="tooltip-content">
            {t.complexWord}: "{clean}" ({countSyllables(clean)} syl.) — {t.complexWordTip}
          </span>
        </span>
      );
    }
    return <span key={wi}>{word}</span>;
  });
}

function SentencePill({ sentence, lang }: { sentence: SentenceAnalysis; lang: Lang }) {
  const t = translations[lang];
  const category = getCategory(sentence);
  const { bg, border } = CATEGORY_STYLES[category];
  const tooltip = buildTooltip(sentence, t);

  return (
    <div
      className={`highlight-animate custom-tooltip`}
      style={{
        background: bg,
        borderLeft: `3px solid ${border}`,
        padding: '6px 10px',
        marginBottom: '6px',
        animationDelay: `${sentence.index * 0.04}s`,
      }}
    >
      <span className="font-mono text-sm leading-relaxed text-foreground">
        {renderWords(sentence, t)}
      </span>
      {tooltip && <span className="tooltip-content">{tooltip}</span>}
    </div>
  );
}

const LEGEND_ITEMS: { category: Category; key: 'legendLong' | 'legendPassive' | 'legendComplex' | 'legendClean' }[] = [
  { category: 'long',    key: 'legendLong' },
  { category: 'passive', key: 'legendPassive' },
  { category: 'complex', key: 'legendComplex' },
  { category: 'clean',   key: 'legendClean' },
];

const AnnotatedText = ({ sentences, lang }: AnnotatedTextProps) => {
  const t = translations[lang];

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-primary tracking-widest uppercase font-sans">
          {t.annotatedText}
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND_ITEMS.map(({ category, key }) => (
            <span key={category} className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  background: CATEGORY_STYLES[category].bg,
                  borderLeft: `3px solid ${CATEGORY_STYLES[category].border}`,
                  flexShrink: 0,
                }}
              />
              {t[key]}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-secondary border border-border p-4 space-y-0">
        {sentences.map(s => (
          <SentencePill key={s.index} sentence={s} lang={lang} />
        ))}
      </div>
    </div>
  );
};

export default AnnotatedText;
