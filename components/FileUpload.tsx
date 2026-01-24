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
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center
          w-full h-80 rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-in-out
          bg-background/50 hover:bg-secondary/30
          focus-visible:ring-4 focus-visible:ring-primary/20
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg' : 'border-border'}
          ${isDragReject || error ? 'border-destructive/50 bg-destructive/5' : ''}
          ${preview ? 'border-solid border-primary/20 bg-secondary/5' : ''}
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
              className="max-h-[85%] w-auto rounded-lg shadow-md object-contain animate-in fade-in zoom-in duration-300" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
            
            {!isLoading && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearFile}
                className="absolute top-6 right-6 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            )}
            
            <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full shadow-sm text-sm font-medium text-foreground/80">
              <FileCheck className="w-4 h-4 text-primary" />
              Ready for analysis
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className={`
              p-6 rounded-full transition-all duration-300
              ${isDragActive ? 'bg-primary/10 text-primary scale-110' : 'bg-secondary text-muted-foreground group-hover:scale-105 group-hover:bg-secondary/80'}
              ${error ? 'bg-destructive/10 text-destructive' : ''}
            `}>
              {error ? (
                <AlertCircle className="w-10 h-10" />
              ) : isDragActive ? (
                <UploadCloud className="w-10 h-10 animate-bounce" />
              ) : (
                <ImageIcon className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground tracking-tight">
                {isDragActive ? "Drop to upload" : "Upload plant image"}
              </p>
              <p id="upload-hint" className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Drag and drop or click to browse.<br/>
                Supports JPG, PNG, WebP up to 10MB.
              </p>
            </div>

            <Button 
              variant={isDragActive ? "primary" : "secondary"}
              className="mt-2 pointer-events-none" // Button is visual only, parent div handles click
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
          className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl animate-in slide-in-from-top-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};