# Authentication Integration Guide

## ✅ Completed

1. **Dependencies Installed**:
   - bcryptjs (password hashing)
   - jsonwebtoken & jose (JWT tokens)
   - cookie (cookie management)

2. **Backend Created**:
   - [src/lib/dynamodb/users.js](src/lib/dynamodb/users.js) - User CRUD operations
   - [src/lib/auth.js](src/lib/auth.js) - JWT token & session management
   - [src/app/api/auth/register/route.js](src/app/api/auth/register/route.js) - Registration endpoint
   - [src/app/api/auth/login/route.js](src/app/api/auth/login/route.js) - Login endpoint
   - [src/app/api/auth/logout/route.js](src/app/api/auth/logout/route.js) - Logout endpoint
   - [src/app/api/auth/me/route.js](src/app/api/auth/me/route.js) - Get current user

3. **UI Pages Created**:
   - [src/app/login/page.js](src/app/login/page.js) - Login page
   - [src/app/register/page.js](src/app/register/page.js) - Registration page

4. **Partial Route Protection**:
   - [src/app/api/habits/route.js](src/app/api/habits/route.js) - GET and POST protected ✅

## 🔄 Remaining Tasks

### 1. Complete Route Protection

Update these files to use authentication (replace `userId = 'demo-user-1'` with actual auth):

**File**: `src/app/api/habits/[id]/route.js`
- GET, PATCH, DELETE functions need auth
- Add this at the start of each function:
```javascript
const user = await getCurrentUser();
if (!user) {
  return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
}
const userId = user.userId;
```

**File**: `src/app/api/habits/[id]/toggle/route.js`
- POST function needs auth
- Same auth check as above

**File**: `src/app/api/habits/reset/route.js`
- POST function needs auth
- Same auth check as above

### 2. Update Frontend (Main Page)

**File**: `src/app/page.js`

Add these changes:

```javascript
// At the top with other state
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

// Add useEffect to check auth status
useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me');
    const result = await response.json();

    if (result.success) {
      setUser(result.data.user);
    } else {
      // Redirect to login
      router.push('/login');
    }
  } catch (err) {
    router.push('/login');
  } finally {
    setAuthLoading(false);
  }
};

// Add logout handler
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
};

// Update the loading check
if (authLoading || loading) {
  return <LoadingSpinner />;
}
```

### 3. Update Navbar

**File**: `src/components/Navbar.js`

Add user display and logout button:

```javascript
'use client';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Habit Tracker
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

## 🧪 Testing

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test in Browser
1. Go to http://localhost:3000/register
2. Create an account
3. Should auto-login and redirect to home
4. Create some habits
5. Logout and login again
6. Habits should still be there (per user)

## 📝 Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- Session stored in HTTP-only cookie (secure in production)
- Each user's habits are isolated by `userId`

## 🔒 Security Checklist

- ✅ Passwords hashed before storage
- ✅ JWT secret in environment variable
- ✅ HTTP-only cookies (prevents XSS)
- ✅ Input validation on all endpoints
- ⚠️ TODO: Add HTTPS in production
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add email verification
