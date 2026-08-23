import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateRoomCode, generateTemporaryIdentity, generateParticipantId, generateInternalRoomId } from '../src/lib/identity';
import { formatTimeRemaining } from '../src/lib/crypto';
import { createRoom, getRoom, validateRoom, joinRoom } from '../src/lib/room-store';
import { getMaxRoomMembers, ROOM_LIMITS } from '../src/lib/plans';

describe('TempLink Room Architecture & Multi-Participant Tests', () => {
  test('centralized plan member limits adhere to official specifications', () => {
    assert.strictEqual(getMaxRoomMembers('FREE'), 3);
    assert.strictEqual(getMaxRoomMembers('PRO'), 10);
    assert.strictEqual(getMaxRoomMembers('BUSINESS'), 25);
    assert.strictEqual(getMaxRoomMembers(), 3);
  });

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
    assert.ok(!code.includes('0'));
    assert.ok(!code.includes('O'));
    assert.ok(!code.includes('1'));
    assert.ok(!code.includes('I'));
  });

  test('FREE PLAN Room: allows exactly 3 members and blocks 4th member', () => {
    const freeRoom = createRoom({
      durationMinutes: 15,
      plan: 'FREE',
      creatorName: 'FreeHost',
    });

    assert.strictEqual(freeRoom.maxMembers, 3);
    assert.strictEqual(freeRoom.participants.length, 1);

    // Member 2 joins
    const join2 = joinRoom(freeRoom.roomCode, 'p_mem2', 'Member 2');
    assert.strictEqual(join2.success, true);
    assert.strictEqual(freeRoom.participants.length, 2);

    // Member 3 joins
    const join3 = joinRoom(freeRoom.roomCode, 'p_mem3', 'Member 3');
    assert.strictEqual(join3.success, true);
    assert.strictEqual(freeRoom.participants.length, 3);

    // Member 4 tries to join -> Must be rejected with ROOM_FULL
    const join4 = joinRoom(freeRoom.roomCode, 'p_mem4', 'Member 4');
    assert.strictEqual(join4.success, false);
    assert.strictEqual(join4.code, 'ROOM_FULL');
    assert.strictEqual(freeRoom.participants.length, 3);

    // validateRoom should also return status: 'full'
    const validateFull = validateRoom(freeRoom.roomCode);
    assert.strictEqual(validateFull.valid, false);
    assert.strictEqual(validateFull.status, 'full');
  });

  test('PRO PLAN Room: allows up to 10 members and blocks 11th member', () => {
    const proRoom = createRoom({
      durationMinutes: 30,
      plan: 'PRO',
      creatorName: 'ProHost',
    });

    assert.strictEqual(proRoom.maxMembers, 10);
    assert.strictEqual(proRoom.participants.length, 1);

    // Join members 2 through 10
    for (let i = 2; i <= 10; i++) {
      const res = joinRoom(proRoom.roomCode, `p_pro_${i}`, `Pro Member ${i}`);
      assert.strictEqual(res.success, true, `Pro Member ${i} should be allowed`);
    }

    assert.strictEqual(proRoom.participants.length, 10);

    // Member 11 tries to join -> Must be rejected with ROOM_FULL
    const join11 = joinRoom(proRoom.roomCode, 'p_pro_11', 'Pro Member 11');
    assert.strictEqual(join11.success, false);
    assert.strictEqual(join11.code, 'ROOM_FULL');
    assert.strictEqual(proRoom.participants.length, 10);
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
