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
                Example Business Dashboard • Demo Workspace
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Business Suite</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Custom room capacity, team workspaces, and developer API integration.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl self-start sm:self-auto shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              Request Business Access
            </button>
          </header>

          {/* Business Metrics Bento (Demo Workspace Preview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Organization Rooms
                </span>
                <span className="text-[9px] font-mono text-primary-light px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Demo</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">Demo Mode</span>
              <span className="text-[11px] text-slate-400">Available with Business plan</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  API Provisioning
                </span>
                <span className="text-[9px] font-mono text-primary-light px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Coming Soon</span>
              </div>
              <span className="font-display text-2xl font-bold text-primary-light">REST API</span>
              <span className="text-[11px] text-slate-400">Programmatic room creation</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Room Capacity
                </span>
                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Custom</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">25+ Members</span>
              <span className="text-[11px] text-slate-400">Higher participant limit</span>
            </div>
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Data Policy
                </span>
                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Standard</span>
              </div>
              <span className="font-display text-2xl font-bold text-emerald-400">Data Minimization</span>
              <span className="text-[11px] text-slate-400">No persistent chat database</span>
            </div>
          </div>

          {/* API Configuration & Code Preview */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#080B12]/80 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-light">code</span>
                Developer API Access — Coming Soon
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary-light uppercase">
                Planned Feature
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Planned REST API specification for programmatic room creation and lifecycle management.
            </p>

            <div className="bg-[#05070B] rounded-2xl p-4 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre className="text-primary-light/90 leading-relaxed">
{`// Planned TempLink API specification (Business Tier)
curl -X POST https://templink.in/api/rooms \\
  -H "Authorization: Bearer tl_live_preview..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "durationMinutes": 30,
    "maxParticipants": 25,
    "requirePassword": true
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
