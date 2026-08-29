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
      name: 'Free',
      price: '₹0',
      period: 'forever',
      badge: null,
      microcopy: 'No credit card required • Guest access included',
      capacityBadge: 'Up to 3 members per room',
      description: 'For personal and occasional conversations.',
      features: [
        'Temporary private rooms',
        'Up to 3 members per room',
        'One-time room codes',
        'QR-based joining',
        'Real-time messaging',
        'Room countdown',
        'Automatic room expiration',
        'Basic temporary identity',
        'PWA access',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '₹99' : '₹999',
      period: billingCycle === 'monthly' ? '/ month' : '/ year',
      badge: 'MOST POPULAR',
      microcopy: 'Cancel anytime • Billed annually or monthly',
      capacityBadge: 'Up to 10 members per room',
      description: 'For users who need larger rooms and advanced controls.',
      features: [
        'Everything in Free',
        'Up to 10 members per room',
        'Longer room durations (up to 24h)',
        'Larger file-sharing limits (up to 50MB)',
        'Custom room settings & secret password',
        'Advanced privacy controls',
        'More flexible room configuration',
        'Pro usage dashboard',
        'Priority product features as available',
      ],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: 'Custom',
      period: 'for teams & enterprise',
      badge: null,
      microcopy: 'Custom plans available for organizations',
      capacityBadge: 'Custom room capacity',
      description: 'For teams, organizations, and higher-volume communication.',
      features: [
        'Everything in Pro',
        'Higher/custom member limits',
        'Organization workspace',
        'Team management',
        'Admin controls',
        'Usage analytics (Coming soon)',
        'Custom branding (Coming soon)',
        'API access (Coming soon)',
        'Business billing & SLA support',
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
      toast('Create an account to continue with Pro', 'info');
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
      toast('Welcome to TempLink Pro! Your 10-member capacity is active.', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update plan', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (planId === 'free') {
      return currentPlan === 'FREE' && user ? 'Current Plan' : 'Start for Free';
    }

    if (planId === 'pro') {
      if (currentPlan === 'PRO') return 'Current Active Plan';
      if (!user) return 'Upgrade to Pro';
      return 'Upgrade to Pro';
    }

    if (planId === 'business') {
      if (currentPlan === 'BUSINESS') return 'Current Active Plan';
      return 'Contact Us';
    }

    return 'Select Plan';
  };

  const comparisonRows = [
    { name: 'Temporary private rooms', free: '✅', pro: '✅', business: '✅' },
    { name: 'Members per room', free: '3 members', pro: '10 members', business: 'Custom / 25+' },
    { name: 'One-time room codes', free: '✅', pro: '✅', business: '✅' },
    { name: 'QR-based camera joining', free: '✅', pro: '✅', business: '✅' },
    { name: 'Real-time WebSocket chat', free: '✅', pro: '✅', business: '✅' },
    { name: 'Automatic room expiration', free: '✅', pro: '✅', business: '✅' },
    { name: 'Room durations', free: 'Up to 1 hour', pro: 'Up to 24 hours', business: 'Custom TTL' },
    { name: 'Volatile file sharing', free: '5 MB', pro: '50 MB', business: 'Custom limits' },
    { name: 'Secret password protection', free: '—', pro: '✅', business: '✅' },
    { name: 'Advanced privacy controls', free: '—', pro: '✅', business: '✅' },
    { name: 'Pro usage dashboard', free: '—', pro: '✅', business: '✅' },
    { name: 'Team management', free: '—', pro: '—', business: '✅' },
    { name: 'Usage analytics', free: '—', pro: '—', business: 'Coming soon' },
    { name: 'Custom branding', free: '—', pro: '—', business: 'Coming soon' },
    { name: 'Developer API access', free: '—', pro: '—', business: 'Coming soon' },
  ];

  const faqs = [
    {
      q: 'Do I need an account to use TempLink?',
      a: 'No. You can create and join temporary private rooms without creating an account. Guest access is included by default on the Free plan.',
    },
    {
      q: 'How many people can join a Free room?',
      a: 'Up to 3 members, including the room creator. Once the 3rd person connects, additional join requests are gracefully rejected with a Room Full prompt.',
    },
    {
      q: 'How many people can join a Pro room?',
      a: 'Up to 10 members, including the room creator. Pro rooms give freelancers, teams, and creators room to collaborate privately.',
    },
    {
      q: 'What happens when a room expires?',
      a: 'The temporary session ends and the room is immediately destroyed. In-memory data vanishes and the room code becomes permanently invalid.',
    },
    {
      q: 'Can I upgrade later?',
      a: 'Yes. You can start with a Free room at any time and upgrade to Pro whenever you require 10-member room limits or 24-hour durations.',
    },
  ];

  return (
    <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-slate-100 bg-[#05070B]">
      {/* 1. Hero Section */}
      <BlurFade delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">payments</span>
            Transparent Privacy Pricing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Simple plans. More ways to connect.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-4">
            Start free with temporary private rooms, or upgrade when you need larger rooms and advanced controls.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="material-symbols-outlined text-[15px]">check</span>
              No account required to start
            </span>
            <span>•</span>
            <span>Create a room in seconds</span>
            <span>•</span>
            <span>Pay only when you need more</span>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex p-1.5 bg-[#0D111A] border border-white/10 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Save ~16%
              </span>
            </button>
          </div>
        </div>
      </BlurFade>

      {/* 2. Primary Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.id.toUpperCase();

          return (
            <BlurFade key={plan.id} delay={0.2 + idx * 0.1} className="h-full">
              <div className="relative pt-3.5 h-full">
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20 z-20 whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div
                  className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 h-full overflow-hidden ${
                    plan.popular
                      ? 'border-primary/50 bg-[#080B12]/95 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
                      : 'border-white/10 bg-[#080B12]/80 hover:border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <BorderBeam size={240} duration={8} colorFrom="#6366F1" colorTo="#A855F7" />
                  )}

                <div>
                  {/* Header & Plan Name */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-bold text-2xl text-white">{plan.name}</h2>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  {/* Prominent Member Limit Pill */}
                  <div className="mb-6 p-3 rounded-2xl bg-[#0D111A] border border-white/10 flex items-center gap-2.5 shadow-inner">
                    <span className="material-symbols-outlined text-primary-light text-[20px]">
                      group
                    </span>
                    <span className="text-xs font-bold text-white">
                      {plan.capacityBadge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="my-4 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-6">{plan.microcopy}</p>

                  <hr className="border-white/10 mb-6" />

                  {/* Features List */}
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

                {/* Primary CTA */}
                <div>
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
                      className="btn-ghost w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-white/10 hover:border-white/30"
                    >
                      {loadingPlan === plan.id ? 'Updating...' : getButtonText(plan.id)}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </BlurFade>
        );
        })}
      </div>

      {/* 3. Core Value Message Section */}
      <BlurFade delay={0.4}>
        <div className="mb-24 p-8 sm:p-10 rounded-3xl glass-panel border border-primary/20 bg-gradient-to-r from-primary/10 via-[#080B12] to-primary/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold text-primary-light tracking-wider">
              Freemium Privacy Tech
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Only pay when you need more.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              TempLink keeps temporary communication accessible for everyone. The free plan provides the core experience, while Pro and Business unlock greater room capacity and advanced capabilities.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/create"
              className="btn-primary px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
            >
              <span>Start Free (3 Members)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </BlurFade>

      {/* 4. Plan Limit Explanations */}
      <BlurFade delay={0.5}>
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              Which plan is right for you?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear breakdown of use cases tailored to different collaboration needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#080B12] border border-white/10 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#161E2E] flex items-center justify-center text-primary-light">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <h3 className="font-bold text-base text-white">Free</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For students, individuals, quick collaborations, and short conversations that require immediate private communication without sign-up.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080B12] border border-primary/30 flex flex-col gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
              </div>
              <h3 className="font-bold text-base text-white">Pro</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For freelancers, creators, small teams, and users who need up to 10 participants, 24h lifespans, and password-protected rooms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080B12] border border-white/10 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#161E2E] flex items-center justify-center text-primary-light">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              <h3 className="font-bold text-base text-white">Business</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For organizations that need larger rooms, team controls, analytics, custom branding, and custom capacity capabilities.
              </p>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* 5. Detailed Feature Comparison Table */}
      <BlurFade delay={0.6}>
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              Plan Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A comprehensive feature breakdown across all subscription tiers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#080B12]/80 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0D111A]">
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Feature
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-white text-center w-28 sm:w-36">
                    Free
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-primary-light text-center w-28 sm:w-36 bg-primary/5 border-x border-primary/20">
                    Pro
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-white text-center w-28 sm:w-36">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-200">
                      {row.name}
                    </td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      {row.free}
                    </td>
                    <td className="p-4 sm:p-5 text-center font-bold text-white bg-primary/5 border-x border-primary/20">
                      {row.pro}
                    </td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      {row.business}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </BlurFade>

      {/* 6. FAQ Section */}
      <BlurFade delay={0.7}>
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to know about TempLink plans and limits.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#080B12] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2"
              >
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary-light">
                    help
                  </span>
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* 7. Privacy & Monetization Commitment Note */}
      <BlurFade delay={0.8}>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto flex flex-col items-center gap-2 bg-[#080B12]/80">
          <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
          <h4 className="font-bold text-sm text-white">No Data Monetization</h4>
          <p className="text-xs text-slate-400">
            TempLink is funded through direct software subscriptions. We do not sell user data, serve advertisements, or monetize conversation telemetry.
          </p>
        </div>
      </BlurFade>
    </main>
  );
}
