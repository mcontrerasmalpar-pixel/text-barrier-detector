import type { AnalysisResult } from './analyzer';
import type { ClaudeEnhancement } from './claudeEnhancer';

type Category = 'long' | 'passive' | 'complex' | 'clean';

function sentenceCategory(s: AnalysisResult['sentences'][number]): Category {
  if (s.isLong) return 'long';
  if (s.hasPassiveVoice) return 'passive';
  if (s.complexWords.length > 0) return 'complex';
  return 'clean';
}

const CAT_META: Record<Category, { label: string; color: string; bg: string }> = {
  long:    { label: 'Long sentence',   color: '#dc2626', bg: '#fef2f2' },
  passive: { label: 'Passive voice',   color: '#ea580c', bg: '#fff7ed' },
  complex: { label: 'Complex words',   color: '#ca8a04', bg: '#fefce8' },
  clean:   { label: 'Clean',           color: '#16a34a', bg: '#f0fdf4' },
};

function scoreColor(score: number) {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#ca8a04';
  return '#dc2626';
}

function fleschGaugeSVG(score: number): string {
  const r = 46;
  const circ = Math.PI * r;
  const filled = Math.min(Math.max(score, 0), 100) / 100 * circ;
  const offset = circ - filled;
  const color = score >= 60 ? '#0891b2' : score >= 30 ? '#ca8a04' : '#dc2626';
  return `<svg viewBox="0 0 120 70" width="140" height="82">
    <path d="M 11 62 A 46 46 0 0 1 109 62" fill="none" stroke="#e5e7eb" stroke-width="9" stroke-linecap="round"/>
    <path d="M 11 62 A 46 46 0 0 1 109 62" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${circ} ${circ}" stroke-dashoffset="${offset}"/>
    <text x="60" y="56" text-anchor="middle" fill="#111827" font-size="18" font-weight="bold" font-family="monospace">${score}</text>
  </svg>`;
}

function sentenceRows(result: AnalysisResult): string {
  return result.sentences.map(s => {
    const cat = sentenceCategory(s);
    const { label, color, bg } = CAT_META[cat];
    const truncated = s.text.length > 120 ? s.text.slice(0, 120) + '…' : s.text;
    return `<tr>
      <td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; color:#374151; font-size:12px; line-height:1.5;">${truncated}</td>
      <td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; white-space:nowrap;">
        <span style="display:inline-block; padding:2px 8px; background:${bg}; color:${color}; border:1px solid ${color}40; border-radius:4px; font-size:11px; font-weight:600;">${label}</span>
      </td>
      <td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; text-align:center; font-size:12px; color:#6b7280;">${s.wordCount}</td>
      ${s.complexWords.length > 0
        ? `<td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:11px; color:#ca8a04;">${s.complexWords.slice(0, 5).join(', ')}</td>`
        : `<td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:11px; color:#9ca3af;">—</td>`}
    </tr>`;
  }).join('');
}

function enhancementSection(enhancement: ClaudeEnhancement): string {
  const parts: string[] = [];

  if (enhancement.titleSuggestion) {
    parts.push(`<div style="margin-bottom:16px;">
      <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px;">Suggested Title</div>
      <div style="font-size:14px; color:#111827; font-style:italic;">"${enhancement.titleSuggestion}"</div>
    </div>`);
  }

  if (enhancement.rewrites.length > 0) {
    parts.push(`<div style="margin-bottom:16px;">
      <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;">Suggested Rewrites</div>
      ${enhancement.rewrites.map(rw => `
        <div style="margin-bottom:10px; padding:10px; background:#f9fafb; border-left:3px solid #0891b2;">
          <div style="font-size:11px; color:#9ca3af; text-decoration:line-through; margin-bottom:4px;">${rw.original}</div>
          <div style="font-size:12px; color:#111827; margin-bottom:4px;">${rw.rewrite}</div>
          <div style="font-size:11px; color:#6b7280; font-style:italic;">↳ ${rw.reason}</div>
        </div>
      `).join('')}
    </div>`);
  }

  if (enhancement.jargonValidation.length > 0) {
    parts.push(`<div>
      <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;">Jargon Check</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${enhancement.jargonValidation.map(j => `
          <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-family:monospace;
            background:${j.isJargon ? '#fef2f2' : '#f0fdf4'};
            color:${j.isJargon ? '#dc2626' : '#16a34a'};
            border:1px solid ${j.isJargon ? '#dc262640' : '#16a34a40'};">
            ${j.isJargon ? '✗' : '✓'} ${j.word}${j.simpler ? ` → ${j.simpler}` : ''}
          </span>
        `).join('')}
      </div>
    </div>`);
  }

  return parts.join('');
}

