import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Only Facility Manager can manage users
    await requireAuth(['FACILITY_MANAGER']);

    const res = await query(
      `SELECT id, full_name, email, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at ASC;`
    );

    return NextResponse.json({ users: res.rows });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied. Facility Managers only.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
