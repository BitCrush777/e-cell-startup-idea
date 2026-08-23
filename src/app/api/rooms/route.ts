import { NextRequest, NextResponse } from 'next/server';
import { createRoom, getAllActiveRooms } from '@/lib/room-store';
import { generateTemporaryIdentity } from '@/lib/identity';
import { getMaxRoomMembers, PlanType } from '@/lib/plans';
import { RoomPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const {
      durationMinutes = 15,
      plan = 'FREE',
      maxMembers,
      maxParticipants,
      passwordProtected = false,
      password = '',
      allowFiles = true,
      notifyExpiration = true,
      creatorName = generateTemporaryIdentity(),
    } = body;

    const normalizedPlan = (plan || 'FREE').toUpperCase() as RoomPlan;
    const computedMaxMembers = maxMembers || maxParticipants || getMaxRoomMembers(normalizedPlan as PlanType);

    const room = createRoom({
      durationMinutes: Number(durationMinutes),
      plan: normalizedPlan,
      maxMembers: computedMaxMembers,
      maxParticipants: computedMaxMembers,
      passwordProtected: Boolean(passwordProtected),
      password: passwordProtected ? password : undefined,
      allowFiles: Boolean(allowFiles),
      notifyExpiration: Boolean(notifyExpiration),
      creatorName,
    });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rooms = getAllActiveRooms();
    const sanitized = rooms.map((r) => ({
      id: r.id,
      roomCode: r.roomCode,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      durationMinutes: r.durationMinutes,
      plan: r.plan || 'FREE',
      participantCount: r.participants.length,
      currentMembers: r.participants.length,
      maxMembers: r.maxMembers || r.maxParticipants || 3,
      maxParticipants: r.maxMembers || r.maxParticipants || 3,
      status: r.status,
      creatorName: r.creatorName,
    }));
    return NextResponse.json({ success: true, rooms: sanitized });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
