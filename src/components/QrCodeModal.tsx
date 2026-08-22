'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from './ToastProvider';
import { BorderBeam } from '@/components/magicui/BorderBeam';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  joinUrl?: string;
}

export default function QrCodeModal({ isOpen, onClose, roomCode, joinUrl }: QrCodeModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const actualJoinUrl =
    joinUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/join/${roomCode}`
      : `https://templink.app/join/${roomCode}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(actualJoinUrl);
      setCopied(true);
      toast('Private room link copied!', 'success');
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
          title: 'Join my TempLink private room',
          text: `Join this temporary private room. Code: ${roomCode}`,
          url: actualJoinUrl,
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
      <div className="relative glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full flex flex-col items-center gap-5 border border-white/10 bg-[#080B12]/95 shadow-2xl overflow-hidden">
        {/* Magic UI BorderBeam */}
        <BorderBeam size={180} duration={8} colorFrom="#6366F1" colorTo="#38BDF8" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] font-semibold text-primary-light uppercase tracking-widest block mb-1">
            Dynamic QR Code
          </span>
          <h3 className="font-display font-bold text-xl text-white">Scan to Connect</h3>
          <p className="text-xs text-slate-400 mt-1">
            Scan with any mobile camera to join this room instantly.
          </p>
        </div>

        {/* Dynamic QR Container */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
          <QRCodeSVG
            value={actualJoinUrl}
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
          className="flex items-center justify-between w-full bg-[#05070B] border border-white/10 rounded-2xl px-4 py-2.5 cursor-pointer hover:border-primary/50 transition-colors group shadow-inner"
        >
          <span className="font-mono text-sm font-semibold tracking-widest text-primary-light">
            {roomCode}
          </span>
          <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-primary-light transition-colors">
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
            className="btn-primary py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
