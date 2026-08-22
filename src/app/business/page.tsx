'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function BusinessPage() {
  return (
    <div className="flex min-h-screen bg-[#05070B] text-slate-100">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 p-6 sm:p-10 pt-24 md:pt-10 overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-[15px]">domain</span>
                Organization & Developer Console
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Business Suite</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enterprise ephemeral infrastructure, dedicated memory clusters, and API keys.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl self-start sm:self-auto shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              Generate API Key
            </button>
          </header>

          {/* Business Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Active Organization Rooms
              </span>
              <span className="font-display text-2xl font-bold text-white">14 Active</span>
              <span className="text-[11px] text-emerald-400">All within cryptographic TTL</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                API Calls (Last 24h)
              </span>
              <span className="font-display text-2xl font-bold text-primary-light">12,480</span>
              <span className="text-[11px] text-slate-400">Avg latency: 18ms</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Team Member Seats
              </span>
              <span className="font-display text-2xl font-bold text-white">8 / 25</span>
              <span className="text-[11px] text-primary-light hover:underline cursor-pointer">Manage team</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                RAM Auto-Purge Rate
              </span>
              <span className="font-display text-2xl font-bold text-emerald-400">100.0%</span>
              <span className="text-[11px] text-slate-400">0 bytes retained</span>
            </div>
          </div>

          {/* API Configuration & Code Preview */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#080B12]/80 space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-light">code</span>
              Developer Ephemeral API Integration
            </h3>
            <p className="text-xs text-slate-400">
              Programmatically provision ephemeral rooms with custom TTL and webhook triggers.
            </p>

            <div className="bg-[#05070B] rounded-2xl p-4 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre className="text-primary-light/90 leading-relaxed">
{`// Create an ephemeral room via TempLink REST API
curl -X POST https://api.templink.app/v1/rooms \\
  -H "Authorization: Bearer tl_live_948a7b..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "durationMinutes": 30,
    "maxParticipants": 2,
    "requirePassword": true,
    "webhookOnExpire": "https://your-domain.com/webhooks/purged"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
