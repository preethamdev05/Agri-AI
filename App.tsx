import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Activity, Leaf, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { checkHealth, analyzeImage } from './services/api';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import Button from './components/ui/Button';
import MetadataViewer from './components/MetadataViewer';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AgriScanApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100">
      
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 text-white">
              <Leaf size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 leading-none">AgriScan AI</h1>
              <p className="text-[10px] text-neutral-500 font-medium tracking-wide uppercase">Inference Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHealthLoading ? (
              <span className="h-2 w-2 rounded-full bg-neutral-300 animate-pulse" />
            ) : isServiceAvailable ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                <WifiOff size={10} />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        
        <AnimatePresence mode="wait">
          {!analysisMutation.data ? (
            <motion.div 
              key="upload-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border shadow-sm p-1">
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
                   className="w-full shadow-sm hover:shadow-md transition-all h-12 text-base"
                   onClick={handleAnalyze} 
                   disabled={!selectedFile || analysisMutation.isPending}
                   isLoading={analysisMutation.isPending}
                 >
                   {analysisMutation.isPending ? 'Processing Image...' : 'Run Analysis'}
                 </Button>
              </div>

              {/* Error State */}
              {analysisMutation.isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-semibold text-red-900">Analysis Failed</h4>
                      <p className="text-red-700 mt-1">
                        {analysisMutation.error instanceof Error ? analysisMutation.error.message : "An unknown error occurred."}
                      </p>
                      <button 
                        onClick={handleAnalyze}
                        className="mt-2 text-xs font-medium text-red-800 underline decoration-red-400 underline-offset-2 hover:text-red-950"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="results-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <AnalysisResult 
                data={analysisMutation.data} 
                onRetry={handleClear} 
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 text-center bg-white">
        <div className="container mx-auto px-4 space-y-4">
          <MetadataViewer />
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} AgriScan AI. Secure & Private Inference.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AgriScanApp />
    </QueryClientProvider>
  );
}
