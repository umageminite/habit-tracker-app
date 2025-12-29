import {
  Habit,
  CreateHabitRequest,
  UpdateHabitRequest,
  ListHabitsQuery,
  ListHabitsResponse,
  ApiResponse,
  ApiError,
} from '@/types/habit';

/**
 * API Contract for Habit CRUD Operations
 *
 * This interface defines the contract for all habit-related API operations.
 * Implementations can be client-side (localStorage), server-side (REST API),
 * or any other data persistence layer.
 */
export interface HabitApi {
  /**
   * Create a new habit
   *
   * @param request - The habit creation request payload
   * @returns Promise resolving to the created habit
   * @throws ApiError if creation fails (e.g., validation error, duplicate name)
   *
   * @example
   * ```ts
   * const habit = await habitApi.addHabit({
   *   name: 'Morning Exercise',
   *   description: '30 minutes of cardio',
   *   frequency: 'daily'
   * });
   * ```
   */
  addHabit(request: CreateHabitRequest): Promise<ApiResponse<Habit> | ApiError>;

  /**
   * List all habits with optional filtering
   *
   * @param query - Optional query parameters for filtering and pagination
   * @returns Promise resolving to a list of habits with metadata
   * @throws ApiError if listing fails
   *
   * @example
   * ```ts
   * // Get all daily habits
   * const response = await habitApi.listHabits({ frequency: 'daily' });
   *
   * // Get completed habits with pagination
   * const response = await habitApi.listHabits({
   *   completedToday: true,
   *   limit: 10,
   *   offset: 0
   * });
   * ```
   */
  listHabits(query?: ListHabitsQuery): Promise<ApiResponse<ListHabitsResponse> | ApiError>;

  /**
   * Get a single habit by ID
   *
   * @param id - The unique identifier of the habit
   * @returns Promise resolving to the habit
   * @throws ApiError if habit not found or retrieval fails
   *
   * @example
   * ```ts
   * const habit = await habitApi.getHabit('habit-123');
   * ```
   */
  getHabit(id: string): Promise<ApiResponse<Habit> | ApiError>;

  /**
   * Update an existing habit
   *
   * @param id - The unique identifier of the habit
   * @param request - The habit update request payload (partial update)
   * @returns Promise resolving to the updated habit
   * @throws ApiError if habit not found or update fails
   *
   * @example
   * ```ts
   * // Mark habit as completed
   * const habit = await habitApi.updateHabit('habit-123', {
   *   completedToday: true
   * });
   *
   * // Update habit name and frequency
   * const habit = await habitApi.updateHabit('habit-123', {
   *   name: 'Evening Exercise',
   *   frequency: 'weekly'
   * });
   * ```
   */
  updateHabit(id: string, request: UpdateHabitRequest): Promise<ApiResponse<Habit> | ApiError>;

  /**
   * Delete a habit
   *
   * @param id - The unique identifier of the habit
   * @returns Promise resolving to void on success
   * @throws ApiError if habit not found or deletion fails
   *
   * @example
   * ```ts
   * await habitApi.deleteHabit('habit-123');
   * ```
   */
  deleteHabit(id: string): Promise<ApiResponse<void> | ApiError>;

  /**
   * Toggle the completion status of a habit for today
   *
   * @param id - The unique identifier of the habit
   * @returns Promise resolving to the updated habit
   * @throws ApiError if habit not found or toggle fails
   *
   * @example
   * ```ts
   * const habit = await habitApi.toggleHabit('habit-123');
   * ```
   */
  toggleHabit(id: string): Promise<ApiResponse<Habit> | ApiError>;

  /**
   * Reset all habits' completedToday status to false
   * This should typically be called at the start of each day
   *
   * @returns Promise resolving to void on success
   * @throws ApiError if reset fails
   *
   * @example
   * ```ts
   * await habitApi.resetDailyHabits();
   * ```
   */
  resetDailyHabits(): Promise<ApiResponse<void> | ApiError>;
}

/**
 * HTTP-based REST API implementation
 *
 * This class implements the HabitApi interface using HTTP requests
 * to a backend REST API.
 */
export class RestHabitApi implements HabitApi {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/habits') {
    this.baseUrl = baseUrl;
  }

  async addHabit(request: CreateHabitRequest): Promise<ApiResponse<Habit> | ApiError> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async listHabits(query?: ListHabitsQuery): Promise<ApiResponse<ListHabitsResponse> | ApiError> {
    const params = new URLSearchParams();
    if (query?.frequency) params.append('frequency', query.frequency);
    if (query?.completedToday !== undefined) params.append('completedToday', String(query.completedToday));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.offset) params.append('offset', String(query.offset));

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    const response = await fetch(url);
    return response.json();
  }

  async getHabit(id: string): Promise<ApiResponse<Habit> | ApiError> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async updateHabit(id: string, request: UpdateHabitRequest): Promise<ApiResponse<Habit> | ApiError> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async deleteHabit(id: string): Promise<ApiResponse<void> | ApiError> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async toggleHabit(id: string): Promise<ApiResponse<Habit> | ApiError> {
    const response = await fetch(`${this.baseUrl}/${id}/toggle`, {
      method: 'POST',
    });
    return response.json();
  }

  async resetDailyHabits(): Promise<ApiResponse<void> | ApiError> {
    const response = await fetch(`${this.baseUrl}/reset`, {
      method: 'POST',
    });
    return response.json();
  }
}
