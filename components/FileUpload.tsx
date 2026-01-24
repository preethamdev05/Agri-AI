import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, AlertCircle, X, FileCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Max size is 10MB.');
      } else {
        setError('Please upload a valid image file (JPEG, PNG, WebP).');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Additional safety check beyond Dropzone
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type.');
        return;
      }

      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 fade-in">
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center
          w-full h-80 rounded-3xl border-2 border-dashed
          transition-all duration-300 ease-out
          bg-gradient-to-br from-background/50 to-secondary/30 hover:from-secondary/30 hover:to-secondary/50
          focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none
          ${
            isDragActive 
              ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/20 border-solid' 
              : 'border-border hover:border-primary/50'
          }
          ${
            isDragReject || error 
              ? 'border-destructive/60 bg-destructive/5 border-solid' 
              : ''
          }
          ${
            preview 
              ? 'border-solid border-primary/30 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-background' 
              : ''
          }
        `}
        role="button"
        aria-label="Upload image area"
        aria-describedby="upload-hint"
        tabIndex={0}
      >
        <input {...getInputProps()} aria-label="File upload input" />

        {preview ? (
          <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[85%] w-auto rounded-2xl shadow-2xl object-contain fade-in-zoom border-2 border-white/50 dark:border-slate-700/50" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent group-hover:from-black/10 transition-colors rounded-3xl pointer-events-none" />
            
            {!isLoading && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearFile}
                className="absolute top-6 right-6 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                aria-label="Remove image"
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            )}
            
            <div className="absolute bottom-6 flex items-center gap-2.5 px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-emerald-500/20 text-sm font-semibold text-foreground">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Ready for analysis
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className={`
              relative p-6 rounded-full transition-all duration-300
              ${
                isDragActive 
                  ? 'bg-primary/10 text-primary scale-110' 
                  : 'bg-gradient-to-br from-secondary to-secondary/50 text-muted-foreground group-hover:scale-105 group-hover:from-secondary/80 group-hover:to-secondary'
              }
              ${
                error 
                  ? 'bg-destructive/10 text-destructive' 
                  : ''
              }
            `}>
              {!isDragActive && !error && (
                <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
              )}
              {error ? (
                <AlertCircle className="w-10 h-10 relative z-10" />
              ) : isDragActive ? (
                <UploadCloud className="w-10 h-10 animate-bounce relative z-10" />
              ) : (
                <ImageIcon className="w-10 h-10 relative z-10" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground tracking-tight">
                {isDragActive ? "Drop to upload" : "Upload plant image"}
              </p>
              <p id="upload-hint" className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Drag and drop or click to browse.<br/>
                <span className="text-xs">Supports JPG, PNG, WebP up to 10MB.</span>
              </p>
            </div>

            <Button 
              variant={isDragActive ? "primary" : "secondary"}
              className="mt-2 pointer-events-none shadow-sm" // Button is visual only, parent div handles click
              tabIndex={-1}
            >
              Select Image
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div 
          role="alert" 
          className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 border-2 border-destructive/20 rounded-2xl fade-in backdrop-blur-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};