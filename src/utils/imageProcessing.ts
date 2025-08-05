
export interface ImageFilters {
  brightness: number;
  contrast: number;
  blur: number;
  threshold: number;
  edgeDetection: boolean;
  noiseReduction: number;
}

export const applyImageFilters = (
  imageData: string,
  filters: ImageFilters
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      if (ctx) {
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        // Apply brightness
        if (filters.brightness !== 0) {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + filters.brightness));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + filters.brightness));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + filters.brightness));
          }
        }

        // Apply contrast
        if (filters.contrast !== 0) {
          const contrastFactor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128));
          }
        }

        // Apply edge detection
        if (filters.edgeDetection) {
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const edge = gray > filters.threshold ? 255 : 0;
            data[i] = edge;
            data[i + 1] = edge;
            data[i + 2] = edge;
          }
        }

        // Apply noise reduction (simple blur)
        if (filters.noiseReduction > 0) {
          // Simple box blur implementation
          const blurRadius = filters.noiseReduction;
          const originalData = new Uint8ClampedArray(data);
          
          for (let y = blurRadius; y < canvas.height - blurRadius; y++) {
            for (let x = blurRadius; x < canvas.width - blurRadius; x++) {
              let r = 0, g = 0, b = 0, count = 0;
              
              for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                  const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                  r += originalData[idx];
                  g += originalData[idx + 1];
                  b += originalData[idx + 2];
                  count++;
                }
              }
              
              const idx = (y * canvas.width + x) * 4;
              data[idx] = r / count;
              data[idx + 1] = g / count;
              data[idx + 2] = b / count;
            }
          }
        }

        ctx.putImageData(imageDataObj, 0, 0);
        resolve(canvas.toDataURL());
      }
    };

    img.src = imageData;
  });
};
