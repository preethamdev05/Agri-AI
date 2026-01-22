import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onClear, 
  selectedFile, 
  previewUrl,
  disabled 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const triggerInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              relative flex flex-col items-center justify-center w-full min-h-[300px] 
              rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!disabled ? triggerInput : undefined}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              disabled={disabled}
            />
            
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="p-4 mb-4 rounded-full bg-secondary text-primary">
                <UploadCloud size={32} />
              </div>
              <p className="mb-2 text-lg font-medium text-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">
                SVG, PNG, JPG or WEBP (max. 10MB)
              </p>
            </div>
          </motion.div>
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
                   alt="Preview" 
                   className="h-full w-full object-contain" 
                 />
               ) : (
                 <ImageIcon className="text-muted-foreground h-12 w-12" />
               )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-background">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md text-primary">
                  <ImageIcon size={20} />
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