import jsQR from 'jsqr';

export interface DecodeQrResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Ultra-fast, highly resilient local in-browser QR decoder.
 * Runs multi-stage passes across native resolution, center crops,
 * adaptive binarization, and hardware acceleration.
 * 100% private - processes completely on device without any network requests.
 */
export async function decodeQrFromImageElement(
  img: HTMLImageElement
): Promise<DecodeQrResult> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (!width || !height) {
    return { success: false, error: 'Invalid image dimensions' };
  }

  // Pass 1: Hardware-Accelerated Native BarcodeDetector (Chrome/Edge/Android)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return { success: true, data: barcodes[0].rawValue };
      }
    } catch {
      // Continue to canvas-based decoders
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { success: false, error: 'Could not initialize 2D canvas context' };
  }

  // Pass 2: Full Image Native Resolution Pass (jsQR with both normal and inverted attempts)
  // Handles standard QR images and full-screen desktop screenshots
  const maxDim = 1920;
  let scale = 1;
  if (Math.max(width, height) > maxDim) {
    scale = maxDim / Math.max(width, height);
  }
  const w1 = Math.round(width * scale);
  const h1 = Math.round(height * scale);

  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img, 0, 0, w1, h1);

  let imgData = ctx.getImageData(0, 0, w1, h1);
  let code = jsQR(imgData.data, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 3: Center 60% Crop Pass (jsQR)
  // Specifically targets screenshots where the QR modal is in the middle of the screen
  const cropW1 = Math.round(w1 * 0.6);
  const cropH1 = Math.round(h1 * 0.6);
  const cropX1 = Math.round((w1 - cropW1) / 2);
  const cropY1 = Math.round((h1 - cropH1) / 2);

  canvas.width = cropW1;
  canvas.height = cropH1;
  ctx.drawImage(
    img,
    cropX1 / scale,
    cropY1 / scale,
    cropW1 / scale,
    cropH1 / scale,
    0,
    0,
    cropW1,
    cropH1
  );

  imgData = ctx.getImageData(0, 0, cropW1, cropH1);
  code = jsQR(imgData.data, cropW1, cropH1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 4: Center 35% Tight Crop Pass (jsQR)
  // Targets close-up screenshots and phone screen captures
  const tightW = Math.round(w1 * 0.35);
  const tightH = Math.round(h1 * 0.35);
  const tightX = Math.round((w1 - tightW) / 2);
  const tightY = Math.round((h1 - tightH) / 2);

  canvas.width = tightW;
  canvas.height = tightH;
  ctx.drawImage(
    img,
    tightX / scale,
    tightY / scale,
    tightW / scale,
    tightH / scale,
    0,
    0,
    tightW,
    tightH
  );

  imgData = ctx.getImageData(0, 0, tightW, tightH);
  code = jsQR(imgData.data, tightW, tightH, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 5: Adaptive Contrast & High-Binarization on Center Crop
  // Solves dark mode, low lighting, glare, and compression artifacts
  canvas.width = cropW1;
  canvas.height = cropH1;
  ctx.drawImage(
    img,
    cropX1 / scale,
    cropY1 / scale,
    cropW1 / scale,
    cropH1 / scale,
    0,
    0,
    cropW1,
    cropH1
  );

  imgData = ctx.getImageData(0, 0, cropW1, cropH1);
  const d = imgData.data;
  let totalLum = 0;
  for (let i = 0; i < d.length; i += 4) {
    totalLum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  }
  const avgLum = totalLum / (d.length / 4);

  // Apply binarization threshold
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const v = lum > avgLum ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  code = jsQR(d, cropW1, cropH1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 6: Full Image Adaptive Binarization
  canvas.width = w1;
  canvas.height = h1;
  ctx.drawImage(img, 0, 0, w1, h1);
  imgData = ctx.getImageData(0, 0, w1, h1);
  const dFull = imgData.data;
  for (let i = 0; i < dFull.length; i += 4) {
    const lum = dFull[i] * 0.299 + dFull[i + 1] * 0.587 + dFull[i + 2] * 0.114;
    const v = lum > avgLum ? 255 : 0;
    dFull[i] = v;
    dFull[i + 1] = v;
    dFull[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  code = jsQR(dFull, w1, h1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // Pass 7: Downscale Pass (900px) for Ultra-High Resolution (4K+) Camera Photos
  if (Math.max(width, height) > 1200) {
    const scaleDown = 900 / Math.max(width, height);
    const wDown = Math.round(width * scaleDown);
    const hDown = Math.round(height * scaleDown);
    canvas.width = wDown;
    canvas.height = hDown;
    ctx.drawImage(img, 0, 0, wDown, hDown);

    imgData = ctx.getImageData(0, 0, wDown, hDown);
    code = jsQR(imgData.data, wDown, hDown, { inversionAttempts: 'attemptBoth' });
    if (code && code.data) {
      return { success: true, data: code.data };
    }
  }

  return { success: false, error: 'No QR code detected' };
}
