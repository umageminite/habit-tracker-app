// Clean up corrupted user records
import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function cleanupCorruptedUsers() {
  try {
    console.log('Scanning for corrupted users...\n');

    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'habit-tracker-users',
    });

    const response = await ddbDocClient.send(scanCommand);

    if (!response.Items || response.Items.length === 0) {
      console.log('No users found.');
      return;
    }

    let deletedCount = 0;

    for (const user of response.Items) {
      // Check if user is missing critical fields
      if (!user.email || !user.name || !user.passwordHash) {
        console.log(`Deleting corrupted user: ${user.userId}`);

        const deleteCommand = new DeleteCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE || 'habit-tracker-users',
          Key: {
            userId: user.userId,
          },
        });

        await ddbDocClient.send(deleteCommand);
        deletedCount++;
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} corrupted user(s).`);
    console.log('\nYou can now register a new account at: http://localhost:3000/register');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanupCorruptedUsers();
