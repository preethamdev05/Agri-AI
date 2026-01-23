import React, { useState, useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Sprout, WifiOff, AlertCircle, Moon, Sun, Loader2 } from 'lucide-react';
import { checkHealth, analyzeImage } from './services/api';
import FileUpload from './components/FileUpload';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/ui/Toast';

// Lazy load heavy components
const AnalysisResult = React.lazy(() => import('./components/AnalysisResult'));
const MetadataViewer = React.lazy(() => import('./components/MetadataViewer'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0 rounded-full border-border/60 hover:bg-muted"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function AgriScanApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { addToast } = useToast();
  
  // 1. Health Check
  const { data: isServiceAvailable, isLoading: isHealthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 2. Analysis Mutation
  const analysisMutation = useMutation({
    mutationFn: analyzeImage,
    onError: (error) => {
      addToast(
        error instanceof Error ? error.message : "Analysis failed. Please try again.",
        'error'
      );
    },
    onSuccess: () => {
      addToast("Analysis complete.", 'success');
    }
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    analysisMutation.reset();
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    analysisMutation.reset();
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analysisMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">AgriScan AI</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">Production Inference Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isHealthLoading ? (
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30 animate-pulse" />
            ) : isServiceAvailable ? (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>System Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20 shadow-sm">
                <WifiOff size={12} />
                <span className="hidden sm:inline">System Offline</span>
              </div>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Crop Disease Analysis</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a clear image of a crop leaf to detect potential diseases using our multi-task deep learning model.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!analysisMutation.data ? (
            <motion.div 
              key="upload-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border shadow-sm p-1.5 transition-shadow hover:shadow-md">
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  onClear={handleClear} 
                  selectedFile={selectedFile}
                  previewUrl={previewUrl}
                  disabled={analysisMutation.isPending}
                />
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Button 
                   size="lg"
                   variant="primary"
                   className="w-full shadow-sm hover:shadow-md transition-all h-14 text-base font-semibold rounded-xl"
                   onClick={handleAnalyze} 
                   disabled={!selectedFile || analysisMutation.isPending}
                   isLoading={analysisMutation.isPending}
                 >
                   {analysisMutation.isPending ? 'Analyzing Crop Health...' : 'Run Diagnostics'}
                 </Button>
              </div>

              {/* Error State - Kept for persistent visibility */}
              {analysisMutation.isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl border border-destructive/20 bg-destructive/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="text-sm pt-0.5">
                      <h4 className="font-semibold text-destructive">Analysis Failed</h4>
                      <p className="text-muted-foreground mt-1">
                        {analysisMutation.error instanceof Error ? analysisMutation.error.message : "An unknown error occurred during inference."}
                      </p>
                      <button 
                        onClick={handleAnalyze}
                        className="mt-3 text-xs font-semibold text-destructive underline decoration-destructive/30 underline-offset-4 hover:text-destructive/80"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="results-section"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="space-y-6"
            >
               <Suspense fallback={<div className="h-96 w-full rounded-xl bg-muted/50 animate-pulse" />}>
                  <AnalysisResult 
                    data={analysisMutation.data} 
                    onRetry={handleClear} 
                  />
               </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/50">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <Suspense fallback={<Skeleton className="h-4 w-48 mx-auto" />}>
              <MetadataViewer />
            </Suspense>
            <div className="pt-4 border-t border-border/50">
               <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} AgriScan AI. 
                <span className="mx-2">•</span>
                Powered by Multi-Task EfficientNet
                <span className="mx-2">•</span>
                v2.5.0-prod
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="agri-scan-theme">
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AgriScanApp />
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
