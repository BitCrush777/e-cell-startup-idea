'use client';

import React, { useState, useEffect } from 'react';
import { FeedbackAnalyticsMetrics, FeedbackItem } from '@/types/feedback';
import Link from 'next/link';

export default function AdminFeedbackDashboard() {
  const [adminKey, setAdminKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<FeedbackAnalyticsMetrics | null>(null);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check persisted session auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('templink_admin_key');
      if (stored) {
        setAdminKey(stored);
        fetchDashboardData(stored, 1, ratingFilter, searchQuery);
      }
    }
  }, []);

  async function fetchDashboardData(
    key: string,
    targetPage = 1,
    rating = ratingFilter,
    search = searchQuery
  ) {
    setIsLoading(true);
    setAuthError(null);
    try {
      const url = new URL('/api/admin/feedback', window.location.origin);
      url.searchParams.set('page', targetPage.toString());
      url.searchParams.set('limit', '10');
      if (rating !== 'all') {
        url.searchParams.set('rating', rating);
      }
      if (search.trim()) {
        url.searchParams.set('search', search.trim());
      }

      const res = await fetch(url.toString(), {
        headers: {
          'x-admin-key': key,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unauthorized');
      }

      setAnalytics(data.analytics);
      setItems(data.items || []);
      setPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('templink_admin_key', key);
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthError(err.message || 'Authentication failed. Please check your admin key.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    fetchDashboardData(adminKey.trim(), 1, ratingFilter, searchQuery);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('templink_admin_key');
    }
    setIsAuthenticated(false);
    setAdminKey('');
    setAnalytics(null);
    setItems([]);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#05070B] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full border border-white/10 bg-[#080B12]/95 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#101621] border border-white/15 flex items-center justify-center mx-auto text-primary-light">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Validation Access</h1>
            <p className="text-xs text-slate-400">
              Enter your authorization key to access genuine product traction and feedback metrics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Authorization Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin secret..."
                className="w-full bg-[#05070B] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !adminKey.trim()}
              className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Return to TempLink
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hasData = analytics && analytics.totalResponses > 0;

  return (
    <main className="min-h-screen bg-[#05070B] text-slate-100 p-4 sm:p-8 md:p-12 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
              Real Traction Only
            </span>
            <span className="text-xs text-slate-500">• No Synthetic Data</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Product Validation & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real user feedback metrics for E-Cell presentations and product iteration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(adminKey, page, ratingFilter, searchQuery)}
            className="p-2.5 border border-white/10 rounded-xl bg-[#080B12] hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh Metrics"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 border border-rose-500/20 text-rose-400 rounded-xl bg-[#080B12] hover:bg-rose-500/10 text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Average Rating */}
        <div className="glass-panel p-5 rounded-2xl bg-[#080B12]/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg Experience
          </span>
          <div className="my-2">
            <span className="font-display text-3xl font-extrabold text-white">
              {hasData ? `${analytics.averageRating}` : '—'}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ 5.0</span>
          </div>
          <div className="flex items-center text-amber-400 text-sm">
            {'★'.repeat(hasData ? Math.round(analytics.averageRating) : 0)}
            <span className="text-slate-600">
              {'★'.repeat(5 - (hasData ? Math.round(analytics.averageRating) : 0))}
            </span>
          </div>
        </div>

        {/* Would Use Again */}
        <div className="glass-panel p-5 rounded-2xl bg-[#080B12]/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Would Use Again
          </span>
          <div className="my-2">
            <span className="font-display text-3xl font-extrabold text-emerald-400">
              {hasData ? `${analytics.wouldUseAgainPositivePercent}%` : '—'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Positive Intent (Def + Prob)</span>
        </div>

        {/* Total Feedback Responses */}
        <div className="glass-panel p-5 rounded-2xl bg-[#080B12]/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Responses
          </span>
          <div className="my-2">
            <span className="font-display text-3xl font-extrabold text-white">
              {analytics?.totalResponses || 0}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Submitted surveys</span>
        </div>

        {/* Estimated Response Rate */}
        <div className="glass-panel p-5 rounded-2xl bg-[#080B12]/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Response Rate
          </span>
          <div className="my-2">
            <span className="font-display text-3xl font-extrabold text-primary-light">
              {hasData ? `${analytics.responseRatePercent}%` : '—'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Of completed sessions</span>
        </div>

        {/* Average Members */}
        <div className="glass-panel p-5 rounded-2xl bg-[#080B12]/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg Room Size
          </span>
          <div className="my-2">
            <span className="font-display text-3xl font-extrabold text-white">
              {hasData ? `${analytics.averageMembersPerRoom}` : '—'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Participants / session</span>
        </div>
      </div>

      {/* Presentation Pitch Snippet Card */}
      {hasData && (
        <div className="p-4 bg-[#101621] border border-primary/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light">
              E-Cell Presentation Pitch Metric
            </span>
            <p className="text-xs text-slate-200">
              &ldquo;We collected real post-session feedback from{' '}
              <strong className="text-white">{analytics.totalResponses} users</strong>:{' '}
              <strong className="text-emerald-400">
                {analytics.wouldUseAgainPositivePercent}%
              </strong>{' '}
              stated they would use TempLink again, with an average satisfaction rating of{' '}
              <strong className="text-amber-400">{analytics.averageRating}/5</strong>.&rdquo;
            </p>
          </div>
          <button
            onClick={() => {
              const text = `We collected real post-session feedback from ${analytics.totalResponses} users: ${analytics.wouldUseAgainPositivePercent}% stated they would use TempLink again, with an average satisfaction rating of ${analytics.averageRating}/5.`;
              navigator.clipboard.writeText(text);
              alert('Copied pitch statistic to clipboard!');
            }}
            className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-primary-light text-xs font-semibold shrink-0 transition-colors"
          >
            Copy Metric
          </button>
        </div>
      )}

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Breakdown */}
        <div className="glass-panel p-6 rounded-2xl bg-[#080B12]/80 border border-white/10 space-y-4">
          <h2 className="font-display font-bold text-base text-white">Rating Distribution</h2>
          {hasData ? (
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = analytics.ratingDistribution[r as keyof typeof analytics.ratingDistribution] || 0;
                const percent = analytics.totalResponses > 0 ? Math.round((count / analytics.totalResponses) * 100) : 0;
                return (
                  <div key={r} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-medium text-slate-300">{r} Star</span>
                    <div className="flex-1 h-3 bg-[#05070B] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-slate-400">{percent}% ({count})</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">No rating data collected yet.</p>
          )}
        </div>

        {/* Would Use Again Distribution */}
        <div className="glass-panel p-6 rounded-2xl bg-[#080B12]/80 border border-white/10 space-y-4">
          <h2 className="font-display font-bold text-base text-white">Retention Intent</h2>
          {hasData ? (
            <div className="space-y-2.5">
              {Object.entries(analytics.wouldUseAgainDistribution).map(([choice, count]) => {
                const percent = analytics.totalResponses > 0 ? Math.round((count / analytics.totalResponses) * 100) : 0;
                const labelMap: Record<string, string> = {
                  DEFINITELY: 'Definitely',
                  PROBABLY: 'Probably',
                  UNSURE: 'Not sure',
                  PROBABLY_NOT: 'Probably not',
                  NO: 'No',
                };
                return (
                  <div key={choice} className="flex items-center gap-3 text-xs">
                    <span className="w-20 font-medium text-slate-300 truncate">{labelMap[choice] || choice}</span>
                    <div className="flex-1 h-3 bg-[#05070B] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          choice === 'DEFINITELY' || choice === 'PROBABLY' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-slate-400">{percent}% ({count})</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">No intent data collected yet.</p>
          )}
        </div>

        {/* Use Cases Breakdown */}
        <div className="glass-panel p-6 rounded-2xl bg-[#080B12]/80 border border-white/10 space-y-4">
          <h2 className="font-display font-bold text-base text-white">Use Case Breakdown</h2>
          {hasData && Object.keys(analytics.useCaseDistribution).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(analytics.useCaseDistribution).map(([category, { count, percentage }]) => (
                <div key={category} className="flex items-center gap-3 text-xs">
                  <span className="w-28 font-medium text-slate-300 truncate" title={category}>{category}</span>
                  <div className="flex-1 h-3 bg-[#05070B] rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-slate-400">{percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">No use cases selected yet.</p>
          )}
        </div>
      </div>

      {/* Improvement Comments Feed */}
      <div className="glass-panel p-6 rounded-3xl bg-[#080B12]/90 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white">Anonymous Improvement Comments</h2>
            <p className="text-xs text-slate-400">Direct qualitative feedback from temporary room users.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                fetchDashboardData(adminKey, 1, e.target.value, searchQuery);
              }}
              className="bg-[#05070B] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchDashboardData(adminKey, 1, ratingFilter, searchQuery);
                }
              }}
              placeholder="Search feedback..."
              className="bg-[#05070B] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-primary"
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
            <p>No feedback responses match the current filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="pt-3 pb-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-semibold">
                      {'★'.repeat(item.rating)}
                      <span className="text-slate-700">{'★'.repeat(5 - item.rating)}</span>
                    </span>
                    {item.useCase && (
                      <span className="px-2 py-0.5 rounded-full bg-[#101621] border border-white/10 text-[10px] text-slate-300 font-medium">
                        {item.useCase}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary-light font-bold">
                      {item.plan}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                  {item.improvementText ? `"${item.improvementText}"` : <span className="text-slate-600 italic">No comment provided</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <span className="text-slate-400">
              Showing page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchDashboardData(adminKey, page - 1, ratingFilter, searchQuery)}
                className="px-3 py-1.5 border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/5"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchDashboardData(adminKey, page + 1, ratingFilter, searchQuery)}
                className="px-3 py-1.5 border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
