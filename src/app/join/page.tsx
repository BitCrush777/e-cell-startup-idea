'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { joinRoom, validateRoom, RoomValidationResult } from '@/lib/api';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';
import CountdownTimer from '@/components/CountdownTimer';
import { Room } from '@/types';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

function JoinRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const codeParam = searchParams.get('code') || '';
  const [code, setCode] = useState<string>(codeParam.toUpperCase());
  const [participantName, setParticipantName] = useState<string>(() => generateTemporaryIdentity());
  const [password, setPassword] = useState<string>('');

  // Validation States: 'initial' | 'checking' | 'valid' | 'invalid' | 'expired' | 'full' | 'ended'
  const [validationState, setValidationState] = useState<'initial' | 'checking' | 'valid' | 'invalid' | 'expired' | 'full' | 'ended'>('initial');
  const [validatedRoom, setValidatedRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus on desktop/tablet
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatCodeInput = (raw: string): string => {
    let clean = raw.trim();
    // If URL pasted e.g. https://.../join/K7XM-4P2Q or ?code=K7XM-4P2Q
    const urlMatch = clean.match(/\/join\/([A-Za-z0-9-]+)/i) || clean.match(/[?&]code=([A-Za-z0-9-]+)/i);
    if (urlMatch && urlMatch[1]) {
      clean = urlMatch[1];
    }
    // Remove invalid characters
    clean = clean.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // Auto-insert dash after 4 characters
    if (clean.length === 4 && !clean.includes('-')) {
      clean = clean + '-';
    } else if (clean.length > 4 && !clean.includes('-')) {
      clean = clean.substring(0, 4) + '-' + clean.substring(4, 8);
    }

    return clean.substring(0, 9);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCodeInput(e.target.value);
    setCode(formatted);
    setErrorMessage(null);

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
      setValidationState('valid');
    } else {
      setValidatedRoom(null);
      if (result.status === 'expired') {
        setValidationState('expired');
        setErrorMessage('This room has expired and was erased.');
      } else if (result.status === 'full') {
        setValidationState('full');
        setErrorMessage('This room is already full (2/2 participants reached).');
      } else if (result.status === 'ended') {
        setValidationState('ended');
        setErrorMessage('This room is no longer active.');
      } else {
        setValidationState('invalid');
        setErrorMessage(result.error || 'Room not found.');
      }
    }
  };

  // Initial code param validation
  useEffect(() => {
    if (codeParam) {
      const formatted = formatCodeInput(codeParam);
      setCode(formatted);
      if (formatted.length >= 4) {
        performValidation(formatted);
      }
    }
  }, [codeParam]);

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
      const { participant } = await joinRoom(cleanCode, participantId, participantName, password || undefined);

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

      toast('Connected to private room!', 'success');
      router.push(`/room/${cleanCode}`);
    } catch (err: any) {
      const errText = err.message || 'Unable to join room';
      setErrorMessage(errText);
      toast(errText, 'error');
      setIsJoining(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
        <div className="w-[700px] h-[700px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <BlurFade delay={0.1} className="w-full max-w-[560px] mt-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[15px]">vpn_key</span>
            One-Time Access Code
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
            Join a Private Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter the one-time code or scan the QR code.
          </p>
        </header>

        <form
          onSubmit={handleJoinSubmit}
          className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-white/10 bg-[#080B12]/85 shadow-2xl"
        >
          {/* Room Code Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Room Code
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-xs text-primary-light hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px]">content_paste</span>
                  Paste Link
                </button>
                <Link
                  href="/scan"
                  className="text-xs text-primary-light hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                  Scan QR
                </Link>
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
                className="w-full bg-[#05070B] border border-white/15 rounded-2xl px-4 py-4 font-mono text-center text-2xl sm:text-3xl font-bold tracking-[0.25em] text-primary-light placeholder:text-slate-700 focus:outline-none focus:border-primary shadow-inner uppercase transition-all"
              />

              {/* Status Indicator inside Input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {validationState === 'checking' && (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                )}
                {validationState === 'valid' && (
                  <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                    check_circle
                  </span>
                )}
                {validationState === 'invalid' && (
                  <span className="material-symbols-outlined text-error-rose text-[22px]">
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
                  Private Room Found
                </span>
                <span className="bg-[#121824] px-2.5 py-0.5 rounded-lg border border-white/5 text-[10px] font-mono font-semibold text-primary-light">
                  1 / {validatedRoom.maxParticipants || 2} Connected
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">
                  Hosted by <strong className="text-white">{validatedRoom.creatorName}</strong>
                </span>
                <div className="flex items-center gap-1 text-xs">
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

          {/* Error Banner with clear recovery action */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-2.5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
              {validationState === 'expired' || validationState === 'full' ? (
                <Link
                  href="/create"
                  className="btn-primary py-1 px-3 rounded-lg text-[10px] font-bold uppercase shrink-0"
                >
                  Create New
                </Link>
              ) : null}
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
            <div className="flex-1 order-1 sm:order-2">
              <ShimmerButton
                type="submit"
                disabled={isJoining || validationState === 'checking' || validationState === 'expired' || validationState === 'full' || code.length < 4}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Connecting to Private Room...
                  </>
                ) : (
                  <>
                    Join Room
                    <span className="material-symbols-outlined text-[18px]">login</span>
                  </>
                )}
              </ShimmerButton>
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
