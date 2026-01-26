import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Leaf, Activity, Info, ImageOff } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { formatConfidence } from '../utils/domain';
import type { PredictResponse } from '../types';
import { Button } from './ui/Button';

interface AnalysisResultProps {
  result: PredictResponse;
  onClear: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // 1) NON_CROP STATE (authoritative)
  if (result.crop.label === "NON_CROP") {
    return (
      <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
        <div className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg bg-gradient-to-br from-slate-50 to-white border-slate-200 dark:from-slate-950/50 dark:to-background dark:border-slate-800">
          <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-300/30 dark:bg-slate-700/30 blur-2xl rounded-full" />
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-full border-2 border-slate-200/50 dark:border-slate-700/50">
                <ImageOff className="w-12 h-12 text-slate-600 dark:text-slate-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                No plant detected
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                The analysis indicates this image does not contain a supported crop leaf. Please upload a clear photo of a plant.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={onClear}
              className="w-full sm:w-auto mt-2 hover:bg-primary hover:text-white transition-colors"
            >
              Upload a Different Image
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Backend is authoritative: labels are already sanitized.
  const cropLabel = result.crop.label;

  // 2) HEALTHY STATE (authoritative)
  if (result.health.status === 'healthy') {
    return (
      <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
        <div className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg bg-gradient-to-br from-emerald-50 to-white border-emerald-200 dark:from-emerald-950/20 dark:to-background dark:border-emerald-800">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
            <div className="space-y-6 flex-1 w-full">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-md backdrop-blur-sm bg-emerald-100/80 text-emerald-700 border-emerald-300 shadow-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <span>Plant appears healthy</span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Crop identified</p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground leading-tight">
                  {cropLabel}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500/20 dark:border-emerald-700/40 shadow-sm backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatConfidence(result.health.probability)}
                  </span>
                  <span className="text-xs text-muted-foreground">confidence</span>
                </div>
                {result.processing_time_ms && (
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-blue-500/20 dark:border-blue-700/40 shadow-sm backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {result.processing_time_ms.toFixed(0)}ms
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative group shrink-0 self-center sm:self-start">
              <div className="absolute inset-0 blur-3xl opacity-30 rounded-3xl bg-emerald-400" />
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-3 rounded-3xl shadow-xl border-2 border-white/20 dark:border-white/10 backdrop-blur-sm rotate-2 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105">
                <div className="w-36 h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Leaf className="w-16 h-16 text-emerald-500/40 dark:text-emerald-400/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border-2 shadow-sm p-6 space-y-6 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-primary" />
                Confidence Metrics
              </h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-5">
              <ProgressBar
                label="Health Detection"
                value={result.health.probability}
                colorClass="bg-emerald-500"
              />
              <ProgressBar
                label="Crop Identification"
                value={result.crop.confidence}
                colorClass="bg-blue-500"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-4 dark:border-slate-800">
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-full">
              <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Analyze another sample</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs mx-auto leading-relaxed">
                Field verification is recommended for production crops.
              </p>
              <Button variant="outline" onClick={onClear} className="w-full hover:bg-primary hover:text-white transition-colors">
                Analyze New Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3) DISEASED STATE (authoritative): show disease only if status=diseased AND disease != null
  if (result.health.status === 'diseased' && result.disease) {
    const diseaseLabel = result.disease.label;

    return (
      <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
        <div className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg bg-gradient-to-br from-amber-50 to-white border-amber-200 dark:from-amber-950/20 dark:to-background dark:border-amber-800">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
            <div className="space-y-6 flex-1 w-full">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-md backdrop-blur-sm bg-amber-100/80 text-amber-700 border-amber-300 shadow-amber-500/20 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700">
                <AlertTriangle className="w-5 h-5" />
                <span>Disease detected</span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Crop identified</p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground leading-tight">
                  {cropLabel}
                </h2>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Disease detected</p>
                <h3 className="text-2xl font-semibold text-foreground">
                  {diseaseLabel}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Confidence: {formatConfidence(result.disease.confidence)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-500/20 dark:border-amber-700/40 shadow-sm backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatConfidence(result.health.probability)}
                  </span>
                  <span className="text-xs text-muted-foreground">confidence</span>
                </div>
                {result.processing_time_ms && (
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-blue-500/20 dark:border-blue-700/40 shadow-sm backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {result.processing_time_ms.toFixed(0)}ms
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative group shrink-0 self-center sm:self-start">
              <div className="absolute inset-0 blur-3xl opacity-30 rounded-3xl bg-amber-400" />
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-3 rounded-3xl shadow-xl border-2 border-white/20 dark:border-white/10 backdrop-blur-sm rotate-2 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105">
                <div className="w-36 h-36 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Leaf className="w-16 h-16 text-amber-500/40 dark:text-amber-400/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border-2 shadow-sm p-6 space-y-6 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-primary" />
                Confidence Metrics
              </h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-5">
              <ProgressBar
                label="Health Detection"
                value={result.health.probability}
                colorClass="bg-amber-500"
              />
              <ProgressBar
                label="Crop Identification"
                value={result.crop.confidence}
                colorClass="bg-blue-500"
              />
              <ProgressBar
                label="Disease Classification"
                value={result.disease.confidence}
                colorClass="bg-red-500"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-4 dark:border-slate-800">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-full">
              <Leaf className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Analyze another sample</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs mx-auto leading-relaxed">
                Field verification is recommended for production crops.
              </p>
              <Button variant="outline" onClick={onClear} className="w-full hover:bg-primary hover:text-white transition-colors">
                Analyze New Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid/partial backend response: do not show disease.
  return (
    <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
      <div className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg bg-gradient-to-br from-slate-50 to-white border-slate-200 dark:from-slate-950/50 dark:to-background dark:border-slate-800">
        <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Unable to display result
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              The server response was incomplete.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onClear}
            className="w-full sm:w-auto mt-2 hover:bg-primary hover:text-white transition-colors"
          >
            Analyze New Image
          </Button>
        </div>
      </div>
    </div>
  );
};
