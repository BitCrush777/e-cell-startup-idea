'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { generateTemporaryIdentity } from '@/lib/identity';
import { UserPlan } from '@/types';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';

export default function SettingsPage() {
  const { user, logout, updatePlan } = useAuth();
  const { toast } = useToast();

  const [defaultIdentity, setDefaultIdentity] = useState<string>('SilverWave');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoPurgeBrowserStorage, setAutoPurgeBrowserStorage] = useState<boolean>(true);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Preferences updated successfully.', 'success');
  };

  const handlePlanChange = async (newPlan: UserPlan) => {
    if (!user) return;
    setIsUpdatingPlan(true);
    try {
      await updatePlan(newPlan);
    } catch (err: any) {
      toast(err.message || 'Failed to update plan', 'error');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handlePurgeAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      toast('All local session artifacts and tokens destroyed.', 'info');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05070B] text-slate-100">
      <Sidebar userIdentity={user?.displayName || defaultIdentity} />

      <main className="flex-1 ml-0 md:ml-64 p-6 sm:p-10 pt-24 md:pt-10 overflow-y-auto w-full relative">
        <div className="max-w-3xl mx-auto relative z-10 space-y-8">
          <BlurFade delay={0.1}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-[15px]">tune</span>
                Account & Preferences
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Settings</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage your profile, subscription tier, and client privacy controls.
              </p>
            </div>
          </BlurFade>

          {/* Account Profile Card */}
          <BlurFade delay={0.2}>
            <div className="relative glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/85 shadow-2xl space-y-6 overflow-hidden">
              {user ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-white">{user.displayName}</h3>
                          <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary-light px-2 py-0.5 rounded-md border border-primary/30">
                            {user.plan}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => logout()}
                      className="btn-ghost text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Sign Out
                    </button>
                  </div>

                  <hr className="border-white/10" />

                  {/* Plan Switcher */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Subscription Plan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['FREE', 'PRO', 'BUSINESS'] as UserPlan[]).map((plan) => {
                        const isCurrent = (user.plan || 'FREE').toUpperCase() === plan;
                        return (
                          <div
                            key={plan}
                            onClick={() => !isCurrent && !isUpdatingPlan && handlePlanChange(plan)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-primary/15 border-primary shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                                : 'bg-[#0D111A] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold font-mono text-white">{plan}</span>
                              {isCurrent && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {plan === 'FREE'
                                ? 'Basic 1-on-1 rooms'
                                : plan === 'PRO'
                                ? '24h TTL & passwords'
                                : 'Enterprise clusters'}
                            </span>
                            <span className="text-[10px] text-primary-light font-semibold mt-3">
                              {isCurrent ? 'Active Plan' : 'Switch to ' + plan}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0D111A] rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#161E2E] flex items-center justify-center text-primary-light">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">Guest Session Mode</h4>
                      <p className="text-[11px] text-slate-400">
                        Create an optional account to unlock Pro 24h rooms and subscriptions.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                      href="/login"
                      className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold text-center flex-1 sm:flex-initial"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center flex-1 sm:flex-initial"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </BlurFade>

          {/* Privacy & Client Controls Form */}
          <BlurFade delay={0.3}>
            <form
              onSubmit={handleSave}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#080B12]/80 space-y-6 shadow-2xl"
            >
              <h3 className="font-display font-bold text-lg text-white">Client Privacy Controls</h3>

              {/* Pseudonym Customization */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Default Guest Pseudonym
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={defaultIdentity}
                    onChange={(e) => setDefaultIdentity(e.target.value)}
                    className="flex-1 bg-[#05070B] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setDefaultIdentity(generateTemporaryIdentity())}
                    className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Notification Sound Toggle */}
              <div
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Message Chimes</h4>
                  <p className="text-[11px] text-slate-400">Play subtle chime on incoming message.</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    soundEnabled ? 'bg-[#6366F1]' : 'bg-[#161E2E]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Auto Purge Storage */}
              <div
                onClick={() => setAutoPurgeBrowserStorage(!autoPurgeBrowserStorage)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Purge Storage on Window Close</h4>
                  <p className="text-[11px] text-slate-400">Destroy participant tokens when tab closes.</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    autoPurgeBrowserStorage ? 'bg-[#6366F1]' : 'bg-[#161E2E]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoPurgeBrowserStorage ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={handlePurgeAll}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  Purge All Local Data Now
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider w-full sm:w-auto"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}
