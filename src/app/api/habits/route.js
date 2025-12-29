import { NextResponse } from 'next/server';
import { createHabit, listHabits } from '@/lib/dynamodb/habits';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/habits
 *
 * List all habits with optional filtering
 * Query params: frequency, completedToday, limit, offset
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const query = {
      frequency: searchParams.get('frequency'),
      completedToday: searchParams.get('completedToday') === 'true' ? true : searchParams.get('completedToday') === 'false' ? false : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset'), 10) : 0,
    };

    const result = await listHabits(userId, query);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error listing habits:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list habits',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 *
 * Create a new habit
 * Body: { name, description?, frequency }
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

    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              name: 'Name is required and must be a string',
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

    if (!['daily', 'weekly'].includes(body.frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              frequency: "Frequency must be 'daily' or 'weekly'",
            },
          },
        },
        { status: 400 }
      );
    }

    if (body.description && body.description.length > 500) {
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

    const habit = await createHabit(userId, {
      name: body.name,
      description: body.description,
      frequency: body.frequency,
    });

    return NextResponse.json(
      {
        success: true,
        data: habit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating habit:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create habit',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
