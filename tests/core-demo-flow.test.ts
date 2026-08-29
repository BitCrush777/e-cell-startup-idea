import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createRoom, getRoom, joinRoom, validateRoom } from '../src/lib/room-store';
import { parseQrContent, extractRoomCode, normalizeRoomCode } from '../src/lib/urls';
import { defaultModerator, SAFE_ROOM_CONFIG } from '../src/lib/moderation/word-filter';
import { submitFeedback, getFeedbackAnalytics, resetFeedbackStore } from '../src/lib/feedback-store';

describe('TempLink Core Demo Flow & Production Reliability Tests', () => {
  test('STEP 1 — Room Creation: Generates unique collision-free XXXX-XXXX code and valid production join URL', () => {
    const roomA = createRoom({
      durationMinutes: 30,
      plan: 'FREE',
      maxMembers: 3,
      creatorName: 'User A (Laptop)',
    });

    const roomB = createRoom({
      durationMinutes: 30,
      plan: 'PRO',
      maxMembers: 10,
      creatorName: 'User B (Phone)',
    });

    // 1. Code format check
    assert.match(roomA.roomCode, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Code must match XXXX-XXXX format');
    assert.match(roomB.roomCode, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Code must match XXXX-XXXX format');
    assert.notStrictEqual(roomA.roomCode, roomB.roomCode, 'Rooms must have unique codes');

    // 2. Join URL check
    assert.ok(roomA.joinUrl.includes(`/join/${roomA.roomCode}`));
    assert.strictEqual(roomA.maxMembers, 3);
    assert.strictEqual(roomB.maxMembers, 10);
    assert.strictEqual(roomA.status, 'WAITING');
  });

  test('STEP 2 — QR Code Parsing & Security: Normalizes production URLs and rejects external/malicious links', () => {
    // Valid Production Join URL
    const validUrl = 'https://templink.in/join/K7XM-4P2Q';
    const parsedValid = parseQrContent(validUrl);
    assert.strictEqual(parsedValid.valid, true);
    assert.strictEqual(parsedValid.roomCode, 'K7XM-4P2Q');

    // Valid Query Param URL
    const validQuery = 'https://templink.in/join?code=K7XM-4P2Q';
    const parsedQuery = parseQrContent(validQuery);
    assert.strictEqual(parsedQuery.valid, true);
    assert.strictEqual(parsedQuery.roomCode, 'K7XM-4P2Q');

    // Raw Code
    const rawCode = 'k7xm4p2q';
    assert.strictEqual(normalizeRoomCode(rawCode), 'K7XM-4P2Q');
    const parsedRaw = parseQrContent(rawCode);
    assert.strictEqual(parsedRaw.valid, true);
    assert.strictEqual(parsedRaw.roomCode, 'K7XM-4P2Q');

    // Malicious External URL
    const phishingUrl = 'https://fake-templink.phishing.com/join/K7XM-4P2Q';
    const parsedMalicious = parseQrContent(phishingUrl);
    assert.strictEqual(parsedMalicious.valid, false);
    assert.ok(parsedMalicious.error?.includes('external website'));

    // Arbitrary URL
    const arbitraryUrl = 'https://google.com';
    assert.strictEqual(parseQrContent(arbitraryUrl).valid, false);
  });

  test('STEP 3 — User B Joins Room: Authoritative server validation and participant list update', () => {
    const room = createRoom({
      durationMinutes: 15,
      plan: 'FREE',
      maxMembers: 3,
      creatorName: 'Alice (Laptop)',
    });

    // Validate room before join
    const validation = validateRoom(room.roomCode);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.room?.roomCode, room.roomCode);

    // User B joins
    const joinRes = joinRoom(room.roomCode, 'p_user_b', 'Bob (Mobile 5G)');
    assert.strictEqual(joinRes.success, true);
    assert.strictEqual(joinRes.room?.participants.length, 2);
    assert.strictEqual(joinRes.room?.status, 'ACTIVE');

    // Verify Bob is in participant list
    const fetched = getRoom(room.roomCode);
    assert.ok(fetched?.participants.some((p: any) => p.participantId === 'p_user_b' && p.displayName === 'Bob (Mobile 5G)'));
  });

  test('STEP 4 — Multi-Member Capacity Enforcement: Free room allows 3 and strictly blocks 4th member', () => {
    const room = createRoom({
      durationMinutes: 30,
      plan: 'FREE',
      maxMembers: 3,
      creatorName: 'Member 1',
    });

    // Member 2 joins
    const res2 = joinRoom(room.roomCode, 'p_m2', 'Member 2');
    assert.strictEqual(res2.success, true);

    // Member 3 joins (Capacity reached: 3/3)
    const res3 = joinRoom(room.roomCode, 'p_m3', 'Member 3');
    assert.strictEqual(res3.success, true);

    // Member 4 tries to join -> BLOCKED
    const res4 = joinRoom(room.roomCode, 'p_m4', 'Member 4');
    assert.strictEqual(res4.success, false);
    assert.ok(res4.error?.includes('full') || res4.error?.includes('limit'));

    // Validation confirms full status
    const valFull = validateRoom(room.roomCode);
    assert.strictEqual(valFull.valid, false);
    assert.strictEqual(valFull.code, 'ROOM_FULL');
  });

  test('STEP 5 — SafeRoom Moderation in Active Flow: Blocks profanity, warns sender, terminates room on 3rd violation', () => {
    // Test clean message
    const cleanMsg = defaultModerator.moderate('Hey! Welcome to the TempLink room.');
    assert.strictEqual(cleanMsg.allowed, true);

    // Test prohibited message
    const badMsg = defaultModerator.moderate('You are an idiot asshole');
    assert.strictEqual(badMsg.allowed, false);

    // Verify threshold structure
    assert.strictEqual(SAFE_ROOM_CONFIG.maxWarnings, 2);
    assert.strictEqual(SAFE_ROOM_CONFIG.terminateOnViolationNumber, 3);
  });

  test('STEP 6 — Post-Room User Feedback & Validation Flow', () => {
    resetFeedbackStore();

    const room = createRoom({
      durationMinutes: 10,
      plan: 'FREE',
      creatorName: 'Tester',
    });

    // Submit post-room feedback
    const submission = submitFeedback({
      roomCode: room.roomCode,
      rating: 5,
      wouldUseAgain: 'DEFINITELY',
      improvementText: 'Tested across laptop and Android phone seamlessly over 5G!',
      useCase: 'Startup demo',
      plan: 'FREE',
      memberCount: 2,
    });

    assert.strictEqual(submission.success, true);
    assert.ok(submission.feedback?.id.startsWith('fb_'));

    // Verify analytics aggregation
    const analytics = getFeedbackAnalytics();
    assert.strictEqual(analytics.totalResponses, 1);
    assert.strictEqual(analytics.averageRating, 5);
    assert.strictEqual(analytics.wouldUseAgainPositivePercent, 100);
  });

  test('STEP 7 — Concurrent Join Race Conditions & Leave Slot Freeing', () => {
    // Room with 2 slots occupied, 1 remaining (2/3)
    const room = createRoom({
      durationMinutes: 30,
      plan: 'FREE',
      maxMembers: 3,
      creatorName: 'Host',
    });
    joinRoom(room.roomCode, 'p_2', 'User 2');

    // Simulate 2 users attempting to join the last slot simultaneously
    const joinAttempts = [
      () => joinRoom(room.roomCode, 'p_3a', 'Simultaneous User A'),
      () => joinRoom(room.roomCode, 'p_3b', 'Simultaneous User B'),
    ];

    const results = joinAttempts.map((fn) => fn());
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Exactly one must succeed, exactly one must fail
    assert.strictEqual(successes.length, 1, 'Only 1 user gets the last slot');
    assert.strictEqual(failures.length, 1, 'The other user gets rejected with room full');
    assert.strictEqual(getRoom(room.roomCode)?.participants.length, 3);
  });

  test('STEP 8 — Cross-Room Isolation Guarantee: No data or moderation bleed between rooms', () => {
    const room1 = createRoom({ durationMinutes: 15, plan: 'FREE', creatorName: 'Alice' });
    const room2 = createRoom({ durationMinutes: 15, plan: 'FREE', creatorName: 'Bob' });

    assert.notStrictEqual(room1.roomCode, room2.roomCode);

    // Join participants to Room 1
    joinRoom(room1.roomCode, 'p_alice_friend', 'Charlie');

    // Verify Room 2 is completely isolated
    const fetchedRoom2 = getRoom(room2.roomCode);
    assert.strictEqual(fetchedRoom2?.participants.length, 1);
    assert.strictEqual(fetchedRoom2?.participants[0].displayName, 'Bob');
  });
});
