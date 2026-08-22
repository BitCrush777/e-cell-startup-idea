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
          Zero Knowledge & Mathematical Ephemerality
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Privacy shouldn't be complicated.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We don't just encrypt your data; we ensure it ceases to exist. Experience communication that leaves zero trace, secured by mathematical certainty, not corporate promises.
        </p>
      </section>

      {/* Ephemeral Transmission Protocol Diagram */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 mb-16 border border-white/10 bg-[#080B12]/80 relative overflow-hidden shadow-2xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Ephemeral Transmission Protocol
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data flows exclusively through isolated Edge Worker RAM with automated memory zeroization.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* User A */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary-light">person</span>
            </div>
            <span className="text-xs font-bold text-white">Peer A (Creator)</span>
            <span className="text-[10px] text-slate-500 font-mono">Volatile Key #1</span>
          </div>

          {/* Connection Pipeline */}
          <div className="flex-grow flex items-center justify-center relative w-full h-24 md:h-auto">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
            
            {/* Temporary Room Node */}
            <div className="relative z-10 glass-panel rounded-2xl p-5 flex flex-col items-center gap-1 border border-primary/40 shadow-[0_0_35px_rgba(99,102,241,0.25)] bg-[#05070B]">
              <span className="material-symbols-outlined text-primary-light text-2xl">vpn_key</span>
              <span className="text-xs font-bold text-white">Ephemeral Durable Object</span>
              <div className="text-[10px] text-amber-300 font-mono tracking-widest animate-pulse mt-0.5">
                T-MINUS AUTO DESTRUCT
              </div>
            </div>
          </div>

          {/* User B */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary-light">person_add</span>
            </div>
            <span className="text-xs font-bold text-white">Peer B (Member)</span>
            <span className="text-[10px] text-slate-500 font-mono">Volatile Key #2</span>
          </div>
        </div>
      </section>

      {/* Security Pillars Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">fingerprint</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Temporary Identity</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Every guest receives a random privacy pseudonym upon room entry (e.g., SilentNova, SilverWave). No phone numbers, real names, or social profiles are ever requested or stored.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">auto_delete</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Guaranteed Auto-Destruct</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Room lifespans are governed by authoritative timers. When 0:00 is reached or the creator triggers early termination, all cryptographic session buffers are instantly overwritten in memory.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">visibility_off</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">Zero Metadata Retention</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            We adhere to a strict zero-knowledge architecture. We do not log IP addresses, connection durations, device fingerprints, or routing telemetry. What is never saved cannot be leaked.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7 flex flex-col gap-3 bg-[#080B12]/80 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-[24px]">key</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">One-Time Password Gating</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Creators can specify unique session passphrases. Joining parties must verify credentials before connecting to the room socket, preventing unauthorized eavesdropping.
          </p>
        </div>
      </section>

      {/* CTA Box */}
      <div className="text-center glass-panel p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 max-w-xl mx-auto flex flex-col items-center gap-4 shadow-2xl">
        <h3 className="font-display text-2xl font-bold text-white">Ready to start a private session?</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Experience real ephemeral messaging now. No sign-up needed.
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
