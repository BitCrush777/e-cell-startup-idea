import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  submitFeedback,
  getFeedbackAnalytics,
  getFeedbackList,
  resetFeedbackStore,
} from '../src/lib/feedback-store';

describe('TempLink Post-Room Feedback & Product Validation Tests', () => {
  beforeEach(() => {
    resetFeedbackStore();
  });

  test('TEST 1 — Real Metrics Guarantee: Empty store returns 0s without fake synthetic data', () => {
    const analytics = getFeedbackAnalytics();
    assert.strictEqual(analytics.totalResponses, 0);
    assert.strictEqual(analytics.averageRating, 0);
    assert.strictEqual(analytics.wouldUseAgainPositivePercent, 0);
    assert.strictEqual(analytics.responseRatePercent, 0);
    assert.strictEqual(analytics.recentComments.length, 0);
    assert.deepStrictEqual(analytics.ratingDistribution, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    assert.deepStrictEqual(analytics.useCaseDistribution, {});
  });

  test('TEST 2 — Valid feedback submission creates structured anonymous record', () => {
    const res = submitFeedback({
      rating: 5,
      wouldUseAgain: 'DEFINITELY',
      improvementText: 'Super fast and intuitive temporary chat!',
      useCase: 'Student collaboration',
      plan: 'FREE',
      memberCount: 3,
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.feedback);
    assert.strictEqual(res.feedback.rating, 5);
    assert.strictEqual(res.feedback.wouldUseAgain, 'DEFINITELY');
    assert.strictEqual(res.feedback.improvementText, 'Super fast and intuitive temporary chat!');
    assert.strictEqual(res.feedback.useCase, 'Student collaboration');
    assert.strictEqual(res.feedback.plan, 'FREE');
    assert.strictEqual(res.feedback.memberCount, 3);
    assert.strictEqual(res.feedback.appVersion, '1.0.0');
    assert.ok(res.feedback.id.startsWith('fb_'));
  });

  test('TEST 3 — Rating validation rejects invalid values (< 1, > 5, floats, non-numbers)', () => {
    const invalidRatings = [0, 6, -1, 3.5, NaN, null as any, undefined as any];

    for (const r of invalidRatings) {
      const res = submitFeedback({
        rating: r,
        wouldUseAgain: 'DEFINITELY',
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 'INVALID_RATING');
    }
  });

  test('TEST 4 — WouldUseAgain validation rejects invalid options', () => {
    const invalidChoices = ['MAYBE' as any, 'YES' as any, '' as any, null as any];

    for (const c of invalidChoices) {
      const res = submitFeedback({
        rating: 4,
        wouldUseAgain: c,
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 'INVALID_CHOICE');
    }
  });

  test('TEST 5 — Improvement text exceeding 500 characters is rejected', () => {
    const longText = 'a'.repeat(501);
    const res = submitFeedback({
      rating: 4,
      wouldUseAgain: 'PROBABLY',
      improvementText: longText,
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 'TEXT_TOO_LONG');
  });

  test('TEST 6 — Idempotency token prevents duplicate submission on double-click / retry', () => {
    const token = 'tok_unique_abc_123';

    const res1 = submitFeedback({
      rating: 5,
      wouldUseAgain: 'DEFINITELY',
      improvementText: 'First attempt',
      idempotencyToken: token,
    });
    assert.strictEqual(res1.success, true);
    const firstId = res1.feedback?.id;

    // Retry with exact same token -> returns existing record without duplicating
    const res2 = submitFeedback({
      rating: 5,
      wouldUseAgain: 'DEFINITELY',
      improvementText: 'First attempt',
      idempotencyToken: token,
    });
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.feedback?.id, firstId);

    const analytics = getFeedbackAnalytics();
    assert.strictEqual(analytics.totalResponses, 1, 'Store must only have 1 total entry');
  });

  test('TEST 7 — Rate limiting blocks rapid flooding from single client', () => {
    const clientKey = 'test_ip_192.168.1.100';

    for (let i = 0; i < 10; i++) {
      const res = submitFeedback(
        {
          rating: 4,
          wouldUseAgain: 'PROBABLY',
        },
        clientKey
      );
      assert.strictEqual(res.success, true);
    }

    // 11th request must be blocked
    const res11 = submitFeedback(
      {
        rating: 4,
        wouldUseAgain: 'PROBABLY',
      },
      clientKey
    );
    assert.strictEqual(res11.success, false);
    assert.strictEqual(res11.code, 'RATE_LIMITED');
  });

  test('TEST 8 — Statistical Aggregations (Average rating, positive retention, use cases)', () => {
    submitFeedback({ rating: 5, wouldUseAgain: 'DEFINITELY', useCase: 'Student collaboration', memberCount: 3 });
    submitFeedback({ rating: 4, wouldUseAgain: 'PROBABLY', useCase: 'Student collaboration', memberCount: 2 });
    submitFeedback({ rating: 5, wouldUseAgain: 'DEFINITELY', useCase: 'Freelance / client communication', memberCount: 2 });
    submitFeedback({ rating: 2, wouldUseAgain: 'NO', useCase: 'Testing the product', memberCount: 1 });

    const analytics = getFeedbackAnalytics();

    assert.strictEqual(analytics.totalResponses, 4);
    // (5 + 4 + 5 + 2) / 4 = 16 / 4 = 4.0
    assert.strictEqual(analytics.averageRating, 4.0);
    // Positive = DEFINITELY (2) + PROBABLY (1) = 3 / 4 = 75%
    assert.strictEqual(analytics.wouldUseAgainPositivePercent, 75);
    // Average members = (3 + 2 + 2 + 1) / 4 = 8 / 4 = 2.0
    assert.strictEqual(analytics.averageMembersPerRoom, 2.0);

    // Rating distribution
    assert.strictEqual(analytics.ratingDistribution[5], 2);
    assert.strictEqual(analytics.ratingDistribution[4], 1);
    assert.strictEqual(analytics.ratingDistribution[2], 1);
    assert.strictEqual(analytics.ratingDistribution[1], 0);

    // Use Case Breakdown: Student collaboration = 2/4 = 50%
    assert.strictEqual(analytics.useCaseDistribution['Student collaboration'].count, 2);
    assert.strictEqual(analytics.useCaseDistribution['Student collaboration'].percentage, 50);
    assert.strictEqual(analytics.useCaseDistribution['Freelance / client communication'].count, 1);
    assert.strictEqual(analytics.useCaseDistribution['Freelance / client communication'].percentage, 25);
  });

  test('TEST 9 — Search and pagination in getFeedbackList', () => {
    submitFeedback({ rating: 5, wouldUseAgain: 'DEFINITELY', improvementText: 'Loved the QR joining flow' });
    submitFeedback({ rating: 3, wouldUseAgain: 'UNSURE', improvementText: 'File upload was slightly slow' });
    submitFeedback({ rating: 1, wouldUseAgain: 'NO', improvementText: 'Room expired before we finished' });

    const list = getFeedbackList({ page: 1, limit: 2 });
    assert.strictEqual(list.items.length, 2);
    assert.strictEqual(list.total, 3);
    assert.strictEqual(list.totalPages, 2);

    const searchRes = getFeedbackList({ search: 'QR joining' });
    assert.strictEqual(searchRes.items.length, 1);
    assert.ok(searchRes.items[0].improvementText?.includes('QR joining'));

    const ratingRes = getFeedbackList({ rating: 5 });
    assert.strictEqual(ratingRes.items.length, 1);
    assert.strictEqual(ratingRes.items[0].rating, 5);
  });

  test('TEST 10 — Anonymity Integrity: No personal identifiable information is accepted or stored', () => {
    const rawPayload: any = {
      rating: 5,
      wouldUseAgain: 'DEFINITELY',
      improvementText: 'Great product!',
      email: 'user@example.com', // Extraneous PII
      phone: '+1234567890',      // Extraneous PII
      chatMessages: ['secret message 1', 'secret message 2'], // Plaintext chat
      userName: 'John Doe',
    };

    const res = submitFeedback(rawPayload);
    assert.strictEqual(res.success, true);
    const stored = res.feedback as any;

    assert.strictEqual(stored.email, undefined);
    assert.strictEqual(stored.phone, undefined);
    assert.strictEqual(stored.chatMessages, undefined);
    assert.strictEqual(stored.userName, undefined);
  });
});
