import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Create a JWT token for a user
 *
 * @param {Object} payload - User data to encode in token
 * @returns {Promise<string>} JWT token
 */
export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(key);
}

/**
 * Verify and decode a JWT token
 *
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user from the session cookie
 *
 * @returns {Promise<Object|null>} User data or null if not authenticated
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

/**
 * Set session cookie
 *
 * @param {string} token - JWT token
 */
export async function setSessionCookie(token) {
  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear session cookie (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * Middleware helper to protect API routes
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User data or null if not authenticated
 */
export async function requireAuth(request) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return null;
  }

  const user = await verifyToken(token);
  return user;
}
