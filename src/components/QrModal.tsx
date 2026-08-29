'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from './ToastProvider';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export default function QrModal({ isOpen, onClose, roomCode }: QrModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${roomCode}`
    : `https://templink.in/join?code=${roomCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast('Join link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy link', 'error');
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast(`Room code ${roomCode} copied!`, 'success');
    } catch {
      toast('Failed to copy code', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my private TempLink room',
          text: `Connect securely with me on TempLink. Code: ${roomCode}`,
          url: joinUrl,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 md:p-8 rounded-2xl max-w-sm w-full flex flex-col items-center gap-5 relative border border-white/15 bg-[#0D1C2D]/90 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-widest block mb-1">
            Private Scan
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface">Scan to Connect</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Scan with any camera or phone to join instantly.
          </p>
        </div>

        {/* High-contrast QR Container */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-white/20 flex items-center justify-center">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#051424"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Room Code Badge */}
        <div
          onClick={copyCode}
          className="flex items-center justify-between w-full bg-[#051424] border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:border-primary/50 transition-colors group"
        >
          <span className="font-mono-timer text-sm font-semibold tracking-wider text-primary">
            {roomCode}
          </span>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
            content_copy
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={copyLink}
            className="btn-ghost py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'link'}
            </span>
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button
            onClick={handleNativeShare}
            className="btn-primary py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
