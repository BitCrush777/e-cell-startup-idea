import jsQR from 'jsqr';
import {
  BrowserQRCodeReader,
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} from '@zxing/library';

export interface DecodeQrResult {
  success: boolean;
  data?: string;
  error?: string;
}

// Pre-configured ZXing MultiFormatReader with TRY_HARDER
function getZxingReader(): MultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  const reader = new MultiFormatReader();
  reader.setHints(hints);
  return reader;
}

/**
 * Universal, ultra-resilient local in-browser QR decoder.
 * Uses ZXing (Google/Android engine), native BarcodeDetector, and jsQR multi-pass.
 * 100% private - never uploads to any server.
 */
export async function decodeQrFromImageElement(
  img: HTMLImageElement
): Promise<DecodeQrResult> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (!width || !height) {
    return { success: false, error: 'Invalid image dimensions' };
  }

  // 1. Native Browser BarcodeDetector (Hardware Accelerated)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return { success: true, data: barcodes[0].rawValue };
      }
    } catch {
      // Continue to ZXing engine
    }
  }

  // 2. ZXing BrowserQRCodeReader directly on HTMLImageElement
  try {
    const zxingBrowserReader = new BrowserQRCodeReader();
    const result = await zxingBrowserReader.decodeFromImageElement(img);
    if (result && result.getText()) {
      return { success: true, data: result.getText() };
    }
  } catch {
    // Continue to canvas-based ZXing and jsQR passes
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { success: false, error: 'Could not initialize 2D canvas context' };
  }

  // 3. Full-Resolution ZXing HybridBinarizer Pass (Ideal for desktop screenshots with small QR codes)
  try {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    const fullImageData = ctx.getImageData(0, 0, width, height);

    const luminanceSource = new RGBLuminanceSource(
      fullImageData.data,
      width,
      height
    );
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const zxingReader = getZxingReader();
    const result = zxingReader.decode(binaryBitmap);
    if (result && result.getText()) {
      return { success: true, data: result.getText() };
    }
  } catch {
    // Continue to center crop and jsQR passes
  }

  // 4. Center 65% Crop with ZXing (Targets modal QR codes in desktop and mobile screenshots)
  try {
    const cropW = Math.round(width * 0.65);
    const cropH = Math.round(height * 0.65);
    const cropX = Math.round((width - cropW) / 2);
    const cropY = Math.round((height - cropH) / 2);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const cropImageData = ctx.getImageData(0, 0, cropW, cropH);
    const cropLuminance = new RGBLuminanceSource(
      cropImageData.data,
      cropW,
      cropH
    );
    const cropBitmap = new BinaryBitmap(new HybridBinarizer(cropLuminance));
    const zxingReader = getZxingReader();
    const result = zxingReader.decode(cropBitmap);
    if (result && result.getText()) {
      return { success: true, data: result.getText() };
    }
  } catch {
    // Continue to jsQR passes
  }

  // 5. jsQR Native Resolution Pass with Inversion Support
  const maxDim = 1600;
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

  // 6. jsQR Center Crop Pass
  const cropW1 = Math.round(w1 * 0.65);
  const cropH1 = Math.round(h1 * 0.65);
  const cropX1 = Math.round((w1 - cropW1) / 2);
  const cropY1 = Math.round((h1 - cropH1) / 2);

  canvas.width = cropW1;
  canvas.height = cropH1;
  ctx.drawImage(img, cropX1 / scale, cropY1 / scale, cropW1 / scale, cropH1 / scale, 0, 0, cropW1, cropH1);

  imgData = ctx.getImageData(0, 0, cropW1, cropH1);
  code = jsQR(imgData.data, cropW1, cropH1, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) {
    return { success: true, data: code.data };
  }

  // 7. jsQR Adaptive Binarization / Contrast Boost
  const d = imgData.data;
  let totalLum = 0;
  for (let i = 0; i < d.length; i += 4) {
    totalLum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  }
  const avgLum = totalLum / (d.length / 4);
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

  return { success: false, error: 'No QR code detected' };
}
