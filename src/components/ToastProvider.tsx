'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type'], duration?: number, customId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((
    message: string,
    type: Toast['type'] = 'info',
    duration = 3000,
    customId?: string
  ) => {
    const id = customId || `toast_${message.replace(/[^a-zA-Z0-9]/g, '_')}`;

    setToasts((prev) => {
      // Deduplication: If a toast with this exact ID or message already exists, do not duplicate
      if (prev.some((t) => t.id === id || t.message === message)) {
        return prev;
      }
      // Keep maximum 3 toasts visible simultaneously
      const next = [...prev, { id, message, type, duration }];
      return next.slice(-3);
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-medium ${
                t.type === 'error'
                  ? 'bg-red-950/80 border-red-500/30 text-red-200'
                  : t.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                  : t.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
                  : 'bg-[#161618]/90 border-white/10 text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.type === 'error'
                  ? 'error'
                  : t.type === 'success'
                  ? 'check_circle'
                  : t.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
