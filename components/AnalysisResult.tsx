import React, { useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, Leaf, Activity, Info } from 'lucide-react';
import { ProgressBar } from './ui/ProgressBar';
import { isPlantHealthy, getActiveDisease } from '../utils/domain';
import type { PredictResponse } from '../types';

interface AnalysisResultProps {
  result: PredictResponse;
  onClear: () => void;
}

const StatCard = ({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  colorClass, 
  delay = 0 
}: { 
  label: string; 
  value: string; 
  subtext?: string; 
  icon: any; 
  colorClass: string;
  delay?: number;
}) => (
  <div 
    className={`
      flex flex-col p-5 rounded-xl border bg-card shadow-sm
      animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards
      hover:shadow-md transition-shadow
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="mt-auto">
      <span className="text-2xl font-bold tracking-tight text-foreground block mb-1">
        {value}
      </span>
      {subtext && (
        <span className="text-sm text-muted-foreground font-medium">
          {subtext}
        </span>
      )}
    </div>
  </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onClear }) => {
  const isHealthy = isPlantHealthy(result.health);
  const activeDisease = getActiveDisease(result.health, result.disease);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-focus for accessibility when result appears
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.focus();
    }
  }, [result]);

  const headerColor = isHealthy 
    ? "bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-100" 
    : "bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100";

  const iconColor = isHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
  const MainIcon = isHealthy ? CheckCircle : AlertTriangle;

  return (
    <div 
      ref={resultRef}
      className="w-full max-w-2xl mx-auto space-y-6 outline-none"
      tabIndex={-1}
      role="region"
      aria-label="Analysis Results"
    >
      {/* Primary Status Card */}
      <div className={`
        relative overflow-hidden rounded-2xl border-2 p-8 text-center
        animate-in zoom-in-95 duration-500
        ${headerColor}
      `}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className={`p-4 rounded-full bg-white/50 dark:bg-black/20 shadow-sm backdrop-blur-sm`}>
            <MainIcon className={`w-12 h-12 ${iconColor}`} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              {isHealthy ? "Plant is Healthy" : "Disease Detected"}
            </h2>
            <p className="text-lg opacity-90 font-medium">
              {isHealthy 
                ? "No signs of disease detected." 
                : `Identified: ${activeDisease?.label}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Crop Type"
          value={result.crop.label}
          subtext={`${(result.crop.confidence * 100).toFixed(1)}% match`}
          icon={Leaf}
          colorClass="bg-blue-500 text-blue-500"
          delay={100}
        />
        
        <StatCard
          label="Confidence"
          value={`${(result.health.confidence * 100).toFixed(1)}%`}
          subtext="Model certainty"
          icon={Activity}
          colorClass={isHealthy ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500"}
          delay={200}
        />
      </div>

      {/* Disease Detail Section (Only if not healthy) */}
      {!isHealthy && activeDisease && (
        <div className="
          rounded-xl border bg-card p-6 shadow-sm
          animate-in fade-in slide-in-from-bottom-8 duration-700
        ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-muted-foreground" />
              Pathology Analysis
            </h3>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-950/50 dark:text-amber-400">
              Needs Attention
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{activeDisease.label}</span>
                <span className="text-muted-foreground">{(activeDisease.confidence * 100).toFixed(1)}%</span>
              </div>
              <ProgressBar 
                value={activeDisease.confidence * 100} 
                max={100} 
                className="h-2.5"
                colorClass="bg-amber-500" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Area */}
      <div className="flex justify-center pt-4 animate-in fade-in duration-1000">
        <button
          onClick={onClear}
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
        >
          Analyze another image
        </button>
      </div>
    </div>
  );
};
