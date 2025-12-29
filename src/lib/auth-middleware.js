import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

/**
 * Middleware to require authentication for API routes
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with auth check
 */
export function withAuth(handler) {
  return async function (request, context) {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Attach user to request for convenience
    request.user = user;

    return handler(request, context);
  };
}
