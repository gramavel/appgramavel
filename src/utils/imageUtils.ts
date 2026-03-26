export async function convertToWebP(
  file: File,
  quality = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (maxWidth && w > maxWidth) {
        h = Math.round(h * maxWidth / w);
        w = maxWidth;
      }
      if (maxHeight && h > maxHeight) {
        w = Math.round(w * maxHeight / h);
        h = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          const webpFile = new File(
            [blob!],
            file.name.replace(/\.[^.]+$/, '.webp'),
            { type: 'image/webp' }
          );
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.src = url;
  });
}
