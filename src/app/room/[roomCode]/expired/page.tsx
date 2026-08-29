'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostRoomFeedback } from '@/components/PostRoomFeedback';

export default function ExpiredRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params.roomCode as string) || '').toUpperCase();

  const [phase, setPhase] = useState<'dissolving' | 'destroyed'>('dissolving');
  const [showFeedback, setShowFeedback] = useState<boolean>(true);

  useEffect(() => {
    // Clear local storage for this room's participant
    if (typeof window !== 'undefined' && roomCode) {
      localStorage.removeItem(`templink_participant_${roomCode}`);
      sessionStorage.removeItem(`templink_session_${roomCode}`);
    }

    const timer = setTimeout(() => {
      setPhase('destroyed');
    }, 1200);

    return () => clearTimeout(timer);
  }, [roomCode]);

  return (
    <main className="flex-grow pt-24 pb-16 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 relative z-10 overflow-hidden bg-[#05070B] text-slate-100">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[600px] h-[600px] bg-rose-950/20 rounded-full blur-[160px]" />
      </div>

      {phase === 'dissolving' ? (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl border border-rose-500/30 bg-[#080B12] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-rose-400 animate-spin">
              auto_delete
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-white">Closing Temporary Room</h2>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              Cleaning temporary session state for room {roomCode}...
            </p>
          </div>
        </div>
      ) : showFeedback ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          {/* Subtle Session Ended Banner */}
          <div className="w-full bg-[#080B12]/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs backdrop-blur-md">
            <span className="text-slate-300 flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              Room <span className="font-mono text-white">{roomCode}</span> expired • Session ended
            </span>
            <button
              onClick={() => router.push('/')}
              className="text-[11px] text-primary-light hover:underline font-semibold"
            >
              Skip
            </button>
          </div>

          {/* Core Post-Room Feedback Component */}
          <PostRoomFeedback
            roomCode={roomCode}
            onClose={() => router.push('/')}
          />
        </div>
      ) : (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full flex flex-col items-center text-center gap-5 animate-fade-in border border-white/10 bg-[#080B12]/90 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl text-slate-400">timer_off</span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
              Room {roomCode}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Room expired
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The configured room lifetime has ended. This temporary room is no longer active and messages are no longer available.
          </p>

          <div className="w-full bg-[#05070B] rounded-2xl p-3.5 border border-white/10 flex items-center justify-between shadow-inner">
            <span className="text-xs text-slate-300 flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              Temporary Room Closed
            </span>
            <span className="font-mono text-xs font-bold text-primary-light">Expired</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Link
              href="/"
              className="btn-ghost flex-1 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center"
            >
              Return Home
            </Link>
            <Link
              href="/create"
              className="btn-primary flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Room
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
