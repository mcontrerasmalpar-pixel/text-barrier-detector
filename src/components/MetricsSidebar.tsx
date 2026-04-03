import type { AnalysisResult } from '@/lib/analyzer';
import { type Lang, translations } from '@/lib/i18n';

interface MetricsSidebarProps {
  result: AnalysisResult;
  lang: Lang;
}

function scoreColor(value: number, thresholds: [number, number]): string {
  if (value >= thresholds[1]) return '#0891b2';
  if (value >= thresholds[0]) return '#d97706';
  return '#dc2626';
}

// For metrics where lower is better, invert the value before coloring
function scoreColorInverse(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return '#0891b2';
  if (value <= thresholds[1]) return '#d97706';
  return '#dc2626';
}

interface CardProps {
  label: string;
  value: number | string;
  subtitle: string;
  color: string;
}

function MetricCard({ label, value, subtitle, color }: CardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e8e8e5',
        borderRadius: '10px',
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaaaaa', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 600, color, lineHeight: 1.1, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: '#aaaaaa' }}>
        {subtitle}
      </div>
    </div>
  );
}

const MetricsSidebar = ({ result, lang }: MetricsSidebarProps) => {
  const t = translations[lang];

  const cards: CardProps[] = [
    {
      label: t.fleschReading,
      value: result.fleschScore,
      subtitle: result.fleschLabel ?? '',
      color: scoreColor(result.fleschScore, [40, 70]),
    },
    {
      label: t.gradeLevel,
      value: result.gradeLevel,
      subtitle: t.grade,
      color: scoreColorInverse(result.gradeLevel, [7, 11]),
    },
    {
      label: t.avgSentenceLen,
      value: result.avgSentenceLength,
      subtitle: t.words,
      color: scoreColorInverse(result.avgSentenceLength, [15, 20]),
    },
    {
      label: t.passiveVoice,
      value: result.passiveCount,
      subtitle: t.instances,
      color: scoreColorInverse(result.passiveCount, [2, 5]),
    },
  ];

  return (
    <div>
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '10px' }}>
        {t.metrics}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

export default MetricsSidebar;
