'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsQR from 'jsqr';
import { useToast } from '@/components/ToastProvider';
import { validateRoom } from '@/lib/api';
import { parseQrContent } from '@/lib/urls';
import { BlurFade } from '@/components/magicui/BlurFade';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Scanner States: 'idle' | 'initializing' | 'scanning' | 'detected' | 'validating' | 'error' | 'denied'
  const [scannerState, setScannerState] = useState<
    'idle' | 'initializing' | 'scanning' | 'detected' | 'validating' | 'error' | 'denied'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [manualValidating, setManualValidating] = useState<boolean>(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasProcessedRef = useRef<boolean>(false);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleValidRoomCode = useCallback(
    async (rawPayload: string) => {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      stopCamera();
      setScannerState('validating');

      const parsed = parseQrContent(rawPayload);
      if (!parsed.valid || !parsed.roomCode) {
        setScannerState('error');
        setErrorMessage(parsed.error || 'Invalid QR code. Please scan a valid TempLink room.');
        toast(parsed.error || 'Invalid QR code', 'error');
        return;
      }

      const roomCode = parsed.roomCode;
      setDetectedCode(roomCode);

      try {
        const validation = await validateRoom(roomCode);
        if (!validation.valid || !validation.room) {
          setScannerState('error');
          const err = validation.error || 'Room not found or has expired.';
          setErrorMessage(err);
          toast(err, 'error');
          return;
        }

        toast(`Room ${roomCode} found! Connecting...`, 'success');
        router.push(`/join/${roomCode}`);
      } catch (err: any) {
        router.push(`/join/${roomCode}`);
      }
    },
    [router, stopCamera, toast]
  );

  const startScanningLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let offscreenCanvas = canvasRef.current;
    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
      canvasRef.current = offscreenCanvas;
    }
    const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      if (hasProcessedRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        offscreenCanvas!.width = video.videoWidth;
        offscreenCanvas!.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, offscreenCanvas!.width, offscreenCanvas!.height);

        const imageData = ctx.getImageData(0, 0, offscreenCanvas!.width, offscreenCanvas!.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          setScannerState('detected');
          handleValidRoomCode(code.data);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleValidRoomCode]);

  const startCamera = useCallback(async () => {
    hasProcessedRef.current = false;
    setScannerState('initializing');
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScannerState('denied');
        setErrorMessage('Camera access is not supported by your browser.');
        return;
      }

      let stream: MediaStream;
      try {
        // Try rear/environment camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScannerState('scanning');
        startScanningLoop();
      }
    } catch (err: any) {
      setScannerState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. You can enter the room code manually.');
      } else {
        setErrorMessage('Camera is unavailable or in use by another app.');
      }
    }
  }, [startScanningLoop]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || manualValidating) return;

    setManualValidating(true);
    const parsed = parseQrContent(inputVal);

    if (!parsed.valid || !parsed.roomCode) {
      toast(parsed.error || 'Please enter a valid room code', 'error');
      setManualValidating(false);
      return;
    }

    stopCamera();
    router.push(`/join/${parsed.roomCode}`);
  };

  const handleRetryScan = () => {
    stopCamera();
    startCamera();
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-lg py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <BlurFade delay={0.1} className="w-full max-w-[500px] mt-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
            Real-Time Visual Join
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            Scan Room QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Hold your camera over the TempLink QR code to connect instantly.
          </p>
        </header>

        <div className="relative glass-panel p-6 sm:p-8 rounded-3xl flex flex-col items-center gap-6 border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
          {/* Border Beam Accent */}
          <BorderBeam size={200} duration={8} colorFrom="#6366F1" colorTo="#38BDF8" />

          {/* Camera Viewport */}
          <div className="relative w-full aspect-square max-w-[320px] bg-black rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                scannerState === 'scanning' ? 'opacity-100' : 'opacity-30'
              }`}
            />

            {/* Target Reticle Overlay */}
            {scannerState === 'scanning' && (
              <div className="absolute inset-8 border-2 border-primary/60 rounded-2xl pointer-events-none flex items-center justify-center">
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-primary shadow-[0_0_8px_#6366F1] animate-pulse" />
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary-light rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary-light rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary-light rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary-light rounded-br-lg" />
              </div>
            )}

            {/* State Overlays */}
            {scannerState === 'initializing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs font-semibold text-white">Initializing camera...</span>
              </div>
            )}

            {(scannerState === 'detected' || scannerState === 'validating') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-6 text-center animate-fade-in">
                <span className="material-symbols-outlined text-4xl text-emerald-400 animate-bounce">
                  check_circle
                </span>
                <span className="text-sm font-bold text-white">QR Code Detected!</span>
                <span className="text-xs text-primary-light font-mono">
                  {detectedCode ? `Room ${detectedCode}` : 'Validating room on edge...'}
                </span>
              </div>
            )}

            {(scannerState === 'denied' || scannerState === 'error') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080B12]/95 p-6 text-center animate-fade-in">
                <span className="material-symbols-outlined text-4xl text-amber-400">
                  {scannerState === 'denied' ? 'videocam_off' : 'error'}
                </span>
                <span className="text-xs font-semibold text-white max-w-[220px]">
                  {errorMessage || 'Unable to scan QR code.'}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleRetryScan}
                    className="btn-ghost text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    Try Again
                  </button>
                  <Link
                    href="/join"
                    className="btn-primary text-xs font-bold px-3 py-2 rounded-xl uppercase tracking-wider"
                  >
                    Enter Code
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Status Message */}
          <div className="text-center text-xs text-slate-400">
            {scannerState === 'scanning' && (
              <span className="flex items-center justify-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera Active — Align QR within frame
              </span>
            )}
            {scannerState === 'initializing' && 'Requesting camera access...'}
            {scannerState === 'validating' && 'Verifying room status on edge network...'}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="w-full flex flex-col gap-2">
            <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider text-center">
              Or paste join link / enter code manually
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={manualValidating}
                placeholder="e.g. K7XM-4P2Q or join URL"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={manualValidating || !inputVal.trim()}
                className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm"
              >
                {manualValidating ? 'Checking...' : 'Join'}
              </button>
            </div>
          </form>

          <Link
            href="/join"
            className="text-xs text-slate-400 hover:text-primary-light transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Back to Manual Code Entry
          </Link>
        </div>
      </BlurFade>
    </main>
  );
}
