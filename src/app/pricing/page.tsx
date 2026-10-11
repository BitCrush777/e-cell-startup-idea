'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { BlurFade } from '@/components/magicui/BlurFade';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '₹0',
      period: 'Available Now',
      badge: 'FREE TRIAL AVAILABLE',
      microcopy: 'No credit card or payment required • Guest access included',
      capacityBadge: 'Up to 3 members per room',
      description: 'Explore TempLink for free while we continue improving the product.',
      status: 'active',
      features: [
        'Temporary private rooms',
        'Up to 3 members per room',
        'One-time 8-character room codes',
        'In-browser QR code generation & scanning',
        'Real-time WebSocket communication',
        'Deterministic countdown timer',
        'Automatic server-authoritative expiration',
        'Anonymous session aliases (no phone required)',
        'In-memory file sharing (up to 10MB)',
        'SafeRoom automated content protection',
      ],
      popular: true,
      ctaText: 'Start for Free',
      ctaHref: '/create',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Planned',
      period: 'future tier',
      badge: 'COMING SOON',
      microcopy: 'Not currently available for purchase • Under evaluation',
      capacityBadge: 'Up to 10 members per room (Planned)',
      description: 'Planned tier for larger project teams and extended discussions.',
      status: 'planned',
      features: [
        'Everything in Free Early Access',
        'Higher participant capacity (up to 10 members)',
        'Extended room durations (up to 24 hours)',
        'Larger in-memory file sharing limit',
        'Custom secret password gating',
        'Saved room history dashboard (Optional account)',
        'Priority updates based on community feedback',
      ],
      popular: false,
      ctaText: 'Planned — Try Free Now',
      ctaHref: '/create',
    },
    {
      id: 'business',
      name: 'Business',
      price: 'Planned',
      period: 'future tier',
      badge: 'CONCEPT',
      microcopy: 'Early-access concept for campus & organizations',
      capacityBadge: 'Custom room capacity (Planned)',
      description: 'Planned concepts for student clubs, hackathons, and organizations.',
      status: 'planned',
      features: [
        'Everything in Pro',
        'Organization-wide temporary workspaces',
        'Dedicated event room provisioning',
        'Developer API for automated room creation',
        'Audit & moderation policy customization',
        'Dedicated onboarding support for student events',
      ],
      popular: false,
      ctaText: 'Explore Business Concept',
      ctaHref: '/business',
    },
  ];

  const comparisonRows = [
    { name: 'Temporary private rooms', free: '✅ Active', pro: 'Planned', business: 'Planned' },
    { name: 'Members per room (Authoritative)', free: '3 members', pro: '10 members (Planned)', business: 'Custom / 25+ (Planned)' },
    { name: 'One-time room codes', free: '✅ Active', pro: 'Planned', business: 'Planned' },
    { name: 'QR-based joining (100% in-browser)', free: '✅ Active', pro: 'Planned', business: 'Planned' },
    { name: 'Real-time WebSocket chat', free: '✅ Active', pro: 'Planned', business: 'Planned' },
    { name: 'Automatic room expiration', free: '✅ Active', pro: 'Planned', business: 'Planned' },
    { name: 'Max room duration', free: 'Up to 60 mins', pro: 'Up to 24h (Planned)', business: 'Custom TTL (Planned)' },
    { name: 'In-memory file sharing', free: '10 MB', pro: '50 MB (Planned)', business: 'Custom limits (Planned)' },
    { name: 'Password protection', free: '✅ Supported', pro: '✅ Planned', business: '✅ Planned' },
    { name: 'SafeRoom automated protection', free: '✅ Active', pro: '✅ Planned', business: '✅ Planned' },
    { name: 'Developer REST API', free: '—', pro: '—', business: 'Coming soon' },
  ];

  const faqs = [
    {
      q: 'Is TempLink really free to use right now?',
      a: 'Yes. TempLink is currently free to try while we continue improving the product. We are validating demand with college project teams, hackathons, and student communities.',
    },
    {
      q: 'Can I purchase a subscription or upgrade today?',
      a: 'No. We have deliberately not integrated a payment gateway or billing system yet. TempLink is operating in free early access so everyone can test the core experience without payment friction.',
    },
    {
      q: 'Do I need to create an account or provide a credit card?',
      a: 'No. Guest access is built directly into TempLink. You can create or join rooms immediately without an account, phone number, or payment details.',
    },
    {
      q: 'What are the current room limits on Free Early Access?',
      a: 'Free rooms allow up to 3 simultaneous participants (including the creator) and session durations up to 60 minutes. Server-side limits are authoritative to maintain high reliability.',
    },
    {
      q: 'What happens when a room expires?',
      a: 'The temporary room state terminates in Cloudflare Durable Object memory. Active participants are disconnected and the room code becomes permanently expired.',
    },
  ];

  return (
    <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-slate-100 bg-[#05070B]">
      {/* 1. Hero Section */}
      <BlurFade delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Free Trial Available — Paid Plans Coming Soon</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Try TempLink for Free
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Explore TempLink for free while we continue improving the product. Paid plans and payment options are coming soon. No payment is required to use the current version.
          </p>

          <div className="p-4 bg-[#080B12] rounded-2xl border border-white/10 max-w-xl mx-auto text-xs text-slate-400 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-primary-light text-[20px] shrink-0">info</span>
            <span>No subscription or payment gateway is required. Enjoy temporary private rooms without entering card details.</span>
          </div>
        </div>
      </BlurFade>

      {/* 2. Primary Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
        {plans.map((plan, idx) => {
          return (
            <BlurFade key={plan.id} delay={0.2 + idx * 0.1} className="h-full">
              <div className="relative pt-3.5 h-full">
                {plan.badge && (
                  <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full z-20 whitespace-nowrap border ${
                      plan.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-[#121824] text-slate-400 border-white/10'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div
                  className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 h-full overflow-hidden ${
                    plan.status === 'active'
                      ? 'border-primary/50 bg-[#080B12]/95 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
                      : 'border-white/10 bg-[#080B12]/80 opacity-90'
                  }`}
                >
                  {plan.status === 'active' && (
                    <BorderBeam size={240} duration={8} colorFrom="#6366F1" colorTo="#38BDF8" />
                  )}

                  <div>
                    {/* Header & Plan Name */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display font-bold text-2xl text-white">{plan.name}</h2>
                        {plan.status === 'active' ? (
                          <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                            Available Now
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold bg-[#121824] text-slate-400 px-2.5 py-0.5 rounded-lg border border-white/10">
                            Planned
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

                    <p className="text-[11px] text-slate-400 mb-6">{plan.microcopy}</p>

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
                    {plan.status === 'active' ? (
                      <Link href={plan.ctaHref} className="block w-full">
                        <ShimmerButton
                          type="button"
                          className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          <span>{plan.ctaText}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </ShimmerButton>
                      </Link>
                    ) : (
                      <Link href={plan.ctaHref} className="block w-full">
                        <button
                          type="button"
                          className="btn-ghost w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-slate-300"
                        >
                          <span>{plan.ctaText}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </BlurFade>
          );
        })}
      </div>

      {/* 3. Core Early Access Commitment */}
      <BlurFade delay={0.4}>
        <div className="mb-24 p-8 sm:p-10 rounded-3xl glass-panel border border-primary/20 bg-gradient-to-r from-primary/10 via-[#080B12] to-primary/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold text-primary-light tracking-wider">
              Paid Plans Are Coming Soon
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Try TempLink for Free with zero cost or commitment.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Explore TempLink for free while we continue improving the product. Paid plans and payment options are coming soon. No payment is required to use the current version.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/create"
              className="btn-primary px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
            >
              <span>Start for Free</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </BlurFade>

      {/* 4. Detailed Feature Comparison Table */}
      <BlurFade delay={0.5}>
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              Capabilities Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear distinction between currently available features and planned future tiers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#080B12]/80 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0D111A]">
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Feature
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-emerald-400 text-center w-36 bg-emerald-500/5 border-x border-emerald-500/20">
                    Free Early Access
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center w-36">
                    Pro (Planned)
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center w-36">
                    Business (Planned)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-200">
                      {row.name}
                    </td>
                    <td className="p-4 sm:p-5 text-center font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                      {row.free}
                    </td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">
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

      {/* 5. FAQ Section */}
      <BlurFade delay={0.6}>
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear answers about TempLink&apos;s free early-access status and policies.
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

      {/* 6. Privacy & Data Minimization Commitment Note */}
      <BlurFade delay={0.7}>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto flex flex-col items-center gap-2 bg-[#080B12]/80">
          <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
          <h4 className="font-bold text-sm text-white">No Data Monetization</h4>
          <p className="text-xs text-slate-400">
            TempLink does not sell user data, serve tracking ads, or build permanent profiles. Active messages reside strictly in temporary volatile memory and expire automatically.
          </p>
        </div>
      </BlurFade>
    </main>
  );
}
