# AWS Deployment Guide - Free Tier Only

Complete guide to deploy your Habit Tracker app on AWS using only free tier services.

## Overview

We'll use:
- **AWS Amplify** (Free tier: 1000 build minutes/month, 15 GB served/month)
- **DynamoDB** (Already configured, Free tier: 25 GB storage, 25 RCU/WCU)
- **Route 53** (Optional - $0.50/month for hosted zone, not free)

## Prerequisites

✅ AWS Account (Free tier)
✅ Your app is ready (already done)
✅ Git installed on your computer
✅ GitHub account (free)

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Create a `.gitignore` file (if not exists)

Create/update `.gitignore` in your project root:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 1.2 Update `package.json` build script

Make sure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.3 Create `.env.example` file

Create a `.env.example` file to document required environment variables:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_USERS_TABLE=habit-tracker-users
DYNAMODB_HABITS_TABLE=habit-tracker-habits
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Habit Tracker App"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New Repository"** (green button)
3. Repository name: `habit-tracker-app`
4. Description: "A habit tracking app built with Next.js and AWS"
5. Keep it **Public** (required for free deployment)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### 2.3 Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker-app.git

# Push code
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy with AWS Amplify

### 3.1 Go to AWS Amplify Console

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Search for **"Amplify"** in the search bar
3. Click **"AWS Amplify"**
4. Click **"Get Started"** under "Host your web app"

### 3.2 Connect GitHub Repository

1. Choose **GitHub** as your repository service
2. Click **"Continue"**
3. You'll be redirected to GitHub to authorize AWS Amplify
4. Click **"Authorize AWS Amplify"**
5. Select your repository: `habit-tracker-app`
6. Select branch: `main`
7. Click **"Next"**

### 3.3 Configure Build Settings

Amplify should auto-detect Next.js. Verify the build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Click **"Next"**

### 3.4 Add Environment Variables

⚠️ **CRITICAL STEP** - Add your AWS credentials:

1. Expand **"Advanced settings"**
2. Scroll to **"Environment variables"**
3. Add the following variables:

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-1` (or your region) |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key |
| `DYNAMODB_USERS_TABLE` | `habit-tracker-users` |
| `DYNAMODB_HABITS_TABLE` | `habit-tracker-habits` |

**Where to get AWS credentials?**

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Add users"**
3. Username: `habit-tracker-app-user`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search and select: **"AmazonDynamoDBFullAccess"**
7. Click **"Next"** → **"Create user"**
8. Click on the created user
9. Go to **"Security credentials"** tab
10. Click **"Create access key"**
11. Select **"Application running outside AWS"**
12. Click **"Next"** → **"Create access key"**
13. **Copy the Access Key ID and Secret Access Key** ⚠️ Save these securely!

### 3.5 Save and Deploy

1. Click **"Save and deploy"**
2. Amplify will start building your app (takes 3-5 minutes)
3. Wait for the build to complete

---

## Step 4: Verify Deployment

### 4.1 Check Build Status

1. Watch the build process in real-time
2. Phases: Provision → Build → Deploy → Verify
3. All should show green checkmarks ✅

### 4.2 Access Your App

1. Once deployed, you'll see a URL like:
   ```
   https://main.d1234abcd5678.amplifyapp.com
   ```
2. Click the URL to open your app
3. Test all features:
   - ✅ Register a new account
   - ✅ Login
   - ✅ Create habits
   - ✅ Toggle completion
   - ✅ Edit habits
   - ✅ Delete habits
   - ✅ Logout

---

## Step 5: Custom Domain (Optional - Costs $0.50/month)

### Option A: Use Free Amplify Subdomain (Recommended for Free Tier)

Your app is already accessible at:
```
https://main.d1234abcd5678.amplifyapp.com
```

**This is completely free!** ✅

### Option B: Use Custom Domain (Costs $0.50/month)

If you want a custom domain like `myhabittracker.com`:

1. Buy a domain from Route 53 (costs $12-15/year)
2. In Amplify console, click **"Domain management"**
3. Click **"Add domain"**
4. Follow the wizard to connect your domain

**Skip this if you want to stay 100% free.**

---

## Step 6: Enable Continuous Deployment

### 6.1 Automatic Deployments

AWS Amplify automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Amplify automatically rebuilds and deploys! 🚀
```

### 6.2 Monitor Deployments

1. Go to Amplify Console
2. Click on your app
3. View deployment history
4. Check logs if build fails

---

