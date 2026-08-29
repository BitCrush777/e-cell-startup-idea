'use client';

import React from 'react';
import Link from 'next/link';

interface RoomTerminatedStateProps {
  roomCode?: string;
  reason?: string;
}

export function RoomTerminatedState({ roomCode, reason }: RoomTerminatedStateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#05070B] text-slate-100 items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-3xl border border-rose-500/30 bg-[#080B12]/95 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center flex flex-col items-center gap-6">
        {/* Shield / Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
          <span className="material-symbols-outlined text-[36px]">shield_lock</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          {roomCode && (
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              Room {roomCode}
            </span>
          )}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Room closed
          </h1>
        </div>

        {/* Content */}
        <div className="p-4 rounded-2xl bg-[#0D111A] border border-white/10 text-xs text-slate-300 leading-relaxed flex flex-col gap-2 text-left">
          <p className="font-semibold text-slate-200">
            {reason || "This room was closed because of repeated violations of the conversation guidelines."}
          </p>
          <p className="text-slate-400">
            Temporary rooms are designed to remain respectful and useful for everyone. When repeated severe violations occur, the room is automatically closed for all participants.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Link
            href="/create"
            className="btn-primary flex-1 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Room</span>
          </Link>
          <Link
            href="/"
            className="btn-ghost flex-1 py-3.5 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 hover:border-white/25"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
