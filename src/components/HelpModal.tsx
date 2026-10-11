'use client';

import React, { useState } from 'react';
import { useToast } from './ToastProvider';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'guide' | 'feedback';

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [issueCategory, setIssueCategory] = useState<string>('General product feedback');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      toast('Please describe the issue or feedback.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          wouldUseAgain: 'DEFINITELY',
          improvementText: `[${issueCategory}] ${issueDescription.trim()}`.substring(0, 500),
          useCase: issueCategory.substring(0, 100),
          idempotencyToken: 'help_' + Date.now().toString(36),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record feedback');
      }

      setSubmitted(true);
      toast('Thank you! Your feedback has been received.', 'success');
    } catch {
      toast('Could not submit feedback at this moment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab('guide');
    setSubmitted(false);
    setIssueDescription('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#080B12] shadow-2xl relative flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'guide'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'feedback'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Report an Issue
            </button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:ring-2 focus:ring-primary"
            aria-label="Close Help Dialog"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {activeTab === 'guide' ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Create a room</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Click Create Room and choose your session duration (default: 30 mins).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Share QR or room code</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Show the QR code on screen or send the 8-character code (e.g. K7XM-4P2Q).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Join instantly</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The other person scans the QR or types the code. No account required for basic rooms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
                <span className="font-mono text-xs font-bold text-primary-light bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Chat in real time</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Send text messages and files. SafeRoom active protection helps keep conversations safe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#0D111A] rounded-2xl border border-white/5">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#161E2E] w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Room expires</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When the timer hits 0:00, the session ends automatically and cannot be rejoined.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-1 focus:ring-2 focus:ring-primary"
            >
              Got It
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {submitted ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                <h4 className="text-xs font-bold text-white">Thank You for Your Feedback!</h4>
                <p className="text-[11px] text-slate-400">
                  Your note helps us improve TempLink for everyone in the community.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div>
                  <label htmlFor="issueCategory" className="block text-xs font-semibold text-slate-400 mb-1">
                    What are you reporting?
                  </label>
                  <select
                    id="issueCategory"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-[#05070B] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary"
                  >
                    <option value="Failed room creation">Failed room creation</option>
                    <option value="QR scanning issues">QR scanning issues</option>
                    <option value="Join failures">Join failures / Room not found</option>
                    <option value="Connection problems">WebSocket / Connection drops</option>
                    <option value="General product feedback">General product feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="issueDescription" className="block text-xs font-semibold text-slate-400 mb-1">
                    Details
                  </label>
                  <textarea
                    id="issueDescription"
                    rows={4}
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Tell us what happened so we can investigate and fix it..."
                    className="w-full bg-[#05070B] border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
