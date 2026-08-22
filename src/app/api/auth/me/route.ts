import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('templink_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({
      success: true,
      user: null,
    });
  }

  const user = getSessionUser(sessionToken);

  return NextResponse.json({
    success: true,
    user: user || null,
  });
}
