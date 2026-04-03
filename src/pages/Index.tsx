import { useState, useCallback } from 'react';
import TextInput from '@/components/TextInput';
import AnnotatedText from '@/components/AnnotatedText';
import MetricsSidebar from '@/components/MetricsSidebar';
import SuggestionCard from '@/components/SuggestionCard';
import { analyzeText, type AnalysisResult } from '@/lib/analyzer';
import { enhanceWithClaude, type ClaudeEnhancement } from '@/lib/claudeEnhancer';
import { generatePDF } from '@/lib/generatePDF';
import { type Lang, translations } from '@/lib/i18n';

const Index = () => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [enhancement, setEnhancement] = useState<ClaudeEnhancement | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const t = translations[lang];

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setEnhancement(null);
    setTimeout(() => {
      try {
        const r = analyzeText(text);
        setResult(r);
      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 50);
  }, [text]);

  const handleEnhance = useCallback(async () => {
    if (!result) return;
    setIsEnhancing(true);
    try {
      const e = await enhanceWithClaude(text, result);
      setEnhancement(e);
    } catch (err) {
      console.error('Claude enhancement failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  }, [result, text]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9f9f8',
      backgroundImage: 'radial-gradient(circle, #d1d1ce 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      {/* Header — full width, white, 1px bottom border + subtle cyan accent line */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #e8e8e5', boxShadow: 'inset 0 -2px 0 rgba(8,145,178,0.15)' }}>
        <div className="max-w-[680px] mx-auto px-4 h-12 flex items-center justify-between">
          {/* Left: icon + title + beta badge */}
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 bg-primary rounded-sm shrink-0" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#111111', lineHeight: 1 }}>
              Text Barrier Detector
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary/10 text-primary leading-none">
              Beta
            </span>
          </div>

          {/* Right: EN/ES toggle */}
          <div className="flex items-center border border-[#e8e8e5] rounded overflow-hidden text-xs font-sans">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${
                lang === 'en'
                  ? 'bg-primary text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#f9f9f8]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('es')}
              className={`px-3 py-1.5 border-l border-[#e8e8e5] transition-colors ${
                lang === 'es'
                  ? 'bg-primary text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#f9f9f8]'
              }`}
            >
              ES
            </button>
          </div>
        </div>
      </header>

      {/* Centered content — max-width 680px, anchored with top padding */}
      <div className="max-w-[680px] mx-auto px-4 space-y-6" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        {/* Hero */}
        {!result && (
          <div style={{ marginBottom: '32px', paddingTop: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111111', lineHeight: 1.3, marginBottom: '10px' }}>
              Make your writing more accessible
            </h2>
            <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.7 }}>
              Paste any text to detect readability issues and get AI-powered suggestions to fix them.
            </p>
          </div>
        )}

        <TextInput
          value={text}
          onChange={setText}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          lang={lang}
        />

        {result && (
          <>
            <MetricsSidebar result={result} lang={lang} />

            <AnnotatedText sentences={result.sentences} lang={lang} />

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '12px' }}>
                  {t.suggestions}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.suggestions.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#444444', lineHeight: 1.6 }}>
                      <span style={{ color: '#0891b2', fontWeight: 600, flexShrink: 0 }}>›</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <SuggestionCard
              enhancement={enhancement}
              isEnhancing={isEnhancing}
              onEnhance={handleEnhance}
              lang={lang}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => generatePDF(result, enhancement)}
                style={{ fontSize: '12px', color: '#aaaaaa', border: '1px solid #e8e8e5', borderRadius: '6px', padding: '6px 14px', background: 'transparent', cursor: 'pointer' }}
              >
                ↓ Download Report
              </button>
            </div>
          </>
        )}

        {!result && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t.noResults}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
