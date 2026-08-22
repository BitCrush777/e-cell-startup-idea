import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const { email, password, displayName } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const user = registerUser(email, password, displayName || 'User');
    const sessionToken = createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully.',
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
      { success: false, error: err.message || 'Unable to create account.' },
      { status: 400 }
    );
  }
}
