import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackAnalytics, getFeedbackList } from '@/lib/feedback-store';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'templink-admin-e-cell-2026';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-key') || req.headers.get('authorization');
  const url = new URL(req.url);
  const queryKey = url.searchParams.get('adminKey');

  const providedKey = authHeader?.replace(/^Bearer\s+/i, '') || queryKey;

  if (providedKey !== ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin authentication required.' },
      { status: 401 }
    );
  }

  const page = Number(url.searchParams.get('page')) || 1;
  const limit = Number(url.searchParams.get('limit')) || 15;
  const rating = url.searchParams.get('rating') ? Number(url.searchParams.get('rating')) : undefined;
  const search = url.searchParams.get('search') || undefined;

  const analytics = getFeedbackAnalytics();
  const list = getFeedbackList({ page, limit, rating, search });

  return NextResponse.json({
    success: true,
    analytics,
    items: list.items,
    pagination: {
      page: list.page,
      limit,
      total: list.total,
      totalPages: list.totalPages,
    },
  });
}
