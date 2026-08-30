import jsQR from 'jsqr';

export interface DecodeQrResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Robust multi-tier local in-browser QR decoder.
 * Works seamlessly with screenshots, mobile camera photos, dark mode screenshots,
 * and compressed image files. Never uploads to any external server.
 */
export async function decodeQrFromImageElement(
  img: HTMLImageElement | ImageBitmap
): Promise<DecodeQrResult> {
  const width = img.width;
  const height = img.height;

  if (!width || !height) {
    return { success: false, error: 'Invalid image dimensions' };
  }

  // 1. Native Browser BarcodeDetector (Hardware-accelerated)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      
      // Try on original image
      const barcodes = await detector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return { success: true, data: barcodes[0].rawValue };
      }
    } catch {
      // Fall through to canvas-based decoders
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { success: false, error: 'Could not initialize 2D canvas context' };
  }

  // Pass 1: Native or Clamped Full-Resolution (Max 1600px)
  // Keeps QR code modules large enough (200px+) on tall phone screenshots
  const maxDim = 1600;
  let scale = 1;
  if (Math.max(width, height) > maxDim) {
    scale = maxDim / Math.max(width, height);
  }
  const w1 = Math.round(width * scale);
  const h1 = Math.round(height * scale);
  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img as CanvasImageSource, 0, 0, w1, h1);

  let imgData = ctx.getImageData(0, 0, w1, h1);
  let code = jsQR(imgData.data, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 2: Center 60% Crop (Targets mobile screenshots where QR is in the center modal)
  const cropW = Math.round(w1 * 0.65);
  const cropH = Math.round(h1 * 0.65);
  const cropX = Math.round((w1 - cropW) / 2);
  const cropY = Math.round((h1 - cropH) / 2);

  canvas.width = cropW;
  canvas.height = cropH;
  ctx.drawImage(
    img as CanvasImageSource,
    cropX / scale,
    cropY / scale,
    cropW / scale,
    cropH / scale,
    0,
    0,
    cropW,
    cropH
  );

  imgData = ctx.getImageData(0, 0, cropW, cropH);
  code = jsQR(imgData.data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 3: High-Contrast & Binarization on Center Crop
  // Solves dark-theme screenshots, glare, and low-contrast mobile captures
  const dCrop = imgData.data;
  let totalLuminance = 0;
  for (let i = 0; i < dCrop.length; i += 4) {
    totalLuminance += dCrop[i] * 0.299 + dCrop[i + 1] * 0.587 + dCrop[i + 2] * 0.114;
  }
  const avgLuminance = totalLuminance / (dCrop.length / 4);

  // Apply binarization
  for (let i = 0; i < dCrop.length; i += 4) {
    const lum = dCrop[i] * 0.299 + dCrop[i + 1] * 0.587 + dCrop[i + 2] * 0.114;
    const v = lum > avgLuminance ? 255 : 0;
    dCrop[i] = v;
    dCrop[i + 1] = v;
    dCrop[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  code = jsQR(dCrop, cropW, cropH, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 4: High-Contrast & Binarization on Full Image
  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img as CanvasImageSource, 0, 0, w1, h1);
  imgData = ctx.getImageData(0, 0, w1, h1);
  const dFull = imgData.data;
  for (let i = 0; i < dFull.length; i += 4) {
    const lum = dFull[i] * 0.299 + dFull[i + 1] * 0.587 + dFull[i + 2] * 0.114;
    const v = lum > avgLuminance ? 255 : 0;
    dFull[i] = v;
    dFull[i + 1] = v;
    dFull[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
  code = jsQR(dFull, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 5: Downscaled Scale for 4K / Ultra High-Res Camera Shots (900px)
  if (Math.max(width, height) > 1000) {
    const scaleDown = 900 / Math.max(width, height);
    const wDown = Math.round(width * scaleDown);
    const hDown = Math.round(height * scaleDown);
    canvas.width = wDown;
    canvas.height = hDown;
    ctx.drawImage(img as CanvasImageSource, 0, 0, wDown, hDown);

    imgData = ctx.getImageData(0, 0, wDown, hDown);
    code = jsQR(imgData.data, wDown, hDown, { inversionAttempts: 'attemptBoth' });
    if (code && code.data) {
      return { success: true, data: code.data };
    }
  }

  return { success: false, error: 'No QR code detected' };
}
