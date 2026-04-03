import type { SentenceAnalysis } from '@/lib/analyzer';
import { type Lang, translations } from '@/lib/i18n';

interface AnnotatedTextProps {
  sentences: SentenceAnalysis[];
  lang: Lang;
}

type Severity = 'red' | 'amber' | 'blue';

function getSeverity(s: SentenceAnalysis): Severity {
  if (s.isLong || s.hasPassiveVoice) return 'red';
  if (s.complexWords.length > 0) return 'amber';
  return 'blue';
}

const BORDER_COLOR: Record<Severity, string> = {
  red:   '#dc2626',
  amber: '#d97706',
  blue:  '#0891b2',
};

const PILL: Record<Severity, { bg: string; color: string }> = {
  red:   { bg: 'rgba(220,38,38,0.10)',  color: '#dc2626' },
  amber: { bg: 'rgba(217,119,6,0.10)',  color: '#d97706' },
  blue:  { bg: 'rgba(8,145,178,0.10)',  color: '#0891b2' },
};

interface Tag { label: string; severity: Severity }

function getTags(s: SentenceAnalysis, t: (typeof translations)['en']): Tag[] {
  const tags: Tag[] = [];
  if (s.isLong)          tags.push({ label: `${t.longSentence} · ${s.wordCount}w`, severity: 'red' });
  if (s.hasPassiveVoice) tags.push({ label: t.passiveVoiceLabel, severity: 'red' });
  for (const w of s.complexWords) tags.push({ label: w.toLowerCase(), severity: 'amber' });
  return tags;
}

function SentenceRow({ sentence, lang }: { sentence: SentenceAnalysis; lang: Lang }) {
  const t = translations[lang];
  const severity = getSeverity(sentence);
  const tags = getTags(sentence, t);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e8e8e5',
      borderRadius: '10px',
      borderLeft: `4px solid ${BORDER_COLOR[severity]}`,
      padding: '14px 16px',
    }}>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#111111', margin: 0 }}>
        {sentence.text}
      </p>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 500,
              background: PILL[tag.severity].bg,
              color: PILL[tag.severity].color,
            }}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const LEGEND: { severity: Severity; label: (t: (typeof translations)['en']) => string }[] = [
  { severity: 'red',   label: (t) => `${t.legendLong} / ${t.legendPassive}` },
  { severity: 'amber', label: (t) => t.legendComplex },
  { severity: 'blue',  label: (t) => t.legendClean },
];

const AnnotatedText = ({ sentences, lang }: AnnotatedTextProps) => {
  const t = translations[lang];

  return (
    <div>
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '10px' }}>
        {t.annotatedText}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sentences.map((s) => (
          <SentenceRow key={s.index} sentence={s} lang={lang} />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
        {LEGEND.map(({ severity, label }) => (
          <span key={severity} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#aaaaaa' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: BORDER_COLOR[severity], flexShrink: 0 }} />
            {label(t)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnotatedText;
