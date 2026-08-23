import { test, describe } from 'node:test';
import assert from 'node:assert';
import { defaultModerator, normalizeMessage, WordFilterModerationProvider } from '../src/lib/moderation/word-filter';
import { SAFE_ROOM_CONFIG, MODERATION_DICTIONARY_VERSION } from '../src/lib/moderation/config';
import { defaultPatternCatalog } from '../src/lib/moderation/patterns';
import { createRoom, getRoom, validateRoom, joinRoom, addMessage } from '../src/lib/room-store';

describe('SafeRoom Expanded Conversation Moderation & Policy Tests', () => {
  test('Version and centralized configuration are properly structured', () => {
    assert.strictEqual(MODERATION_DICTIONARY_VERSION, '2026.08.1');
    assert.strictEqual(SAFE_ROOM_CONFIG.enabled, true);
    assert.strictEqual(SAFE_ROOM_CONFIG.maxWarnings, 2);
    assert.strictEqual(SAFE_ROOM_CONFIG.terminateOnViolationNumber, 3);
    assert.strictEqual(SAFE_ROOM_CONFIG.messageMaxLength, 10000);
    assert.strictEqual(SAFE_ROOM_CONFIG.enabledCategories.length, 8);
    assert.ok(defaultPatternCatalog.getAllRules().length >= 20);
  });

  test('TEST 1 — Comprehensive False Positive Protection (Clean & Ambiguous Vocabulary)', () => {
    const cleanSamples = [
      'Hey everyone, are we meeting at 6?',
      'Please check the attached documentation.',
      'That was a classic game!',
      'Can you pass the notes from yesterday?',
      'The assassin in the game had great stealth.',
      'We need some butter and bread.',
      'Everything looks fine and respectful.',
      'We will look at the compass heading.',
      'The green grass is growing rapidly.',
      'We are attending physics class today.',
      'We assume the assignment is due tomorrow.',
      'He played a wonderful acoustic bass solo.',
      'Charles Dickens was an English novelist.',
      'The assembly meeting is scheduled for Monday.',
      'Enjoy your evening and welcome to TempLink!',
      'Please send the document title and summary.',
    ];

    for (const msg of cleanSamples) {
      const result = defaultModerator.moderate(msg);
      assert.strictEqual(result.allowed, true, `Expected clean message to pass without false positive: "${msg}"`);
    }
  });

  test('TEST 2 — Multi-Category Violation Tagging & Severity Matching', () => {
    // 1. PROFANITY
    const prof = defaultModerator.moderate('What the fucking bullshit is this');
    assert.strictEqual(prof.allowed, false);
    assert.ok(['PROFANITY', 'HARASSMENT'].includes(prof.category!));
    assert.ok(prof.matchedRuleId?.startsWith('PROFANITY_'));

    // 2. HARASSMENT
    const har = defaultModerator.moderate('Go die and jump off a bridge');
    assert.strictEqual(har.allowed, false);
    assert.strictEqual(har.category, 'HARASSMENT');
    assert.strictEqual(har.severity, 'HIGH');
    assert.strictEqual(har.matchedRuleId, 'HARASSMENT_004');

    // 3. THREATS
    const threat = defaultModerator.moderate('I will hunt and kill you');
    assert.strictEqual(threat.allowed, false);
    assert.strictEqual(threat.category, 'THREATS');
    assert.strictEqual(threat.severity, 'HIGH');
    assert.strictEqual(threat.matchedRuleId, 'THREAT_001');

    // 4. SEXUAL_ABUSE
    const sex = defaultModerator.moderate('send nudes right now');
    assert.strictEqual(sex.allowed, false);
    assert.strictEqual(sex.category, 'SEXUAL_ABUSE');
    assert.strictEqual(sex.severity, 'HIGH');
    assert.strictEqual(sex.matchedRuleId, 'SEXUAL_ABUSE_002');

    // 5. HATEFUL_LANGUAGE
    const hate = defaultModerator.moderate('Heil Hitler nazi scum');
    assert.strictEqual(hate.allowed, false);
    assert.strictEqual(hate.category, 'HATEFUL_LANGUAGE');
    assert.strictEqual(hate.severity, 'HIGH');
    assert.strictEqual(hate.matchedRuleId, 'HATE_001');

    // 6. SLURS
    const slur = defaultModerator.moderate('You are a faggot');
    assert.strictEqual(slur.allowed, false);
    assert.strictEqual(slur.category, 'SLURS');
    assert.strictEqual(slur.severity, 'HIGH');
    assert.strictEqual(slur.matchedRuleId, 'SLUR_002');

    // 7. PERSONAL_ATTACKS
    const attack = defaultModerator.moderate('You are stupid and pathetic');
    assert.strictEqual(attack.allowed, false);
    assert.strictEqual(attack.category, 'PERSONAL_ATTACKS');
    assert.strictEqual(attack.severity, 'MEDIUM');
    assert.strictEqual(attack.matchedRuleId, 'PERSONAL_ATTACK_001');

    // 8. SPAM_ABUSE
    const spam = defaultModerator.moderate('Claim your free bitcoin and crypto airdrop now');
    assert.strictEqual(spam.allowed, false);
    assert.strictEqual(spam.category, 'SPAM_ABUSE');
    assert.strictEqual(spam.severity, 'LOW');
    assert.strictEqual(spam.matchedRuleId, 'SPAM_ABUSE_001');
  });

  test('TEST 3 — Multilingual Support (Hindi / Hinglish Transliteration Rules)', () => {
    const hindi1 = defaultModerator.moderate('tere ko jaan se maar dunga');
    assert.strictEqual(hindi1.allowed, false);
    assert.strictEqual(hindi1.category, 'THREATS');
    assert.strictEqual(hindi1.matchedRuleId, 'HI_THREAT_001');

    const hindi2 = defaultModerator.moderate('tu ek number ka madarchod hai');
    assert.strictEqual(hindi2.allowed, false);
    assert.strictEqual(hindi2.category, 'PROFANITY');
    assert.strictEqual(hindi2.matchedRuleId, 'HI_PROFANITY_001');
  });

  test('TEST 4 — Obfuscation & Evasion Handling (Spaced characters, Leetspeak, Repeating runs)', () => {
    const obfuscatedSamples = [
      'What the f u c k is this',
      'You are a b.i.t.c.h',
      'Go d i e now',
      'Shut up a$$hole',
      'k-y-s right now',
      'fuuuuucking idiot',
      'you are a b!tch',
      'shiiiit happens',
    ];

    for (const msg of obfuscatedSamples) {
      const result = defaultModerator.moderate(msg);
      assert.strictEqual(result.allowed, false, `Expected obfuscated violation to be blocked: "${msg}"`);
    }
  });

  test('TEST 5 — Warning 1 of 2: First violation blocks message and returns Warning 1 metadata', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'Host_W1',
    });

    const userA = 'p_user_w1';
    joinRoom(room.roomCode, userA, 'Alice');

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

  test('TEST 6 — Final Warning: Second violation returns Final Warning metadata (2 of 2)', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'Host_W2',
    });

    const userA = 'p_user_w2';
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

    // Room must still be ACTIVE
    const checkRoom = getRoom(room.roomCode);
    assert.strictEqual(checkRoom?.status, 'ACTIVE');
  });

  test('TEST 7 — Third Violation: Immediately terminates room with MODERATION_TERMINATED', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'Host_W3',
    });

    const userA = 'p_user_w3';
    joinRoom(room.roomCode, userA, 'Alice');

    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    addMessage(room.roomCode, userA, 'Alice', 'bitch');
    const res3 = addMessage(room.roomCode, userA, 'Alice', 'kill yourself');

    assert.strictEqual(res3.success, false);
    assert.strictEqual(res3.code, 'ROOM_TERMINATED');
    assert.strictEqual(res3.warningNumber, 3);
    assert.strictEqual(res3.finalWarning, true);

    const checkRoom = getRoom(room.roomCode);
    assert.strictEqual(checkRoom?.status, 'MODERATION_TERMINATED');
    assert.strictEqual(checkRoom?.messages.length, 0);
  });

  test('TEST 8 — Participant Warning Isolation: User B is unaffected by User A warnings', () => {
    const room = createRoom({
      durationMinutes: 15,
      creatorName: 'Host_Iso',
    });

    const userA = 'p_iso_alice';
    const userB = 'p_iso_bob';
    joinRoom(room.roomCode, userA, 'Alice');
    joinRoom(room.roomCode, userB, 'Bob');

    // Alice gets 2 warnings
    addMessage(room.roomCode, userA, 'Alice', 'f u c k');
    addMessage(room.roomCode, userA, 'Alice', 'bitch');

    // Bob sends clean message -> Allowed
    const bClean = addMessage(room.roomCode, userB, 'Bob', 'Good afternoon everyone!');
    assert.strictEqual(bClean.success, true);

    // Bob commits 1st violation -> Gets Warning 1 (not 3)
    const bViol = addMessage(room.roomCode, userB, 'Bob', 'f u c k');
    assert.strictEqual(bViol.success, false);
    assert.strictEqual(bViol.warningNumber, 1);
    assert.strictEqual(bViol.finalWarning, false);
  });

  test('TEST 9 — Room-to-Room Isolation: Terminated Room A does not impact active Room B', () => {
    const roomA = createRoom({ durationMinutes: 15, creatorName: 'Host_A' });
    const roomB = createRoom({ durationMinutes: 15, creatorName: 'Host_B' });

    joinRoom(roomA.roomCode, 'p_a', 'Alice');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'f u c k');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'bitch');
    addMessage(roomA.roomCode, 'p_a', 'Alice', 'kill yourself');

    assert.strictEqual(getRoom(roomA.roomCode)?.status, 'MODERATION_TERMINATED');

    // Room B remains WAITING/ACTIVE and clean
    assert.strictEqual(getRoom(roomB.roomCode)?.status, 'WAITING');
    const bJoin = joinRoom(roomB.roomCode, 'p_b', 'Bob');
    assert.strictEqual(bJoin.success, true);
    const bMsg = addMessage(roomB.roomCode, 'p_b', 'Bob', 'Room B is working perfectly');
    assert.strictEqual(bMsg.success, true);
  });

  test('TEST 10 — Terminated Room Rejection for validation and joining', () => {
    const room = createRoom({ durationMinutes: 15, creatorName: 'Host_Term' });
    joinRoom(room.roomCode, 'p_a', 'Alice');
    addMessage(room.roomCode, 'p_a', 'Alice', 'f u c k');
    addMessage(room.roomCode, 'p_a', 'Alice', 'bitch');
    addMessage(room.roomCode, 'p_a', 'Alice', 'kill yourself');

    const joinRes = joinRoom(room.roomCode, 'p_new', 'Charlie');
    assert.strictEqual(joinRes.success, false);
    assert.strictEqual(joinRes.code, 'ROOM_TERMINATED');

    const validateRes = validateRoom(room.roomCode);
    assert.strictEqual(validateRes.valid, false);
    assert.strictEqual(validateRes.code, 'ROOM_TERMINATED');
  });
});
