import { RoomPlan } from './index';

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type WouldUseAgainOption =
  | 'DEFINITELY'
  | 'PROBABLY'
  | 'UNSURE'
  | 'PROBABLY_NOT'
  | 'NO';

export type StandardUseCase =
  | 'Student collaboration'
  | 'Freelance / client communication'
  | 'Event / hackathon'
  | 'Online buyer / seller communication'
  | 'Short-term team communication'
  | 'Testing the product'
  | 'Other';

export interface FeedbackSubmission {
  rating: FeedbackRating;
  wouldUseAgain: WouldUseAgainOption;
  improvementText?: string;
  useCase?: string;
  plan?: RoomPlan;
  memberCount?: number;
  idempotencyToken?: string;
  appVersion?: string;
}

export interface FeedbackItem {
  id: string;
  rating: FeedbackRating;
  wouldUseAgain: WouldUseAgainOption;
  improvementText?: string;
  useCase?: string;
  plan: RoomPlan;
  memberCount: number;
  appVersion: string;
  idempotencyToken?: string;
  createdAt: number;
}

export interface FeedbackRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface FeedbackUseCases {
  [category: string]: number;
}

export interface FeedbackWouldUseAgainDistribution {
  DEFINITELY: number;
  PROBABLY: number;
  UNSURE: number;
  PROBABLY_NOT: number;
  NO: number;
}

export interface FeedbackAnalyticsMetrics {
  totalResponses: number;
  completedRoomsEstimate: number;
  responseRatePercent: number;
  averageRating: number;
  wouldUseAgainPositivePercent: number;
  averageMembersPerRoom: number;
  ratingDistribution: FeedbackRatingDistribution;
  wouldUseAgainDistribution: FeedbackWouldUseAgainDistribution;
  useCaseDistribution: Record<string, { count: number; percentage: number }>;
  recentComments: Array<{
    id: string;
    rating: FeedbackRating;
    useCase?: string;
    improvementText: string;
    createdAt: number;
    plan: RoomPlan;
  }>;
}
