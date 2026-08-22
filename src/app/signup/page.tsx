'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { label: string; color: string; width: string } => {
    if (!pass) return { label: '', color: 'bg-slate-700', width: '0%' };
    if (pass.length < 8) return { label: 'Too short (8+ chars required)', color: 'bg-rose-500', width: '25%' };

    let score = 0;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-amber-500', width: '50%' };
    if (score === 2 || score === 3) return { label: 'Fair', color: 'bg-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full or display name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await signup(email, password, displayName);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-80px)] min-h-[calc(100dvh-80px)] relative z-10 bg-[#05070B] text-slate-100">
      <BlurFade delay={0.1} className="w-full max-w-md">
        <div className="relative glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#080B12]/90 shadow-2xl overflow-hidden">
          {/* Border Beam Accent */}
          <BorderBeam size={220} duration={10} colorFrom="#6366F1" colorTo="#A855F7" />

          <header className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              Account Creation
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Create your TempLink account
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Unlock advanced features while keeping basic temporary communication account-free.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Display Name Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Account Name / Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. Alex Rivers"
                className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary shadow-inner"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Email Address
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
                className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary shadow-inner"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Password
                </label>
                {strength.label && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Strength: <strong className="text-slate-200">{strength.label}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary pr-11 shadow-inner"
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

              {/* Password strength meter */}
              {password && (
                <div className="w-full bg-[#05070B] h-1 rounded-full overflow-hidden mt-1.5 border border-white/5">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Re-enter your password"
                className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary shadow-inner"
              />
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </ShimmerButton>
            </div>
          </form>

          {/* Links Footer */}
          <div className="mt-6 space-y-3 text-center text-xs text-slate-400">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="text-primary-light hover:underline font-semibold">
                Sign In
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#05070B]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
