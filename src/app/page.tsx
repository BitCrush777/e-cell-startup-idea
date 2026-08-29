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
      <section id="product" className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Badge */}
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-white/10 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Temporary Communication</span>
            <span className="text-slate-500">•</span>
            <span className="text-primary-light font-mono">No Account Required</span>
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
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-8">
            Create a temporary room, share a code or QR, communicate in real time, and let the room expire when you&apos;re done.
          </p>
        </BlurFade>

        {/* Main CTAs */}
        <BlurFade delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-4">
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
              <span>Join a Room</span>
            </Link>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-12">
            No account required for basic use.
          </p>
        </BlurFade>

        {/* 4-Step Quick Visual Onboarding (How TempLink Works) */}
        <BlurFade delay={0.45} className="w-full max-w-4xl mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="bg-[#080B12]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-all">
              <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-7 h-7 rounded-lg flex items-center justify-center border border-white/5">
                01
              </span>
              <h4 className="font-bold text-sm text-white">Create a room</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Choose a duration and generate a private room in seconds.
              </p>
            </div>
            <div className="bg-[#080B12]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-all">
              <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-7 h-7 rounded-lg flex items-center justify-center border border-white/5">
                02
              </span>
              <h4 className="font-bold text-sm text-white">Share QR or code</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Invite members with an 8-character code or camera scan.
              </p>
            </div>
            <div className="bg-[#080B12]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-all">
              <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-7 h-7 rounded-lg flex items-center justify-center border border-white/5">
                03
              </span>
              <h4 className="font-bold text-sm text-white">Chat in real time</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Send messages and files with SafeRoom active protection.
              </p>
            </div>
            <div className="bg-[#080B12]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-all">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-[#101621] w-7 h-7 rounded-lg flex items-center justify-center border border-white/5">
                04
              </span>
              <h4 className="font-bold text-sm text-white">Room expires</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Session automatically closes when the countdown ends.
              </p>
            </div>
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
              <span className="text-xs font-bold text-white">Member A (Creator)</span>
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
                <span className="text-slate-400">Expires in:</span>
                <span className="text-amber-300 font-bold">29:42</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                Temporary Room Session
              </span>
            </div>

            {/* User B Node */}
            <div ref={userBRef} className="z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center shadow-lg text-primary-light">
                <span className="material-symbols-outlined text-[26px]">person_add</span>
              </div>
              <span className="text-xs font-bold text-white">Member B (Participant)</span>
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

        {/* Interactive App Preview */}
        <BlurFade delay={0.6} className="w-full max-w-3xl">
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-[#080B12]/90 backdrop-blur-xl">
            {/* Border Beam Accent */}
            <BorderBeam size={220} duration={12} colorFrom="#6366F1" colorTo="#38BDF8" />

            {/* Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
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
                  2/3 Connected
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
                  Temporary room active • Expires in 29m 42s
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
                    Sending the project update report. Will this room expire?
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
                    Yes. The room runs in memory and expires automatically when the timer reaches 0:00.
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
                      <span className="text-xs font-semibold text-slate-200">project_brief.pdf</span>
                      <span className="text-[10px] text-slate-500 font-mono">1.8 MB • Active Session</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Composer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <div className="flex-1 bg-[#05070B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                <span>Type a message...</span>
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
            Designed for Privacy & Simplicity
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How TempLink Works
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
                <h3 className="text-lg font-bold text-white mb-2">In-Memory Temporary Rooms</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Active conversation state is held in temporary Cloudflare Durable Object memory and is not stored in a persistent message database.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Session State</span>
                <span className="font-mono text-emerald-400">In-Memory</span>
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
                <h3 className="text-lg font-bold text-white mb-2">Automatic Room Expiration</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every room has a configured lifetime. When the timer reaches 0:00, the session ends and the room becomes permanently unavailable.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Expiration Timer</span>
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
                <h3 className="text-lg font-bold text-white mb-2">QR & Room Code Access</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Join temporary rooms in seconds using a room code or QR code scan—no phone number or account required for basic access.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Room Onboarding</span>
                <span className="font-mono text-emerald-400">Account-Free</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-2">
            Built for Short-Term Communication
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Create. Connect. Communicate. Disappear.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlurFade delay={0.1}>
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#080B12]/80">
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Student & Team Collaboration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate study groups, hackathons, and short-term projects without exchanging personal phone numbers or cluttering permanent chat apps.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#080B12]/80">
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[20px]">work</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Freelance & Client Consultations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discuss requirements, share project files, and review drafts with clients in temporary sessions that close when work is complete.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#080B12]/80">
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[20px]">handshake</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Marketplace & Event Communication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate one-time transactions, event meetups, or local exchanges with time-limited rooms without sharing personal contacts.
              </p>
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
              Ready for temporary communication?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8">
              Create your first temporary private room in seconds. No signup required for basic rooms.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create">
                <ShimmerButton className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider">
                  Create Private Room
                </ShimmerButton>
              </Link>
              <Link
                href="/join"
                className="btn-ghost px-7 py-3.5 text-xs font-semibold"
              >
                Join a Room
              </Link>
            </div>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}
