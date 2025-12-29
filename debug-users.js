// Debug user data in DynamoDB
import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function debugUsers() {
  try {
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'habit-tracker-users',
    });

    const response = await ddbDocClient.send(command);

    console.log('Raw user data from DynamoDB:\n');
    console.log(JSON.stringify(response.Items, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

debugUsers();
