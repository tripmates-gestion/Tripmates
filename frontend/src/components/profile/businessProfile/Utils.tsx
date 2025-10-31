export function parseHours(hhmmRange: string | '') {
    if (!hhmmRange) return undefined;
    const [o, c] = hhmmRange.split('–');
    const [oh, om] = o.split(':').map(Number);
    const [ch, cm] = c.split(':').map(Number);
    return {
      openingTime: { hour: oh, minute: om, second: 0, nano: 0 },
      closingTime: { hour: ch, minute: cm, second: 0, nano: 0 },
    };
  }
  
  // dataURL (base64) -> File
  export function dataURLtoFile(dataUrl: string, filename: string) {
    const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }
  