/**
 * Add watermark to an image file
 * @param imageFile - The original image file
 * @param watermarkText - Text to use as watermark (default: "3B Solution")
 * @param opacity - Watermark opacity (0-1, default: 0.3)
 * @returns Promise<File> - Watermarked image file
 */
export async function addWatermark(
  imageFile: File,
  watermarkText: string = "3B Solution",
  opacity: number = 0.3
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      const fontSize = Math.max(img.width / 30, 20);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw watermark in bottom-right corner
      const padding = 20;
      ctx.fillText(
        watermarkText,
        img.width - padding,
        img.height - padding
      );

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create blob from canvas'));
          return;
        }

        // Create new file with watermark
        const watermarkedFile = new File(
          [blob],
          imageFile.name,
          { type: imageFile.type }
        );

        resolve(watermarkedFile);
      }, imageFile.type, 0.95);
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    reader.readAsDataURL(imageFile);
  });
}
