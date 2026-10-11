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
          Security &amp; Data Handling Architecture
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Privacy through simplicity and data minimization.
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
            <span className="text-[10px] text-slate-500 font-mono">Secure WSS / HTTPS</span>
          </div>

          {/* Connection Pipeline */}
          <div className="flex-grow flex items-center justify-center relative w-full h-24 md:h-auto">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
            
            {/* Temporary Room Node */}
            <div className="relative z-10 glass-panel rounded-2xl p-5 flex flex-col items-center gap-1 border border-primary/40 shadow-[0_0_35px_rgba(99,102,241,0.25)] bg-[#05070B]">
              <span className="material-symbols-outlined text-primary-light text-2xl">vpn_key</span>
              <span className="text-xs font-bold text-white">Volatile Durable Object Room</span>
              <div className="text-[10px] text-amber-300 font-mono tracking-widest mt-0.5">
                SERVER-ENFORCED TTL EXPIRATION
              </div>
            </div>
          </div>

          {/* User B */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary-light">person_add</span>
            </div>
            <span className="text-xs font-bold text-white">Member B (Participant)</span>
            <span className="text-[10px] text-slate-500 font-mono">Secure WSS / HTTPS</span>
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
            Every participant receives an anonymous session alias upon entry (e.g., SilentNova, SilverWave). No phone numbers, real names, or social profiles are required for basic room communication.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">auto_delete</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Automatic Room Expiration</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Room lifespans are governed by authoritative server-side timers. When the timer reaches 0:00 or a creator terminates the session, the room closes and becomes permanently unavailable for further communication.
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
          <h3 className="font-display font-bold text-lg text-white">Password Gating</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Creators can specify unique session passwords. Joining parties must verify credentials before connecting to the room socket, preventing unwanted access.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10 md:col-span-2">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">SafeRoom Automated Moderation</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            TempLink applies automated in-memory pattern checks to detect prohibited hate speech, harassment, slurs, and violent threats. Violating messages are rejected before broadcasting, and repeated violations terminate the room. SafeRoom operates during active sessions without retaining permanent message logs.
          </p>
        </div>
      </section>

      {/* Realistic Technical Boundaries & Disclosures */}
      <section className="glass-panel rounded-3xl p-8 mb-16 border border-white/10 bg-[#080B12]/90 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-300 text-[22px]">info</span>
          <h3 className="font-display font-bold text-lg text-white">Important Technical Scoping &amp; Boundaries</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          To ensure clear and trustworthy expectations, we explicitly document our system design:
        </p>
        <ul className="space-y-2.5 text-xs text-slate-300 list-disc pl-5 leading-relaxed">
          <li>
            <strong>No End-to-End Encryption Claim:</strong> Messages and file transfers travel over standard encrypted transport (HTTPS and WSS), but TempLink does not implement client-side public-key cryptography.
          </li>
          <li>
            <strong>Recipient Devices &amp; Downloads:</strong> When files or messages are viewed or saved by a recipient on their phone or computer, TempLink cannot remotely delete local files or prevent screenshots.
          </li>
          <li>
            <strong>Infrastructure Telemetry:</strong> While active conversations are not archived in a chat database, standard edge network telemetry (e.g. Cloudflare IP routing and DDoS mitigation logs) may exist transiently at the infrastructure level.
          </li>
        </ul>
        <div className="pt-2 flex items-center gap-4 text-xs font-medium text-primary-light">
          <Link href="/privacy" className="hover:underline flex items-center gap-1">
            <span>Read full Privacy Policy</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
          <Link href="/terms" className="hover:underline flex items-center gap-1">
            <span>Read Terms of Service</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* CTA Box */}
      <div className="text-center glass-panel p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 max-w-xl mx-auto flex flex-col items-center gap-4 shadow-2xl">
        <h3 className="font-display text-2xl font-bold text-white">Ready to start a private session?</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Experience temporary communication now. Free to try with no sign-up required.
        </p>
        <Link
          href="/create"
          className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.35)]"
        >
          Create Free Room
        </Link>
      </div>
    </main>
  );
}
