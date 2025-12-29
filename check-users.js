// Check registered users in DynamoDB
import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Load .env.local file
config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function checkUsers() {
  try {
    console.log('Checking registered users...\n');

    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'habit-tracker-users',
    });

    const response = await ddbDocClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      console.log('❌ No users registered yet.');
      console.log('\nTo register a user, go to: http://localhost:3000/register');
      return;
    }

    console.log(`✅ Found ${response.Items.length} registered user(s):\n`);

    response.Items.forEach((user, index) => {
      console.log(`${index + 1}. User Details:`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - User ID: ${user.userId}`);
      console.log(`   - Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   - Last Login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}`);
      console.log('');
    });

    console.log(`\nTotal users: ${response.Items.length}`);
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers();
