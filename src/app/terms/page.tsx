import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — TempLink',
  description:
    'TempLink Terms of Service: Acceptable use guidelines, temporary room lifecycle terms, and service disclaimers.',
  alternates: {
    canonical: 'https://templink.in/terms',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 2026';

  return (
    <main className="flex-1 w-full min-h-screen bg-[#05070B] text-slate-100 relative pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 pb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">description</span>
            Terms of Service
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            TempLink Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last Updated: {lastUpdated} • Product Domain: https://templink.in
          </p>
        </header>

        {/* 1. Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            By accessing or using TempLink (&quot;the Service&quot;), available at https://templink.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Description of the Service</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            TempLink is a temporary communication platform that enables users to create time-limited private rooms, join via 8-character codes or QR codes, communicate in real time, and allow sessions to expire automatically. The platform operates on a guest-first, free early-access basis.
          </p>
        </section>

        {/* 3. Acceptable Use Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Acceptable Use Policy</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You agree to use TempLink solely for lawful purposes. You must not use the Service to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>Transmit, store, or share unlawful, abusive, harassing, threatening, defamatory, or hateful content.</li>
            <li>Distribute malware, phishing links, viruses, or any software intended to harm systems or participants.</li>
            <li>Attempt to bypass rate limits, probe infrastructure vulnerabilities, or reverse-engineer temporary session tokens.</li>
            <li>Impersonate another person, institution, or entity.</li>
            <li>Distribute non-consensual imagery, child sexual abuse material (CSAM), or content depicting sexual violence.</li>
          </ul>
        </section>

        {/* 4. SafeRoom Moderation & Room Termination */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. SafeRoom Automated Moderation</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            TempLink implements automated in-memory pattern checks (&quot;SafeRoom&quot;) to detect severe violations. If a participant posts prohibited material:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>The violating message is blocked before delivery.</li>
            <li>The participant receives an in-session warning.</li>
            <li>Repeated violations (3 violations) immediately terminate the entire room for all participants to protect the platform and members.</li>
          </ul>
        </section>

        {/* 5. Ephemeral State and Responsibility */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Ephemeral Sessions and Expiration</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            TempLink rooms are temporary by design. When a room countdown reaches 0:00 or a creator ends the session:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>The room terminates in volatile memory and cannot be recovered.</li>
            <li>You are solely responsible for saving or archiving any notes or files on your personal device prior to room expiration.</li>
            <li>TempLink cannot restore or retrieve expired conversations.</li>
          </ul>
        </section>

        {/* 6. Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Disclaimer of Warranties</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis during early access without warranties of any kind, whether express or implied. TempLink does not warrant that the Service will be uninterrupted, error-free, or entirely free of security vulnerabilities.
          </p>
        </section>

        {/* 7. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">7. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To the maximum extent permitted by applicable law, TempLink, its founders, and contributors shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service, including the loss of data due to room expiration.
          </p>
        </section>

        {/* 8. Contact */}
        <section className="space-y-3 border-t border-white/10 pt-8">
          <h2 className="text-lg font-bold text-white">8. Inquiries and Reports</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To report abuse, technical vulnerabilities, or general questions, contact the team at:
          </p>
          <div className="p-4 bg-[#080B12] rounded-xl border border-white/10 text-xs text-slate-300 font-mono space-y-1">
            <div>Project: TempLink (https://templink.in)</div>
            <div>Founder: Sai Darshan.k</div>
            <div>GitHub: <a href="https://github.com/BitCrush777/e-cell-startup-idea" target="_blank" rel="noopener noreferrer" className="text-primary-light hover:underline">BitCrush777/e-cell-startup-idea</a></div>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link href="/privacy" className="hover:text-primary-light">
            Read Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
