import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../services/api';
import { Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

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

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg border bg-background shadow-lg"
            >
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">Model Capabilities</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isError ? (
                  <div className="text-center text-sm text-destructive">
                    Failed to load model metadata.
                  </div>
                ) : data ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 font-medium text-foreground">Supported Crops</h3>
                      <ul className="space-y-2">
                        {data.crops.map((crop) => (
                          <li key={crop.id} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="capitalize">{crop.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-3 font-medium text-foreground">Detectable Pathologies</h3>
                      <ul className="space-y-2">
                        {data.diseases.map((disease) => (
                          <li key={disease.id} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span className="capitalize">{disease.label.replace(/_/g, ' ')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MetadataViewer;
