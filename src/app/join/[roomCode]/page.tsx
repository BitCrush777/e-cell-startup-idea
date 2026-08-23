'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { joinRoom, validateRoom } from '@/lib/api';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';
import CountdownTimer from '@/components/CountdownTimer';
import { Room, RoomPlan } from '@/types';

export default function JoinByRoomCodePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomCode = ((params.roomCode as string) || '').toUpperCase().trim();

  const [room, setRoom] = useState<Room | null>(null);
  const [participantName, setParticipantName] = useState<string>(() => generateTemporaryIdentity());
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<'not_found' | 'expired' | 'full' | 'ended' | null>(null);
  const [roomPlan, setRoomPlan] = useState<RoomPlan>('FREE');
  const [maxMembers, setMaxMembers] = useState<number>(3);
  const [currentMembers, setCurrentMembers] = useState<number>(1);

  useEffect(() => {
    if (!roomCode) return;

    async function checkRoom() {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await validateRoom(roomCode);
      if (!res.valid || !res.room) {
        setErrorStatus(res.status as any);
        if (res.status === 'full' || res.code === 'ROOM_FULL') {
          const p = res.plan || 'FREE';
          const max = res.maxMembers || (p === 'PRO' ? 10 : 3);
          setRoomPlan(p);
          setMaxMembers(max);
          setErrorMessage(
            p === 'FREE'
              ? `This Free room has reached its ${max}-member limit.`
              : `This ${p} room has reached its ${max}-member limit.`
          );
        } else {
          setErrorMessage(res.error || 'This room is expired or does not exist.');
        }
        setIsLoading(false);
        return;
      }

      setRoom(res.room);
      setRoomPlan(res.room.plan || 'FREE');
      setMaxMembers(res.room.maxMembers || res.room.maxParticipants || 3);
      setCurrentMembers(res.currentMembers || res.room.participants?.length || 1);
      setIsLoading(false);
    }

    checkRoom();
  }, [roomCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isJoining) return;

    setIsJoining(true);
    setErrorMessage(null);

    // Retrieve or generate tab-isolated participantId
    let participantId = generateParticipantId();
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem(`templink_session_${roomCode}`);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed.participantId) {
            participantId = parsed.participantId;
          }
        } catch {}
      }
    }

    try {
      const { participant } = await joinRoom(roomCode, participantId, participantName, password || undefined);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `templink_session_${roomCode}`,
          JSON.stringify({
            participantId: participant.participantId || participantId,
            displayName: participant.displayName || participantName,
            role: participant.role || 'member',
            joinedAt: participant.joinedAt || Date.now(),
            isOnline: true,
          })
        );
      }

      toast('Connected to private room!', 'success');
      router.push(`/room/${roomCode}`);
    } catch (err: any) {
      setIsJoining(false);
      if (err.code === 'ROOM_FULL' || (err.message && err.message.toLowerCase().includes('full'))) {
        setErrorStatus('full');
        setErrorMessage(
          err.plan === 'FREE' || roomPlan === 'FREE'
            ? 'This Free room has reached its 3-member limit.'
            : 'This Pro room has reached its 10-member limit.'
        );
      } else {
        setErrorMessage(err.message || 'Unable to join room');
      }
      toast(err.message || 'Unable to join room', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05070B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Validating Private Room {roomCode}...
          </span>
        </div>
      </div>
    );
  }

  if (errorMessage && !room) {
    return (
      <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-16 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] bg-[#05070B] text-slate-100">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center flex flex-col items-center gap-4 border border-white/10 bg-[#080B12]/90 shadow-2xl animate-fade-in">
          <span className="material-symbols-outlined text-4xl text-amber-400">
            {errorStatus === 'full' ? 'group_off' : 'error'}
          </span>
          <h2 className="font-display font-bold text-xl text-white">
            {errorStatus === 'full' ? 'Room Full' : 'Room Unavailable'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{errorMessage}</p>

          {errorStatus === 'full' && roomPlan === 'FREE' && (
            <p className="text-[11px] text-slate-500">
              Upgrade to Pro for up to 10 members per room.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
            {errorStatus === 'full' && roomPlan === 'FREE' && (
              <Link
                href="/pricing"
                className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
              >
                Upgrade to Pro
              </Link>
            )}
            <Link
              href="/join"
              className="btn-ghost flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-center"
            >
              Enter Code
            </Link>
            <Link
              href="/create"
              className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
            >
              Create New
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <div className="w-full max-w-[540px] animate-fade-in mt-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Private Room ({room?.plan || roomPlan} Plan)
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
            Join Room {roomCode}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Ephemeral temporary chat with zero stored history.
          </p>
        </header>

        <form
          onSubmit={handleJoin}
          className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-white/15 bg-[#080B12]/85 shadow-2xl"
        >
          {/* Room Confirmation Card */}
          {room && (
            <div className="p-4 bg-[#05070B] rounded-2xl border border-white/10 flex flex-col gap-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-primary-light tracking-wider">
                  Room Capacity
                </span>
                <span
                  className="bg-[#121824] text-primary-light font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border border-white/5"
                  aria-label={`${currentMembers} of ${maxMembers} members currently connected`}
                >
                  {currentMembers} / {maxMembers} Members Connected
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">
                  Hosted by <strong className="text-white">{room.creatorName}</strong>
                </span>
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="material-symbols-outlined text-primary-light text-[15px]">timer</span>
                  <CountdownTimer expiresAt={room.expiresAt} showIcon={false} />
                </div>
              </div>
            </div>
          )}

          {/* Identity Assignment */}
          <div className="flex items-center justify-between p-3.5 bg-[#0D111A] rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#161E2E] flex items-center justify-center text-primary-light">
                <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                  Joining as
                </span>
                <span className="text-xs font-semibold text-white">{participantName}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setParticipantName(generateTemporaryIdentity())}
              disabled={isJoining}
              className="text-xs text-primary-light hover:underline font-medium disabled:opacity-50"
            >
              Change ID
            </button>
          </div>

          {/* Password Prompt if protected */}
          {room?.passwordProtected && (
            <div className="flex flex-col gap-2 animate-fade-in">
              <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                Room Password Required
              </label>
              <input
                type="password"
                disabled={isJoining}
                placeholder="Enter secret room password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#05070B] border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href="/"
              className="btn-ghost py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider text-center order-2 sm:order-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isJoining}
              className="btn-primary flex-1 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 order-1 sm:order-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Connecting to Room...
                </>
              ) : (
                <>
                  Join Room
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