export function generatePDF(result: AnalysisResult, enhancement?: ClaudeEnhancement | null) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Text Barrier Analysis Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; padding: 32px; max-width: 860px; margin: 0 auto; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
    h1 { font-size: 22px; font-family: monospace; letter-spacing: .2em; color: #0891b2; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .1em; color: #6b7280; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    section { margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    th:last-child, td:last-child { text-align: left; }
  </style>
</head>
<body>
  <!-- Header -->
  <section>
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
      <div>
        <h1>TEXT BARRIER DETECTOR</h1>
        <div style="font-size:12px; color:#9ca3af; margin-top:4px;">Accessibility Analysis Report</div>
      </div>
      <div style="text-align:right; font-size:12px; color:#9ca3af; font-family:monospace;">${date}</div>
    </div>
    <div style="height:2px; background:linear-gradient(to right, #0891b2, transparent); margin-top:10px;"></div>
  </section>

  <!-- Scores -->
  <section>
    <h2>Scores</h2>
    <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-start;">

      <!-- Overall -->
      <div style="text-align:center; padding:16px 20px; border:1px solid #e5e7eb; border-radius:6px; min-width:110px;">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;">Overall</div>
        <div style="font-size:40px; font-weight:bold; font-family:monospace; color:${scoreColor(result.overallScore)}; line-height:1;">${result.overallScore}</div>
        <div style="font-size:10px; color:#9ca3af; margin-top:4px;">/100</div>
      </div>

      <!-- Flesch gauge -->
      <div style="text-align:center; padding:16px 20px; border:1px solid #e5e7eb; border-radius:6px;">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px;">Flesch Reading Ease</div>
        ${fleschGaugeSVG(result.fleschScore)}
        <div style="font-size:11px; color:#6b7280; margin-top:2px;">${result.fleschLabel}</div>
      </div>

      <!-- Metric grid -->
      <div style="flex:1; display:grid; grid-template-columns:1fr 1fr; gap:10px; min-width:240px;">
        ${[
          ['Grade Level', result.gradeLevel, 'grade'],
          ['Avg Sentence Length', result.avgSentenceLength, 'words'],
          ['Passive Voice', result.passiveCount, 'instances'],
          ['Complex Words', result.complexWordCount, 'detected'],
          ['Structure Score', result.structureScore, '/100'],
          ['Total Sentences', result.totalSentences, 'sentences'],
        ].map(([label, value, sub]) => `
          <div style="padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:4px;">
            <div style="font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; margin-bottom:2px;">${label}</div>
            <div style="font-size:20px; font-weight:bold; font-family:monospace; color:#111827;">${value}</div>
            <div style="font-size:10px; color:#9ca3af;">${sub}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Suggestions -->
  ${result.suggestions.length > 0 ? `<section>
    <h2>Top Suggestions</h2>
    <ul style="list-style:none; space-y:6px;">
      ${result.suggestions.map(s => `
        <li style="display:flex; gap:8px; margin-bottom:8px; font-size:13px; color:#374151;">
          <span style="color:#0891b2; font-family:monospace; flex-shrink:0;">›</span>
          ${s}
        </li>
      `).join('')}
    </ul>
  </section>` : ''}

  <!-- Sentence Breakdown -->
  <section>
    <h2>Sentence Breakdown (${result.totalSentences} sentences)</h2>
    <div style="margin-bottom:10px; display:flex; gap:10px; flex-wrap:wrap;">
      ${Object.entries(CAT_META).map(([, { label, color, bg }]) => `
        <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; color:#6b7280;">
          <span style="width:10px; height:10px; border-radius:2px; background:${bg}; border:2px solid ${color}; display:inline-block;"></span>
          ${label}
        </span>
      `).join('')}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:55%;">Sentence</th>
          <th>Category</th>
          <th style="text-align:center;">Words</th>
          <th>Complex Words</th>
        </tr>
      </thead>
      <tbody>${sentenceRows(result)}</tbody>
    </table>
  </section>

  <!-- AI Enhancements -->
  ${enhancement ? `<section>
    <h2>AI Enhancements</h2>
    ${enhancementSection(enhancement)}
  </section>` : ''}

  <!-- Print button -->
  <div class="no-print" style="margin-top:24px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 28px; background:#0891b2; color:#fff; border:none; border-radius:4px; font-size:14px; cursor:pointer; font-family:monospace; letter-spacing:.05em;">
      Save as PDF
    </button>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
