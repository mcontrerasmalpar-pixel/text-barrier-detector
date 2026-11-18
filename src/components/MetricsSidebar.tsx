import type { AnalysisResult } from '@maky/text-barrier-core';
import { getLevelColor, getNextLevel } from '@maky/text-barrier-core';
import {
  type Lang,
  translations,
  localizeBandAudience,
  localizeBandLabel,
  localizeEaseLabel,
  localizeTip,
} from '@/lib/i18n';

interface MetricsSidebarProps {
  result: AnalysisResult;
  lang: Lang;
}

function scoreColor(value: number, thresholds: [number, number]): string {
  if (value >= thresholds[1]) return '#0891b2';
  if (value >= thresholds[0]) return '#d97706';
  return '#dc2626';
}

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
    <div style={{ background: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '10px', padding: '14px 16px' }}>
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
  const lv = result.level;
  const levelColor = getLevelColor(lv.level);
  const nextLevel = getNextLevel(lv.level);

  const easeLabel =
    result.formulaName === 'Fernández-Huerta'
      ? t.formulaFernandezHuerta
      : t.formulaFlesch;

  const cards: CardProps[] = [
    {
      label: easeLabel,
      value: result.fleschScore,
      subtitle: localizeEaseLabel(result.fleschLabel ?? '', lang),
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
    {
      label: t.complexWords,
      value: result.complexWordCount,
      subtitle: t.detected,
      color: scoreColorInverse(result.complexWordCount, [2, 6]),
    },
    {
      label: t.structure,
      value: result.structureScore,
      subtitle: t.outOf100,
      color: scoreColor(result.structureScore, [40, 70]),
    },
  ];

  return (
    <div>
      {/* Readability Band banner (CEFR-inspired, not a certification) */}
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '8px' }}>
        {t.readabilityBand}
      </div>
      <div style={{
        background: '#ffffff',
        border: `1.5px solid ${levelColor}`,
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        {/* Badge */}
        <div style={{
          background: levelColor,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '22px',
          borderRadius: '8px',
          minWidth: '54px',
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}>
          {lv.level}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
              {localizeBandLabel(lv.label, lang)}
            </span>
            <span style={{
              fontSize: '11px',
              background: `${levelColor}18`,
              color: levelColor,
              border: `1px solid ${levelColor}40`,
              borderRadius: '20px',
              padding: '2px 8px',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              {t.levelScore}: {lv.score}/100
            </span>
            <span style={{
              fontSize: '11px',
              background: '#f4f4f2',
              color: '#555555',
              border: '1px solid #e5e5e2',
              borderRadius: '20px',
              padding: '2px 8px',
              fontWeight: 500,
            }}>
              {t.overallScore}: {result.overallScore}/100
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px', lineHeight: 1.4 }}>
            {localizeBandAudience(lv.level, lv.audience, lang)}
          </div>
          <div style={{ fontSize: '11px', color: '#888888', marginTop: '3px', fontStyle: 'italic' }}>
            {t.readabilityBandNote}
          </div>
          {nextLevel && lv.tips[0] && (
            <div style={{ fontSize: '11px', color: '#777777', marginTop: '6px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ color: levelColor, fontWeight: 700, flexShrink: 0 }}>↑ {nextLevel}:</span>
              <span>{localizeTip(lv.tips[0], lang)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '10px' }}>
        {t.metrics}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

export default MetricsSidebar;
