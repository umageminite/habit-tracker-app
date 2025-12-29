import { NextResponse } from 'next/server';
import { toggleHabit } from '@/lib/dynamodb/habits';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/habits/:id/toggle
 *
 * Toggle the completion status of a habit
 */
export async function POST(request, context) {
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
    const params = await context.params;
    const habitId = params.id;

    console.log('Toggle habit - userId:', userId, 'habitId:', habitId);

    const updatedHabit = await toggleHabit(userId, habitId);

    if (!updatedHabit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HABIT_NOT_FOUND',
            message: `Habit with id '${habitId}' not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedHabit,
    });
  } catch (error) {
    console.error('Error toggling habit:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to toggle habit',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
