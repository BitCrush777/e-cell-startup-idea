'use client';

import React, { useState } from 'react';

export function SafeRoomIndicator() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary-light hover:bg-primary/15 transition-all shadow-sm group"
        title="SafeRoom Active: Automated real-time conversation safety protection"
        aria-label="SafeRoom Active: click for details"
      >
        <span className="material-symbols-outlined text-[14px] text-primary-light">
          shield
        </span>
        <span className="hidden sm:inline font-semibold">SafeRoom Active</span>
        <span className="sm:hidden font-semibold">SafeRoom</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="saferoom-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-primary/30 bg-[#080B12] shadow-2xl relative flex flex-col gap-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <h3 id="saferoom-title" className="font-bold text-sm text-white">
                  SafeRoom Protection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              TempLink can automatically block supported prohibited content and issue warnings for repeated violations to keep conversations respectful.
            </p>

            <div className="p-3 rounded-xl bg-[#0D111A] border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-400">
              <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0 mt-0.5">
                verified_user
              </span>
              <span>
                Server-authoritative protection active for all room participants.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
