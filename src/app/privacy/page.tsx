import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — TempLink',
  description:
    'TempLink Privacy Policy: Designed around temporary communication, data minimization, and in-memory room lifecycles.',
  alternates: {
    canonical: 'https://templink.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <main className="flex-1 w-full min-h-screen bg-[#05070B] text-slate-100 relative pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 pb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-white/10 text-primary-light text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            Legal &amp; Privacy Disclosures
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            TempLink Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last Updated: {lastUpdated} • Product Domain: https://templink.in
          </p>
        </header>

        {/* Overview Banner */}
        <div className="p-6 rounded-2xl bg-[#080B12] border border-white/10 space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-light text-[18px]">privacy_tip</span>
            Our Privacy Philosophy: Data Minimization
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            TempLink is designed around temporary communication. We believe that short-term conversations should not leave permanent digital footprints. Active room messages are held in volatile Cloudflare Durable Object memory for the duration of the countdown timer and are not stored in a persistent chat database.
          </p>
        </div>

        {/* Section 1: Information We Process */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">1. Information We Process During Room Usage</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            TempLink is guest-first. You do not need to provide a phone number, real name, or social profile to create or join a basic room.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>
              <strong>Temporary Participant Identifiers:</strong> When entering a room, a temporary pseudonym (e.g. <em>SilentNova</em> or <em>SilverWave</em>) and a volatile participant ID (<code>p_...</code>) are assigned for the active session only.
            </li>
            <li>
              <strong>Ephemeral Message Contents:</strong> Messages, typing indicators, and file attachments sent in an active room exist only in volatile server memory (Cloudflare Durable Objects) to route messages in real time between connected participants.
            </li>
            <li>
              <strong>Room Metadata:</strong> Room codes (e.g. <code>K7XM-4P2Q</code>), expiration timestamps, configured member limits, and optional room passphrases.
            </li>
            <li>
              <strong>Optional Registered Accounts:</strong> If you choose to create an optional account (e.g. for saved room settings), we store your email address, display name, and securely hashed passwords.
            </li>
          </ul>
        </section>

        {/* Section 2: Room Expiration & Lifecycle */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">2. Room Lifecycle and Expiration</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every room is governed by a server-authoritative timer:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>
              When the timer reaches 0:00 or the creator ends the session, the room terminates.
            </li>
            <li>
              Connected WebSockets are severed, subsequent join attempts are rejected, and the volatile in-memory room state is discarded.
            </li>
            <li>
              Expired rooms cannot be restored or re-opened.
            </li>
          </ul>
        </section>

        {/* Section 3: Technical Boundaries & Limitations */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">3. Important Technical Scoping &amp; Boundaries</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To prevent misunderstandings, we clearly state what TempLink cannot guarantee:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc pl-5 leading-relaxed">
            <li>
              <strong>No End-to-End Encryption:</strong> Communication is secured with modern transport encryption (TLS / HTTPS / WSS), but TempLink does not use client-side end-to-end cryptography.
            </li>
            <li>
              <strong>Recipient Devices &amp; Screenshots:</strong> Once messages or files appear on another participant&apos;s phone, tablet, or browser, we cannot prevent them from taking screenshots, copying text, or keeping downloaded files.
            </li>
            <li>
              <strong>Infrastructure Telemetry:</strong> Standard edge infrastructure (Cloudflare Workers) may process temporary IP addresses and HTTP request logs for security routing, DDoS defense, and rate limiting.
            </li>
          </ul>
        </section>

        {/* Section 4: File Transfers */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">4. Temporary File Transfers</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Files transferred through a room (up to 10MB during early access) are held in memory during the active session. TempLink does not operate permanent cloud file hosting. Once a participant downloads a file onto their local device, that copy is governed by their personal device storage.
          </p>
        </section>

        {/* Section 5: SafeRoom Moderation */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">5. SafeRoom Automated Moderation</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To prevent severe abuse, slurs, harassment, and violent threats, TempLink runs automated pattern matching in volatile server memory. Messages matching prohibited violation categories are blocked before broadcasting. We do not store plaintext message archives for moderation purposes.
          </p>
        </section>

        {/* Section 6: Cookies and Local Storage */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">6. Cookies and Local Device Storage</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We do not use advertising cookies or third-party trackers. We use local browser storage strictly for essential user preferences (such as audio notifications and theme state) and anonymous client-side funnel completion counts.
          </p>
        </section>

        {/* Section 7: User Rights & Contact */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-lg font-bold text-white">7. Contact and Inquiries</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            If you have questions about TempLink&apos;s data practices, or wish to report a security concern or bug, contact the founder and team through our community channels:
          </p>
          <div className="p-4 bg-[#080B12] rounded-xl border border-white/10 text-xs text-slate-300 space-y-1 font-mono">
            <div>Project: TempLink (https://templink.in)</div>
            <div>Founder &amp; Lead: Sai Darshan.k</div>
            <div>GitHub Repository: <a href="https://github.com/BitCrush777/e-cell-startup-idea" target="_blank" rel="noopener noreferrer" className="text-primary-light hover:underline">BitCrush777/e-cell-startup-idea</a></div>
          </div>
        </section>

        {/* Navigation Back */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link href="/terms" className="hover:text-primary-light">
            Read Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
}
