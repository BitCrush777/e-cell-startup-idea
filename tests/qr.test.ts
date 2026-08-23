import { test, describe } from 'node:test';
import assert from 'node:assert';
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
});
