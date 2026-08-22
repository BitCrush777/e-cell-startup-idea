'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export default function PricingPage() {
  const router = useRouter();
  const { user, updatePlan } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = (user?.plan || 'FREE').toUpperCase();

  const plans = [
    {
      id: 'free',
      name: 'Free (Guest)',
      price: '₹0',
      period: 'forever',
      description: 'Ideal for immediate 1-on-1 private conversations with zero sign-up required.',
      features: [
        'Unlimited 1-on-1 private rooms',
        'Lifespans up to 1 hour',
        'Standard ephemeral file sharing (5MB)',
        'Dynamic QR generation & camera scan',
        'Instant pseudonym identities',
        'Deterministic volatile memory wipe',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Privacy',
      price: billingCycle === 'monthly' ? '₹99' : '₹949',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For privacy-conscious professionals requiring extended lifespans and custom keys.',
      features: [
        'Everything in Free, plus:',
        'Custom room lifespans up to 24 hours',
        'Secret password protection on all rooms',
        'Encrypted file transfer up to 50MB',
        'Multi-device session pairing',
        'Priority low-latency relay network',
      ],
      popular: true,
    },
    {
      id: 'business',
      name: 'Enterprise / Teams',
      price: billingCycle === 'monthly' ? '₹999' : '₹9,599',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For security teams, legal, medical, and journalism organizations.',
      features: [
        'Everything in Pro, plus:',
        'Dedicated isolated memory clusters',
        'Custom organizational domain routing',
        'Room capacity up to 10 participants',
        'Developer API & Webhook access',
        'Custom cryptographic TTL policies',
        '24/7 dedicated security engineer SLA',
      ],
      popular: false,
    },
  ];

  const handleAction = async (planId: string) => {
    if (planId === 'free') {
      router.push('/create');
      return;
    }

    if (planId === 'business') {
      router.push('/business');
      return;
    }

    if (!user) {
      router.push('/signup?redirect=/pricing');
      return;
    }

    if (currentPlan === 'PRO') {
      toast('You are already subscribed to the Pro plan.', 'info');
      return;
    }

    setLoadingPlan(planId);
    try {
      await updatePlan('PRO');
    } catch (err: any) {
      toast(err.message || 'Failed to update plan', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (planId === 'free') {
      return currentPlan === 'FREE' && user ? 'Current Plan' : 'Start Free Room';
    }

    if (planId === 'pro') {
      if (currentPlan === 'PRO') return 'Current Active Plan';
      if (!user) return 'Create Account to Upgrade';
      return 'Upgrade to Pro';
    }

    if (planId === 'business') {
      if (currentPlan === 'BUSINESS') return 'Current Active Plan';
      return 'Explore Enterprise';
    }

    return 'Select Plan';
  };

  return (
    <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-slate-100 bg-[#05070B]">
      <BlurFade delay={0.1}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-4">
            <span className="material-symbols-outlined text-[15px]">payments</span>
            Transparent Privacy Pricing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Predictable plans for pure privacy.
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Start for free without an account, or upgrade for enterprise isolation and extended durations.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex p-1 bg-[#0D111A] border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.id.toUpperCase();

          return (
            <BlurFade key={plan.id} delay={0.2 + idx * 0.1}>
              <div
                className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 h-full overflow-hidden ${
                  plan.popular
                    ? 'border-primary/50 bg-[#080B12]/95 shadow-[0_0_40px_rgba(99,102,241,0.2)] md:-translate-y-2'
                    : 'border-white/10 bg-[#080B12]/80'
                }`}
              >
                {plan.popular && (
                  <>
                    <BorderBeam size={220} duration={8} colorFrom="#6366F1" colorTo="#A855F7" />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/20 z-10">
                      Most Popular
                    </div>
                  </>
                )}

                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-xl text-white">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="my-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                  </div>

                  <hr className="border-white/10 mb-6" />

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="material-symbols-outlined text-[16px] text-primary-light shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.popular ? (
                  <ShimmerButton
                    type="button"
                    disabled={isCurrent || loadingPlan === plan.id}
                    onClick={() => handleAction(plan.id)}
                    className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {loadingPlan === plan.id ? 'Updating...' : getButtonText(plan.id)}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </ShimmerButton>
                ) : (
                  <button
                    type="button"
                    disabled={isCurrent || loadingPlan === plan.id}
                    onClick={() => handleAction(plan.id)}
                    className="btn-ghost w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingPlan === plan.id ? 'Updating...' : getButtonText(plan.id)}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </BlurFade>
          );
        })}
      </div>

      {/* Security Guarantee Note */}
      <BlurFade delay={0.5}>
        <div className="mt-16 glass-panel p-6 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto flex flex-col items-center gap-2 bg-[#080B12]/80">
          <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
          <h4 className="font-bold text-sm text-white">Zero Data Monetization Guarantee</h4>
          <p className="text-xs text-slate-400">
            TempLink is funded exclusively through direct software subscriptions. We never sell telemetry, serve ads, or retain contact logs.
          </p>
        </div>
      </BlurFade>
    </main>
  );
}
