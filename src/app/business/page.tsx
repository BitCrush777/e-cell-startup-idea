'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastProvider';

export default function BusinessPage() {
  const { toast } = useToast();
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [teamEmail, setTeamEmail] = useState('');
  const [teamNotes, setTeamNotes] = useState('');

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamEmail || !teamEmail.includes('@')) {
      toast('Please enter a valid email address.', 'error');
      return;
    }
    setInterestSubmitted(true);
    toast('Thank you! Your interest has been recorded for early access.', 'success');
  };

  return (
    <div className="flex min-h-screen bg-[#05070B] text-slate-100">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 p-6 sm:p-10 pt-24 md:pt-10 overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D111A] border border-primary/30 text-primary-light text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-[15px]">concept</span>
                Planned Offering • Early-Access Concept
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Business &amp; Campus Suite</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                A planned concept for hackathons, college student clubs, workshops, and teams requiring higher-capacity temporary rooms.
              </p>
            </div>
            <Link
              href="/create"
              className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl self-start sm:self-auto shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center gap-1.5"
            >
              <span>Try Free Rooms</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </header>

          {/* Status Clarification Banner */}
          <div className="p-4 bg-[#080B12] rounded-2xl border border-white/10 text-xs text-slate-400 flex items-start sm:items-center gap-3">
            <span className="material-symbols-outlined text-amber-300 text-[20px] shrink-0 mt-0.5 sm:mt-0">lightbulb</span>
            <div>
              <strong className="text-slate-200">Demonstration &amp; Future Concept:</strong> TempLink does not currently charge customers or enforce paid SLAs. The cards and specifications below demonstrate our roadmap for campus and organizational use.
            </div>
          </div>

          {/* Concept Overview Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Organization Rooms
                </span>
                <span className="text-[9px] font-mono text-primary-light px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Planned</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">Campus Spaces</span>
              <span className="text-[11px] text-slate-400">Planned workspaces for events &amp; clubs</span>
            </div>

            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  API Provisioning
                </span>
                <span className="text-[9px] font-mono text-primary-light px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Coming Soon</span>
              </div>
              <span className="font-display text-2xl font-bold text-primary-light">REST API</span>
              <span className="text-[11px] text-slate-400">Programmatic room creation</span>
            </div>

            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Room Capacity
                </span>
                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Concept</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">25+ Members</span>
              <span className="text-[11px] text-slate-400">Large workshop &amp; hackathon rooms</span>
            </div>

            <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Data Policy
                </span>
                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-[#101621] border border-white/10">Consistent</span>
              </div>
              <span className="font-display text-2xl font-bold text-emerald-400">Data Minimization</span>
              <span className="text-[11px] text-slate-400">Volatile memory • No chat archives</span>
            </div>
          </div>

          {/* Planned API Specification Preview */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#080B12]/80 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-light">code</span>
                Planned Developer REST API Specification
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary-light uppercase">
                Under Specification
              </span>
            </div>
            <p className="text-xs text-slate-400">
              For hackathon platforms and event organizers needing automated temporary room generation. This endpoint is planned and will be provided through our production domain (templink.in).
            </p>

            <div className="bg-[#05070B] rounded-2xl p-4 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre className="text-primary-light/90 leading-relaxed">
{`// Planned TempLink API specification (Draft)
curl -X POST https://templink.in/api/rooms \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "durationMinutes": 60,
    "maxParticipants": 25,
    "requirePassword": false
  }'`}
              </pre>
            </div>
          </div>

          {/* Early Interest / Feedback Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#080B12]/90 space-y-4 max-w-2xl">
            <h3 className="font-display font-bold text-lg text-white">
              Interested in campus or hackathon collaboration?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you run student workshops, hackathons, or campus events and would like custom capacity rooms or automated integrations, reach out to share your use case.
            </p>

            {interestSubmitted ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Thank you! We will review your note as we prioritize our upcoming features.</span>
              </div>
            ) : (
              <form onSubmit={handleInterestSubmit} className="space-y-3">
                <div>
                  <label htmlFor="teamEmail" className="block text-xs font-semibold text-slate-400 mb-1">
                    Your Contact Email
                  </label>
                  <input
                    id="teamEmail"
                    type="email"
                    required
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    placeholder="organizer@university.edu"
                    className="w-full bg-[#05070B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="teamNotes" className="block text-xs font-semibold text-slate-400 mb-1">
                    Event or Campus Need (Optional)
                  </label>
                  <textarea
                    id="teamNotes"
                    rows={3}
                    value={teamNotes}
                    onChange={(e) => setTeamNotes(e.target.value)}
                    placeholder="We're organizing a 48-hour student hackathon and need temporary discussion channels..."
                    className="w-full bg-[#05070B] border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md"
                >
                  Submit Early-Access Interest
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
