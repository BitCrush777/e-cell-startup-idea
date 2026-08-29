import jsQR from 'jsqr';

export interface DecodeQrResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Robust multi-tier local in-browser QR decoder.
 * Works with screenshots, mobile camera photos, dark mode screenshots, and compressed images.
 * Never uploads to a server.
 */
export async function decodeQrFromImageElement(
  img: HTMLImageElement | ImageBitmap
): Promise<DecodeQrResult> {
  const width = img.width;
  const height = img.height;

  if (!width || !height) {
    return { success: false, error: 'Invalid image dimensions' };
  }

  // Tier 1: Native browser BarcodeDetector API (hardware accelerated, ultra-reliable for screenshots)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return { success: true, data: barcodes[0].rawValue };
      }
    } catch {
      // Fallback to jsQR canvas passes
    }
  }

  // Tier 2: Multi-Pass jsQR with Canvas Processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { success: false, error: 'Could not initialize 2D canvas' };
  }

  // Pass 2A: Standard optimal scale (800px max dimension)
  const scale1 = Math.min(1, 800 / Math.max(width, height));
  const w1 = Math.round(width * scale1);
  const h1 = Math.round(height * scale1);
  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img as CanvasImageSource, 0, 0, w1, h1);

  let imgData = ctx.getImageData(0, 0, w1, h1);
  let code = jsQR(imgData.data, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 2B: Higher-resolution scale (1400px max dimension)
  if (Math.max(width, height) > 800) {
    const scale2 = Math.min(1, 1400 / Math.max(width, height));
    const w2 = Math.round(width * scale2);
    const h2 = Math.round(height * scale2);
    canvas.width = w2;
    canvas.height = h2;
    ctx.drawImage(img as CanvasImageSource, 0, 0, w2, h2);

    imgData = ctx.getImageData(0, 0, w2, h2);
    code = jsQR(imgData.data, w2, h2, { inversionAttempts: 'attemptBoth' });
    if (code && code.data) {
      return { success: true, data: code.data };
    }
  }

  // Pass 2C: Center crop (ideal for mobile screenshots with status bar / padding)
  const cropW = Math.round(w1 * 0.75);
  const cropH = Math.round(h1 * 0.75);
  const cropX = Math.round((w1 - cropW) / 2);
  const cropY = Math.round((h1 - cropH) / 2);

  canvas.width = cropW;
  canvas.height = cropH;
  ctx.drawImage(img as CanvasImageSource, cropX / scale1, cropY / scale1, cropW / scale1, cropH / scale1, 0, 0, cropW, cropH);

  imgData = ctx.getImageData(0, 0, cropW, cropH);
  code = jsQR(imgData.data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 2D: Grayscale & Contrast boost for dark/dim screenshots
  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img as CanvasImageSource, 0, 0, w1, h1);
  imgData = ctx.getImageData(0, 0, w1, h1);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const avg = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const v = avg > 128 ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
  code = jsQR(d, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  return { success: false, error: 'No QR code detected' };
}
