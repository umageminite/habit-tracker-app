import { NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/dynamodb/users';
import { createToken, setSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/login
 *
 * Login with email and password
 * Body: { email, password }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        },
        { status: 400 }
      );
    }

    // Verify credentials
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.$metadata?.httpStatusCode);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed',
          details: error.message,
          errorName: error.name,
          errorCode: error.code || error.$metadata?.httpStatusCode,
        },
      },
      { status: 500 }
    );
  }
}
