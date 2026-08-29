'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QrCode from '@/components/QrCode';
import { useToast } from '@/components/ToastProvider';
import { createRoom } from '@/lib/api';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';
import { getMaxRoomMembers, ROOM_LIMITS, PlanType } from '@/lib/plans';
import CountdownTimer from '@/components/CountdownTimer';
import { Room, RoomPlan } from '@/types';
import { RealtimeClient } from '@/lib/realtime';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export default function CreateRoomPage() {
  const router = useRouter();
  const { toast } = useToast();

  // User Plan: 'FREE' | 'PRO' | 'BUSINESS' (detected from session/auth or default 'FREE')
  const [userPlan, setUserPlan] = useState<PlanType>('FREE');

  // Smart Defaults: 30 mins, password OFF, files OFF, notify ON
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('45');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [allowFiles, setAllowFiles] = useState<boolean>(false);
  const [notifyExpiration, setNotifyExpiration] = useState<boolean>(true);
  const [creatorName, setCreatorName] = useState<string>(() => generateTemporaryIdentity());

  // Creation State Machine: 'idle' | 'loading' | 'ready' | 'error'
  const [creationState, setCreationState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [creatorParticipantId, setCreatorParticipantId] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [someoneJoined, setSomeoneJoined] = useState<boolean>(false);

  const realtimeClientRef = useRef<RealtimeClient | null>(null);

  // Detect user plan if logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.plan) {
            setUserPlan(data.user.plan.toUpperCase() as PlanType);
          }
        }
      } catch {}
    }
    checkAuth();
  }, []);

  // Clean up realtime on unmount
  useEffect(() => {
    return () => {
      realtimeClientRef.current?.disconnect();
    };
  }, []);

  const handleDurationSelect = (mins: number) => {
    setIsCustom(false);
    setDuration(mins);
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
  };

  const maxMembersAllowed = getMaxRoomMembers(userPlan);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creationState === 'loading') return; // Prevent double-submit

    setCreationState('loading');
    setErrorMessage(null);

    const finalDuration = isCustom ? Math.max(1, parseInt(customDuration) || 30) : duration;
    const pid = generateParticipantId();
    setCreatorParticipantId(pid);

    try {
      const room = await createRoom({
        durationMinutes: finalDuration,
        plan: userPlan as RoomPlan,
        maxMembers: maxMembersAllowed,
        maxParticipants: maxMembersAllowed,
        passwordProtected: requirePassword,
        password: requirePassword ? password : '',
        allowFiles,
        notifyExpiration,
        creatorParticipantId: pid,
        creatorName,
      });

      // Save creator identity in sessionStorage for this tab/window
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `templink_session_${room.roomCode}`,
          JSON.stringify({
            participantId: pid,
            displayName: creatorName,
            role: 'creator',
            joinedAt: Date.now(),
            isOnline: true,
          })
        );
      }

      setCreatedRoom(room);
      setCreationState('ready');
      toast(`Private room ${room.roomCode} is ready!`, 'success');

      // Initialize real-time waiting connection
      const client = new RealtimeClient(room.roomCode, {
        participantId: pid,
        displayName: creatorName,
        role: 'creator',
        joinedAt: Date.now(),
        isOnline: true,
      });
      realtimeClientRef.current = client;

      client.subscribe((event) => {
        if (event.type === 'participant_joined') {
          if (event.participant.participantId !== pid) {
            setParticipantCount((prev) => prev + 1);
            setSomeoneJoined(true);
            toast(`${event.participant.displayName} connected! Entering chat...`, 'success');
            setTimeout(() => {
              router.push(`/room/${room.roomCode}`);
            }, 1200);
          }
        }
      });

      client.connect();
    } catch (err: any) {
      setCreationState('error');
      setErrorMessage(err.message || 'Unable to create room. Please try again.');
      toast(err.message || 'Unable to create room. Please try again.', 'error');
    }
  };

  const handleCopyCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.roomCode);
    toast(`Room code ${createdRoom.roomCode} copied!`, 'success');
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.joinUrl);
    toast('Private room link copied!', 'success');
  };

  const handleNativeShare = async () => {
    if (!createdRoom) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join TempLink Room ${createdRoom.roomCode}`,
          text: `Join my private TempLink room: ${createdRoom.roomCode}`,
          url: createdRoom.joinUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleEnterChat = () => {
    if (createdRoom) {
      router.push(`/room/${createdRoom.roomCode}`);
    }
  };

  // SUCCESS / ROOM READY SCREEN
  if (creationState === 'ready' && createdRoom) {
    const maxCapacity = createdRoom.maxMembers || createdRoom.maxParticipants || maxMembersAllowed;

    return (
      <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
        <BlurFade delay={0.1} className="w-full max-w-[520px] mt-4">
          <header className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Room Created ({createdRoom.plan || userPlan} Plan • Up to {maxCapacity} Members)
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
              Your Private Room is Ready
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Share the one-time code or QR code to begin communicating.
            </p>
          </header>

          <div className="relative glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
            {/* Border Beam Accent */}
            <BorderBeam size={200} duration={10} colorFrom="#6366F1" colorTo="#A855F7" />

            {/* Live Status & Participants Banner */}
            <div className="flex items-center justify-between p-3.5 bg-[#0D111A] rounded-2xl border border-white/10">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${someoneJoined ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-xs font-semibold text-white">
                  {someoneJoined ? 'Connected! Transitioning...' : 'Waiting for participants...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#161E2E] text-primary-light font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-white/5">
                  {participantCount} / {maxCapacity} members
                </span>
                <CountdownTimer expiresAt={createdRoom.expiresAt} showIcon={false} />
              </div>
            </div>

            {/* Dynamic QR Display */}
            <div className="relative flex flex-col items-center justify-center p-5 bg-[#05070B] rounded-2xl border border-white/10 gap-3">
              <QrCode
                key={createdRoom.roomCode}
                value={createdRoom.joinUrl}
                size={180}
              />
              <span className="text-[11px] text-slate-400">
                Scan with smartphone camera to connect instantly
              </span>
            </div>

            {/* Room Code Badge */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                One-Time Room Code
              </label>
              <div
                onClick={handleCopyCode}
                className="flex items-center justify-between w-full bg-[#05070B] border border-white/15 hover:border-primary/50 rounded-2xl px-5 py-3.5 cursor-pointer transition-colors group shadow-inner"
              >
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-[0.2em] text-primary-light">
                  {createdRoom.roomCode}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-primary-light transition-colors font-medium bg-[#121824] px-3 py-1.5 rounded-xl border border-white/5"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  Copy Code
                </button>
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-ghost py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                Copy Link
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="btn-ghost py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                Share
              </button>
            </div>

            {/* Enter Chat CTA */}
            <button
              type="button"
              onClick={handleEnterChat}
              className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              Enter Chat Interface
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </BlurFade>
      </main>
    );
  }

  // CREATE CONFIGURATION SCREEN
  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
        <div className="w-[700px] h-[700px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <BlurFade delay={0.1} className="w-full max-w-[600px] mt-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            Temporary Session Config
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
            Create a Private Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Start a temporary communication session in seconds.
          </p>
        </header>

        <form
          onSubmit={handleCreate}
          className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-white/10 bg-[#080B12]/85 shadow-2xl"
        >
          {/* Temporary Identity Display */}
          <section className="flex items-center justify-between p-3.5 bg-[#0D111A] rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#161E2E] flex items-center justify-center text-primary-light">
                <span className="material-symbols-outlined text-[18px]">fingerprint</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                  Your Identity
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">{creatorName}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreatorName(generateTemporaryIdentity())}
              disabled={creationState === 'loading'}
              className="text-xs text-primary-light hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reroll
            </button>
          </section>

          {/* Section: Room Lifetime */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Room Duration
              </label>
              <span className="material-symbols-outlined text-slate-500 text-[18px]">
                timer
              </span>
            </div>

            <div className="bg-[#05070B] p-1.5 rounded-xl border border-white/10 grid grid-cols-4 gap-1">
              {[15, 30, 60].map((mins) => {
                const label = mins === 60 ? '1 hour' : `${mins} min`;
                const isSelected = !isCustom && duration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    disabled={creationState === 'loading'}
                    onClick={() => handleDurationSelect(mins)}
                    className={`py-2.5 px-2 rounded-lg text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={creationState === 'loading'}
                onClick={handleCustomSelect}
                className={`py-2.5 px-2 rounded-lg text-center text-xs font-semibold transition-all ${
                  isCustom
                    ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="flex items-center gap-3 mt-1 animate-fade-in">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  disabled={creationState === 'loading'}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Minutes (e.g. 45)"
                  className="bg-[#05070B] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary w-36 font-mono"
                />
                <span className="text-xs text-slate-400">Minutes (up to 24h)</span>
              </div>
            )}
          </section>

          <hr className="border-white/10" />

          {/* Section: Maximum Members & Plan Capacity */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Maximum Members
              </label>
              <span className="material-symbols-outlined text-slate-500 text-[18px]">
                group
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#0D111A] border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-light text-[20px]">
                  {userPlan === 'PRO' ? 'workspace_premium' : userPlan === 'BUSINESS' ? 'corporate_fare' : 'group'}
                </span>
                <div>
                  <span className="text-xs sm:text-sm text-white font-medium block">
                    {userPlan === 'PRO'
                      ? 'Pro Room (Up to 10 members)'
                      : userPlan === 'BUSINESS'
                      ? 'Business Room (Custom limit: up to 25 members)'
                      : 'Free Room (Up to 3 members)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Includes room creator and connecting participants
                  </span>
                </div>
              </div>
              <span className="bg-[#161E2E] text-primary-light font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-white/5 shrink-0">
                {maxMembersAllowed} Max
              </span>
            </div>

            {/* Upgrade prompt for Free users */}
            {userPlan === 'FREE' && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[18px]">
                    upgrade
                  </span>
                  <span className="text-slate-300">
                    Need more people? <strong className="text-white">Upgrade to Pro</strong> for up to 10 members.
                  </span>
                </div>
                <Link
                  href="/pricing"
                  className="text-primary-light font-semibold hover:underline shrink-0 ml-2"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </section>

          <hr className="border-white/10" />

          {/* Section: Privacy Options */}
          <section className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Privacy Options
              </label>
              <span className="material-symbols-outlined text-slate-500 text-[18px]">
                shield
              </span>
            </div>

            {/* Toggle: Password */}
            <div
              onClick={() => creationState !== 'loading' && setRequirePassword(!requirePassword)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white">Require room password</span>
                <span className="text-[11px] text-slate-400">Add secret passphrase protection.</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  requirePassword ? 'bg-[#6366F1]' : 'bg-[#161E2E]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    requirePassword ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {requirePassword && (
              <div className="px-3 pb-2 animate-fade-in">
                <input
                  type="password"
                  disabled={creationState === 'loading'}
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Toggle: Allow Files */}
            <div
              onClick={() => creationState !== 'loading' && setAllowFiles(!allowFiles)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white">Allow file sharing</span>
                <span className="text-[11px] text-slate-400">Enable volatile RAM file transfer.</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  allowFiles ? 'bg-[#6366F1]' : 'bg-[#161E2E]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    allowFiles ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Toggle: Notify before expiration */}
            <div
              onClick={() => creationState !== 'loading' && setNotifyExpiration(!notifyExpiration)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white">Notify before expiration</span>
                <span className="text-[11px] text-slate-400">Warning prompt 1 minute before destruction.</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  notifyExpiration ? 'bg-[#6366F1]' : 'bg-[#161E2E]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifyExpiration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-2 flex flex-col sm:flex-row gap-3 items-center justify-end">
            <Link
              href="/"
              className="btn-ghost w-full sm:w-auto text-xs font-semibold uppercase tracking-wider py-3 px-6 text-center order-2 sm:order-1"
            >
              Cancel
            </Link>
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <ShimmerButton
                type="submit"
                disabled={creationState === 'loading'}
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg"
              >
                {creationState === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating Room...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Create Room ({maxMembersAllowed} Members)
                  </span>
                )}
              </ShimmerButton>
            </div>
          </div>
        </form>
      </BlurFade>
    </main>
  );
}
