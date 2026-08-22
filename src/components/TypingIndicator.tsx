'use client';

import React from 'react';

interface TypingIndicatorProps {
  participantName: string | null;
}

export default function TypingIndicator({ participantName }: TypingIndicatorProps) {
  if (!participantName) return null;

  return (
    <div className="flex items-center gap-2 self-start text-on-surface-variant mt-1 animate-fade-in">
      <div className="bg-[#122131] border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs italic text-on-surface-variant/70">
        {participantName} is typing...
      </span>
    </div>
  );
}
