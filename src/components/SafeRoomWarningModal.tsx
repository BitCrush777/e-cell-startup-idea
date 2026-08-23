'use client';

import React, { useEffect, useRef } from 'react';

export interface ModerationWarningData {
  eventId: string;
  warningNumber: number;
  warningsRemaining: number;
  maxWarnings: number;
  finalWarning: boolean;
  message: string;
}

interface SafeRoomWarningModalProps {
  warning: ModerationWarningData | null;
  onDismiss: () => void;
}

export function SafeRoomWarningModal({ warning, onDismiss }: SafeRoomWarningModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (warning) {
      // Auto-focus dismiss button for keyboard accessibility
      buttonRef.current?.focus();
    }
  }, [warning]);

  if (!warning) return null;

  const isFinal = warning.finalWarning || warning.warningNumber >= 2;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      aria-describedby="warning-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-[#080B12] shadow-[0_0_50px_rgba(245,158,11,0.2)] relative flex flex-col gap-5 text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>

        {/* Header */}
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
            SafeRoom Guideline Alert
          </span>
          <h2 id="warning-title" className="font-display font-bold text-2xl text-white mt-1">
            {isFinal ? '⚠️ Final Warning' : '⚠️ Warning 1 of 2'}
          </h2>
        </div>

        {/* Message */}
        <div id="warning-desc" className="p-4 rounded-2xl bg-[#0D111A] border border-white/10 text-left flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-200">
            {isFinal
              ? 'This is your final warning. Another violation will close this room.'
              : 'Please keep the conversation respectful. Continued violations may close this room.'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFinal
              ? 'TempLink rooms are designed for constructive, respectful communication. A third violation will immediately terminate the room for all participants.'
              : 'Our automated safety system detected prohibited language or content in your recent message. The message was blocked and not delivered.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onDismiss}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
