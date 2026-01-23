import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../services/api';
import Dialog from './ui/Dialog';
import Skeleton from './ui/Skeleton';
import { useToast } from './ui/Toast';
import { Info, AlertCircle, RefreshCw } from 'lucide-react';
import { mapApiErrorToMessage } from '../utils/errorMapper';
import { useI18n } from './I18nProvider';

const MetadataViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();
  const { t } = useI18n();
  
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: isOpen,
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      addToast('Metadata updated successfully', 'success');
    } catch (err) {
      const { message } = mapApiErrorToMessage(err);
      addToast(message, 'error');
    }
  };

  // Safe fallback to prevent rendering empty lists if data is malformed
  const crops = data?.crops || [];
  const diseases = data?.diseases || [];

  return (
    <>
      <button 
        onClick={handleOpen}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        {t('footer.supported')}
      </button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={t('footer.supported')}
        description="Current inference engine capabilities, updated live from backend."
      >
        <div className="min-h-[250px] relative">
          
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b">
             <span className="text-xs text-muted-foreground flex items-center gap-1.5">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Live System Map
             </span>
             <button 
               onClick={handleRefresh} 
               disabled={isFetching}
               className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
               title="Refresh Metadata"
               aria-label="Refresh Metadata"
             >
               <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
             </button>
          </div>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-destructive bg-destructive/5 rounded-xl border border-destructive/10">
              <AlertCircle className="mb-3 h-10 w-10 opacity-80" />
              <p className="text-sm font-semibold mb-1">Failed to sync with inference engine.</p>
              <p className="text-xs opacity-70 max-w-[200px] mb-4">
                {error instanceof Error ? error.message : "Network error"}
              </p>
              <button 
                onClick={handleRefresh}
                className="text-xs font-bold underline underline-offset-4 hover:opacity-80"
              >
                Retry Sync
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 animate-in fade-in duration-300">
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-medium text-foreground text-sm uppercase tracking-wide opacity-80">
                  <Info className="h-4 w-4 text-emerald-500" />
                  Supported Crops ({crops.length})
                </h3>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {crops.map((crop: any) => (
                    <li 
                      key={crop.id || crop.label} 
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-all hover:text-foreground hover:translate-x-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
                      <span className="capitalize">{crop.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-medium text-foreground text-sm uppercase tracking-wide opacity-80">
                  <Info className="h-4 w-4 text-amber-500" />
                  Pathology Index ({diseases.length})
                </h3>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {diseases.map((disease: any) => (
                    <li 
                      key={disease.id || disease.label} 
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-all hover:text-foreground hover:translate-x-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-500 transition-colors" />
                      <span className="capitalize">{disease.label.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default React.memo(MetadataViewer);
