import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { WifiOff, AlertCircle, Sprout, Sun, Moon, Loader2, History } from 'lucide-react';
import { checkHealth, analyzeImage } from './services/api';
import { compressImage } from './utils/imageOptimizer';
import { mapApiErrorToMessage } from './utils/errorMapper';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { I18nProvider, useI18n } from './components/I18nProvider';
import { ToastProvider, useToast } from './components/ui/Toast';
import FileUpload from './components/FileUpload';
import Button from './components/ui/Button';
import MetadataViewer from './components/MetadataViewer';
import EmptyState from './components/ui/EmptyState';
import Skeleton from './components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load heavy result component
const AnalysisResult = React.lazy(() => import('./components/AnalysisResult'));

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('SW registration failed:', error);
    });
  });
}

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
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 p-0 rounded-full border-border/50 hover:bg-muted"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <div className="relative h-4 w-4">
        <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
    </Button>
  );
}

function LangToggle() {
  const { language, setLanguage } = useI18n();
  const nextLang = language === 'en' ? 'es' : language === 'es' ? 'hi' : 'en';
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(nextLang)}
      className="h-9 w-12 rounded-full border-border/50 text-xs font-bold"
      aria-label={`Switch language to ${nextLang.toUpperCase()}`}
    >
      {language.toUpperCase()}
    </Button>
  );
}

function AgriScanApp() {
  const { t } = useI18n();
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // 1. Health Check
  const { data: isServiceAvailable, isLoading: isHealthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 2. Analysis Mutation with Stepped Loading
  const analysisMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        setLoadingStep(t('btn.optimizing'));
        const compressedFile = await compressImage(file);
        
        setLoadingStep(t('btn.uploading'));
        const result = await analyzeImage(compressedFile);
        
        setLoadingStep(t('btn.processing'));
        // Save to history (mock)
        const historyItem = { date: new Date().toISOString(), result };
        const history = JSON.parse(localStorage.getItem('scan_history') || '[]');
        localStorage.setItem('scan_history', JSON.stringify([historyItem, ...history].slice(0, 10)));
        
        return result;
      } finally {
        setLoadingStep(null);
      }
    },
    onSuccess: () => {
       addToast("Analysis complete!", "success");
    },
    onError: (error) => {
      const { message, severity } = mapApiErrorToMessage(error);
      if (severity === 'warning') {
         addToast(message, 'info');
      }
    }
  });

  // Optimized: Memoized handlers to prevent child re-renders during background health checks
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    analysisMutation.reset();
  }, [analysisMutation.reset]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    analysisMutation.reset();
  }, [previewUrl, analysisMutation.reset]);

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      analysisMutation.mutate(selectedFile);
    }
  }, [selectedFile, analysisMutation.mutate]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">{t('app.title')}</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <LangToggle />
             <ThemeToggle />
            {isHealthLoading ? (
              <Skeleton className="h-6 w-20 rounded-full" />
            ) : isServiceAvailable ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">{t('status.online')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/5 px-3 py-1.5 rounded-full border border-destructive/10 shadow-sm">
                <WifiOff size={12} />
                <span>{t('status.offline')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-12 space-y-8" role="main">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('hero.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('hero.desc')}
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
                   className="w-full shadow-sm hover:shadow-md transition-all h-14 text-base font-semibold rounded-xl relative overflow-hidden"
                   onClick={handleAnalyze} 
                   disabled={!selectedFile || analysisMutation.isPending}
                   aria-busy={analysisMutation.isPending}
                 >
                   {analysisMutation.isPending ? (
                     <div className="flex items-center gap-2">
                       <Loader2 className="h-5 w-5 animate-spin" />
                       <span>{loadingStep || t('btn.analyzing')}</span>
                     </div>
                   ) : (
                     t('btn.upload')
                   )}
                 </Button>
              </div>

              {/* Error State */}
              {analysisMutation.isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2"
                >
                  <EmptyState 
                    icon={AlertCircle}
                    title="Analysis Failed"
                    description={mapApiErrorToMessage(analysisMutation.error).message}
                    actionLabel="Retry Analysis"
                    onAction={handleAnalyze}
                  />
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
              <Suspense fallback={
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                  </div>
                </div>
              }>
                <AnalysisResult 
                  data={analysisMutation.data} 
                  onRetry={handleClear} 
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History Toggle */}
        <div className="flex justify-center pt-8 border-t">
             <button 
               onClick={() => setShowHistory(!showHistory)}
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
               aria-expanded={showHistory}
             >
               <History size={16} />
               <span>{showHistory ? 'Hide History' : t('history.title')}</span>
             </button>
        </div>
        
        {showHistory && (
           <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in">
              <p className="text-center text-xs text-muted-foreground italic">{t('history.empty')}</p>
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/30" role="contentinfo">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <MetadataViewer />
            <div className="pt-4 border-t border-border/50">
               <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} AgriScan AI. 
                <span className="mx-2">•</span>
                v2.7.0-prod
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
    <I18nProvider>
      <ThemeProvider defaultTheme="system" storageKey="agri-scan-theme">
        <ToastProvider>
           <QueryClientProvider client={queryClient}>
             <AgriScanApp />
           </QueryClientProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
