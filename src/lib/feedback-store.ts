import {
  FeedbackItem,
  FeedbackSubmission,
  FeedbackAnalyticsMetrics,
  FeedbackRating,
  WouldUseAgainOption,
} from '@/types/feedback';
import { getAllRooms } from './room-store';

// In-memory store for Node / Next.js server runtime (mirrored in D1 on Cloudflare)
const feedbackRecords: FeedbackItem[] = [];
const idempotencyMap = new Map<string, FeedbackItem>();
const rateLimitMap = new Map<string, number[]>();

const APP_VERSION = '1.0.0';

/**
 * Validates and records an anonymous feedback submission.
 */
export function submitFeedback(
  submission: FeedbackSubmission,
  clientKey?: string
): { success: boolean; feedback?: FeedbackItem; error?: string; code?: string } {
  // 1. Rate Limiting Check (Simple sliding window: max 10 submissions per 10 minutes per client)
  if (clientKey) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const timestamps = (rateLimitMap.get(clientKey) || []).filter((t) => now - t < windowMs);
    if (timestamps.length >= 10) {
      return {
        success: false,
        code: 'RATE_LIMITED',
        error: 'Too many feedback submissions. Please try again later.',
      };
    }
    timestamps.push(now);
    rateLimitMap.set(clientKey, timestamps);
  }

  // 2. Idempotency Token Check
  if (submission.idempotencyToken && idempotencyMap.has(submission.idempotencyToken)) {
    return {
      success: true,
      feedback: idempotencyMap.get(submission.idempotencyToken)!,
    };
  }

  // 3. Validation: Rating
  const rating = Number(submission.rating);
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return {
      success: false,
      code: 'INVALID_RATING',
      error: 'Please select a rating between 1 and 5 stars.',
    };
  }

  // 4. Validation: Would Use Again
  const validOptions: WouldUseAgainOption[] = ['DEFINITELY', 'PROBABLY', 'UNSURE', 'PROBABLY_NOT', 'NO'];
  if (!submission.wouldUseAgain || !validOptions.includes(submission.wouldUseAgain)) {
    return {
      success: false,
      code: 'INVALID_CHOICE',
      error: 'Please select if you would use TempLink again.',
    };
  }

  // 5. Validation: Improvement Text (Max 500 characters, optional)
  let cleanImprovementText: string | undefined = undefined;
  if (submission.improvementText && typeof submission.improvementText === 'string') {
    const trimmed = submission.improvementText.trim();
    if (trimmed.length > 500) {
      return {
        success: false,
        code: 'TEXT_TOO_LONG',
        error: 'Improvement feedback must be 500 characters or fewer.',
      };
    }
    cleanImprovementText = trimmed;
  }

  // 6. Validation: Use Case (Max 100 characters, optional)
  let cleanUseCase: string | undefined = undefined;
  if (submission.useCase && typeof submission.useCase === 'string') {
    const trimmed = submission.useCase.trim();
    if (trimmed.length > 100) {
      return {
        success: false,
        code: 'USE_CASE_TOO_LONG',
        error: 'Use case must be 100 characters or fewer.',
      };
    }
    cleanUseCase = trimmed;
  }

  // 7. Assemble structured anonymous record
  const item: FeedbackItem = {
    id: 'fb_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    rating: rating as FeedbackRating,
    wouldUseAgain: submission.wouldUseAgain,
    improvementText: cleanImprovementText,
    useCase: cleanUseCase,
    plan: submission.plan || 'FREE',
    memberCount: Math.max(1, Number(submission.memberCount) || 1),
    appVersion: submission.appVersion || APP_VERSION,
    idempotencyToken: submission.idempotencyToken,
    createdAt: Date.now(),
  };

  feedbackRecords.push(item);

  if (submission.idempotencyToken) {
    idempotencyMap.set(submission.idempotencyToken, item);
  }

  return {
    success: true,
    feedback: item,
  };
}

/**
 * Calculates genuine product validation metrics from real stored feedback.
 * Returns 0s when no responses exist — zero synthetic/fake metrics.
 */
