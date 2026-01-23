import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PredictResponse } from '../types';
import { isPlantHealthy, getActiveDisease, formatConfidence, formatLabel } from '../utils/domain';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';
import { CheckCircle2, AlertTriangle, Sprout, Bug, Clock, Activity, ArrowRight } from 'lucide-react';

interface AnalysisResultProps {
  data: PredictResponse;
  onRetry: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onRetry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use centralized domain logic
  const healthy = isPlantHealthy(data.health.label);
  const activeDisease = getActiveDisease(data);
  const healthLabel = formatLabel(data.health.label);
  
  // Focus management for accessibility
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6 outline-none"
      tabIndex={-1}
      aria-label="Analysis Results"
    >
      {/* Primary Status Card */}
      <div className={`
        relative overflow-hidden rounded-2xl border p-1 shadow-sm
        ${healthy ? 'border-emerald-200/50 bg-card shadow-emerald-500/5' : 'border-amber-200/50 bg-card shadow-amber-500/5'}
      `}>
        <div className={`
          rounded-xl p-8 
          ${healthy ? 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/30' : 'bg-gradient-to-br from-amber-50/80 to-amber-100/30'}
        `}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  Diagnostic Result
                </h3>
                <div className="flex items-center gap-3">
                  {healthy ? (
                    <div className="rounded-full bg-emerald-100 p-1 text-emerald-600 ring-4 ring-emerald-50">
                       <CheckCircle2 className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-amber-100 p-1 text-amber-600 ring-4 ring-amber-50">
                       <AlertTriangle className="h-8 w-8" />
                    </div>
                  )}
                  <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${healthy ? 'text-emerald-950' : 'text-amber-950'}`}>
                    {healthLabel}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                 <div className="px-3 py-1 rounded-full bg-white/60 border border-black/5 backdrop-blur font-medium text-foreground/80">
                   {formatConfidence(data.health.confidence)} Confidence
                 </div>
                 <div className="flex items-center gap-1.5 text-muted-foreground">
                   <Clock className="h-3.5 w-3.5" />
                   {/* Backend returns float ms, display as integer */}
                   <span>{data.processing_time_ms ? `${data.processing_time_ms.toFixed(0)}ms` : '< 50ms'}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
             <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                <span>Model Certainty</span>
                <span>{data.health.confidence.toFixed(4)}</span>
             </div>
             <ProgressBar 
               value={data.health.confidence} 
               colorClass={healthy ? 'bg-emerald-500' : 'bg-amber-500'}
               showValue={false}
               height="h-3"
             />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Crop Card */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 transition-all hover:shadow-md">
           <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Sprout size={18} />
              </div>
              <h4 className="font-semibold text-foreground">Crop Type</h4>
           </div>
           
           <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground capitalize">
                  {formatLabel(data.crop.label)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {formatConfidence(data.crop.confidence)}
                </span>
              </div>
              <ProgressBar value={data.crop.confidence} colorClass="bg-blue-500" height="h-2" showValue={false} />
           </div>
        </div>

        {/* Pathology Card */}
        {activeDisease ? (
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 transition-all hover:shadow-md">
             <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Bug size={18} />
                </div>
                <h4 className="font-semibold text-foreground">Pathology</h4>
             </div>
             
             <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground capitalize leading-none">
                    {formatLabel(activeDisease.label)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatConfidence(activeDisease.confidence)}
                  </span>
                </div>
                <ProgressBar value={activeDisease.confidence} colorClass="bg-rose-500" height="h-2" showValue={false} />
             </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card/50 p-5 shadow-sm flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground dashed-border">
             <Activity className="h-8 w-8 opacity-20" />
             <p className="text-sm font-medium">No active pathology detected</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-6">
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="group px-6 h-11 border-border/60 hover:bg-secondary/50"
          aria-label="Analyze another sample"
        >
          <span>Analyze Another Sample</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;
