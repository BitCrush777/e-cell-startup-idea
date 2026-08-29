'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';
import { getActiveRooms } from '@/lib/api';

export default function RoomsHistoryPage() {
  const [tab, setTab] = useState<'active' | 'expired'>('active');
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const active = await getActiveRooms();
        setRooms(active);
      } catch {}
    }
    fetchRooms();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#05070B] text-slate-100">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 p-6 sm:p-10 pt-24 md:pt-10 overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Room History</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Active temporary sessions and expired cryptographic records.
              </p>
            </div>
            <Link
              href="/create"
              className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Room
            </Link>
          </header>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === 'active'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Active Sessions ({rooms.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('expired')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === 'expired'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Destroyed / Expired
            </button>
          </div>

          {tab === 'active' ? (
            rooms.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-3 bg-[#080B12]/80">
                <span className="material-symbols-outlined text-4xl text-slate-600">
                  history_toggle_off
                </span>
                <p className="text-sm font-semibold text-white">No active sessions at the moment.</p>
                <Link href="/create" className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold mt-2">
                  Create Room
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-4 bg-[#080B12]/80 shadow-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-base font-bold text-primary-light">
                        {r.roomCode}
                      </span>
                      <CountdownTimer expiresAt={r.expiresAt} />
                    </div>
                    <p className="text-xs text-slate-400">
                      Created by {r.creatorName} • {r.durationMinutes} mins lifespan
                    </p>
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/room/${r.roomCode}`}
                        className="btn-primary flex-1 py-2.5 text-center text-xs font-bold rounded-xl"
                      >
                        Enter Room
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-3 bg-[#080B12]/60">
              <span className="material-symbols-outlined text-4xl text-emerald-400">
                lock_reset
              </span>
              <h4 className="font-bold text-base text-white">Temporary Session Policy</h4>
              <p className="text-xs text-slate-400 max-w-md">
                In adherence to TempLink&apos;s data minimization principles, expired rooms and conversation messages are not archived in a persistent chat database.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
