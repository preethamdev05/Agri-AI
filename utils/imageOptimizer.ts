/**
 * Compress and resize images client-side before upload using HTML5 Canvas.
 * Target: Max 1024px dimension, 0.8 quality JPEG.
 */
export const compressImage = async (file: File): Promise<File> => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) return file;
  
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(img.src);
          resolve(file); // Fallback to original
          return;
        }
  
        // Calculate new dimensions (Max 1024px)
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;
  
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(img.src);
            if (blob) {
              // Create new File from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback
            }
          },
          'image/jpeg',
          0.8 // Quality 80%
        );
      };
  
      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(error);
      };
    });
  };
