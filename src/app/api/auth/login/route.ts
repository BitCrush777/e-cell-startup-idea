import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = authenticateUser(email, password);
    const sessionToken = createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Signed in successfully.',
    });

    response.cookies.set('templink_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 30,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Email or password is incorrect.' },
      { status: 401 }
    );
  }
}
