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
    // Small timeout to let UI update
    setTimeout(() => {
      const r = analyzeText(text);
      setResult(r);
      setIsAnalyzing(false);
    }, 100);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-primary tracking-[0.3em]">{t.title}</h1>
          <p className="text-xs text-muted-foreground font-sans">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex border border-border">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('es')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                lang === 'es' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ES
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {!result && (
        <div className="px-4 pt-12 pb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground leading-tight mb-3">
            Decode your text.{' '}
            <span className="text-primary">Make it accessible.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Detect readability barriers instantly — long sentences, passive voice, complex words.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Flesch score', 'Sentence heatmap', 'AI rewrites', 'No login needed'].map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 text-xs border border-primary/30 text-primary bg-primary/5"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className="flex-1 p-4 space-y-4 min-w-0">
          <TextInput
            value={text}
            onChange={setText}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            lang={lang}
          />

          {result && (
            <>
              <AnnotatedText sentences={result.sentences} lang={lang} />

              <div className="flex justify-end">
                <button
                  onClick={() => generatePDF(result, enhancement)}
                  className="px-4 py-2 text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  ↓ Download Report
                </button>
              </div>

              <SuggestionCard
                enhancement={enhancement}
                isEnhancing={isEnhancing}
                onEnhance={handleEnhance}
                lang={lang}
              />
            </>
          )}

          {!result && (
            <div className="text-center py-16 text-muted-foreground text-sm font-sans">
              {t.noResults}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {result && (
          <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border p-4 shrink-0">
            <MetricsSidebar result={result} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
