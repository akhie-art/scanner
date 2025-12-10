import { FilterType } from '../types';

export const applyFilter = async (base64Image: string, filter: FilterType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (filter === FilterType.ORIGINAL) {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (filter === FilterType.GRAYSCALE) {
          const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        } else if (filter === FilterType.BW) {
          // Simple thresholding
          const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const v = avg > 128 ? 255 : 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        } else if (filter === FilterType.MAGIC) {
          // Increase saturation and contrast
          // This is a naive implementation. For complex color matrix, we'd need more math.
          // Simple contrast boost
          const contrast = 1.2;
          const intercept = 128 * (1 - contrast);
          
          data[i] = Math.min(255, Math.max(0, data[i] * contrast + intercept));
          data[i + 1] = Math.min(255, Math.max(0, data[i+1] * contrast + intercept));
          data[i + 2] = Math.min(255, Math.max(0, data[i+2] * contrast + intercept));
        } else if (filter === FilterType.LIGHTEN) {
           // Gamma correction to lighten
           const gamma = 1.4;
           data[i] = 255 * Math.pow(data[i] / 255, 1 / gamma);
           data[i + 1] = 255 * Math.pow(data[i + 1] / 255, 1 / gamma);
           data[i + 2] = 255 * Math.pow(data[i + 2] / 255, 1 / gamma);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = (err) => reject(err);
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
