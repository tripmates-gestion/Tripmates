// src/utils/imageCrop.ts
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous'); // evita problemas de CORS en dataURL
    img.src = src;
  });
}

export async function getCroppedDataUrl(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  output: { width?: number; height?: number } = {}
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const { width, height } = crop;
  // tamaño del canvas = tamaño del recorte (o el que pidas)
  canvas.width = output.width ?? Math.round(width);
  canvas.height = output.height ?? Math.round(height);

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}
