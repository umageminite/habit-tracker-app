import { NextResponse } from 'next/server';
import { createUser } from '@/lib/dynamodb/users';
import { createToken, setSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/register
 *
 * Register a new user account
 * Body: { email, password, name }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid email is required',
          },
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters',
          },
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name is required',
          },
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      email,
      password,
      name: name.trim(),
    });

    // Create session token
    const token = await createToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.$metadata?.httpStatusCode);
    console.error('Error stack:', error.stack);

    if (error.message === 'USER_ALREADY_EXISTS') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create account',
          details: error.message,
          errorName: error.name,
          errorCode: error.code || error.$metadata?.httpStatusCode,
        },
      },
      { status: 500 }
    );
  }
}
