import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRoom, joinRoom, endRoom } from '@/lib/room-store';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomCode = params.roomCode.toUpperCase();
    const room = getOrCreateRoom(roomCode);

    return NextResponse.json({ success: true, room });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomCode = params.roomCode.toUpperCase();
    const body: any = await req.json();
    const { action, participantId, participantName, displayName, password, requestedBy } = body;

    if (action === 'join') {
      const pid = participantId || generateParticipantId();
      const name = displayName || participantName || generateTemporaryIdentity();
      const result = joinRoom(roomCode, pid, name, password);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        room: result.room,
        participant: result.participant,
      });
    }

    if (action === 'end') {
      const result = endRoom(roomCode, requestedBy);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Room ended' });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
