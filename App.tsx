import React, { useState, Suspense, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Sprout, BarChart3, Info } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ErrorBoundary } from './components/ErrorBoundary';
import Skeleton from './components/ui/Skeleton';
import { analyzeImage, checkHealth, fetchMetadata } from './services/api';
import { createMetadataLookup, type MetadataLookup } from './utils/metadata';
import type { PredictResponse } from './types';

// Lazy load heavy result component
const AnalysisResult = React.lazy(() => 
  import('./components/AnalysisResult').then(module => ({ default: module.AnalysisResult }))
);

function App() {
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [metadataLookup, setMetadataLookup] = useState<MetadataLookup | null>(null);

  useEffect(() => {
    // Initialize system checks and metadata
    checkHealth().then(setHealthStatus);
    
    // Fetch metadata for label enrichment (non-blocking)
    fetchMetadata()
      .then(metadata => {
        const lookup = createMetadataLookup(metadata);
        setMetadataLookup(lookup);
      })
      .catch(error => {
        console.warn('Metadata fetch failed, using fallback labels:', error);
        // Create empty lookup for graceful degradation
        setMetadataLookup(createMetadataLookup(null));
      });
    
    // Cleanup object URLs on unmount
    return () => {
      // Logic handled in FileUpload but good practice to ensure clean exits
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    try {
      const data = await analyzeImage(file);
      setResult(data);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Agri-AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {healthStatus !== null && (
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  healthStatus 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }`}
                title={healthStatus ? "System Operational" : "System Offline"}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${healthStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {healthStatus ? 'Online' : 'Offline'}
              </div>
            )}
            
            <a 
              href="https://github.com/preethamdev05/Agri-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View Source on GitHub"
            >
              <Info className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-4xl" role="main">
        <ErrorBoundary>
          <div className="space-y-12">
            
            {/* Hero Section (Only show when no result) */}
            {!result && (
              <div className="text-center space-y-4 fade-in-up">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl text-balance">
                  Instant Plant <span className="text-primary">Health Analysis</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                  Upload a photo of your crop to instantly identify diseases, verify health status, 
                  and get detailed confidence metrics powered by deep learning.
                </p>
              </div>
            )}

            {/* Interactive Area */}
            <div className="relative min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <BarChart3 className="w-16 h-16 text-primary relative z-10 animate-bounce" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Analyzing Image...</h3>
                    <p className="text-muted-foreground">Running inference models on your crop</p>
                  </div>
                  <div className="w-full max-w-xs space-y-2">
                    <Skeleton className="h-2 w-full bg-primary/20" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Preprocessing</span>
                      <span>Inference</span>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <Suspense fallback={<div className="p-8 space-y-4"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
                  <AnalysisResult 
                    result={result} 
                    onClear={handleClear}
                    metadataLookup={metadataLookup || undefined}
                  />
                </Suspense>
              ) : (
                <div className="bg-card rounded-3xl border shadow-sm p-1">
                  <div className="bg-background/50 rounded-[22px] p-6 md:p-8 backdrop-blur-sm">
                    <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
                  </div>
                </div>
              )}
            </div>

            {/* Features Footer (Only when idle) */}
            {!result && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
                {[
                  { title: "Real-time Inference", desc: "Get results in milliseconds powered by optimized TF models." },
                  { title: "Offline Capable", desc: "Progressive Web App support for field usage." },
                  { title: "Privacy First", desc: "Images are processed securely and never shared." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
