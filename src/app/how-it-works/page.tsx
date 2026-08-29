'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlurFade } from '@/components/magicui/BlurFade';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Do I need an account to use TempLink?',
    answer: 'No. Basic temporary room creation and joining can be used without creating an account.',
  },
  {
    question: 'How many people can join a Free room?',
    answer: 'Up to 3 members, including the room creator.',
  },
  {
    question: 'How many people can join a Pro room?',
    answer: 'Up to 10 members, including the room creator.',
  },
  {
    question: 'How do I join with a QR code?',
    answer: 'Scan the TempLink QR code. The room code is automatically placed in the Join Room field, and you can confirm by pressing Join Room.',
  },
  {
    question: 'What happens when a room expires?',
    answer: 'The room becomes unavailable and active participants are disconnected.',
  },
  {
    question: 'Can I create a room without an account?',
    answer: 'Yes. Guest access is part of the core TempLink experience.',
  },
  {
    question: 'What happens if the room is full?',
    answer: 'New participants are prevented from joining once the room reaches its member limit.',
  },
  {
    question: 'Can I use TempLink on mobile?',
    answer: 'Yes. TempLink is designed as a responsive PWA and can be installed on supported devices.',
  },
];

export default function HowItWorksPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#05070B] text-slate-100">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-4 md:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-white/10 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Simple Step-by-Step Guide</span>
            <span className="text-slate-500">•</span>
            <span className="text-primary-light font-mono">1-Minute Overview</span>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15] mb-6">
            How TempLink works
          </h1>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed mb-8">
            Create a temporary room, invite people with a code or QR, communicate in real time, and let the room expire when you&apos;re done.
          </p>
        </BlurFade>

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
          <p className="text-xs text-slate-500 font-medium">
            No account required for basic use.
          </p>
        </BlurFade>
      </section>

      {/* 5-Step Core Journey */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full flex flex-col gap-10">
        <div className="text-center mb-4">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
            The Complete Lifecycle
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Create → Connect → Communicate → Disappear
          </h2>
        </div>

        {/* STEP 1: CREATE */}
        <BlurFade delay={0.1}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-8 h-8 rounded-xl flex items-center justify-center border border-white/10">
                  01
                </span>
                <h3 className="text-xl font-bold text-white">1. Create a room</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose your room settings and create a temporary private room in seconds. No signup required for basic rooms.
              </p>
              <div className="grid grid-cols-3 gap-2.5 mt-2">
                <div className="bg-[#0D111A] p-2.5 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Free Plan</span>
                  <span className="text-xs font-semibold text-white">Up to 3 members</span>
                </div>
                <div className="bg-[#0D111A] p-2.5 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-primary-light">Pro Plan</span>
                  <span className="text-xs font-semibold text-white">Up to 10 members</span>
                </div>
                <div className="bg-[#0D111A] p-2.5 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Business</span>
                  <span className="text-xs font-semibold text-white">Custom capacity</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 bg-[#05070B] p-4 rounded-2xl border border-white/10 flex flex-col gap-2 shrink-0">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Duration</span>
                <span className="text-white font-mono font-semibold">30 mins</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Identity</span>
                <span className="text-primary-light font-medium">BlueFox</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Password</span>
                <span className="text-slate-500">Optional</span>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* STEP 2: SHARE */}
        <BlurFade delay={0.15}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-8 h-8 rounded-xl flex items-center justify-center border border-white/10">
                  02
                </span>
                <h3 className="text-xl font-bold text-white">2. Share the room</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                After creating a room, TempLink generates a unique 8-character room code, a dynamic QR code, and a direct join link.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-1">
                <span className="bg-[#0D111A] px-3 py-1.5 rounded-lg border border-white/10 text-primary-light">
                  Code: K7XM-4P2Q
                </span>
                <span className="bg-[#0D111A] px-3 py-1.5 rounded-lg border border-white/10 text-slate-300">
                  https://templink.in/join/K7XM-4P2Q
                </span>
              </div>
            </div>
            <div className="w-full md:w-64 bg-[#05070B] p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2.5 shrink-0">
              <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-900 text-[48px]">qr_code_2</span>
              </div>
              <div className="flex gap-2 w-full">
                <span className="btn-ghost py-1 px-2 rounded-lg text-[10px] font-semibold text-center flex-1">Copy Code</span>
                <span className="btn-ghost py-1 px-2 rounded-lg text-[10px] font-semibold text-center flex-1">Copy Link</span>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* STEP 3: JOIN */}
        <BlurFade delay={0.2}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-8 h-8 rounded-xl flex items-center justify-center border border-white/10">
                  03
                </span>
                <h3 className="text-xl font-bold text-white">3. Join the room</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Invited members can join via the 8-character code or by scanning the QR code with their phone camera.
              </p>
              <div className="p-3 bg-[#0D111A] rounded-xl border border-white/5 text-xs text-slate-400">
                <strong className="text-white">QR Scanning Workflow:</strong> Scan QR → Room code is automatically filled into Join field → User manually presses <strong>Join Room</strong>. Scanning does not auto-join without user confirmation.
              </div>
            </div>
            <div className="w-full md:w-64 bg-[#05070B] p-4 rounded-2xl border border-emerald-500/30 flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Room Found (Free Plan)
              </div>
              <span className="text-xs text-slate-400 font-mono">1 / 3 Members Connected</span>
              <div className="bg-primary text-white text-center py-2 rounded-xl text-xs font-bold uppercase mt-1">
                Join Room
              </div>
            </div>
          </div>
        </BlurFade>

        {/* STEP 4: COMMUNICATE */}
        <BlurFade delay={0.25}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#101621] w-8 h-8 rounded-xl flex items-center justify-center border border-white/10">
                  04
                </span>
                <h3 className="text-xl font-bold text-white">4. Communicate in real time</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Once connected, all participants communicate in the same temporary room in real time with typing indicators, file sharing, and SafeRoom automated protection.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="material-symbols-outlined text-primary-light text-[16px]">shield</span>
                <span>SafeRoom active protection monitors conversation safety.</span>
              </div>
            </div>
            <div className="w-full md:w-64 bg-[#05070B] p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shrink-0 text-left text-xs">
              <div className="bg-[#0D111A] p-2 rounded-xl self-start max-w-[90%] border border-white/5">
                <span className="text-[9px] font-bold text-primary-light block">BlueFox</span>
                <span>Ready to start?</span>
              </div>
              <div className="bg-primary text-white p-2 rounded-xl self-end max-w-[90%]">
                <span>Yep!</span>
              </div>
              <div className="bg-[#0D111A] p-2 rounded-xl self-start max-w-[90%] border border-white/5">
                <span className="text-[9px] font-bold text-cyan-400 block">QuietNova</span>
                <span>I&apos;m joining now.</span>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* STEP 5: EXPIRES */}
        <BlurFade delay={0.3}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#101621] w-8 h-8 rounded-xl flex items-center justify-center border border-white/10">
                  05
                </span>
                <h3 className="text-xl font-bold text-white">5. When you&apos;re done, the room ends</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every temporary room has a server-controlled expiration time. When the room expires, participants are disconnected and the room becomes permanently unavailable.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="material-symbols-outlined text-amber-400 text-[16px]">timer</span>
                <span>Server-authoritative timer prevents expired room reconnection.</span>
              </div>
            </div>
            <div className="w-full md:w-64 bg-[#05070B] p-4 rounded-2xl border border-amber-500/30 flex flex-col items-center text-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">Countdown Reached</span>
              <span className="font-mono text-xl font-bold text-white">00:00</span>
              <span className="text-[11px] text-slate-400 mt-1">Room Expired • Session Closed</span>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Deep Dive Bento Grid: Multi-Member, Identity, SafeRoom, Privacy */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
            Key Architecture &amp; Features
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Built Around Temporary Communication
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Multi-Member */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">How many people can join?</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                The room creator counts as one member. Free rooms allow up to 3 members (1/3, 2/3, 3/3). If a fourth person tries to join, they receive a clear <strong>Room Full</strong> message.
              </p>
            </div>
            <div className="p-3 bg-[#0D111A] rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Free Limit: 3 members</span>
              <span className="text-primary-light">Pro Limit: 10 members</span>
            </div>
          </div>

          {/* Card 2: Temporary Identity */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[22px]">fingerprint</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Temporary Identity</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Guest users communicate using a temporary room identity (like <em>BlueFox</em>, <em>SilverWave</em>, or <em>QuietNova</em>) without creating a permanent profile for basic room usage.
              </p>
            </div>
            <div className="p-3 bg-[#0D111A] rounded-xl border border-white/5 text-xs text-slate-400">
              Display names are session-specific and not permanent social handles.
            </div>
          </div>

          {/* Card 3: SafeRoom */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SafeRoom Protection</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                TempLink automatically blocks supported prohibited content and issues warnings for repeated violations. A third violation terminates the room immediately.
              </p>
            </div>
            <div className="p-3 bg-[#0D111A] rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Violation 1: Warning</span>
              <span className="text-amber-400">Violation 2: Final Warning</span>
              <span className="text-red-400 font-bold">Violation 3: Closed</span>
            </div>
          </div>

          {/* Card 4: Server Timer */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#080B12]/80 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                <span className="material-symbols-outlined text-[22px]">timer</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Authoritative Room Timer</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                The timer is server-authoritative and remains synchronized across tab sleeps, background PWA switches, and mobile network handovers.
              </p>
            </div>
            <div className="p-3 bg-[#0D111A] rounded-xl border border-white/5 text-xs text-slate-400 flex justify-between font-mono">
              <span>Standard: 29:42</span>
              <span>Warning: 04:59</span>
              <span className="text-red-400">Critical: 00:59</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why TempLink & Use Cases */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
            Practical Applications
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Why use TempLink?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Not every conversation needs a permanent connection. TempLink is designed for situations where people need to communicate for a specific purpose and period.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            <h4 className="font-bold text-sm text-white">Students</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Temporary project collaboration without exchanging personal phone numbers.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <h4 className="font-bold text-sm text-white">Hackathons</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Quick team coordination during 24-48 hour hackathon sprints.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">work</span>
            </div>
            <h4 className="font-bold text-sm text-white">Freelancers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Short-term client consultations and review sessions.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">event</span>
            </div>
            <h4 className="font-bold text-sm text-white">Events</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Temporary coordination between attendees at meetups and conferences.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">group_work</span>
            </div>
            <h4 className="font-bold text-sm text-white">Short-Term Teams</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Fast communication during a specific project phase or review.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B12]/70 border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#101621] flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
            <h4 className="font-bold text-sm text-white">Buyers &amp; Sellers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">One-time marketplace communications without revealing personal contacts.</p>
          </div>
        </div>
      </section>

      {/* Plan Comparison Summary */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Plans &amp; Capacities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Start free or upgrade when your team needs larger rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#080B12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Free</span>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-white">₹0</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Up to 3 members per room
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  QR code &amp; room code joining
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Real-time chat &amp; file sharing
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Automatic room expiration
                </li>
              </ul>
            </div>
            <Link href="/create" className="btn-ghost w-full py-2.5 rounded-xl text-xs font-semibold text-center mt-6">
              Start Free
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D111A] border border-primary/40 relative shadow-2xl flex flex-col justify-between">
            <BorderBeam size={150} duration={8} colorFrom="#6366F1" colorTo="#A855F7" />
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-primary-light tracking-wider">Pro</span>
                <span className="text-[10px] font-mono bg-primary/20 text-primary-light px-2 py-0.5 rounded-md font-bold">Popular</span>
              </div>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-white">₹99</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Up to 10 members per room
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Extended room durations (up to 24h)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Advanced room controls
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Larger in-session file transfers
                </li>
              </ul>
            </div>
            <Link href="/pricing" className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center mt-6">
              Upgrade to Pro
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-[#080B12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Business</span>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Custom room capacity (25+)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  Dedicated workspace controls
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-light text-[16px]">check</span>
                  API access &amp; analytics
                </li>
              </ul>
            </div>
            <Link href="/business" className="btn-ghost w-full py-2.5 rounded-xl text-xs font-semibold text-center mt-6">
              Contact Business
            </Link>
          </div>
        </div>
      </section>

      {/* Accessible Interactive FAQ Accordion */}
      <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
            Got Questions?
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#080B12]/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto w-full text-center">
        <BlurFade delay={0.2}>
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0D111A] to-[#080B12] shadow-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to start a private conversation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8">
              Create a temporary room in seconds. No signup required for basic use.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create">
                <ShimmerButton className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider">
                  Create Private Room
                </ShimmerButton>
              </Link>
              <Link href="/join" className="btn-ghost px-7 py-3.5 text-xs font-semibold">
                Join a Room
              </Link>
            </div>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}
