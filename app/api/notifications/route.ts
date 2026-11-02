import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { syncWarrantyNotifications } from '@/lib/notifications';

export async function GET() {
  try {
    const user = await requireAuth();

    // If user is Facility Manager, ensure any freshly eligible warranty alerts are synced
    if (user.role === 'FACILITY_MANAGER') {
      await syncWarrantyNotifications();
    }

    const res = await query(
      `SELECT 
        n.id, n.user_id, n.asset_id, n.ticket_id, n.type, n.message,
        n.dedupe_key, n.read_at, n.created_at,
        a.asset_tag, a.name AS asset_name,
        t.ticket_code
       FROM notifications n
       LEFT JOIN assets a ON n.asset_id = a.id
       LEFT JOIN tickets t ON n.ticket_id = t.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC;`,
      [user.id]
    );

    const unreadCount = res.rows.filter((r) => !r.read_at).length;

    return NextResponse.json({
      notifications: res.rows,
      unread_count: unreadCount,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await requireAuth();

    await query(
      `UPDATE notifications 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read_at IS NULL;`,
      [user.id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
