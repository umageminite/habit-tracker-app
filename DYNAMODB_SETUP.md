# DynamoDB Setup Guide for Habit Tracker

## Prerequisites
- AWS Account (Free Tier eligible)
- AWS CLI installed (optional but recommended)

## Step 1: Create DynamoDB Tables

### Option A: Using AWS Console

1. Go to AWS Console → DynamoDB → Tables → Create table

#### Table 1: Users
- **Table name:** `habit-tracker-users`
- **Partition key:** `userId` (String)
- **Settings:** Use default settings (On-demand billing)

#### Table 2: Habits
- **Table name:** `habit-tracker-habits`
- **Partition key:** `userId` (String)
- **Sort key:** `habitId` (String)
- **Settings:** Use default settings (On-demand billing)

**Global Secondary Index (GSI):**
- **Index name:** `HabitsByUser`
- **Partition key:** `userId` (String)
- **Sort key:** `createdAt` (String)

#### Table 3: HabitCompletions
- **Table name:** `habit-tracker-completions`
- **Partition key:** `habitId` (String)
- **Sort key:** `completedAt` (String)
- **Settings:** Use default settings (On-demand billing)

**Global Secondary Index (GSI):**
- **Index name:** `CompletionsByDate`
- **Partition key:** `userId` (String)
- **Sort key:** `completedAt` (String)

---

### Option B: Using AWS CLI

```bash
# Create Users table
aws dynamodb create-table \
  --table-name habit-tracker-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "EmailIndex",
      "KeySchema": [{"AttributeName":"email","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    }]' \
  --billing-mode PAY_PER_REQUEST

# Create Habits table
aws dynamodb create-table \
  --table-name habit-tracker-habits \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=habitId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=habitId,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "HabitsByUser",
      "KeySchema": [
        {"AttributeName":"userId","KeyType":"HASH"},
        {"AttributeName":"createdAt","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }]' \
  --billing-mode PAY_PER_REQUEST

# Create Completions table
aws dynamodb create-table \
  --table-name habit-tracker-completions \
  --attribute-definitions \
    AttributeName=habitId,AttributeType=S \
    AttributeName=completedAt,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=habitId,KeyType=HASH \
    AttributeName=completedAt,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "CompletionsByDate",
      "KeySchema": [
        {"AttributeName":"userId","KeyType":"HASH"},
        {"AttributeName":"completedAt","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }]' \
  --billing-mode PAY_PER_REQUEST
```

---

## Step 2: Set Up AWS Credentials

### Option A: Environment Variables (Recommended for local development)

Create `.env.local` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Table names
DYNAMODB_USERS_TABLE=habit-tracker-users
DYNAMODB_HABITS_TABLE=habit-tracker-habits
DYNAMODB_COMPLETIONS_TABLE=habit-tracker-completions
```

### Option B: AWS Amplify (for production)

```bash
npm install aws-amplify @aws-amplify/auth
```

---

## Step 3: Get AWS Credentials

1. Go to AWS Console → IAM → Users → Create user
2. User name: `habit-tracker-app`
3. Attach policies:
   - `AmazonDynamoDBFullAccess` (or create custom policy)
4. Create access key → Download credentials

### Custom IAM Policy (Recommended - Least Privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/habit-tracker-users",
        "arn:aws:dynamodb:us-east-1:*:table/habit-tracker-habits",
        "arn:aws:dynamodb:us-east-1:*:table/habit-tracker-completions",
        "arn:aws:dynamodb:us-east-1:*:table/habit-tracker-*/index/*"
      ]
    }
  ]
}
```

---

## Step 4: Free Tier Limits (Important!)

### DynamoDB Free Tier (Always Free):
- ✅ 25 GB of storage
- ✅ 25 read capacity units (RCUs)
- ✅ 25 write capacity units (WCUs)
- ✅ Enough for ~200M requests/month

### Estimated Usage for 1000 Users:
- Storage: ~100 MB (well within 25 GB)
- Reads: ~50,000/month (well within limit)
- Writes: ~10,000/month (well within limit)

**You won't be charged if you stay within these limits!**

---

## Step 5: Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use IAM roles** in production (not access keys)
3. **Enable CloudWatch alarms** for billing
4. **Use On-demand billing** to avoid capacity planning
5. **Enable Point-in-Time Recovery** (costs extra, optional)

---

## Step 6: Monitoring Costs

Set up a billing alarm:

1. AWS Console → CloudWatch → Billing → Create alarm
2. Set threshold: $1 USD
3. Get email notifications if you exceed free tier

---

## Next Steps

After creating the tables, run:

```bash
npm install
npm run dev
```

The app will automatically connect to DynamoDB!
