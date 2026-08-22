'use client';

import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: number;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

export default function CountdownTimer({
  expiresAt,
  onExpire,
  className = '',
  showIcon = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isWarning = totalSeconds > 0 && totalSeconds <= 300 && totalSeconds > 60; // < 5 mins
  const isCritical = totalSeconds > 0 && totalSeconds <= 60; // < 1 min

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
        isCritical
          ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)]'
          : isWarning
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          : 'bg-[#0D111A] border-white/10 text-slate-200'
      } ${className}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[15px]">
          timer
        </span>
      )}
      <span className="tracking-wider">{formatted}</span>
    </div>
  );
}
