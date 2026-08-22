import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, updateUserPlan } from '@/lib/auth';
import { UserPlan } from '@/types';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get('templink_session')?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  const currentUser = getSessionUser(sessionToken);
  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: 'Session expired. Please sign in again.' },
      { status: 401 }
    );
  }

  try {
    const body: any = await req.json();
    const { plan } = body || {};

    if (!['FREE', 'PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription plan.' },
        { status: 400 }
      );
    }

    const updatedUser = updateUserPlan(currentUser.id, plan as UserPlan);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Subscription updated to ${plan}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Unable to update plan.' },
      { status: 500 }
    );
  }
}
