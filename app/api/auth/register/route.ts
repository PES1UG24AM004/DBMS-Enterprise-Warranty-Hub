import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';

const VALID_ROLES: UserRole[] = ['FACILITY_MANAGER', 'TECHNICIAN', 'VENDOR'];

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, confirm_password, role } = await req.json();

    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { error: 'Password and confirmation do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role chosen.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const insertRes = await query<User>(
      `INSERT INTO users (full_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, full_name, email, role, is_active`,
      [full_name.trim(), cleanEmail, passwordHash, role]
    );

    const newUser = insertRes.rows[0];

    await createSession({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
