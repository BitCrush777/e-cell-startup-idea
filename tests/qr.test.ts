import { test, describe } from 'node:test';
import assert from 'node:assert';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { parseQrContent, getJoinUrl, extractRoomCode, normalizeRoomCode } from '../src/lib/urls';
import { createRoom } from '../src/lib/room-store';

describe('TempLink QR Code Generation, URL Parsing & Normalization Tests', () => {
  test('normalizeRoomCode normalizes various user and scanner inputs', () => {
    assert.strictEqual(normalizeRoomCode('k7xm4p2q'), 'K7XM-4P2Q');
    assert.strictEqual(normalizeRoomCode('K7XM-4P2Q'), 'K7XM-4P2Q');
    assert.strictEqual(normalizeRoomCode('k7xm-4p2q'), 'K7XM-4P2Q');
    assert.strictEqual(normalizeRoomCode(' K7XM 4P2Q '), 'K7XM-4P2Q');
    assert.strictEqual(normalizeRoomCode('r8tz6w3a'), 'R8TZ-6W3A');
  });

  test('extractRoomCode correctly extracts room code from full production URLs', () => {
    const code = extractRoomCode('https://templink.in/join/K7XM-4P2Q');
    assert.strictEqual(code, 'K7XM-4P2Q');
  });

  test('extractRoomCode correctly extracts room code from raw text payload', () => {
    const code = extractRoomCode('K7XM-4P2Q');
    assert.strictEqual(code, 'K7XM-4P2Q');
  });

  test('extractRoomCode returns null for malicious or external URLs', () => {
    assert.strictEqual(extractRoomCode('https://malicious-site.com/join/K7XM-4P2Q'), null);
    assert.strictEqual(extractRoomCode('https://google.com'), null);
    assert.strictEqual(extractRoomCode('???'), null);
  });

  test('getJoinUrl formats production URLs cleanly', () => {
    const code = 'K7XM-4P2Q';
    const joinUrl = getJoinUrl(code);
    assert.ok(joinUrl.endsWith('/join/K7XM-4P2Q'), 'joinUrl must end with /join/ROOM_CODE');
    assert.strictEqual(joinUrl.includes('undefined'), false, 'joinUrl must never contain undefined');
  });

  test('parseQrContent parses valid TempLink join URLs', () => {
    const url = 'https://templink.in/join/K7XM-4P2Q';
    const res = parseQrContent(url);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.roomCode, 'K7XM-4P2Q');
    assert.ok(res.joinUrl?.endsWith('/join/K7XM-4P2Q'));
  });

  test('parseQrContent parses relative join paths', () => {
    const res = parseQrContent('/join/R8TZ-6W3A');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.roomCode, 'R8TZ-6W3A');
  });

  test('Security: parseQrContent rejects external malicious URLs', () => {
    const malicious = 'https://evil-phishing-site.com/steal-creds';
    const res = parseQrContent(malicious);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error?.includes('external') || res.error?.includes('not a valid TempLink'));
  });

  test('100 Room Test: 100 sequentially created rooms have unique codes and unique join URLs', () => {
    const codes = new Set<string>();
    const joinUrls = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const room = createRoom({
        durationMinutes: 15,
        maxParticipants: 2,
        creatorName: 'User' + i,
      });

      assert.strictEqual(codes.has(room.roomCode), false, `Duplicate code found: ${room.roomCode}`);
      assert.strictEqual(joinUrls.has(room.joinUrl), false, `Duplicate join URL found: ${room.joinUrl}`);

      codes.add(room.roomCode);
      joinUrls.add(room.joinUrl);

      // Verify QR extraction on each generated join URL
      const extracted = extractRoomCode(room.joinUrl);
      assert.strictEqual(extracted, room.roomCode);
    }

    assert.strictEqual(codes.size, 100);
    assert.strictEqual(joinUrls.size, 100);
  });

  test('Real QR Pipeline: Decodes generated QR PNG buffer and extracts room code', async () => {
    const url = 'https://templink.in/join/9A4K-2XYZ';
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 250,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const png = PNG.sync.read(buffer);
    const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height, {
      inversionAttempts: 'attemptBoth',
    });

    assert.ok(code && code.data, 'QR must decode successfully');
    assert.strictEqual(code.data, url);
    assert.strictEqual(extractRoomCode(code.data), '9A4K-2XYZ');
  });

  test('Desktop Screenshot Simulation: Decodes 1920x1080 screenshot with centered modal QR', async () => {
    const url = 'https://templink.in/join/7M4P-8K2L';
    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const qrPng = PNG.sync.read(qrBuffer);

    // Create 1920x1080 dark theme desktop canvas
    const desktop = new PNG({ width: 1920, height: 1080 });
    for (let i = 0; i < desktop.data.length; i += 4) {
      desktop.data[i] = 8;
      desktop.data[i + 1] = 11;
      desktop.data[i + 2] = 18;
      desktop.data[i + 3] = 255;
    }
    const startX = Math.floor((1920 - qrPng.width) / 2);
    const startY = Math.floor((1080 - qrPng.height) / 2);
    PNG.bitblt(qrPng, desktop, 0, 0, qrPng.width, qrPng.height, startX, startY);

    // Pass 1: Direct full image
    const code = jsQR(new Uint8ClampedArray(desktop.data), desktop.width, desktop.height, {
      inversionAttempts: 'attemptBoth',
    });

    assert.ok(code && code.data, 'Desktop screenshot QR must decode');
    assert.strictEqual(code.data, url);
    assert.strictEqual(extractRoomCode(code.data), '7M4P-8K2L');
  });

  test('Mobile Screenshot Simulation: Decodes 1080x2400 tall screenshot with modal QR', async () => {
    const url = 'https://templink.in/join/3B8X-9N1P';
    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 220,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const qrPng = PNG.sync.read(qrBuffer);

    // Create 1080x2400 tall mobile canvas
    const mobile = new PNG({ width: 1080, height: 2400 });
    for (let i = 0; i < mobile.data.length; i += 4) {
      mobile.data[i] = 5;
      mobile.data[i + 1] = 7;
      mobile.data[i + 2] = 11;
      mobile.data[i + 3] = 255;
    }
    const startX = Math.floor((1080 - qrPng.width) / 2);
    const startY = Math.floor((2400 - qrPng.height) / 2);
    PNG.bitblt(qrPng, mobile, 0, 0, qrPng.width, qrPng.height, startX, startY);

    // Center 60% crop test
    const cropW = Math.floor(mobile.width * 0.6);
    const cropH = Math.floor(mobile.height * 0.6);
    const cropX = Math.floor((mobile.width - cropW) / 2);
    const cropY = Math.floor((mobile.height - cropH) / 2);
    const cropped = new PNG({ width: cropW, height: cropH });
    PNG.bitblt(mobile, cropped, cropX, cropY, cropW, cropH, 0, 0);

    const code = jsQR(new Uint8ClampedArray(cropped.data), cropW, cropH, {
      inversionAttempts: 'attemptBoth',
    });

    assert.ok(code && code.data, 'Mobile screenshot QR must decode');
    assert.strictEqual(code.data, url);
    assert.strictEqual(extractRoomCode(code.data), '3B8X-9N1P');
  });
});
