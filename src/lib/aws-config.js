import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * AWS DynamoDB Configuration
 *
 * This file initializes the DynamoDB client with credentials from environment variables.
 * Make sure to set up your .env.local file with the required AWS credentials.
 */

// Validate required environment variables
const requiredEnvVars = [
  'REGION',
  'ACCESS_KEY_ID',
  'SECRET_ACCESS_KEY',
  'DYNAMODB_USERS_TABLE',
  'DYNAMODB_HABITS_TABLE',
  'DYNAMODB_COMPLETIONS_TABLE',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

// Log environment variables for debugging (hide sensitive values)
console.log('AWS Config - Environment Variables Check:');
console.log('REGION:', process.env.REGION || 'NOT SET');
console.log('ACCESS_KEY_ID:', process.env.ACCESS_KEY_ID ? 'SET (hidden)' : 'NOT SET');
console.log('SECRET_ACCESS_KEY:', process.env.SECRET_ACCESS_KEY ? 'SET (hidden)' : 'NOT SET');
console.log('DYNAMODB_USERS_TABLE:', process.env.DYNAMODB_USERS_TABLE || 'NOT SET');
console.log('DYNAMODB_HABITS_TABLE:', process.env.DYNAMODB_HABITS_TABLE || 'NOT SET');
console.log('DYNAMODB_COMPLETIONS_TABLE:', process.env.DYNAMODB_COMPLETIONS_TABLE || 'NOT SET');
console.log('VINOD:', process.env.VINOD || 'NOT SET');


if (missingEnvVars.length > 0) {
  console.warn(
    `Warning: Missing environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

// Create DynamoDB Document client for easier JavaScript object handling
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    // Convert empty strings to null
    convertEmptyValues: false,
    // Remove undefined values
    removeUndefinedValues: true,
    // Convert class instances to maps
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    // Return numbers as JavaScript numbers (not strings)
    wrapNumbers: false,
  },
});

// Table names from environment variables
export const TABLE_NAMES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'habit-tracker-users',
  HABITS: process.env.DYNAMODB_HABITS_TABLE || 'habit-tracker-habits',
  COMPLETIONS: process.env.DYNAMODB_COMPLETIONS_TABLE || 'habit-tracker-completions',
};

export { client, ddbDocClient };
