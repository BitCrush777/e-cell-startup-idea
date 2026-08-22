import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateRoomCode, generateTemporaryIdentity, generateParticipantId, generateInternalRoomId } from '../src/lib/identity';
import { formatTimeRemaining } from '../src/lib/crypto';
import { createRoom, getRoom, validateRoom } from '../src/lib/room-store';

describe('TempLink Room Architecture & Uniqueness Tests', () => {
  test('generateParticipantId creates unique crypto-stable participant IDs (p_...)', () => {
    const id1 = generateParticipantId();
    const id2 = generateParticipantId();

    assert.ok(id1.startsWith('p_'));
    assert.ok(id2.startsWith('p_'));
    assert.notStrictEqual(id1, id2, 'Participant IDs must be cryptographically unique');
  });

  test('generateInternalRoomId creates unique room IDs (room_...)', () => {
    const r1 = generateInternalRoomId();
    const r2 = generateInternalRoomId();
    assert.ok(r1.startsWith('room_'));
    assert.ok(r2.startsWith('room_'));
    assert.notStrictEqual(r1, r2);
  });

  test('generateRoomCode produces valid 8-character format (XXXX-XXXX) with clean alphabet', () => {
    const code = generateRoomCode();
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    // Ensure no ambiguous characters (0, O, 1, I)
    assert.ok(!code.includes('0'));
    assert.ok(!code.includes('O'));
    assert.ok(!code.includes('1'));
    assert.ok(!code.includes('I'));
  });

  test('Stress Test: 100 sequentially generated room codes have 0 duplicates', () => {
    const generated = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const room = createRoom({
        durationMinutes: 15,
        creatorName: `Tester_${i}`,
      });

      assert.ok(room.roomCode, 'Room code must exist');
      assert.ok(room.joinUrl, 'Join URL must exist');
      assert.ok(room.joinUrl.includes(room.roomCode), 'Join URL must contain the room code');
      assert.strictEqual(generated.has(room.roomCode), false, `Collision detected on code: ${room.roomCode}`);
      generated.add(room.roomCode);
    }
    assert.strictEqual(generated.size, 100, 'All 100 rooms must have unique codes');
  });

  test('validateRoom correctly validates active rooms and rejects expired rooms', () => {
    const activeRoom = createRoom({
      durationMinutes: 15,
      creatorName: 'ActiveHost',
    });

    const activeCheck = validateRoom(activeRoom.roomCode);
    assert.strictEqual(activeCheck.valid, true);
    assert.strictEqual(activeCheck.room?.roomCode, activeRoom.roomCode);

    // Non-existent code
    const nonExistent = validateRoom('ZZZZ-9999');
    assert.strictEqual(nonExistent.valid, false);
  });

  test('formatTimeRemaining calculates normal, warning, critical, and expired states correctly', () => {
    const now = Date.now();

    const normal = formatTimeRemaining(now + 25 * 60 * 1000);
    assert.strictEqual(normal.isWarning, false);
    assert.strictEqual(normal.isCritical, false);
    assert.strictEqual(normal.isExpired, false);

    const warning = formatTimeRemaining(now + 3 * 60 * 1000);
    assert.strictEqual(warning.isWarning, true);
    assert.strictEqual(warning.isCritical, false);

    const critical = formatTimeRemaining(now + 30 * 1000);
    assert.strictEqual(critical.isWarning, false);
    assert.strictEqual(critical.isCritical, true);

    const expired = formatTimeRemaining(now - 1000);
    assert.strictEqual(expired.isExpired, true);
  });
});
