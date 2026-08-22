import { NextRequest, NextResponse } from 'next/server';
import { generateResetToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const resetToken = generateResetToken(email);

    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email, we will send password reset instructions.',
      ...(process.env.NODE_ENV !== 'production' && resetToken ? { devResetToken: resetToken } : {}),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to process request. Please try again.' },
      { status: 500 }
    );
  }
}
