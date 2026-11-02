import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { TICKET_STATUSES, TicketStatus } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();

    let sql = `
      SELECT 
        t.id, t.ticket_code, t.asset_id, t.title, t.description, t.status,
        t.assignee_user_id, t.created_by_user_id, t.resolution_notes,
        t.created_at, t.updated_at,
        a.name AS asset_name, a.asset_tag, a.category AS asset_category,
        u.full_name AS assignee_name, u.email AS assignee_email, u.role AS assignee_role,
        c.full_name AS creator_name
      FROM tickets t
      JOIN assets a ON t.asset_id = a.id
      LEFT JOIN users u ON t.assignee_user_id = u.id
      JOIN users c ON t.created_by_user_id = c.id
    `;

    const params: any[] = [];

    // Role-based data filtering: Technicians and Vendors see only assigned tickets
    if (user.role === 'TECHNICIAN' || user.role === 'VENDOR') {
      sql += ' WHERE t.assignee_user_id = $1';
      params.push(user.id);
    }

    sql += ' ORDER BY t.created_at DESC;';

    const res = await query(sql, params);
    return NextResponse.json({ tickets: res.rows });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['FACILITY_MANAGER']);
    const body = await req.json();

    const { asset_id, title, description, assignee_user_id } = body;

    if (!asset_id || !title || !description) {
      return NextResponse.json(
        { error: 'Asset, Title, and Description are required.' },
        { status: 400 }
      );
    }

    // Verify asset exists
    const assetRes = await query('SELECT id, name, asset_tag FROM assets WHERE id = $1', [asset_id]);
    if (assetRes.rows.length === 0) {
      return NextResponse.json({ error: 'Selected equipment asset does not exist.' }, { status: 400 });
    }
    const asset = assetRes.rows[0];

    // Determine initial status based on assignee
    let initialStatus: TicketStatus = 'Reported';
    let assigneeRole: string | null = null;

    if (assignee_user_id) {
      const userRes = await query('SELECT id, full_name, role, is_active FROM users WHERE id = $1', [
        assignee_user_id,
      ]);
      if (userRes.rows.length === 0) {
        return NextResponse.json({ error: 'Assigned specialist account not found.' }, { status: 400 });
      }
      if (!userRes.rows[0].is_active) {
        return NextResponse.json({ error: 'Cannot assign ticket to a deactivated account.' }, { status: 400 });
      }
      assigneeRole = userRes.rows[0].role;
      if (assigneeRole !== 'TECHNICIAN' && assigneeRole !== 'VENDOR') {
        return NextResponse.json(
          { error: 'Tickets can only be assigned to Technicians or Vendors.' },
          { status: 400 }
        );
      }
      initialStatus = 'Assigned';
    }

    // Generate unique human-readable ticket code: TCK-YYYY-NNN
    const year = new Date().getFullYear();
    const countRes = await query('SELECT COUNT(*)::INT as total FROM tickets');
    const seq = (countRes.rows[0].total + 1).toString().padStart(3, '0');
    const ticketCode = `TCK-${year}-${seq}`;

    const insertRes = await query(
      `INSERT INTO tickets (
        ticket_code, asset_id, title, description, status,
        assignee_user_id, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;`,
      [ticketCode, asset_id, title.trim(), description.trim(), initialStatus, assignee_user_id || null, user.id]
    );

    const newTicket = insertRes.rows[0];

    // Send in-app notification to assignee if assigned
    if (assignee_user_id) {
      await query(
        `INSERT INTO notifications (user_id, asset_id, ticket_id, type, message, dedupe_key)
         VALUES ($1, $2, $3, 'TICKET_ASSIGNED', $4, $5)
         ON CONFLICT (user_id, dedupe_key) DO NOTHING;`,
        [
          assignee_user_id,
          asset_id,
          newTicket.id,
          `You have been assigned ${ticketCode}: ${title.trim()} (${asset.name})`,
          `ASSIGN:${ticketCode}:${assignee_user_id}`,
        ]
      );
    }

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied. Facility Managers only.' }, { status: 403 });
    }
    console.error('Create ticket error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
