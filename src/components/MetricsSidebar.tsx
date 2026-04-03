import type { AnalysisResult } from '@/lib/analyzer';
import { type Lang, translations } from '@/lib/i18n';

interface MetricsSidebarProps {
  result: AnalysisResult;
  lang: Lang;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-gauge-green' : score >= 50 ? 'text-gauge-amber' : 'text-gauge-red';
  const borderColor = score >= 80 ? 'border-gauge-green' : score >= 50 ? 'border-gauge-amber' : 'border-gauge-red';
  const bgColor = score >= 80 ? 'bg-gauge-green/10' : score >= 50 ? 'bg-gauge-amber/10' : 'bg-gauge-red/10';

  return (
    <div className={`flex items-center justify-center w-24 h-24 border-2 ${borderColor} ${bgColor} mx-auto`}>
      <span className={`text-3xl font-mono font-bold ${color}`}>{score}</span>
    </div>
  );
}

function FleschGauge({ score, label, sub }: { score: number; label: string; sub?: string }) {
  const r = 46;
  const circumference = Math.PI * r;
  const filled = Math.min(Math.max(score, 0), 100) / 100 * circumference;
  const offset = circumference - filled;
  const strokeColor =
    score >= 60 ? 'hsl(187 100% 45%)' :
    score >= 30 ? 'hsl(45 100% 48%)' :
                  'hsl(0 70% 50%)';

  return (
    <div className="border border-border bg-secondary p-3 col-span-2">
      <div className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">{label}</div>
      <svg viewBox="0 0 120 68" className="w-full max-w-[160px] mx-auto block">
        {/* Track arc */}
        <path
          d="M 11 62 A 46 46 0 0 1 109 62"
          fill="none"
          stroke="hsl(0 0% 20%)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Fill arc */}
        <path
          d="M 11 62 A 46 46 0 0 1 109 62"
          fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
        {/* Score */}
        <text
          x="60" y="57"
          textAnchor="middle"
          fill="hsl(0 0% 90%)"
          fontSize="18"
          fontWeight="bold"
          fontFamily="'JetBrains Mono', monospace"
        >
          {score}
        </text>
      </svg>
      {sub && <div className="text-xs text-muted-foreground font-sans mt-0.5 text-center">{sub}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border bg-secondary p-3">
      <div className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">{label}</div>
      <div className="text-lg font-mono font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground font-sans mt-0.5">{sub}</div>}
    </div>
  );
}

const MetricsSidebar = ({ result, lang }: MetricsSidebarProps) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-primary tracking-widest uppercase font-sans">
        {t.metrics}
      </h2>

      <div className="border border-border bg-secondary p-4 text-center">
        <div className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-3">
          {t.overallScore}
        </div>
        <ScoreGauge score={result.overallScore} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FleschGauge
          score={result.fleschScore}
          label={t.fleschReading}
          sub={result.fleschLabel}
        />
        <MetricCard
          label={t.gradeLevel}
          value={result.gradeLevel}
          sub={t.grade}
        />
        <MetricCard
          label={t.avgSentenceLen}
          value={result.avgSentenceLength}
          sub={t.words}
        />
        <MetricCard
          label={t.passiveVoice}
          value={result.passiveCount}
          sub={t.instances}
        />
        <MetricCard
          label={t.complexWords}
          value={result.complexWordCount}
          sub={t.detected}
        />
        <MetricCard
          label={t.structure}
          value={result.structureScore}
          sub="/100"
        />
      </div>

      {result.suggestions.length > 0 && (
        <div className="border border-border bg-secondary p-3">
          <div className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2">
            {t.suggestions}
          </div>
          <ul className="space-y-1.5">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-foreground font-sans flex gap-2">
                <span className="text-primary font-mono">›</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MetricsSidebar;