## Step 7: Monitor Usage (Stay Within Free Tier)

### 7.1 DynamoDB Free Tier Limits

- ✅ 25 GB storage (you'll use < 1 GB)
- ✅ 25 Read Capacity Units (enough for ~1M reads/month)
- ✅ 25 Write Capacity Units (enough for ~1M writes/month)

### 7.2 Amplify Free Tier Limits

- ✅ 1,000 build minutes/month
- ✅ 15 GB data served/month
- ✅ 5 GB data stored

### 7.3 Set Up Billing Alerts

1. Go to [AWS Billing](https://console.aws.amazon.com/billing/)
2. Click **"Billing Preferences"**
3. Enable **"Receive Free Tier Usage Alerts"**
4. Enter your email
5. Click **"Save preferences"**

**You'll be notified if you exceed free tier!**

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Clear cache and rebuild
# In Amplify Console → App settings → Build settings
# Enable "Clear cache before build"
```

**Error: "Environment variables not found"**
- Check all environment variables are added correctly
- Verify no typos in variable names
- Redeploy after adding variables

### App Not Working

**Error: "Unable to connect to DynamoDB"**
- Verify AWS credentials are correct
- Check IAM user has DynamoDB permissions
- Verify table names match exactly

**Error: "CORS issues"**
- Next.js API routes should handle this automatically
- If issues persist, check browser console for specific errors

### Slow Performance

**Build takes too long**
- Normal for first build (5-10 minutes)
- Subsequent builds are faster (2-3 minutes)
- Build minutes: Monitor in Amplify console

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **AWS Amplify** | 1000 build min/month | ~10-50 min/month | $0.00 |
| **Amplify Hosting** | 15 GB served/month | < 1 GB/month | $0.00 |
| **DynamoDB** | 25 GB storage | < 100 MB | $0.00 |
| **DynamoDB R/W** | 25 RCU/WCU | Well within limits | $0.00 |
| **Data Transfer** | 1 GB/month | < 500 MB/month | $0.00 |
| **TOTAL** | | | **$0.00/month** ✅ |

**Free tier is valid for 12 months after AWS signup.**

After 12 months, estimated cost: **$1-5/month** (depending on usage)

---

## Security Best Practices

### 1. Never Commit `.env.local` to Git
✅ Already in `.gitignore`

### 2. Use Environment Variables in Amplify
✅ Set in Amplify Console (not in code)

### 3. Limit IAM Permissions
- Only grant DynamoDB access
- Don't use root AWS credentials

### 4. Enable MFA on AWS Account
1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click your username → Security credentials
3. Enable MFA

### 5. Monitor Usage Regularly
- Check AWS Billing Dashboard weekly
- Set up billing alarms

---

## Next Steps After Deployment

### 1. Share Your App
Your app is now live! Share the URL:
```
https://main.d1234abcd5678.amplifyapp.com
```

### 2. Monitor Analytics
- Amplify provides basic analytics
- View in: Amplify Console → Monitoring

### 3. Add More Features
Continue developing locally:
```bash
# Make changes
npm run dev

# Test locally
# Push to GitHub when ready
git add .
git commit -m "New feature"
git push origin main

# Auto-deploys to AWS! 🚀
```

### 4. Backup Your Data
DynamoDB has built-in backups:
1. Go to DynamoDB Console
2. Click on table → Backups
3. Enable Point-in-time recovery (free for 7 days)

---

## Quick Reference Commands

```bash
# Local Development
npm run dev              # Start dev server
npm run build            # Test production build
npm run start            # Run production locally

# Git & Deploy
git add .                # Stage changes
git commit -m "message"  # Commit changes
git push origin main     # Deploy to AWS (auto)

# Verify Build
# Check Amplify Console for build status
```

---

## Support & Resources

- **AWS Free Tier**: https://aws.amazon.com/free/
- **Amplify Docs**: https://docs.aws.amazon.com/amplify/
- **DynamoDB Docs**: https://docs.aws.amazon.com/dynamodb/
- **Next.js Docs**: https://nextjs.org/docs

---

## Summary

✅ Your app is deployed on AWS
✅ Costs: $0/month (free tier)
✅ Auto-deploys on git push
✅ Accessible worldwide via HTTPS
✅ DynamoDB handles data storage
✅ No server management needed

**You're done! Your Habit Tracker is live! 🎉**

---

**Pro Tip:** Bookmark your Amplify URL and share it with friends to start tracking habits together!
