'use client';

import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#080B12] shadow-2xl relative flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
            </div>
            <h3 id="help-modal-title" className="font-display font-bold text-base text-white">
              How TempLink Works
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:ring-2 focus:ring-primary"
            aria-label="Close Help Dialog"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 5-Step Process */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
            <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Create a room</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click Create Room and choose your session duration (default: 30 mins).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
            <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Share QR or room code</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Show the QR code on screen or send the 8-character code (e.g. K7XM-4P2Q).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
            <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Join instantly</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The other person scans the QR or types the code. No account required for basic rooms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
            <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Chat in real time</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Send text messages and files. SafeRoom active protection helps keep conversations safe.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              5
            </span>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Room expires</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When the timer hits 0:00, the session ends automatically and cannot be rejoined.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-1 focus:ring-2 focus:ring-primary"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
