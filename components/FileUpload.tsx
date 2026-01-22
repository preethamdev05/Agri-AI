import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
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
      setError('Invalid file type. Please upload an image.');
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
          <div className="space-y-2">
             <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                relative flex flex-col items-center justify-center w-full min-h-[300px] 
                rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : error ? 'border-destructive/50 bg-destructive/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!disabled ? triggerInput : undefined}
              onKeyDown={!disabled ? handleKeyDown : undefined}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label="Upload image dropzone. Click or drag and drop to upload."
              aria-disabled={disabled}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
                disabled={disabled}
                aria-hidden="true"
              />
              
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className={`p-4 mb-4 rounded-full ${error ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'}`}>
                  {error ? <AlertCircle size={32} /> : <UploadCloud size={32} />}
                </div>
                <p className="mb-2 text-lg font-medium text-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  SVG, PNG, JPG or WEBP (max. 10MB)
                </p>
              </div>
            </motion.div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-destructive font-medium flex items-center gap-2 px-1"
                role="alert"
              >
                <AlertCircle size={16} />
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
            className="relative w-full overflow-hidden rounded-xl border bg-background shadow-sm"
          >
            <div className="relative aspect-video w-full bg-black/5 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 <img 
                   src={previewUrl} 
                   alt={`Preview of ${selectedFile.name}`}
                   className="h-full w-full object-contain" 
                 />
               ) : (
                 <ImageIcon className="text-muted-foreground h-12 w-12" />
               )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-background">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md text-primary">
                  <ImageIcon size={20} aria-hidden="true" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClear}
                disabled={disabled}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:border-destructive"
                aria-label="Remove selected file"
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