'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from './ToastProvider';

interface PwaContextType {
  isStandalone: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isStandalone: false,
  isInstallable: false,
  isOnline: true,
  promptInstall: async () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 1. Detect Standalone Display Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Register Service Worker with update detection
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(() => {});
    }

    // 3. Capture beforeinstallprompt event for Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      const dismissed = localStorage.getItem('templink_pwa_prompt_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Track online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast('Connection restored', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast("You're offline. Ephemeral channels require an active connection.", 'error');
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 5. App Lifecycle Resume Listener (re-synchronization on focus / resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsOnline(navigator.onLine);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [toast]);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setShowInstallBanner(false);
        toast('TempLink installed successfully!', 'success');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('templink_pwa_prompt_dismissed', 'true');
  };

  const handleApplyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  };

  // Don't show install banner on active chat screens
  const isChatScreen = pathname?.startsWith('/room/') && !pathname.endsWith('/expired');

  return (
    <PwaContext.Provider value={{ isStandalone, isInstallable, isOnline, promptInstall }}>
      {children}

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-950/90 text-rose-200 border-b border-rose-500/30 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md animate-fade-in shadow-lg">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>You are offline. Private rooms require active network connection.</span>
        </div>
      )}

      {/* New Version Available Banner */}
      {updateAvailable && !isChatScreen && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 glass-panel p-4 rounded-2xl border border-primary/40 bg-[#080B12]/95 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Update Available</span>
            <span className="text-[11px] text-slate-400">A new version of TempLink is ready.</span>
          </div>
          <button
            onClick={handleApplyUpdate}
            className="btn-primary text-xs font-bold px-3.5 py-1.5 rounded-xl uppercase shrink-0"
          >
            Update
          </button>
        </div>
      )}

      {/* Native Install Prompt Banner */}
      {showInstallBanner && !isStandalone && !isChatScreen && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 glass-panel p-4 sm:p-5 rounded-3xl border border-primary/30 bg-[#080B12]/95 shadow-2xl flex items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white shadow-md shrink-0">
              <span className="material-symbols-outlined text-[20px]">install_mobile</span>
            </div>
            <div>
              <h4 className="font-display font-bold text-xs sm:text-sm text-white">Install TempLink</h4>
              <p className="text-[11px] text-slate-400">Get instant access from your home screen.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDismissBanner}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg font-medium"
            >
              Later
            </button>
            <button
              onClick={promptInstall}
              className="btn-primary text-xs font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider"
            >
              Install
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
