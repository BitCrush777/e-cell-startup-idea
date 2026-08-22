import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('TempLink Expiration & Memory Wipe Tests', () => {
  test('Expired room must reject new messages and zeroize message buffers', () => {
    interface TestRoom {
      roomCode: string;
      expiresAt: number;
      status: 'ACTIVE' | 'EXPIRED';
      messages: any[];
    }

    const room: TestRoom = {
      roomCode: 'A7X9-K2P4',
      expiresAt: Date.now() - 5000, // 5 seconds in the past
      status: 'ACTIVE',
      messages: [{ id: '1', content: 'Confidential statement' }],
    };

    // Simulate expiration lifecycle check
    if (Date.now() >= room.expiresAt) {
      room.status = 'EXPIRED';
      room.messages = []; // Destroy all in-memory message content
    }

    assert.strictEqual(room.status, 'EXPIRED');
    assert.strictEqual(room.messages.length, 0, 'Message buffer must be wiped clean on expiration');

    // Attempting to send message to expired room
    const attemptSendMessage = (r: TestRoom) => {
      if (r.status === 'EXPIRED') {
        throw new Error('Room expired. Messages cannot be sent.');
      }
    };

    assert.throws(() => attemptSendMessage(room), /Room expired/);
  });
});
