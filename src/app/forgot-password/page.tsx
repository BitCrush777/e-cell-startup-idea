'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: any = await res.json();
      if (res.ok) {
        setIsSubmitted(true);
        if (data && data.devResetToken) {
          setDevToken(data.devResetToken);
        }
      } else {
        setErrorMessage(data?.error || 'Unable to process request.');
      }
    } catch {
      setErrorMessage('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 py-24 flex items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <BlurFade delay={0.1} className="w-full max-w-md">
        <div className="relative glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
          <BorderBeam size={220} duration={10} colorFrom="#6366F1" colorTo="#38BDF8" />

          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-[15px]">lock_reset</span>
              Password Recovery
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Reset your password</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter your email address and we will provide secure password reset instructions.
            </p>
          </header>

          {isSubmitted ? (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-1">Check Your Email</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If an account exists for <strong className="text-slate-200">{email}</strong>, we have sent instructions to reset your password.
                </p>
              </div>

              {/* Dev token convenience link for quick manual verification */}
              {devToken && (
                <div className="p-3.5 bg-[#05070B] rounded-2xl border border-primary/30 text-left space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-primary-light tracking-wider block">
                    Local Dev Reset Link
                  </span>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="text-xs text-primary-light hover:underline font-mono break-all block"
                  >
                    Click to Open Reset Screen (Token: {devToken.substring(0, 14)}...)
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider block"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary shadow-inner"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </ShimmerButton>
              </div>

              <div className="mt-6 text-center text-xs text-slate-400 space-y-2">
                <div>
                  Remember your password?{' '}
                  <Link href="/login" className="text-primary-light hover:underline font-semibold">
                    Sign In
                  </Link>
                </div>
                <div>
                  <Link href="/create" className="text-slate-400 hover:text-white text-[11px]">
                    Continue as Guest (No account needed)
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </BlurFade>
    </main>
  );
}
