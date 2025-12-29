# Habit Tracker - Complete Setup Instructions

This guide will walk you through setting up the Habit Tracker app with DynamoDB integration.

## 📋 Prerequisites

- Node.js 18+ installed
- AWS account with Basic Free Support
- AWS CLI (optional but recommended)

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required dependencies including:
- AWS SDK for JavaScript v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- UUID for generating unique IDs
- Next.js, React, and Tailwind CSS

---

### Step 2: Set Up DynamoDB Tables

Follow the detailed instructions in [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md) to:
1. Create the required DynamoDB tables
2. Set up AWS credentials
3. Configure IAM policies

**Quick Summary:**

You need to create 3 tables:
- `habit-tracker-users` (for user accounts)
- `habit-tracker-habits` (for storing habits)
- `habit-tracker-completions` (for completion history)

Use **Option A (AWS Console)** or **Option B (AWS CLI)** from the guide.

---

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your AWS credentials:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here

   DYNAMODB_USERS_TABLE=habit-tracker-users
   DYNAMODB_HABITS_TABLE=habit-tracker-habits
   DYNAMODB_COMPLETIONS_TABLE=habit-tracker-completions
   ```

**⚠️ IMPORTANT:** Never commit `.env.local` to version control!

---

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
my-habit-tracker-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── habits/
│   │   │       ├── route.js              # GET (list), POST (create)
│   │   │       ├── [id]/
│   │   │       │   ├── route.js          # GET, PATCH, DELETE by ID
│   │   │       │   └── toggle/
│   │   │       │       └── route.js      # POST toggle completion
│   │   │       └── reset/
│   │   │           └── route.js          # POST reset daily habits
│   │   ├── page.js                       # Main homepage
│   │   └── layout.js                     # Root layout
│   ├── components/
│   │   ├── Navbar.js                     # Navigation component
│   │   └── HabitCard.js                  # Habit card component
│   ├── lib/
│   │   ├── aws-config.js                 # AWS SDK configuration
│   │   └── dynamodb/
│   │       └── habits.js                 # DynamoDB service layer
│   ├── types/
│   │   └── habit.ts                      # TypeScript type definitions
│   ├── api/
│   │   └── habitApi.ts                   # API contract interface
│   └── utils/
│       └── dateHelpers.js                # Date utility functions
├── DYNAMODB_SETUP.md                     # DynamoDB setup guide
├── API_CONTRACT.md                       # REST API documentation
├── .env.local.example                    # Environment variables template
└── package.json
```

---

## 🔧 How It Works

### Frontend (Client-Side)

1. **[src/app/page.js](src/app/page.js)** - Main page component that:
   - Fetches habits from API on mount
   - Displays habit cards with stats
   - Handles add/edit/delete operations
   - Implements daily reset mechanism

2. **[src/components/HabitCard.js](src/components/HabitCard.js)** - Displays individual habits with:
   - Toggle completion button
   - Edit and delete buttons
   - Accessibility features (ARIA labels, focus states)
   - Mobile-first responsive design

### Backend (API Routes)

3. **API Routes** - Next.js API routes in `src/app/api/habits/`:
   - `GET /api/habits` - List all habits
   - `POST /api/habits` - Create new habit
   - `GET /api/habits/:id` - Get single habit
   - `PATCH /api/habits/:id` - Update habit
   - `DELETE /api/habits/:id` - Delete habit
   - `POST /api/habits/:id/toggle` - Toggle completion
   - `POST /api/habits/reset` - Reset daily habits

### Database Layer

4. **[src/lib/dynamodb/habits.js](src/lib/dynamodb/habits.js)** - Service layer that:
   - Implements CRUD operations
   - Handles streak calculation
   - Manages date-based completion tracking
   - Interacts with DynamoDB using AWS SDK

5. **[src/lib/aws-config.js](src/lib/aws-config.js)** - AWS configuration:
   - Initializes DynamoDB client
   - Loads credentials from environment variables
   - Configures marshalling options

---

## 🎯 Features

### ✅ Current Features

- **Habit CRUD Operations**: Create, read, update, and delete habits
- **Completion Tracking**: Mark habits as complete/incomplete for today
- **Streak Calculation**: Automatic streak tracking with date validation
- **Daily Reset**: Automatically resets habits at midnight
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, focus states
- **DynamoDB Integration**: Persistent storage in AWS DynamoDB
- **Free Tier Friendly**: Designed to stay within AWS free tier limits

### 🔜 Future Enhancements

- User authentication (login/registration)
- Multi-user support
- Weekly/monthly reports
- Habit categories and tags
- Notifications and reminders
- Data visualization (charts, graphs)
- Export data (CSV, JSON)

---

## 🧪 Testing the API

You can test the API endpoints using curl or any API client:

### Create a Habit
```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily"
  }'
```

### List All Habits
```bash
curl http://localhost:3000/api/habits
```

### Toggle Habit Completion
```bash
curl -X POST http://localhost:3000/api/habits/{habitId}/toggle
```

See [API_CONTRACT.md](./API_CONTRACT.md) for complete API documentation.

---

## 💰 Cost Monitoring

### DynamoDB Free Tier (Always Free)
- ✅ 25 GB of storage
- ✅ 25 read capacity units
- ✅ 25 write capacity units
- ✅ ~200M requests/month

### Recommended: Set Up Billing Alarm

1. Go to AWS Console → CloudWatch → Billing
2. Create alarm with threshold: **$1 USD**
3. Get email notifications if you exceed free tier

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already added to `.gitignore`
2. **Use IAM roles in production** - Not access keys
3. **Enable CloudWatch alarms** - Monitor costs
4. **Use least privilege policies** - Only grant necessary DynamoDB permissions
5. **Validate all inputs** - API routes include validation

---

## 🐛 Troubleshooting

### Error: Missing environment variables
**Solution:** Make sure `.env.local` exists and contains all required variables.

### Error: Unable to locate credentials
**Solution:** Verify your AWS credentials in `.env.local` are correct.

### Error: Table not found
**Solution:** Ensure you've created the DynamoDB tables as described in [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md).

### Habits not loading
**Solution:**
1. Check browser console for errors
2. Verify API routes are responding: `curl http://localhost:3000/api/habits`
3. Check that DynamoDB tables exist in AWS Console

### Daily reset not working
**Solution:** The reset runs automatically when the date changes. Check browser localStorage for `lastResetDate`.

---

## 📚 Additional Resources

- [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md) - Detailed DynamoDB setup guide
- [API_CONTRACT.md](./API_CONTRACT.md) - Complete REST API documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the API contract and setup guides
3. Verify your AWS credentials and table configuration
4. Check the browser console and server logs for error messages

---

## 📝 Notes

- **Demo User ID**: Currently, all API routes use a hardcoded user ID (`demo-user-1`). This will be replaced with actual authentication in the future.
- **Timezone**: All dates use ISO 8601 format and UTC timezone.
- **Streak Rules**: Streaks continue if you complete a habit today or yesterday. Missing 2+ days breaks the streak.

---

Happy habit tracking! 🎉
