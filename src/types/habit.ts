/**
 * Core Habit type definition
 */
export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  completedToday: boolean;
  streak: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  lastCompletedAt?: string; // ISO 8601 date string
}

/**
 * Request payload for creating a new habit
 */
export interface CreateHabitRequest {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
}

/**
 * Request payload for updating an existing habit
 */
export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly';
  completedToday?: boolean;
}

/**
 * Response wrapper for successful operations
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Response wrapper for errors
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Query parameters for listing habits
 */
export interface ListHabitsQuery {
  frequency?: 'daily' | 'weekly';
  completedToday?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Response for list habits operation
 */
export interface ListHabitsResponse {
  habits: Habit[];
  total: number;
  limit: number;
  offset: number;
}
