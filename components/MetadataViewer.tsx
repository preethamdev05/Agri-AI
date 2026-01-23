import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../services/api';
import Dialog from './ui/Dialog';
import Skeleton from './ui/Skeleton';
import { Info, AlertCircle } from 'lucide-react';

const MetadataViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: isOpen,
  });

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        Supported Models & Semantics
      </button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Model Capabilities"
        description="Current inference engine specifications and class mappings."
      >
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Failed to load model metadata.</p>
              <p className="text-xs opacity-70">Please check your network connection.</p>
            </div>
          ) : data ? (
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                  <Info className="h-4 w-4 text-emerald-500" />
                  Supported Crops
                </h3>
                <ul className="space-y-2">
                  {data.crops.map((crop) => (
                    <li 
                      key={crop.id} 
                      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 transition-transform group-hover:scale-125" />
                      <span className="capitalize">{crop.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                  <Info className="h-4 w-4 text-amber-500" />
                  Detectable Pathologies
                </h3>
                <ul className="space-y-2">
                  {data.diseases.map((disease) => (
                    <li 
                      key={disease.id} 
                      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 transition-transform group-hover:scale-125" />
                      <span className="capitalize">{disease.label.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
};

export default MetadataViewer;
