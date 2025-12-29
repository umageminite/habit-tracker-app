import { NextResponse } from 'next/server';
import { resetDailyHabits } from '@/lib/dynamodb/habits';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/habits/reset
 *
 * Reset all habits' completedToday status to false
 * This endpoint should be called at the start of each day
 */
export async function POST(request) {
  try {
    // Get authenticated user
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

    const userId = user.userId;

    const resetCount = await resetDailyHabits(userId);

    return NextResponse.json({
      success: true,
      data: {
        resetCount,
        message: `Reset ${resetCount} habit(s)`,
      },
    });
  } catch (error) {
    console.error('Error resetting habits:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset habits',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
