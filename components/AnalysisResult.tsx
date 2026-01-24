import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Leaf, Activity, Info, ImageOff } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { isPlantHealthy, getActiveDisease, formatConfidence, UI_MIN_CROP_CONFIDENCE } from '../utils/domain';
import type { PredictResponse } from '../types';
import { MetadataLookup, isKnownCrop, hasTrainedCropMetadata } from '../utils/metadata';
import { Button } from './ui/Button';

interface AnalysisResultProps {
  result: PredictResponse;
  onClear: () => void;
  metadataLookup?: MetadataLookup;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  result, 
  onClear,
  metadataLookup 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // TWO-STAGE DOMAIN VALIDATION GUARD (SAFE FALLBACK)
  
  const cropLabel = result.crop?.label;
  const cropConfidence = result.crop?.confidence ?? 0;

  // CHECK 1: Is metadata available to perform validation?
  // If not, we "fail open" (allow logic to proceed based on confidence only)
  // This prevents bricking the UI if metadata fails to load.
  const metadataReady = hasTrainedCropMetadata();

  // CHECK 2: Primary Domain Gate
  // If metadata is ready, we strictly enforce the whitelist.
  // If metadata is NOT ready, we assume true (fallback).
  const isTrained = metadataReady
    ? isKnownCrop(cropLabel)
    : true; 

  // CHECK 3: Secondary Confidence Gate
  // Only matters if we haven't already blocked it via domain check.
  const hasEnoughConfidence = cropConfidence >= UI_MIN_CROP_CONFIDENCE;

  // FINAL DECISION - Hard Block
  // We block if:
  // A) Metadata is ready AND it's not a trained crop (Domain Block)
  // OR
  // B) Confidence is too low (Quality Block)
  const isUnsupportedImage = (!isTrained && metadataReady) || !hasEnoughConfidence;

  // AMBIGUITY DETECTION
  // For predictions that pass validation but have borderline confidence.
  // Real crops typically score ~1.00, non-crops ~0.96
  // This threshold creates a narrow band where we show a disclaimer instead of blocking.
  const isAmbiguousPrediction = cropConfidence < 0.98;

  // UNSUPPORTED IMAGE STATE - Full replacement, no degraded results
  if (isUnsupportedImage) {
    return (
      <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
        <div className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg bg-gradient-to-br from-slate-50 to-white border-slate-200 dark:from-slate-950/50 dark:to-background dark:border-slate-800">
          <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-300/30 dark:bg-slate-700/30 blur-2xl rounded-full" />
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-full border-2 border-slate-200/50 dark:border-slate-700/50">
                <ImageOff className="w-12 h-12 text-slate-600 dark:text-slate-400" />
              </div>
            </div>

            {/* Primary Message */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                This image does not appear to be a supported crop.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                This model is trained only on specific crop images. Please upload a clear photo of a supported plant leaf.
              </p>
            </div>

            {/* Helper Examples */}
            <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 w-full">
              <p className="text-sm font-semibold text-foreground mb-2">Supported crops include:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tomato leaf, potato leaf, pepper leaf, and similar agricultural crops.
              </p>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Avoid screenshots, webpages, people, or non-plant objects.
              </p>
            </div>

            {/* Action Button */}
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

  // NORMAL FLOW - Valid crop prediction
  // Only reached if guard passes.
  
  const healthy = isPlantHealthy(result.health.label);
  const activeDisease = getActiveDisease(result);
  
  // Get enriched display names via metadata lookup (with fallback)
  const cropInfo = metadataLookup 
    ? metadataLookup.getCropInfo(result.crop.label)
    : { displayName: result.crop.label.replace(/_/g, ' ') };
  
  const diseaseInfo = activeDisease && metadataLookup
    ? metadataLookup.getDiseaseInfo(activeDisease.label)
    : activeDisease 
      ? { displayName: activeDisease.label.replace(/_/g, ' ') }
      : null;

  return (
    <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
      {/* Primary Status Card */}
      <div className={`
        relative overflow-hidden rounded-3xl border-2 p-8 shadow-lg
        ${
          healthy 
            ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 dark:from-emerald-950/20 dark:to-background dark:border-emerald-800' 
            : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 dark:from-amber-950/20 dark:to-background dark:border-amber-800'
        }
      `}>
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
          <div className="space-y-6 flex-1 w-full">
            {/* Health Status Pill - Enhanced */}
            <div className={`
              inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-md backdrop-blur-sm
              ${
                healthy 
                  ? 'bg-emerald-100/80 text-emerald-700 border-emerald-300 shadow-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' 
                  : 'bg-amber-100/80 text-amber-700 border-amber-300 shadow-amber-500/20 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
              }
            `}>
              {healthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>Health status: {healthy ? "Healthy" : "Disease detected"}</span>
            </div>
            
            {/* Crop Name as Primary Headline - Enhanced Typography */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Crop identified</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground leading-tight">
                {cropInfo.displayName}
              </h2>
              
              {/* AMBIGUITY DISCLAIMER - Shown for borderline confidence */}
              {isAmbiguousPrediction && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  This result may be inaccurate if the image is not a clear crop leaf.
                </p>
              )}
              
              {cropInfo.description && (
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-md">
                  {cropInfo.description}
                </p>
              )}
            </div>
            
            {/* Disease Name (Conditional - only when diseased) */}
            {!healthy && diseaseInfo && (
              <div className="pt-3 border-t border-black/5 dark:border-white/5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Disease detected</p>
                <h3 className="text-2xl font-semibold text-foreground">
                  {diseaseInfo.displayName}
                </h3>
                {diseaseInfo.description && (
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                    {diseaseInfo.description}
                  </p>
                )}
              </div>
            )}
            
            {/* Supporting Metadata - Enhanced Badges */}
            <div className="flex flex-wrap gap-3 pt-3">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500/20 dark:border-emerald-700/40 shadow-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatConfidence(result.health.confidence)}
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
          
          {/* Image Placeholder - Enhanced Glassmorphism */}
          <div className="relative group shrink-0 self-center sm:self-start">
             <div className={`absolute inset-0 blur-3xl opacity-30 rounded-3xl ${healthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
             <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-3 rounded-3xl shadow-xl border-2 border-white/20 dark:border-white/10 backdrop-blur-sm rotate-2 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105">
               <div className="w-36 h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl flex items-center justify-center overflow-hidden">
                 <Leaf className="w-16 h-16 text-emerald-500/40 dark:text-emerald-400/30" />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
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
               value={result.health.confidence} 
               colorClass={healthy ? "bg-emerald-500" : "bg-amber-500"} 
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
};
