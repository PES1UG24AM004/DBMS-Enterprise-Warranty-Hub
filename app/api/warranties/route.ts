import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';

    let sql = `
      SELECT 
        asset_id, asset_tag, asset_name, category, manufacturer, model,
        location, department, assigned_to_name, warranty_provider,
        warranty_start_date, warranty_end_date, warranty_status, days_remaining
      FROM asset_warranty_status
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    // Vendor data filtering
    if (user.role === 'VENDOR') {
      params.push(user.id);
      whereClauses.push(`
        asset_id IN (
          SELECT asset_id FROM tickets WHERE assignee_user_id = $${params.length}
        )
      `);
    }

    // Status filter
    if (filter === 'active') {
      whereClauses.push("warranty_status = 'ACTIVE'");
    } else if (filter === 'expiring') {
      whereClauses.push("warranty_status = 'EXPIRING_SOON'");
    } else if (filter === 'expired') {
      whereClauses.push("warranty_status = 'EXPIRED'");
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY days_remaining ASC NULLS LAST;';

    const res = await query(sql, params);
    return NextResponse.json({ warranties: res.rows });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