export function getFeedbackAnalytics(): FeedbackAnalyticsMetrics {
  const totalResponses = feedbackRecords.length;

  // Calculate completed rooms estimate
  const allRooms = getAllRooms();
  const completedRooms = allRooms.filter(
    (r) => r.status === 'EXPIRED' || r.status === 'ENDED' || Date.now() >= r.expiresAt
  ).length;
  const completedRoomsEstimate = Math.max(totalResponses, completedRooms);

  if (totalResponses === 0) {
    return {
      totalResponses: 0,
      completedRoomsEstimate,
      responseRatePercent: 0,
      averageRating: 0,
      wouldUseAgainPositivePercent: 0,
      averageMembersPerRoom: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      wouldUseAgainDistribution: {
        DEFINITELY: 0,
        PROBABLY: 0,
        UNSURE: 0,
        PROBABLY_NOT: 0,
        NO: 0,
      },
      useCaseDistribution: {},
      recentComments: [],
    };
  }

  // Real metric calculations
  let ratingSum = 0;
  let positiveCount = 0;
  let membersSum = 0;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const wouldUseAgainDistribution = {
    DEFINITELY: 0,
    PROBABLY: 0,
    UNSURE: 0,
    PROBABLY_NOT: 0,
    NO: 0,
  };
  const useCaseCounts: Record<string, number> = {};

  const recentComments: FeedbackAnalyticsMetrics['recentComments'] = [];

  for (const item of feedbackRecords) {
    ratingSum += item.rating;
    ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1;

    wouldUseAgainDistribution[item.wouldUseAgain] = (wouldUseAgainDistribution[item.wouldUseAgain] || 0) + 1;
    if (item.wouldUseAgain === 'DEFINITELY' || item.wouldUseAgain === 'PROBABLY') {
      positiveCount++;
    }

    membersSum += item.memberCount || 1;

    if (item.useCase) {
      useCaseCounts[item.useCase] = (useCaseCounts[item.useCase] || 0) + 1;
    }

    if (item.improvementText) {
      recentComments.push({
        id: item.id,
        rating: item.rating,
        useCase: item.useCase,
        improvementText: item.improvementText,
        createdAt: item.createdAt,
        plan: item.plan,
      });
    }
  }

  const averageRating = Number((ratingSum / totalResponses).toFixed(1));
  const wouldUseAgainPositivePercent = Math.round((positiveCount / totalResponses) * 100);
  const averageMembersPerRoom = Number((membersSum / totalResponses).toFixed(1));
  const responseRatePercent = completedRoomsEstimate > 0
    ? Math.min(100, Math.round((totalResponses / completedRoomsEstimate) * 100))
    : 0;

  // Format use case distribution with percentages
  const useCaseDistribution: Record<string, { count: number; percentage: number }> = {};
  for (const [key, count] of Object.entries(useCaseCounts)) {
    useCaseDistribution[key] = {
      count,
      percentage: Math.round((count / totalResponses) * 100),
    };
  }

  // Sort recent comments descending by time
  recentComments.sort((a, b) => b.createdAt - a.createdAt);

  return {
    totalResponses,
    completedRoomsEstimate,
    responseRatePercent,
    averageRating,
    wouldUseAgainPositivePercent,
    averageMembersPerRoom,
    ratingDistribution,
    wouldUseAgainDistribution,
    useCaseDistribution,
    recentComments: recentComments.slice(0, 50),
  };
}

/**
 * Searchable, paginated feedback list for admin view.
 */
export function getFeedbackList(params: {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}): { items: FeedbackItem[]; total: number; page: number; totalPages: number } {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 15));
  const search = (params.search || '').toLowerCase().trim();
  const rating = params.rating ? Number(params.rating) : null;

  let filtered = [...feedbackRecords];

  if (rating && rating >= 1 && rating <= 5) {
    filtered = filtered.filter((item) => item.rating === rating);
  }

  if (search) {
    filtered = filtered.filter(
      (item) =>
        (item.improvementText && item.improvementText.toLowerCase().includes(search)) ||
        (item.useCase && item.useCase.toLowerCase().includes(search)) ||
        item.plan.toLowerCase().includes(search)
    );
  }

  filtered.sort((a, b) => b.createdAt - a.createdAt);

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return { items, total, page, totalPages };
}

/**
 * Clears all feedback records (used in test fixtures).
 */
export function resetFeedbackStore() {
  feedbackRecords.length = 0;
  idempotencyMap.clear();
  rateLimitMap.clear();
}
