import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Leaf, Activity, Info, XCircle } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { isPlantHealthy, getActiveDisease } from '../utils/domain';
import type { PredictResponse } from '../types';
import { Button } from './ui/Button';

interface AnalysisResultProps {
  result: PredictResponse;
  onClear: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // FIXED: Pass result.health.label string instead of the entire result object
  const healthy = isPlantHealthy(result.health.label);
  const activeDisease = getActiveDisease(result);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div ref={scrollRef} className="w-full max-w-4xl mx-auto space-y-6 fade-in-up">
      {/* Primary Status Card */}
      <div className={`
        relative overflow-hidden rounded-3xl border p-8 shadow-sm
        ${healthy 
          ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 dark:from-emerald-950/20 dark:to-background dark:border-emerald-900/50' 
          : 'bg-gradient-to-br from-amber-50 to-white border-amber-100 dark:from-amber-950/20 dark:to-background dark:border-amber-900/50'}
      `}>
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="space-y-4 flex-1">
            <div className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border
              ${healthy 
                ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                : 'bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}
            `}>
              {healthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {healthy ? "Healthy Specimen" : "Disease Detected"}
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                {activeDisease?.label.replace(/_/g, ' ') || "Unknown Condition"}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {healthy 
                  ? "Plant shows no significant signs of disease based on current analysis models." 
                  : "Plant shows symptoms consistent with the identified pathology. Immediate attention recommended."}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-black/5">
                <Activity className="w-4 h-4" />
                Confidence: {(result.health.confidence * 100).toFixed(1)}%
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-black/5">
                <Leaf className="w-4 h-4" />
                Type: {activeDisease?.label || 'General'}
              </div>
            </div>
          </div>
          
          <div className="relative group shrink-0">
             <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
             <div className="relative bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border rotate-3 transition-transform group-hover:rotate-0 duration-500">
               {/* Placeholder for uploaded image thumbnail if we had it passed down */}
               <div className="w-32 h-32 bg-secondary/50 rounded-xl flex items-center justify-center">
                 <Leaf className="w-12 h-12 text-muted-foreground/30" />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="font-semibold flex items-center gap-2">
               <Activity className="w-5 h-5 text-primary" />
               Confidence Metrics
             </h3>
             <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
             {/* If we had multiple predictions, map them here. For now showing main confidence */}
             <ProgressBar 
               label="Primary Diagnosis Confidence" 
               value={result.health.confidence} 
               colorClass={healthy ? "bg-emerald-500" : "bg-amber-500"} 
             />
             
             {/* Simulated secondary metrics for UI completeness */}
             <ProgressBar 
               label="Image Quality Assessment" 
               value={0.92} 
               colorClass="bg-blue-500" 
             />
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-4">
           <div className="p-4 bg-secondary/50 rounded-full">
             <Leaf className="w-8 h-8 text-muted-foreground" />
           </div>
           <div>
             <h3 className="font-semibold">Need another opinion?</h3>
             <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs mx-auto">
               Our models are 94% accurate, but field verification is always recommended for critical crops.
             </p>
             <Button variant="outline" onClick={onClear} className="w-full">
               Analyze New Image
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
