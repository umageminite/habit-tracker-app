import { NextResponse } from 'next/server';
import { getHabit, updateHabit, deleteHabit } from '@/lib/dynamodb/habits';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/habits/:id
 *
 * Get a single habit by ID
 */
export async function GET(request, context) {
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

    const habit = await getHabit(userId, habitId);

    if (!habit) {
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
      data: habit,
    });
  } catch (error) {
    console.error('Error getting habit:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get habit',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/habits/:id
 *
 * Update an existing habit (partial update)
 * Body: { name?, description?, frequency?, completedToday?, streak?, lastCompletedAt? }
 */
export async function PATCH(request, context) {
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

    const body = await request.json();

    // Validation
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: {
                name: 'Name must be a non-empty string',
              },
            },
          },
          { status: 400 }
        );
      }

      if (body.name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: {
                name: 'Name must not exceed 100 characters',
              },
            },
          },
          { status: 400 }
        );
      }
    }

    if (body.frequency !== undefined && !['daily', 'weekly'].includes(body.frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid frequency value',
            details: {
              frequency: "Must be 'daily' or 'weekly'",
            },
          },
        },
        { status: 400 }
      );
    }

    if (body.description !== undefined && body.description && body.description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              description: 'Description must not exceed 500 characters',
            },
          },
        },
        { status: 400 }
      );
    }

    const updatedHabit = await updateHabit(userId, habitId, body);

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
    console.error('Error updating habit:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update habit',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/habits/:id
 *
 * Delete a habit permanently
 */
export async function DELETE(request, context) {
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

    const deleted = await deleteHabit(userId, habitId);

    if (!deleted) {
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
      data: null,
    });
  } catch (error) {
    console.error('Error deleting habit:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete habit',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
