'use client';

import React from 'react';
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-slate-100">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">shield</span>
          Security & Privacy Architecture
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Privacy shouldn't be complicated.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          TempLink is designed around temporary communication and data minimization. We provide short-term private rooms that expire automatically, transmitted over secure connections without requiring personal accounts or phone numbers.
        </p>
      </section>

      {/* Ephemeral Transmission Protocol Diagram */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 mb-16 border border-white/10 bg-[#080B12]/80 relative overflow-hidden shadow-2xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Temporary Room Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data flows through isolated Cloudflare Durable Objects in memory and expires when the session ends.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* User A */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary-light">person</span>
            </div>
            <span className="text-xs font-bold text-white">Member A (Creator)</span>
            <span className="text-[10px] text-slate-500 font-mono">Secure WebSocket</span>
          </div>

          {/* Connection Pipeline */}
          <div className="flex-grow flex items-center justify-center relative w-full h-24 md:h-auto">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
            
            {/* Temporary Room Node */}
            <div className="relative z-10 glass-panel rounded-2xl p-5 flex flex-col items-center gap-1 border border-primary/40 shadow-[0_0_35px_rgba(99,102,241,0.25)] bg-[#05070B]">
              <span className="material-symbols-outlined text-primary-light text-2xl">vpn_key</span>
              <span className="text-xs font-bold text-white">Durable Object Room State</span>
              <div className="text-[10px] text-amber-300 font-mono tracking-widest mt-0.5">
                AUTOMATIC TTL EXPIRATION
              </div>
            </div>
          </div>

          {/* User B */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary-light">person_add</span>
            </div>
            <span className="text-xs font-bold text-white">Member B (Participant)</span>
            <span className="text-[10px] text-slate-500 font-mono">Secure WebSocket</span>
          </div>
        </div>
      </section>

      {/* Security Pillars Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">fingerprint</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Temporary Participant Identity</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Every participant receives a random session alias upon entry (e.g., SilentNova, SilverWave). No phone numbers, real names, or social profiles are required for basic room communication.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">auto_delete</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Automatic Room Expiration</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Room lifespans are governed by authoritative server-side timers. When the timer reaches 0:00 or a creator ends the session, the room terminates and becomes unavailable for further communication.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">visibility_off</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Data Minimization</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            TempLink is built to minimize unnecessary persistent data. Ephemeral chat messages are kept in volatile memory for the duration of the active room and are not archived in a permanent message database.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">key</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">One-Time Password Gating</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Creators can specify unique session passphrases. Joining parties must verify credentials before connecting to the room socket, preventing unauthorized access.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10 md:col-span-2">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">SafeRoom Automated Protection & Privacy</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            TempLink utilizes automated server-side conversation rules to help detect prohibited content, harassment, slurs, and violent threats. Messages violating guidelines are blocked in memory before broadcasting, and repeated violations result in room termination. We do not retain plaintext chat archives for moderation.
          </p>
        </div>
      </section>

      {/* CTA Box */}
      <div className="text-center glass-panel p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 max-w-xl mx-auto flex flex-col items-center gap-4 shadow-2xl">
        <h3 className="font-display text-2xl font-bold text-white">Ready to start a private session?</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Experience temporary communication now. No sign-up needed.
        </p>
        <Link
          href="/create"
          className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.35)]"
        >
          Create Private Room
        </Link>
      </div>
    </main>
  );
}
