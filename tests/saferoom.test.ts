import { test, describe } from 'node:test';
import assert from 'node:assert';
import { defaultModerator, normalizeMessage, WordFilterModerationProvider } from '../src/lib/moderation/word-filter';
import { SAFE_ROOM_CONFIG } from '../src/lib/moderation/config';
import { createRoom, getRoom, validateRoom, joinRoom, addMessage } from '../src/lib/room-store';

describe('SafeRoom Conversation Moderation & Policy Enforcement Tests', () => {
  test('SAFE_ROOM_CONFIG centralized settings match specifications', () => {
    assert.strictEqual(SAFE_ROOM_CONFIG.enabled, true);
    assert.strictEqual(SAFE_ROOM_CONFIG.maxWarnings, 2);
    assert.strictEqual(SAFE_ROOM_CONFIG.terminateOnViolationNumber, 3);
    assert.strictEqual(SAFE_ROOM_CONFIG.messageMaxLength, 10000);
  });

  test('TEST 1 — Normal clean chat messages are allowed without false positives', () => {
    const cleanSamples = [
      'Hey everyone, are we meeting at 6?',
      'Please check the attached documentation.',
      'That was a classic game!',
      'Can you pass the notes from yesterday?',
      'The assassin in the game had great stealth.',
      'We need some butter and bread.',
      'Everything looks fine and respectful.',
    ];

    for (const msg of cleanSamples) {
      const result = defaultModerator.moderate(msg);
      assert.strictEqual(result.allowed, true, `Expected clean message to pass: "${msg}"`);
    }
  });

  test('TEST 2 — Obfuscation normalization handles spaced characters and leetspeak', () => {
    const prohibitedObfuscated = [
      'What the f u c k is this',
      'You are a b.i.t.c.h',
      'Go d i e now',
      'Shut up a$$hole',
      'k-y-s right now',
    ];

    for (const msg of prohibitedObfuscated) {
      const result = defaultModerator.moderate(msg);
      assert.strictEqual(result.allowed, false, `Expected obfuscated violation to be blocked: "${msg}"`);
    }
  });

  test('TEST 3 — Warning 1 of 2: First violation blocks message and issues Warning 1', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'TestHost',
    });

    const userA = 'p_user_a';
    joinRoom(room.roomCode, userA, 'Alice');

    // First violation
    const res1 = addMessage(room.roomCode, userA, 'Alice', 'What the f u c k');
    assert.strictEqual(res1.success, false);
    assert.strictEqual(res1.code, 'MODERATION_VIOLATION');
    assert.strictEqual(res1.warningNumber, 1);
    assert.strictEqual(res1.warningsRemaining, 1);
    assert.strictEqual(res1.finalWarning, false);

    // Room must still be ACTIVE
    const checkRoom = getRoom(room.roomCode);
    assert.strictEqual(checkRoom?.status, 'ACTIVE');
  });

  test('TEST 4 — Final Warning: Second violation issues Final Warning (2 of 2)', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'TestHost2',
    });

    const userA = 'p_user_a2';
    joinRoom(room.roomCode, userA, 'Alice');

    // Violation #1
    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    // Violation #2
    const res2 = addMessage(room.roomCode, userA, 'Alice', 'bitch');

    assert.strictEqual(res2.success, false);
    assert.strictEqual(res2.code, 'MODERATION_VIOLATION');
    assert.strictEqual(res2.warningNumber, 2);
    assert.strictEqual(res2.warningsRemaining, 0);
    assert.strictEqual(res2.finalWarning, true);

    // Room must still be ACTIVE after warning 2
    const checkRoom = getRoom(room.roomCode);
    assert.strictEqual(checkRoom?.status, 'ACTIVE');
  });

  test('TEST 5 — Third Violation: Closes entire room with MODERATION_TERMINATED', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'TestHost3',
    });

    const userA = 'p_user_a3';
    joinRoom(room.roomCode, userA, 'Alice');

    // Violation #1
    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    // Violation #2
    addMessage(room.roomCode, userA, 'Alice', 'bitch');
    // Violation #3 -> Trigger room termination
    const res3 = addMessage(room.roomCode, userA, 'Alice', 'kill yourself');

    assert.strictEqual(res3.success, false);
    assert.strictEqual(res3.code, 'ROOM_TERMINATED');
    assert.strictEqual(res3.warningNumber, 3);
    assert.strictEqual(res3.finalWarning, true);

    // Room must now be MODERATION_TERMINATED and volatile messages wiped
    const checkRoom = getRoom(room.roomCode);
    assert.strictEqual(checkRoom?.status, 'MODERATION_TERMINATED');
    assert.strictEqual(checkRoom?.messages.length, 0);
  });

  test('TEST 6 — Participant Warning Isolation: User B does not inherit User A warnings', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'IsolationHost',
    });

    const userA = 'p_iso_a';
    const userB = 'p_iso_b';
    joinRoom(room.roomCode, userA, 'Alice');
    joinRoom(room.roomCode, userB, 'Bob');

    // User A commits 2 violations
    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    addMessage(room.roomCode, userA, 'Alice', 'bitch');

    // User B sends a normal clean message -> Must succeed without warnings
    const bClean = addMessage(room.roomCode, userB, 'Bob', 'Hello everyone!');
    assert.strictEqual(bClean.success, true);
    assert.ok(bClean.message);

    // User B commits 1 violation -> Must receive Warning 1 (NOT warning 3)
    const bViol = addMessage(room.roomCode, userB, 'Bob', 'f u c k');
    assert.strictEqual(bViol.success, false);
    assert.strictEqual(bViol.warningNumber, 1, 'User B must have warning count 1');
    assert.strictEqual(bViol.finalWarning, false);
  });

  test('TEST 7 — Terminated rooms reject new join and validate requests', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'TermHost',
    });

    const userA = 'p_term_a';
    joinRoom(room.roomCode, userA, 'Alice');

    // 3 violations
    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    addMessage(room.roomCode, userA, 'Alice', 'bitch');
    addMessage(room.roomCode, userA, 'Alice', 'kill yourself');

    // New participant tries to join terminated room -> Must be rejected
    const joinRes = joinRoom(room.roomCode, 'p_late_joiner', 'Charlie');
    assert.strictEqual(joinRes.success, false);
    assert.strictEqual(joinRes.code, 'ROOM_TERMINATED');

    // validateRoom must return valid: false, status: 'terminated'
    const validateRes = validateRoom(room.roomCode);
    assert.strictEqual(validateRes.valid, false);
    assert.strictEqual(validateRes.code, 'ROOM_TERMINATED');
  });

  test('TEST 8 — Room Isolation: Room A moderation does not affect Room B', () => {
    const roomA = createRoom({ durationMinutes: 15, creatorName: 'HostA' });
    const roomB = createRoom({ durationMinutes: 15, creatorName: 'HostB' });

    // Terminate Room A
    joinRoom(roomA.roomCode, 'p_a', 'Alice');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'f u c k');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'bitch');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'kill yourself');

    assert.strictEqual(getRoom(roomA.roomCode)?.status, 'MODERATION_TERMINATED');

    // Room B must remain ACTIVE and healthy
    assert.strictEqual(getRoom(roomB.roomCode)?.status, 'WAITING');
    const bJoin = joinRoom(roomB.roomCode, 'p_b', 'Bob');
    assert.strictEqual(bJoin.success, true);
    const bMsg = addMessage(roomB.roomCode, 'p_b', 'Bob', 'All clear in Room B');
    assert.strictEqual(bMsg.success, true);
  });
});
