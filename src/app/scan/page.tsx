'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { validateRoom } from '@/lib/api';
import { BlurFade } from '@/components/magicui/BlurFade';
import { BorderBeam } from '@/components/magicui/BorderBeam';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setHasCamera(false);
          setCameraError('Camera access not supported on this browser.');
        }
      } catch {
        setHasCamera(false);
        setCameraError('Camera permission not granted or camera busy.');
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const extractRoomCode = (raw: string): string => {
    const trimmed = raw.trim();
    // Match URL pattern e.g. /join/K7XM-4P2Q or ?code=K7XM-4P2Q
    const urlMatch = trimmed.match(/\/join\/([A-Za-z0-9-]+)/i) || trimmed.match(/[?&]code=([A-Za-z0-9-]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].toUpperCase();
    }
    // Match standalone 8-character code e.g. K7XM-4P2Q
    const codeMatch = trimmed.match(/([A-Za-z0-9]{4}-[A-Za-z0-9]{4})/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].toUpperCase();
    }
    return trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  };

  const handleProcessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isValidating) return;

    const code = extractRoomCode(inputVal);
    if (!code || code.length < 4) {
      toast('Please enter a valid room code or join URL', 'error');
      return;
    }

    setIsValidating(true);

    try {
      const res = await validateRoom(code);
      if (!res.valid) {
        toast(res.error || 'Room not found or expired', 'error');
        setIsValidating(false);
        return;
      }

      // Stop camera stream immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      router.push(`/join/${code}`);
    } catch {
      router.push(`/join/${code}`);
    }
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-16 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <BlurFade delay={0.1} className="w-full max-w-[500px] mt-8">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-3">
            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
            Visual P2P Onboarding
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Scan Room QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Position the TempLink QR code within the frame to connect.
          </p>
        </header>

        <div className="relative glass-panel p-6 sm:p-8 rounded-3xl flex flex-col items-center gap-6 border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
          {/* Border Beam Accent */}
          <BorderBeam size={200} duration={8} colorFrom="#6366F1" colorTo="#38BDF8" />

          {/* Camera Viewport */}
          <div className="relative w-full aspect-square max-w-[300px] bg-black/80 rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center shadow-inner">
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-center p-6 gap-3">
                <span className="material-symbols-outlined text-4xl text-slate-500">
                  videocam_off
                </span>
                <p className="text-xs text-slate-400">{cameraError}</p>
                <Link
                  href="/join"
                  className="btn-primary text-xs font-bold px-4 py-2 rounded-xl mt-1 uppercase tracking-wider"
                >
                  Enter Code Manually
                </Link>
              </div>
            )}

            {/* Target Reticle Overlay */}
            {hasCamera && (
              <div className="absolute inset-6 border-2 border-primary/50 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-primary/80 animate-pulse" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-light" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-light" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-light" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-light" />
              </div>
            )}
          </div>

          {/* Paste Scanned URL or Code Form */}
          <form onSubmit={handleProcessCode} className="w-full flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={isValidating}
                placeholder="Paste join link or room code..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={isValidating || !inputVal.trim()}
                className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm"
              >
                {isValidating ? 'Checking...' : 'Join'}
              </button>
            </div>
          </form>

          <Link
            href="/join"
            className="text-xs text-slate-400 hover:text-primary-light transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Back to manual code entry
          </Link>
        </div>
      </BlurFade>
    </main>
  );
}
