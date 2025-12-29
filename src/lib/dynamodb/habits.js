import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAMES } from '../aws-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * DynamoDB Service Layer for Habit Operations
 *
 * This module provides CRUD operations for habits stored in DynamoDB.
 * Each function follows the API contract defined in API_CONTRACT.md
 */

/**
 * Create a new habit for a user
 *
 * @param {string} userId - The user ID
 * @param {Object} habitData - Habit data (name, description, frequency)
 * @returns {Promise<Object>} The created habit
 */
export async function createHabit(userId, habitData) {
  const now = new Date().toISOString();
  const habitId = uuidv4();

  const habit = {
    userId,
    habitId,
    name: habitData.name,
    description: habitData.description || null,
    frequency: habitData.frequency,
    completedToday: false,
    streak: 0,
    createdAt: now,
    updatedAt: now,
    lastCompletedAt: null,
  };

  const command = new PutCommand({
    TableName: TABLE_NAMES.HABITS,
    Item: habit,
  });

  await ddbDocClient.send(command);

  return {
    id: habitId,
    ...habit,
  };
}

/**
 * Get a single habit by ID
 *
 * @param {string} userId - The user ID
 * @param {string} habitId - The habit ID
 * @returns {Promise<Object|null>} The habit or null if not found
 */
export async function getHabit(userId, habitId) {
  const command = new GetCommand({
    TableName: TABLE_NAMES.HABITS,
    Key: {
      userId,
      habitId,
    },
  });

  const response = await ddbDocClient.send(command);

  if (!response.Item) {
    return null;
  }

  return {
    id: response.Item.habitId,
    ...response.Item,
  };
}

/**
 * List all habits for a user with optional filtering
 *
 * @param {string} userId - The user ID
 * @param {Object} query - Query parameters (frequency, completedToday, limit, offset)
 * @returns {Promise<Object>} Object containing habits array and metadata
 */
export async function listHabits(userId, query = {}) {
  const { frequency, completedToday, limit = 50, offset = 0 } = query;

  let filterExpression = '';
  let expressionAttributeValues = {
    ':userId': userId,
  };
  let expressionAttributeNames = {};

  // Build filter expression
  const filters = [];

  if (frequency) {
    filters.push('#frequency = :frequency');
    expressionAttributeNames['#frequency'] = 'frequency';
    expressionAttributeValues[':frequency'] = frequency;
  }

  if (completedToday !== undefined) {
    filters.push('completedToday = :completedToday');
    expressionAttributeValues[':completedToday'] = completedToday;
  }

  if (filters.length > 0) {
    filterExpression = filters.join(' AND ');
  }

  const command = new QueryCommand({
    TableName: TABLE_NAMES.HABITS,
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: filterExpression || undefined,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
    Limit: Math.min(limit, 100), // Cap at 100
  });

  const response = await ddbDocClient.send(command);

  // Transform items to include 'id' field
  const habits = (response.Items || []).map(item => ({
    id: item.habitId,
    ...item,
  }));

  // Simple pagination using offset (for simplicity, not optimal for large datasets)
  const paginatedHabits = habits.slice(offset, offset + limit);

  return {
    habits: paginatedHabits,
    total: habits.length,
    limit,
    offset,
  };
}

/**
 * Update an existing habit
 *
 * @param {string} userId - The user ID
 * @param {string} habitId - The habit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} The updated habit or null if not found
 */
export async function updateHabit(userId, habitId, updates) {
  // Build update expression dynamically
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ':updatedAt': new Date().toISOString(),
  };

  // Add updatedAt to updates
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';

  // Add other fields
  const allowedFields = ['name', 'description', 'frequency', 'completedToday', 'streak', 'lastCompletedAt'];

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = updates[key];
    }
  });

  if (updateExpressions.length === 0) {
    // No valid fields to update
    return await getHabit(userId, habitId);
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAMES.HABITS,
    Key: {
      userId,
      habitId,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  try {
    const response = await ddbDocClient.send(command);

    return {
      id: response.Attributes.habitId,
      ...response.Attributes,
    };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a habit
 *
 * @param {string} userId - The user ID
 * @param {string} habitId - The habit ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteHabit(userId, habitId) {
  const command = new DeleteCommand({
    TableName: TABLE_NAMES.HABITS,
    Key: {
      userId,
      habitId,
    },
    ReturnValues: 'ALL_OLD',
  });

  const response = await ddbDocClient.send(command);

  return !!response.Attributes;
}

/**
 * Toggle habit completion status
 *
 * @param {string} userId - The user ID
 * @param {string} habitId - The habit ID
 * @returns {Promise<Object|null>} The updated habit or null if not found
 */
export async function toggleHabit(userId, habitId) {
  // First, get the current habit state
  const habit = await getHabit(userId, habitId);

  if (!habit) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const wasCompletedToday = habit.completedToday;
  const newCompletedToday = !wasCompletedToday;

  let updates = {
    completedToday: newCompletedToday,
  };

  // If marking as complete
  if (newCompletedToday) {
    const lastCompleted = habit.lastCompletedAt ? habit.lastCompletedAt.split('T')[0] : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const streakContinues = lastCompleted === today || lastCompleted === yesterday;
    const newStreak = streakContinues ? habit.streak + 1 : 1;

    updates.streak = newStreak;
    updates.lastCompletedAt = new Date().toISOString();
  } else {
    // If unmarking (only allowed if completed today)
    const lastCompleted = habit.lastCompletedAt ? habit.lastCompletedAt.split('T')[0] : null;

    if (lastCompleted === today) {
      const newStreak = habit.streak > 0 ? habit.streak - 1 : 0;
      updates.streak = newStreak;

      // Keep lastCompletedAt if streak > 0, otherwise set to null
      if (newStreak === 0) {
        updates.lastCompletedAt = null;
      }
    }
  }

  return await updateHabit(userId, habitId, updates);
}

/**
 * Reset all habits' completedToday status to false
 *
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Number of habits reset
 */
export async function resetDailyHabits(userId) {
  // Get all habits for the user
  const { habits } = await listHabits(userId);

  let resetCount = 0;

  // Update each habit that has completedToday = true
  for (const habit of habits) {
    if (habit.completedToday) {
      await updateHabit(userId, habit.habitId, { completedToday: false });
      resetCount++;
    }
  }

  return resetCount;
}
