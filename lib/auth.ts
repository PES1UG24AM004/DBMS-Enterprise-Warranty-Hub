import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from './db';
import { User, UserRole, UserSession } from './types';

const COOKIE_NAME = 'ewh_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'enterprise-warranty-hub-secure-random-academic-key-32chars'
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Validates the session token from cookies, checks user against PostgreSQL database,
 * ensures is_active = TRUE, and returns current user details from DB.
 */
export async function getSessionUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.id as string;
    if (!userId) return null;

    // Database check to verify user exists and is active, and fetch fresh role
    const res = await query<User>(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (res.rows.length === 0) return null;
    const user = res.rows[0];
    if (!user.is_active) return null;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side guard helper for API routes and server actions.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<UserSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}
