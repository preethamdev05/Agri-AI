import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictResponse } from '../types';
import ProgressBar from './ui/ProgressBar';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sprout, Bug, Clock } from 'lucide-react';
import Button from './ui/Button';

interface AnalysisResultProps {
  data: PredictResponse;
  onRetry: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isHealthy = data.health.label.toLowerCase() === 'healthy';
  const confidencePercent = Math.round(data.health.confidence * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      {/* Primary Result Card */}
      <div className={`
        relative overflow-hidden rounded-lg border-2 p-6
        ${isHealthy ? 'border-emerald-100 bg-emerald-50/50' : 'border-amber-100 bg-amber-50/50'}
      `}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Analysis Result
            </h3>
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              )}
              <span className={`text-3xl font-bold tracking-tight ${isHealthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                {data.health.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Confidence Level: <span className="font-medium text-foreground">{confidencePercent}%</span>
            </p>
          </div>
          
          <div className="text-right">
             <div className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm">
                <Clock className="mr-1 h-3 w-3" />
                {data.processing_time_ms ? `${data.processing_time_ms}ms` : '<1s'}
             </div>
          </div>
        </div>

        <div className="mt-6">
           <ProgressBar 
             value={data.health.confidence} 
             colorClass={isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}
             showValue={false}
           />
        </div>
      </div>

      {/* Collapsible Secondary Fields */}
      <div className="rounded-lg border bg-card shadow-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span>Detailed Inference Metrics</span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-6 border-t p-6 md:grid-cols-2">
                {/* Crop Detail */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sprout className="h-4 w-4" />
                    <span>Crop Identification</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-semibold capitalize">{data.crop.label}</span>
                      <span className="text-sm text-muted-foreground">{(data.crop.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={data.crop.confidence} colorClass="bg-blue-500" showValue={false} />
                  </div>
                </div>

                {/* Disease Detail - Conditional */}
                {data.disease && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bug className="h-4 w-4" />
                      <span>Pathology Detection</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold capitalize">
                          {data.disease.label.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">{(data.disease.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <ProgressBar 
                        value={data.disease.confidence} 
                        colorClass="bg-rose-500" 
                        showValue={false} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onRetry}>
          Analyze Another Image
        </Button>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;
