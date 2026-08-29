'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { joinRoom, validateRoom, RoomValidationResult } from '@/lib/api';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';
import { normalizeRoomCode } from '@/lib/urls';
import CountdownTimer from '@/components/CountdownTimer';
import { Room, RoomPlan } from '@/types';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

function JoinRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const codeParam = searchParams.get('code') || '';
  const isScanned = searchParams.get('scanned') === '1';
  const [code, setCode] = useState<string>(() => normalizeRoomCode(codeParam));
  const [scannedBadge, setScannedBadge] = useState<boolean>(isScanned);
  const [participantName, setParticipantName] = useState<string>(() => generateTemporaryIdentity());
  const [password, setPassword] = useState<string>('');

  // Validation States: 'initial' | 'checking' | 'valid' | 'invalid' | 'expired' | 'full' | 'ended'
  const [validationState, setValidationState] = useState<'initial' | 'checking' | 'valid' | 'invalid' | 'expired' | 'full' | 'ended'>('initial');
  const [validatedRoom, setValidatedRoom] = useState<Room | null>(null);
  const [roomPlan, setRoomPlan] = useState<RoomPlan>('FREE');
  const [maxMembers, setMaxMembers] = useState<number>(3);
  const [currentMembers, setCurrentMembers] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasHandledScanRef = useRef<boolean>(false);

  // Auto-focus on desktop/tablet
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatCodeInput = (raw: string): string => {
    return normalizeRoomCode(raw);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCodeInput(e.target.value);
    setCode(formatted);
    setErrorMessage(null);
    setScannedBadge(false);

    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    if (formatted.length === 9) {
      setValidationState('checking');
      validationTimerRef.current = setTimeout(() => {
        performValidation(formatted);
      }, 350);
    } else {
      setValidationState('initial');
      setValidatedRoom(null);
    }
  };

  const performValidation = async (targetCode: string) => {
    setValidationState('checking');
    setErrorMessage(null);

    const result: RoomValidationResult = await validateRoom(targetCode);

    if (result.valid && result.room) {
      setValidatedRoom(result.room);
      setRoomPlan(result.room.plan || 'FREE');
      setMaxMembers(result.room.maxMembers || result.room.maxParticipants || 3);
      setCurrentMembers(result.currentMembers || result.room.participants?.length || 1);
      setValidationState('valid');
    } else {
      setValidatedRoom(null);
      if (result.status === 'expired') {
        setValidationState('expired');
        setErrorMessage('This temporary room has expired.');
      } else if (result.status === 'terminated' || result.code === 'ROOM_TERMINATED') {
        setValidationState('invalid');
        setErrorMessage("This room was closed because of repeated violations of the conversation guidelines.");
      } else if (result.status === 'full' || result.code === 'ROOM_FULL') {
        setValidationState('full');
        const plan = result.plan || 'FREE';
        const max = result.maxMembers || (plan === 'PRO' ? 10 : 3);
        setRoomPlan(plan);
        setMaxMembers(max);
        setErrorMessage(
          plan === 'FREE'
            ? `This room is full (${max}-member Free limit reached).`
            : `This room is full (${max}-member ${plan} limit reached).`
        );
      } else if (result.status === 'ended') {
        setValidationState('ended');
        setErrorMessage('This room is no longer active.');
      } else {
        setValidationState('invalid');
        setErrorMessage(result.error || 'Room not found.');
      }
    }
  };

  // Initial code param handling (from QR scan or deep link) - STRICTLY ONCE
  useEffect(() => {
    if (codeParam) {
      const formatted = normalizeRoomCode(codeParam);
      setCode(formatted);

      if (isScanned && !hasHandledScanRef.current) {
        hasHandledScanRef.current = true;
        toast('QR code scanned successfully', 'success', 3000, 'qr-scan-success');
        setScannedBadge(true);

        // Clean query parameter without page reload
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          const newUrl = `${window.location.pathname}?code=${encodeURIComponent(formatted)}`;
          window.history.replaceState({}, '', newUrl);
        }
      }

      if (formatted.length >= 4) {
        performValidation(formatted);
      }
    }
  }, [codeParam, isScanned]);

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const formatted = formatCodeInput(text);
        if (formatted) {
          setCode(formatted);
          if (formatted.length >= 4) {
            performValidation(formatted);
          }
          toast('Room code pasted!', 'info');
        }
      }
    } catch {
      toast('Please manually paste the code into the field', 'info');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isJoining) return;

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage('Please enter a valid 8-character room code (e.g. K7XM-4P2Q)');
      return;
    }

    setIsJoining(true);
    setErrorMessage(null);

    // Retrieve or generate tab-isolated participantId
    let participantId = generateParticipantId();
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem(`templink_session_${cleanCode}`);
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
      const { room, participant } = await joinRoom(
        cleanCode,
        participantId,
        participantName,
        password || undefined
      );

      // Persist session in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `templink_session_${cleanCode}`,
          JSON.stringify({
            participantId: participant.participantId || participantId,
            displayName: participant.displayName || participantName,
            role: participant.role || 'member',
            joinedAt: participant.joinedAt || Date.now(),
            isOnline: true,
          })
        );
      }

      toast('Connected to room', 'success');
      router.push(`/room/${cleanCode}`);
    } catch (err: any) {
      setIsJoining(false);
      if (err.code === 'ROOM_FULL' || (err.message && err.message.toLowerCase().includes('full'))) {
        setValidationState('full');
        setErrorMessage(
          err.plan === 'FREE' || roomPlan === 'FREE'
            ? 'This room is full (3-member Free limit reached).'
            : 'This room is full (10-member Pro limit reached).'
        );
        toast('This room is full', 'error');
      } else if (err.code === 'ROOM_EXPIRED' || (err.message && err.message.toLowerCase().includes('expired'))) {
        setValidationState('expired');
        setErrorMessage('This temporary room has expired.');
        toast('This temporary room has expired', 'error');
      } else {
        setErrorMessage(err.message || "We couldn't connect to this room. Please try again.");
        toast("We couldn't connect to this room. Please try again.", 'error');
      }
    }
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[130px]" />
      </div>

      <BlurFade delay={0.1} className="w-full max-w-[500px] mt-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[15px]">key</span>
            Join Temporary Room
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
            Join a Private Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter the room code or scan the QR code shared with you.
          </p>
        </header>

        <form
          onSubmit={handleJoinSubmit}
          className="relative glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-white/10 bg-[#080B12]/85 shadow-2xl overflow-hidden"
        >
          {/* Border Beam Accent */}
          <BorderBeam size={180} duration={9} colorFrom="#6366F1" colorTo="#38BDF8" />

          {/* Room Code Input Field with Validation Feedback */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Room Code
              </label>
              <div className="flex items-center gap-2">
                {scannedBadge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 animate-fade-in">
                    <span className="material-symbols-outlined text-[12px]">qr_code_scanner</span>
                    Auto-Filled from Scan
                  </span>
                )}
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-xs text-primary-light hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px]">content_paste</span>
                  Paste
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                maxLength={9}
                placeholder="XXXX-XXXX"
                value={code}
                onChange={handleCodeChange}
                disabled={isJoining}
                className="w-full bg-[#05070B] border border-white/15 focus:border-primary rounded-2xl px-5 py-4 text-center font-mono text-xl sm:text-2xl font-bold tracking-[0.25em] uppercase text-white placeholder:text-slate-600 focus:outline-none shadow-inner transition-colors"
                autoComplete="off"
                spellCheck={false}
              />

              {/* Live Validation Indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                {validationState === 'checking' && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-light font-mono animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Checking room...</span>
                  </div>
                )}
                {validationState === 'valid' && (
                  <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                    check_circle
                  </span>
                )}
                {validationState === 'invalid' && (
                  <span className="material-symbols-outlined text-red-400 text-[22px]">
                    cancel
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Room Found Confirmation Card */}
          {validationState === 'valid' && validatedRoom && (
            <div className="p-4 bg-[#05070B] rounded-2xl border border-emerald-500/30 flex flex-col gap-2.5 animate-fade-in shadow-inner">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Room Found ({validatedRoom.plan || 'Free'} Plan)
                </span>
                <span
                  className="bg-[#121824] px-2.5 py-0.5 rounded-lg border border-white/5 text-[10px] font-mono font-semibold text-primary-light"
                  aria-label={`${currentMembers} of ${maxMembers} members currently connected`}
                >
                  {currentMembers} / {maxMembers} Members
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">
                  Room <strong className="text-white font-mono">{validatedRoom.roomCode}</strong>
                </span>
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="material-symbols-outlined text-primary-light text-[15px]">timer</span>
                  <CountdownTimer expiresAt={validatedRoom.expiresAt} showIcon={false} />
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

          {/* Password Prompt (if room is protected) */}
          {(validatedRoom?.passwordProtected || errorMessage?.includes('password')) && (
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

          {/* ROOM FULL Specialized Modal Banner */}
          {validationState === 'full' && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-xl text-amber-400 shrink-0">
                  group_off
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Room Full
                  </span>
                  <span className="text-xs text-slate-300">
                    {roomPlan === 'FREE'
                      ? 'This Free room has reached its 3-member limit.'
                      : `This Pro room has reached its ${maxMembers}-member limit.`}
                  </span>
                  {roomPlan === 'FREE' && (
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Upgrade to Pro to create rooms for up to 10 members.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {roomPlan === 'FREE' && (
                  <Link
                    href="/pricing"
                    className="btn-primary py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center flex-1"
                  >
                    Upgrade to Pro
                  </Link>
                )}
                <Link
                  href="/create"
                  className="btn-ghost py-2 px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex-1"
                >
                  Create New Room
                </Link>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && validationState !== 'full' && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-2.5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
              {validationState === 'expired' && (
                <Link
                  href="/create"
                  className="btn-primary py-1 px-3 rounded-lg text-[10px] font-bold uppercase shrink-0"
                >
                  Create New
                </Link>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <ShimmerButton
              type="submit"
              disabled={isJoining || validationState === 'checking' || validationState === 'expired' || validationState === 'full' || code.length < 4}
              className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
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
            </ShimmerButton>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/scan"
                className="btn-ghost py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                Scan QR Code
              </Link>
              <Link
                href="/"
                className="btn-ghost py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </BlurFade>
    </main>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#05070B]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <JoinRoomContent />
    </Suspense>
  );
}
