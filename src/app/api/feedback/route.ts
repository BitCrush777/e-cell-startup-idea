import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback, getFeedbackAnalytics } from '@/lib/feedback-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const forwardedFor = req.headers.get('x-forwarded-for') || 'local';
    const clientIp = forwardedFor.split(',')[0].trim();

    const res = submitFeedback(body, clientIp);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error, code: res.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, id: res.feedback?.id, message: 'Thank you for your feedback!' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid feedback payload' },
      { status: 400 }
    );
  }
}

export async function GET() {
  const analytics = getFeedbackAnalytics();
  // Return public aggregate metrics (without private improvement text entries)
  return NextResponse.json({
    success: true,
    totalResponses: analytics.totalResponses,
    averageRating: analytics.averageRating,
    wouldUseAgainPositivePercent: analytics.wouldUseAgainPositivePercent,
    ratingDistribution: analytics.ratingDistribution,
    useCaseDistribution: analytics.useCaseDistribution,
  });
}
