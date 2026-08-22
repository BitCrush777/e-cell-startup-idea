import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getRoom } from '@/lib/room-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomCode = params.roomCode.toUpperCase();
    const room = getRoom(roomCode);

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, messages: room.messages });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve messages' },
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
    const { senderId, senderName, content, file } = body;

    if (!content && !file) {
      return NextResponse.json(
        { success: false, error: 'Message content or attachment required' },
        { status: 400 }
      );
    }

    const result = addMessage(roomCode, senderId, senderName, content || '', file);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
