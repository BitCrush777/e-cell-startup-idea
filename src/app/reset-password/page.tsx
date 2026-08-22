'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data: any = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data?.error || 'Failed to update password.');
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
          <BorderBeam size={220} duration={10} colorFrom="#6366F1" colorTo="#A855F7" />

          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-[15px]">key</span>
              Secure Credential Update
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Create New Password
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Choose a strong password of at least 8 characters.
            </p>
          </header>

          {isSuccess ? (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white mb-1">Password Updated!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your TempLink password has been changed. You can now sign in with your new credentials.
                </p>
              </div>

              <Link
                href="/login"
                className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider block"
              >
                Sign In to Account
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0">
                    warning
                  </span>
                  <span>No reset token provided. Please request a link from the forgot password page.</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="At least 8 characters"
                    className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary pr-11 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Re-enter new password"
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
                  disabled={loading || !token}
                  className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </ShimmerButton>
              </div>

              <div className="mt-6 text-center text-xs text-slate-400">
                <Link href="/login" className="text-primary-light hover:underline font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </BlurFade>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#05070B]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
