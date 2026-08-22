import { NextRequest, NextResponse } from 'next/server';
import { getRoom, validateRoom } from '@/lib/room-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomCode = params.roomCode.toUpperCase().trim();
    const result = validateRoom(roomCode);

    if (!result.valid || !result.room) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error || 'Room not found or expired',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      room: result.room,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, valid: false, error: 'Failed to validate room' },
      { status: 500 }
    );
  }
}
