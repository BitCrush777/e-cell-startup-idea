'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';
import { getActiveRooms } from '@/lib/api';
import { NumberTicker } from '@/components/magicui/NumberTicker';
import { BlurFade } from '@/components/magicui/BlurFade';

export default function DashboardPage() {
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const rooms = await getActiveRooms();
        setActiveRooms(rooms);
      } catch {}
      setLoading(false);
    }

    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#05070B] text-slate-100">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 p-6 sm:p-10 pt-24 md:pt-10 overflow-y-auto w-full relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          {/* Header Hero Banner */}
          <BlurFade delay={0.1}>
            <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass-panel border border-white/10 bg-[#080B12]/80 shadow-2xl">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-3">
                  <span className="material-symbols-outlined text-[15px]">security</span>
                  Ephemeral Control Center
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2">
                  Manage Private Conversations
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Secure, ephemeral channels that vanish on expiration. Zero permanent traces, RAM-only execution.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <Link
                  href="/create"
                  className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] flex-1 md:flex-initial"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Room
                </Link>
                <Link
                  href="/join"
                  className="btn-ghost text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 flex-1 md:flex-initial"
                >
                  <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                  Join Room
                </Link>
              </div>
            </section>
          </BlurFade>

          {/* Quick Metrics Bento with Magic UI NumberTicker */}
          <BlurFade delay={0.2}>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                <span className="material-symbols-outlined text-primary-light text-[24px]">meeting_room</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mt-1">
                  Active Live Rooms
                </span>
                <span className="font-display text-2xl font-bold text-white">
                  <NumberTicker value={activeRooms.length} />
                </span>
              </div>
              <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mt-1">
                  Zero Log Status
                </span>
                <span className="font-display text-2xl font-bold text-emerald-400">100% Active</span>
              </div>
              <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                <span className="material-symbols-outlined text-primary-light text-[24px]">fingerprint</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mt-1">
                  Session Identity
                </span>
                <span className="font-display text-lg font-bold text-primary-light truncate">Ephemeral</span>
              </div>
              <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">timer</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mt-1">
                  Max TTL Limit
                </span>
                <span className="font-display text-2xl font-bold text-white">24 Hours</span>
              </div>
            </section>
          </BlurFade>

          {/* Active Rooms Bento Section */}
          <BlurFade delay={0.3}>
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Active Rooms
                </h3>
                <Link
                  href="/rooms"
                  className="text-xs text-primary-light hover:underline font-semibold flex items-center gap-1"
                >
                  View Rooms
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading active rooms...
                </div>
              ) : activeRooms.length === 0 ? (
                <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-3 bg-[#080B12]/80">
                  <span className="material-symbols-outlined text-4xl text-slate-600">
                    inbox
                  </span>
                  <h4 className="font-bold text-base text-white">No Active Rooms Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Create a new room or join with a one-time code to start communicating.
                  </p>
                  <Link
                    href="/create"
                    className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl mt-2"
                  >
                    Create Private Room
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeRooms.map((r) => (
                    <div
                      key={r.id}
                      className="glass-panel rounded-3xl p-6 flex flex-col h-full relative overflow-hidden group hover:border-primary/40 transition-all bg-[#080B12]/80 shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5 bg-[#0D111A] px-2.5 py-1 rounded-lg border border-white/5">
                          <span className="material-symbols-outlined text-primary-light text-[14px]">
                            group
                          </span>
                          <span className="text-[10px] font-semibold text-slate-300">
                            {r.participantCount || r.currentMembers || 1}/{r.maxMembers || r.maxParticipants || 3} members Active
                          </span>
                        </div>

                        <div className="text-xs">
                          <CountdownTimer expiresAt={r.expiresAt} />
                        </div>
                      </div>

                      <h4 className="font-mono font-bold text-lg text-primary-light mb-1">
                        {r.roomCode}
                      </h4>
                      <p className="text-xs text-slate-400 mb-6 flex-1">
                        Hosted by {r.creatorName} • {r.durationMinutes}m initial lifespan
                      </p>

                      <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                        <Link
                          href={`/room/${r.roomCode}`}
                          className="flex-1 bg-[#161E2E] hover:bg-[#1C263A] text-white font-semibold text-xs py-2.5 rounded-xl transition-colors text-center border border-white/5"
                        >
                          Enter Room
                        </Link>
                        <Link
                          href={`/join?code=${r.roomCode}`}
                          className="w-10 flex items-center justify-center border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors"
                          title="Share / Join"
                        >
                          <span className="material-symbols-outlined text-[18px]">share</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}
