'use client';

import React from 'react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  isMe: boolean;
}

export default function ChatMessage({ message, isMe }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <span className="text-[11px] text-slate-400 font-mono tracking-wide bg-[#0D111A]/80 px-3.5 py-1 rounded-full border border-white/5 shadow-sm">
          {message.content}
        </span>
      </div>
    );
  }

  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isMe) {
    return (
      <div className="flex flex-col gap-0.5 sm:gap-1 self-end max-w-[88%] sm:max-w-[80%] md:max-w-[75%] items-end animate-fade-in">
        <div className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_15px_rgba(99,102,241,0.25)] font-normal text-[13px] sm:text-sm leading-relaxed border border-white/15">
          {message.file ? (
            <div className="flex flex-col gap-2">
              {message.file.type?.startsWith('image/') && (
                <img
                  src={message.file.dataUrl}
                  alt={message.file.name}
                  className="max-w-full max-h-60 rounded-xl object-contain border border-white/10"
                />
              )}
              <a
                href={message.file.dataUrl}
                download={message.file.name}
                className="flex items-center gap-1.5 font-semibold underline text-xs text-white"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                {message.file.name} ({(message.file.size / 1024).toFixed(1)} KB)
              </a>
            </div>
          ) : (
            message.content
          )}
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-500 mr-1 font-mono">
          {timeFormatted}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 sm:gap-1 self-start max-w-[88%] sm:max-w-[80%] md:max-w-[75%] animate-fade-in">
      <span className="text-[10px] font-semibold text-primary-light ml-1 uppercase tracking-wider">
        {message.senderName}
      </span>
      <div className="bg-[#0D111A] border border-white/10 text-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm text-[13px] sm:text-sm leading-relaxed">
        {message.file ? (
          <div className="flex flex-col gap-2">
            {message.file.type?.startsWith('image/') && (
              <img
                src={message.file.dataUrl}
                alt={message.file.name}
                className="max-w-full max-h-60 rounded-xl object-contain border border-white/10"
              />
            )}
            <a
              href={message.file.dataUrl}
              download={message.file.name}
              className="flex items-center gap-1.5 font-semibold text-primary-light underline text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {message.file.name} ({(message.file.size / 1024).toFixed(1)} KB)
            </a>
          </div>
        ) : (
          message.content
        )}
      </div>
      <span className="text-[9px] sm:text-[10px] text-slate-500 ml-1 font-mono">
        {timeFormatted}
      </span>
    </div>
  );
}
