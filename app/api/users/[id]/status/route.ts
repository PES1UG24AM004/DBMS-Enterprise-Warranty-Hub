import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAuth(['FACILITY_MANAGER']);
    const targetUserId = params.id;
    const body = await req.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Field is_active must be a boolean.' }, { status: 400 });
    }

    if (targetUserId === admin.id && !is_active) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own active Facility Director account.' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
      [is_active, targetUserId]
    );

    return NextResponse.json({ success: true, is_active });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
