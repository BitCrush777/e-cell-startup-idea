'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Meteors } from '@/components/magicui/Meteors';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { AnimatedBeam } from '@/components/magicui/AnimatedBeam';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const userARef = useRef<HTMLDivElement>(null);
  const roomNodeRef = useRef<HTMLDivElement>(null);
  const userBRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#05070B] text-slate-100">
      {/* Background Grid Pattern & Subtle Meteors */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-primary/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[400px] bg-accent-blue/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      
      {/* Subtle Magic UI Meteors */}
      <Meteors number={12} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Badge */}
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-white/10 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Military-Grade Ephemeral Protocol</span>
            <span className="text-slate-500">•</span>
            <span className="text-primary-light font-mono">Zero Logs</span>
          </div>
        </BlurFade>

        {/* Hero Headline */}
        <BlurFade delay={0.2}>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Private conversations. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-200 to-primary-light bg-clip-text text-transparent">
              Temporary by design.
            </span>
          </h1>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade delay={0.3}>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-10">
            Create disposable 1-on-1 encrypted channels that automatically self-destruct. No phone numbers, no account logins, and zero permanent server trace.
          </p>
        </BlurFade>

        {/* Main CTAs */}
        <BlurFade delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16">
            <Link href="/create" className="w-full sm:w-auto">
              <ShimmerButton className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <span>Create Private Room</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </ShimmerButton>
            </Link>
            <Link
              href="/join"
              className="btn-ghost w-full sm:w-auto px-7 py-3.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              <span>Join with Room Code</span>
            </Link>
          </div>
        </BlurFade>

        {/* Interactive Peer Connection Visualization (Magic UI AnimatedBeam) */}
        <BlurFade delay={0.5} className="w-full max-w-3xl mb-12">
          <div
            ref={containerRef}
            className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          >
            {/* User A Node */}
            <div ref={userARef} className="z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg text-primary-light">
                <span className="material-symbols-outlined text-[26px]">person</span>
              </div>
              <span className="text-xs font-bold text-white">Peer A (Creator)</span>
              <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
            </div>

            {/* Central Ephemeral Room Node */}
            <div
              ref={roomNodeRef}
              className="z-10 relative glass-panel rounded-2xl px-6 py-4 border border-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.25)] bg-[#05070B] flex flex-col items-center gap-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-light text-[18px]">lock</span>
                <span className="font-mono text-sm font-bold text-white tracking-widest">A7X9-K2P4</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">TTL:</span>
                <span className="text-amber-300 font-bold">29:42</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                RAM Ephemeral Channel
              </span>
            </div>

            {/* User B Node */}
            <div ref={userBRef} className="z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg text-primary-light">
                <span className="material-symbols-outlined text-[26px]">person_add</span>
              </div>
              <span className="text-xs font-bold text-white">Peer B (Member)</span>
              <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
            </div>

            {/* Animated Beams Connecting Peer A ➔ Room ➔ Peer B */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={userARef}
              toRef={roomNodeRef}
              duration={3}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={userBRef}
              toRef={roomNodeRef}
              duration={3}
              reverse
            />
          </div>
        </BlurFade>

        {/* Hero Product Mockup with Magic UI BorderBeam */}
        <BlurFade delay={0.6} className="w-full max-w-4xl">
          <div className="relative glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#080B12]/80">
            {/* Border Beam Accent */}
            <BorderBeam size={250} duration={12} delay={0} colorFrom="#6366F1" colorTo="#A855F7" />

            {/* Top Mockup Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="font-mono text-xs font-semibold text-primary-light flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  Room A7X9-K2P4
                </span>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="bg-[#0D111A] text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  2/2 Connected
                </span>
                <span className="bg-[#121824] text-amber-300 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  29:42
                </span>
              </div>
            </div>

            {/* Mockup Chat Stream */}
            <div className="flex flex-col gap-3.5 py-2 px-1 text-left">
              {/* System Notice */}
              <div className="flex justify-center">
                <span className="text-[11px] font-mono text-slate-500 bg-[#0D111A]/80 px-3 py-1 rounded-full border border-white/5">
                  Ephemeral channel established • Zeroize in 29m 42s
                </span>
              </div>

              {/* Remote Message */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#161E2E] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary-light shrink-0 mt-0.5">
                  A
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Alex • 11:42 PM</span>
                  <div className="bg-[#0D111A] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs sm:text-sm text-slate-200 shadow-sm">
                    Sending the confidential financial audit. Will this auto-delete?
                  </div>
                </div>
              </div>

              {/* Self Message */}
              <div className="flex items-start gap-2.5 max-w-[85%] self-end flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-[#6366F1] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                  You
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">You • 11:42 PM</span>
                  <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs sm:text-sm shadow-md">
                    Yes. Both the messages and the attached files live only in volatile server memory. Nothing is written to disk.
                  </div>
                </div>
              </div>

              {/* Remote File Attachment Message */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#161E2E] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary-light shrink-0 mt-0.5">
                  A
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Alex • 11:43 PM</span>
                  <div className="bg-[#0D111A] border border-white/10 rounded-2xl rounded-tl-sm p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-[#161E2E] flex items-center justify-center text-primary-light">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-200">audit_q3_report.pdf</span>
                      <span className="text-[10px] text-slate-500 font-mono">1.8 MB • Encrypted RAM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Composer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <div className="flex-1 bg-[#05070B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                <span>Type a self-destructing message...</span>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-[16px]">attach_file</span>
                  <span className="material-symbols-outlined text-[16px]">mood</span>
                </div>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Feature Bento Grid */}
      <section id="how-it-works" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-2">
            Architected for Absolute Secrecy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How TempLink Protects You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <BlurFade delay={0.1}>
            <div className="glass-panel p-7 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-primary/40 transition-all hover:scale-[1.01] bg-[#080B12]/80 h-full shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">memory</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Zero-Disk Volatile Memory</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  All messages and attachments reside exclusively in volatile Cloudflare Durable Object RAM. Nothing touches a database disk.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>RAM-Only State</span>
                <span className="font-mono text-emerald-400">Active</span>
              </div>
            </div>
          </BlurFade>

          {/* Bento Card 2 */}
          <BlurFade delay={0.2}>
            <div className="glass-panel p-7 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-primary/40 transition-all hover:scale-[1.01] bg-[#080B12]/80 h-full shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">timer_off</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Authoritative Edge TTL</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  A server-level countdown timer runs continuously. When 0:00 is reached, all session states and crypto keys are permanently zeroized.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Auto-Destruct Alarm</span>
                <span className="font-mono text-emerald-400">Deterministic</span>
              </div>
            </div>
          </BlurFade>

          {/* Bento Card 3 */}
          <BlurFade delay={0.3}>
            <div className="glass-panel p-7 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-primary/40 transition-all hover:scale-[1.01] bg-[#080B12]/80 h-full shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">One-Time Dynamic QR Pairing</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Seamless peer pairing with dynamic QR codes. Point a smartphone camera to connect instantly without installing apps or sharing numbers.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>P2P QR Onboarding</span>
                <span className="font-mono text-emerald-400">Zero-Friction</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto w-full text-center">
        <BlurFade delay={0.2}>
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#0D111A] to-[#080B12] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready for true conversation privacy?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8">
              Create your first ephemeral room in seconds. No signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create">
                <ShimmerButton className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider">
                  Launch Private Room
                </ShimmerButton>
              </Link>
              <Link
                href="/join"
                className="btn-ghost px-7 py-3.5 text-xs font-semibold"
              >
                Enter Code
              </Link>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 py-8 px-4 md:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TempLink</span>
            <span>• Connect. Communicate. Disappear.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/security" className="hover:text-slate-300 transition-colors">
              Security Protocol
            </Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">
              Pricing
            </Link>
            <Link href="/business" className="hover:text-slate-300 transition-colors">
              Enterprise
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
