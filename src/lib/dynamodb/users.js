import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAMES } from '../aws-config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * DynamoDB Service Layer for User Operations
 *
 * Handles user registration, authentication, and profile management
 */

/**
 * Create a new user account
 *
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} userData.name - User's full name
 * @returns {Promise<Object>} The created user (without password)
 */
export async function createUser(userData) {
  const { email, password, name } = userData;

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const now = new Date().toISOString();
  const userId = uuidv4();

  const user = {
    userId,
    email: email.toLowerCase(),
    passwordHash,
    name,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };

  const command = new PutCommand({
    TableName: TABLE_NAMES.USERS,
    Item: user,
  });

  await ddbDocClient.send(command);

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by email (using GSI)
 *
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByEmail(email) {
  const command = new QueryCommand({
    TableName: TABLE_NAMES.USERS,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase(),
    },
  });

  const response = await ddbDocClient.send(command);

  if (!response.Items || response.Items.length === 0) {
    return null;
  }

  return response.Items[0];
}

/**
 * Get user by ID
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(userId) {
  const command = new GetCommand({
    TableName: TABLE_NAMES.USERS,
    Key: {
      userId,
    },
  });

  const response = await ddbDocClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item;
}

/**
 * Verify user credentials
 *
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object|null>} User object (without password) or null if invalid
 */
export async function verifyUserCredentials(email, password) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  // Update last login time
  await updateLastLogin(user.userId);

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user's last login timestamp
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  const command = new UpdateCommand({
    TableName: TABLE_NAMES.USERS,
    Key: {
      userId,
    },
    UpdateExpression: 'SET lastLoginAt = :lastLoginAt',
    ExpressionAttributeValues: {
      ':lastLoginAt': new Date().toISOString(),
    },
  });

  try {
    await ddbDocClient.send(command);
  } catch (error) {
    // Ignore errors for now - this is a non-critical update
    console.error('Failed to update last login:', error);
  }
}

/**
 * Update user profile
 *
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
export async function updateUserProfile(userId, updates) {
  const allowedFields = ['name'];

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ':updatedAt': new Date().toISOString(),
  };

  // Add updatedAt
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';

  // Add other fields
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
    return await getUserById(userId);
  }

  const command = new PutCommand({
    TableName: TABLE_NAMES.USERS,
    Item: {
      userId,
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });

  try {
    const response = await ddbDocClient.send(command);
    const { passwordHash: _, ...userWithoutPassword } = response.Attributes || {};
    return userWithoutPassword;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return null;
    }
    throw error;
  }
}
