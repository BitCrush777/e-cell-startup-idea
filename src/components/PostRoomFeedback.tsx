'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FeedbackRating, WouldUseAgainOption, StandardUseCase } from '@/types/feedback';
import { RoomPlan } from '@/types';

interface PostRoomFeedbackProps {
  roomCode: string;
  plan?: RoomPlan;
  memberCount?: number;
  onClose?: () => void;
}

const RATING_LABELS: Record<FeedbackRating, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
};

const WOULD_USE_AGAIN_OPTIONS: { value: WouldUseAgainOption; label: string }[] = [
  { value: 'DEFINITELY', label: 'Definitely' },
  { value: 'PROBABLY', label: 'Probably' },
  { value: 'UNSURE', label: 'Not sure' },
  { value: 'PROBABLY_NOT', label: 'Probably not' },
  { value: 'NO', label: 'No' },
];

const STANDARD_USE_CASES: StandardUseCase[] = [
  'Student collaboration',
  'Freelance / client communication',
  'Event / hackathon',
  'Online buyer / seller communication',
  'Short-term team communication',
  'Testing the product',
  'Other',
];

export function PostRoomFeedback({
  roomCode,
  plan = 'FREE',
  memberCount = 1,
  onClose,
}: PostRoomFeedbackProps) {
  const router = useRouter();

  const [rating, setRating] = useState<FeedbackRating | 0>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [wouldUseAgain, setWouldUseAgain] = useState<WouldUseAgainOption | null>(null);
  const [improvementText, setImprovementText] = useState<string>('');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [customUseCaseText, setCustomUseCaseText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const storageKey = `templink_feedback_submitted_${roomCode}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadySubmitted = sessionStorage.getItem(storageKey);
      if (alreadySubmitted) {
        setIsSubmitted(true);
      }
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [storageKey]);

  const handleReturnHome = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !wouldUseAgain || isSubmitting) return;

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      setErrorMessage("You're offline. Please reconnect to send your feedback.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Retrieve or generate idempotency token
    const tokenKey = `templink_feedback_token_${roomCode}`;
    let idempotencyToken = '';
    if (typeof window !== 'undefined') {
      idempotencyToken = sessionStorage.getItem(tokenKey) || '';
      if (!idempotencyToken) {
        idempotencyToken = 'tok_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        sessionStorage.setItem(tokenKey, idempotencyToken);
      }
    }

    const finalUseCase =
      selectedUseCase === 'Other'
        ? customUseCaseText.trim() || 'Other'
        : selectedUseCase || undefined;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          wouldUseAgain,
          improvementText: improvementText.trim() || undefined,
          useCase: finalUseCase,
          plan,
          memberCount,
          idempotencyToken,
          appVersion: '1.0.0',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, 'true');
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "We couldn't submit your feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full flex flex-col items-center text-center gap-5 animate-fade-in border border-white/10 bg-[#080B12]/90 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.2)]">
          <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-white">Thank you!</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Your feedback helps us make TempLink better.
          </p>
        </div>

        <button
          onClick={handleReturnHome}
          className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full flex flex-col gap-6 animate-fade-in border border-white/10 bg-[#080B12]/95 shadow-2xl">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101621] border border-white/10 text-primary-light text-[11px] font-semibold mb-1">
          <span className="material-symbols-outlined text-[14px]">reviews</span>
          Anonymous Feedback
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
          How was your TempLink experience?
        </h2>
        <p className="text-xs text-slate-400">
          Your feedback helps us improve temporary communication. Takes ~20s.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Question 1: 1-5 Star Rating */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-xs font-semibold text-slate-200">
            How would you rate your experience? <span className="text-rose-400">*</span>
          </label>
          <div
            className="flex items-center gap-2 sm:gap-3 py-1"
            role="radiogroup"
            aria-label="Rating out of 5 stars"
          >
            {([1, 2, 3, 4, 5] as FeedbackRating[]).map((starVal) => {
              const isFilled = (hoverRating || rating) >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(starVal)}
                  onBlur={() => setHoverRating(0)}
                  className="p-1 sm:p-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 hover:scale-110 active:scale-95"
                  role="radio"
                  aria-checked={rating === starVal}
                  aria-label={`${starVal} star: ${RATING_LABELS[starVal]}`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl sm:text-4xl transition-colors ${
                      isFilled ? 'text-amber-400 fill-1 font-variation-filled' : 'text-slate-600'
                    }`}
                    style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>
          {rating > 0 ? (
            <span className="text-[11px] font-medium text-amber-400 animate-fade-in">
              {RATING_LABELS[rating as FeedbackRating]}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Tap a star to rate</span>
          )}
        </div>

        {/* Question 2: Would Use Again */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-200">
            Would you use TempLink again? <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {WOULD_USE_AGAIN_OPTIONS.map((opt) => {
              const isSelected = wouldUseAgain === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWouldUseAgain(opt.value)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                      : 'bg-[#0D111A] text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 3: What could we improve? (Optional) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="improvement-feedback" className="text-xs font-semibold text-slate-200">
              What could we improve? <span className="text-[11px] text-slate-500 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {improvementText.length}/500
            </span>
          </div>
          <textarea
            id="improvement-feedback"
            rows={3}
            maxLength={500}
            value={improvementText}
            onChange={(e) => setImprovementText(e.target.value)}
            placeholder="Tell us what worked well or what could be better..."
            className="w-full bg-[#05070B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
          />
        </div>

        {/* Question 4: Use Case (Optional) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="use-case-select" className="text-xs font-semibold text-slate-200">
            What did you use TempLink for? <span className="text-[11px] text-slate-500 font-normal">(Optional)</span>
          </label>
          <select
            id="use-case-select"
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
            className="w-full bg-[#05070B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
          >
            <option value="">Select a use case...</option>
            {STANDARD_USE_CASES.map((uc) => (
              <option key={uc} value={uc} className="bg-[#080B12] text-white">
                {uc}
              </option>
            ))}
          </select>

          {selectedUseCase === 'Other' && (
            <input
              type="text"
              maxLength={100}
              value={customUseCaseText}
              onChange={(e) => setCustomUseCaseText(e.target.value)}
              placeholder="Specify other use case..."
              className="w-full bg-[#05070B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all mt-1"
            />
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={!rating || !wouldUseAgain || isSubmitting}
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Feedback</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReturnHome}
            className="text-xs text-slate-400 hover:text-white py-1.5 text-center transition-colors font-medium"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
