import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseQrContent, getJoinUrl, getAppBaseUrl } from '../src/lib/urls';
import { generateRoomCode, generateInternalRoomId, createRoom } from '../src/lib/room-store';

describe('TempLink QR Code Generation, URL Parsing & Security Tests', () => {
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

  test('parseQrContent parses raw formatted room codes', () => {
    const res = parseQrContent('M5QK-9X7P');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.roomCode, 'M5QK-9X7P');
  });

  test('parseQrContent parses unhyphenated 8-char codes into formatted XXXX-XXXX', () => {
    const res = parseQrContent('K7XM4P2Q');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.roomCode, 'K7XM-4P2Q');
  });

  test('Security: parseQrContent rejects external malicious URLs', () => {
    const malicious = 'https://evil-phishing-site.com/steal-creds';
    const res = parseQrContent(malicious);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error?.includes('external') || res.error?.includes('not a valid TempLink'));
  });

  test('Security: parseQrContent rejects invalid gibberish', () => {
    const res = parseQrContent('???');
    assert.strictEqual(res.valid, false);
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

      // Verify QR parsing on each generated join URL
      const parsed = parseQrContent(room.joinUrl);
      assert.strictEqual(parsed.valid, true);
      assert.strictEqual(parsed.roomCode, room.roomCode);
    }

    assert.strictEqual(codes.size, 100);
    assert.strictEqual(joinUrls.size, 100);
  });
});
