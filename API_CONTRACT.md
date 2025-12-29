# Habit Tracker API Contract

This document defines the REST API contract for the Habit Tracker application.

## Base URL

```
/api/habits
```

## Data Types

### Habit Object

```typescript
{
  id: string;                 // Unique identifier (UUID or similar)
  name: string;               // Habit name (required, max 100 chars)
  description?: string;       // Optional description (max 500 chars)
  frequency: 'daily' | 'weekly';
  completedToday: boolean;    // Whether habit was completed today
  streak: number;             // Current streak count (days)
  createdAt: string;          // ISO 8601 timestamp
  updatedAt: string;          // ISO 8601 timestamp
  lastCompletedAt?: string;   // ISO 8601 timestamp of last completion
}
```

---

## API Endpoints

### 1. Create Habit

**POST** `/api/habits`

Creates a new habit.

#### Request Body

```json
{
  "name": "Morning Exercise",
  "description": "30 minutes of cardio or strength training",
  "frequency": "daily"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "daily",
    "completedToday": false,
    "streak": 0,
    "createdAt": "2025-12-28T10:30:00.000Z",
    "updatedAt": "2025-12-28T10:30:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "Name is required and must not exceed 100 characters"
    }
  }
}
```

---

### 2. List Habits

**GET** `/api/habits`

Retrieves a list of all habits with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `frequency` | `daily` \| `weekly` | No | Filter by frequency |
| `completedToday` | `boolean` | No | Filter by completion status |
| `limit` | `number` | No | Number of results (default: 50, max: 100) |
| `offset` | `number` | No | Offset for pagination (default: 0) |

#### Example Requests

```http
GET /api/habits
GET /api/habits?frequency=daily
GET /api/habits?completedToday=true
GET /api/habits?limit=10&offset=20
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Morning Exercise",
        "description": "30 minutes of cardio or strength training",
        "frequency": "daily",
        "completedToday": false,
        "streak": 5,
        "createdAt": "2025-12-20T10:30:00.000Z",
        "updatedAt": "2025-12-28T10:30:00.000Z",
        "lastCompletedAt": "2025-12-27T08:15:00.000Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 3. Get Habit by ID

**GET** `/api/habits/:id`

Retrieves a single habit by its ID.

#### Example Request

```http
GET /api/habits/550e8400-e29b-41d4-a716-446655440000
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "daily",
    "completedToday": false,
    "streak": 5,
    "createdAt": "2025-12-20T10:30:00.000Z",
    "updatedAt": "2025-12-28T10:30:00.000Z",
    "lastCompletedAt": "2025-12-27T08:15:00.000Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "HABIT_NOT_FOUND",
    "message": "Habit with id '550e8400-e29b-41d4-a716-446655440000' not found"
  }
}
```

---

### 4. Update Habit

**PATCH** `/api/habits/:id`

Updates an existing habit. All fields are optional (partial update).

#### Request Body

```json
{
  "name": "Evening Exercise",
  "frequency": "weekly"
}
```

Or to mark as completed:

```json
{
  "completedToday": true
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Evening Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "weekly",
    "completedToday": false,
    "streak": 5,
    "createdAt": "2025-12-20T10:30:00.000Z",
    "updatedAt": "2025-12-28T11:45:00.000Z",
    "lastCompletedAt": "2025-12-27T08:15:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "HABIT_NOT_FOUND",
    "message": "Habit with id '550e8400-e29b-41d4-a716-446655440000' not found"
  }
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid frequency value",
    "details": {
      "frequency": "Must be 'daily' or 'weekly'"
    }
  }
}
```

---

### 5. Delete Habit

**DELETE** `/api/habits/:id`

Deletes a habit permanently.

#### Example Request

```http
DELETE /api/habits/550e8400-e29b-41d4-a716-446655440000
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": null
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "HABIT_NOT_FOUND",
    "message": "Habit with id '550e8400-e29b-41d4-a716-446655440000' not found"
  }
}
```

---

### 6. Toggle Habit Completion

**POST** `/api/habits/:id/toggle`

Toggles the `completedToday` status of a habit. This is a convenience endpoint that:
- If `completedToday` is `false`, sets it to `true` and increments streak
- If `completedToday` is `true`, sets it to `false` (streak remains unchanged)

#### Example Request

```http
POST /api/habits/550e8400-e29b-41d4-a716-446655440000/toggle
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio or strength training",
    "frequency": "daily",
    "completedToday": true,
    "streak": 6,
    "createdAt": "2025-12-20T10:30:00.000Z",
    "updatedAt": "2025-12-28T12:00:00.000Z",
    "lastCompletedAt": "2025-12-28T12:00:00.000Z"
  }
}
```

---

### 7. Reset Daily Habits

**POST** `/api/habits/reset`

Resets all habits' `completedToday` status to `false`. This endpoint should be called automatically at the start of each day.

#### Example Request

```http
POST /api/habits/reset
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": null
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `HABIT_NOT_FOUND` | Habit with specified ID does not exist |
| `DUPLICATE_HABIT` | Habit with same name already exists |
| `INTERNAL_ERROR` | Internal server error |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |

---

## HTTP Status Codes

| Status | Usage |
|--------|-------|
| `200 OK` | Successful GET, PATCH, DELETE, or POST operations |
| `201 Created` | Successful POST creation |
| `400 Bad Request` | Validation error or malformed request |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Server error |

---

## Authentication (Future)

All endpoints will require authentication via Bearer token:

```http
Authorization: Bearer <token>
```

Unauthenticated requests will receive:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Rate Limiting (Future)

- Rate limit: 100 requests per minute per user
- Headers returned with each response:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1640707200`

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## Client Usage Example

```typescript
import { RestHabitApi } from '@/api/habitApi';

const api = new RestHabitApi('/api/habits');

// Create a habit
const response = await api.addHabit({
  name: 'Morning Exercise',
  description: '30 minutes of cardio',
  frequency: 'daily'
});

if (response.success) {
  console.log('Created habit:', response.data);
} else {
  console.error('Error:', response.error.message);
}

// List all daily habits
const listResponse = await api.listHabits({ frequency: 'daily' });

if (listResponse.success) {
  console.log('Habits:', listResponse.data.habits);
}

// Toggle a habit
const toggleResponse = await api.toggleHabit('habit-id');

if (toggleResponse.success) {
  console.log('Toggled habit:', toggleResponse.data);
}
```
