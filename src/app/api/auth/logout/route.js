import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * Logout and clear session cookie
 */
export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Logout failed',
        },
      },
      { status: 500 }
    );
  }
}
