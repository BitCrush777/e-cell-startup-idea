'use client';

import React from 'react';

interface TypingIndicatorProps {
  participantName?: string | null;
  typingNames?: string[];
}

export default function TypingIndicator({ participantName, typingNames = [] }: TypingIndicatorProps) {
  const names = typingNames.length > 0 ? typingNames : participantName ? [participantName] : [];
  if (names.length === 0) return null;

  let text = '';
  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names.length} people are typing...`;
  }

  return (
    <div className="flex items-center gap-2 self-start text-slate-400 mt-1 animate-fade-in">
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs italic text-slate-400">
        {text}
      </span>
    </div>
  );
}
