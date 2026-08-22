'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email or password is incorrect.');
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('alex@example.com');
    setPassword('ProSecure#2026');
    setErrorMessage(null);
    toast('Demo Pro credentials populated', 'info');
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 py-24 flex items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <BlurFade delay={0.1} className="w-full max-w-md">
        <div className="relative glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
          {/* Border Beam Accent */}
          <BorderBeam size={220} duration={10} colorFrom="#6366F1" colorTo="#A855F7" />

          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              Optional Account Access
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Sign in to access your TempLink account and premium features.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Email Address
              </label>
              <div className="relative">
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
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary-light hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary pr-11 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </ShimmerButton>
            </div>
          </form>

          {/* Seed Demo Account Helper */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-[11px] text-slate-400 hover:text-primary-light transition-colors inline-flex items-center gap-1 font-mono"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Fill Demo Pro Account (alex@example.com)
            </button>
          </div>

          {/* Links Footer */}
          <div className="mt-5 space-y-3 text-center text-xs text-slate-400">
            <div>
              New to TempLink?{' '}
              <Link href="/signup" className="text-primary-light hover:underline font-semibold">
                Create an account
              </Link>
            </div>
            <div>
              <Link
                href="/create"
                className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 text-[11px]"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Continue as Guest (No account required)
              </Link>
            </div>
          </div>
        </div>
      </BlurFade>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#05070B]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
