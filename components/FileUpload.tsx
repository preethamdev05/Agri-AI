import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onClear, 
  selectedFile, 
  previewUrl,
  disabled 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const triggerInput = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerInput();
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <div className="space-y-3">
             <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className={`
                relative flex flex-col items-center justify-center w-full min-h-[320px] 
                rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer 
                focus:outline-none focus:ring-4 focus:ring-primary/10
                ${isDragOver 
                  ? 'border-primary bg-primary/5 scale-[1.01]' 
                  : error 
                    ? 'border-destructive/40 bg-destructive/5' 
                    : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!disabled ? triggerInput : undefined}
              onKeyDown={!disabled ? handleKeyDown : undefined}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label="Upload image dropzone"
              aria-disabled={disabled}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
                disabled={disabled}
              />
              
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-6 space-y-4">
                <div className={`
                  p-5 rounded-full shadow-sm transition-transform duration-300
                  ${error ? 'bg-destructive/10 text-destructive' : 'bg-background text-primary ring-1 ring-border'}
                  ${isDragOver ? 'scale-110' : ''}
                `}>
                  {error ? <AlertCircle size={36} strokeWidth={1.5} /> : <UploadCloud size={36} strokeWidth={1.5} />}
                </div>
                
                <div className="space-y-1">
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    Drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse from your device
                  </p>
                </div>

                <div className="flex gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">
                   <span>JPEG</span>
                   <span>•</span>
                   <span>PNG</span>
                   <span>•</span>
                   <span>WEBP</span>
                </div>
              </div>
            </motion.div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-destructive font-medium flex items-center justify-center gap-2"
                role="alert"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative w-full overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-border/50"
          >
            <div className="relative aspect-video w-full bg-secondary/30 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 <img 
                   src={previewUrl} 
                   alt="Preview"
                   className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                 />
               ) : (
                 <ImageIcon className="text-muted-foreground/40 h-16 w-16" />
               )}
               
               {/* Overlay for better visibility of image boundary */}
               <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-card border-t">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 p-2.5 bg-primary/10 rounded-lg text-primary">
                  <FileUp size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClear}
                disabled={disabled}
                className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;