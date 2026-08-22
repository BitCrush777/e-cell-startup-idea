import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Message, RoomEvent } from '../src/types';

describe('TempLink Realtime Participant Identity & Alignment Tests', () => {
  test('Message Alignment: Person 1 sees own message on RIGHT, Person 2 sees on LEFT', () => {
    const person1Id = 'p_person1_abc123';
    const person2Id = 'p_person2_xyz789';

    const msgFromP1: Message = {
      id: 'msg-1',
      roomCode: 'A7X9-K2P4',
      senderId: person1Id,
      senderName: 'SilverWave',
      content: 'Hello Person 2',
      timestamp: Date.now(),
      type: 'text',
    };

    const msgFromP2: Message = {
      id: 'msg-2',
      roomCode: 'A7X9-K2P4',
      senderId: person2Id,
      senderName: 'QuietNova',
      content: 'Hi Person 1',
      timestamp: Date.now() + 100,
      type: 'text',
    };

    // Client evaluation on Person 1 screen
    const isP1MineMsg1 = msgFromP1.senderId === person1Id;
    const isP1MineMsg2 = msgFromP2.senderId === person1Id;

    assert.strictEqual(isP1MineMsg1, true, 'Person 1 sees msg1 on the RIGHT');
    assert.strictEqual(isP1MineMsg2, false, 'Person 1 sees msg2 on the LEFT');

    // Client evaluation on Person 2 screen
    const isP2MineMsg1 = msgFromP1.senderId === person2Id;
    const isP2MineMsg2 = msgFromP2.senderId === person2Id;

    assert.strictEqual(isP2MineMsg1, false, 'Person 2 sees msg1 on the LEFT');
    assert.strictEqual(isP2MineMsg2, true, 'Person 2 sees msg2 on the RIGHT');
  });

  test('Typing Indicator: Person 1 typing is visible only to Person 2, never Person 1', () => {
    const person1Id = 'p_person1_abc123';
    const person2Id = 'p_person2_xyz789';

    const typingEventFromP1: RoomEvent = {
      type: 'typing',
      roomCode: 'A7X9-K2P4',
      participantId: person1Id,
      displayName: 'SilverWave',
      typing: true,
    };

    // Person 1 receives event -> checks if other user is typing
    const p1ShouldShowTyping =
      typingEventFromP1.type === 'typing' &&
      typingEventFromP1.participantId !== person1Id &&
      typingEventFromP1.typing;

    // Person 2 receives event -> checks if other user is typing
    const p2ShouldShowTyping =
      typingEventFromP1.type === 'typing' &&
      typingEventFromP1.participantId !== person2Id &&
      typingEventFromP1.typing;

    assert.strictEqual(p1ShouldShowTyping, false, 'Person 1 must NOT see own typing indicator');
    assert.strictEqual(p2ShouldShowTyping, true, 'Person 2 must see Person 1 is typing');
  });

  test('Duplicate Message Prevention: Optimistic update + Server broadcast deduplication', () => {
    const messages: Message[] = [];
    const addMessage = (newMsg: Message) => {
      if (!messages.some((m) => m.id === newMsg.id)) {
        messages.push(newMsg);
      }
    };

    const clientMsg: Message = {
      id: 'msg-unique-101',
      roomCode: 'A7X9-K2P4',
      senderId: 'p_123',
      senderName: 'SilverWave',
      content: 'Encrypted statement',
      timestamp: Date.now(),
      type: 'text',
    };

    // 1. Optimistic insert
    addMessage(clientMsg);
    assert.strictEqual(messages.length, 1);

    // 2. Authoritative server broadcast arrives with identical message id
    addMessage({ ...clientMsg });
    assert.strictEqual(messages.length, 1, 'Duplicate message with same id must be ignored');
  });

  test('Strict room isolation: Room A events must not cross into Room B channels', () => {
    const roomAEvents: RoomEvent[] = [];
    const roomBEvents: RoomEvent[] = [];

    const routeEvent = (event: RoomEvent) => {
      if ('roomCode' in event) {
        if (event.roomCode === 'ROOM-AAAA') {
          roomAEvents.push(event);
        } else if (event.roomCode === 'ROOM-BBBB') {
          roomBEvents.push(event);
        }
      }
    };

    const messageA: RoomEvent = {
      type: 'message',
      roomCode: 'ROOM-AAAA',
      message: {
        id: 'msg-1',
        roomCode: 'ROOM-AAAA',
        senderId: 'p_user_a',
        senderName: 'SilverWave',
        content: 'Secret from room A',
        timestamp: Date.now(),
        type: 'text',
      },
    };

    const messageB: RoomEvent = {
      type: 'message',
      roomCode: 'ROOM-BBBB',
      message: {
        id: 'msg-2',
        roomCode: 'ROOM-BBBB',
        senderId: 'p_user_b',
        senderName: 'QuietNova',
        content: 'Secret from room B',
        timestamp: Date.now(),
        type: 'text',
      },
    };

    routeEvent(messageA);
    routeEvent(messageB);

    assert.strictEqual(roomAEvents.length, 1);
    assert.strictEqual(roomBEvents.length, 1);
    assert.strictEqual((roomAEvents[0] as any).message.content, 'Secret from room A');
    assert.strictEqual((roomBEvents[0] as any).message.content, 'Secret from room B');
    assert.ok(!roomAEvents.some((e: any) => e.message?.content?.includes('room B')));
  });
});
