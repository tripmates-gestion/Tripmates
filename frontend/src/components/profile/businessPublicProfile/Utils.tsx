// dataURL (base64) -> File
export function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}


// Utils.ts
export function parseHours(s?: string) {
  if (!s) return undefined;
  const clean = s.replace(/[–—]/g, "-").trim();   // en dash/em dash -> hyphen
  const [open, close] = clean.split("-").map(t => t.trim());
  if (!/^\d{2}:\d{2}$/.test(open) || !/^\d{2}:\d{2}$/.test(close)) return undefined;
  return { openingTime: open, closingTime: close };
}