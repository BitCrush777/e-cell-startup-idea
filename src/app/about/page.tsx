import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BlurFade } from '@/components/magicui/BlurFade';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export const metadata: Metadata = {
  title: 'About TempLink — Meet the Team',
  description:
    'Learn about TempLink and the team building a privacy-focused temporary communication platform.',
  openGraph: {
    title: 'About TempLink — Meet the Team',
    description:
      'Learn about TempLink and the team building a privacy-focused temporary communication platform.',
  },
};

const teamMembers = [
  {
    name: 'Sai Darshan.k',
    initials: 'SD',
    role: 'Founder & Lead Developer',
    responsibilities: 'Product vision • Architecture • Development • UI/UX',
    description:
      'Leading the product vision, system architecture, development, and overall design of TempLink.',
    avatarGradient: 'from-indigo-500 via-primary to-purple-600',
    highlight: true,
  },
  {
    name: 'Anusuya.S',
    initials: 'AS',
    role: 'Team Member',
    responsibilities: 'Project contribution • Collaboration',
    description:
      'Contributing to the development and growth of the TempLink project.',
    avatarGradient: 'from-cyan-500 via-sky-600 to-indigo-600',
    highlight: false,
  },
  {
    name: 'Akastin.R',
    initials: 'AR',
    role: 'Team Member',
    responsibilities: 'Project contribution • Collaboration',
    description:
      'Contributing to the development and growth of the TempLink project.',
    avatarGradient: 'from-emerald-500 via-teal-600 to-indigo-600',
    highlight: false,
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1 w-full min-h-[calc(100vh-80px)] bg-[#05070B] text-slate-100 relative overflow-hidden pt-28 pb-20 px-4 md:px-8">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[350px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-20 relative z-10">
        {/* 1. Hero Section */}
        <section className="text-center flex flex-col items-center">
          <BlurFade delay={0.1}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[15px]">info</span>
              About TempLink
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              About TempLink
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-medium leading-relaxed mb-6">
              A simple way to connect privately for conversations that don&apos;t need to last forever.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              TempLink is a privacy-focused temporary communication platform designed to make short-term communication simple, fast, and account-free. Users can create a temporary private room, share a one-time code or QR code, communicate in real time, and let the session expire when the conversation is over.
            </p>
          </BlurFade>
        </section>

        {/* Visual Architecture Representation */}
        <BlurFade delay={0.45}>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center text-primary-light shadow-md">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
              <span className="text-xs font-bold text-white">People</span>
              <span className="text-[10px] text-slate-400">Account-Free</span>
            </div>

            <div className="hidden sm:flex items-center flex-1 justify-center relative px-4">
              <div className="w-full h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
              <div className="absolute px-3 py-1 bg-[#0D111A] border border-primary/40 rounded-full text-[10px] font-mono text-primary-light">
                Secure WebSocket Relay
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center text-primary-light shadow-md">
                <span className="material-symbols-outlined text-[22px]">vpn_key</span>
              </div>
              <span className="text-xs font-bold text-white">Temporary Room</span>
              <span className="text-[10px] text-emerald-400 font-mono">Configured TTL</span>
            </div>

            <div className="hidden sm:flex items-center flex-1 justify-center relative px-4">
              <div className="w-full h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
              <div className="absolute px-3 py-1 bg-[#0D111A] border border-primary/40 rounded-full text-[10px] font-mono text-primary-light">
                Auto-Expiration
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center text-primary-light shadow-md">
                <span className="material-symbols-outlined text-[22px]">auto_delete</span>
              </div>
              <span className="text-xs font-bold text-white">Disappear</span>
              <span className="text-[10px] text-slate-400">Data Minimization</span>
            </div>
          </div>
        </BlurFade>

        {/* 2. Our Vision Section */}
        <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#080B12]/85 shadow-2xl relative overflow-hidden">
          <BorderBeam size={220} duration={10} colorFrom="#6366F1" colorTo="#38BDF8" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary-light uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Our Philosophy
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              Our Vision
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              We believe not every conversation needs a permanent identity, permanent contact information, or a permanent history. TempLink is built around the idea that temporary communication should be as easy as creating a room, connecting, and leaving when you&apos;re done.
            </p>
          </div>
        </section>

        {/* 3. What TempLink Does — 3 Feature Cards */}
        <section>
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
              Core Mechanics
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              What TempLink Does
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Create */}
            <BlurFade delay={0.1}>
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080B12]/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Create</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create a temporary private room in seconds. Choose your desired lifespan and generate a clean access code.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                  Instant Provisioning
                </div>
              </div>
            </BlurFade>

            {/* Card 2: Connect */}
            <BlurFade delay={0.2}>
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080B12]/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                    <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Connect</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Share a one-time code or QR code to connect instantly. Both parties communicate over a synchronized edge relay.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-[11px] font-mono text-primary-light">
                  Direct Edge Pairing
                </div>
              </div>
            </BlurFade>

            {/* Card 3: Disappear */}
            <BlurFade delay={0.3}>
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080B12]/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light mb-4">
                    <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Disappear</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When the session ends, the temporary room expires and becomes unavailable for further communication.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-300">
                  Automatic Expiration
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* 4. Meet the Team Section */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-primary-light uppercase tracking-widest block mb-1.5">
              The Builders
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Meet the Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              The people behind TempLink, building a simpler approach to temporary private communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <BlurFade key={member.name} delay={0.1 * (idx + 1)}>
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#080B12]/85 h-full flex flex-col justify-between group hover:border-primary/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {member.highlight && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
                  )}

                  <div>
                    {/* Abstract Initials Avatar */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white font-display font-bold text-lg shadow-lg group-hover:scale-105 transition-transform border border-white/20`}
                      >
                        {member.initials}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-primary-light transition-colors">
                          {member.name}
                        </h3>
                        <span className="text-xs font-semibold text-primary-light">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {/* Contribution Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {member.description}
                    </p>
                  </div>

                  {/* Responsibilities Pill */}
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight block">
                      {member.responsibilities}
                    </span>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* 5. Creator / Project Credit Section */}
        <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0D111A] to-[#080B12] shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161E2E] border border-white/10 text-primary-light text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-[15px]">code</span>
              Project Designed &amp; Developed By
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Sai Darshan.k
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
              TempLink is a collaborative startup project developed with a focus on privacy-first temporary communication.
            </p>

            <div className="flex items-center gap-3">
              <Link href="/create">
                <ShimmerButton className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
                  Create a Room
                </ShimmerButton>
              </Link>
              <Link href="/join" className="btn-ghost px-5 py-2.5 text-xs font-semibold">
                Join a Room
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Muted Bottom Credit */}
        <div className="text-center pt-2 text-xs text-slate-500 font-mono">
          TempLink — Designed &amp; Developed by <span className="text-slate-300 font-medium">Sai Darshan.k</span> • Built with the TempLink team
        </div>
      </div>
    </main>
  );
}
