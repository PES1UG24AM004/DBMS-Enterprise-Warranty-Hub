import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { syncWarrantyNotifications } from '@/lib/notifications';

export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role === 'FACILITY_MANAGER') {
      // Idempotently sync warranty alerts if any warranty naturally entered 30d window
      await syncWarrantyNotifications();

      // 1. Manager Metrics
      const countsRes = await query(`
        SELECT 
          (SELECT COUNT(*)::INT FROM assets) as total_assets,
          (SELECT COUNT(*)::INT FROM asset_warranty_status WHERE warranty_status = 'EXPIRING_SOON') as expiring_soon_warranties,
          (SELECT COUNT(*)::INT FROM asset_warranty_status WHERE warranty_status = 'EXPIRED') as expired_warranties,
          (SELECT COUNT(*)::INT FROM tickets WHERE status NOT IN ('Resolved', 'Closed')) as active_tickets,
          (SELECT COUNT(*)::INT FROM tickets WHERE status IN ('Resolved', 'Closed')) as closed_tickets
      `);

      // Category breakdown
      const categoryRes = await query(`
        SELECT category, COUNT(*)::INT as count
        FROM assets
        GROUP BY category
        ORDER BY count DESC;
      `);

      // Ticket status breakdown
      const statusRes = await query(`
        SELECT status, COUNT(*)::INT as count
        FROM tickets
        GROUP BY status
        ORDER BY count DESC;
      `);

      // Upcoming alerts (expiring or expired warranties)
      const alertsRes = await query(`
        SELECT asset_id, asset_tag, asset_name, category, location, warranty_end_date, warranty_status, days_remaining
        FROM asset_warranty_status
        WHERE warranty_status IN ('EXPIRING_SOON', 'EXPIRED')
        ORDER BY days_remaining ASC NULLS LAST
        LIMIT 6;
      `);

      // Recent tickets
      const recentTicketsRes = await query(`
        SELECT t.id, t.ticket_code, t.title, t.status, t.created_at, t.updated_at,
               a.name as asset_name, a.asset_tag, u.full_name as assignee_name
        FROM tickets t
        JOIN assets a ON t.asset_id = a.id
        LEFT JOIN users u ON t.assignee_user_id = u.id
        ORDER BY t.updated_at DESC
        LIMIT 6;
      `);

      return NextResponse.json({
        role: user.role,
        summary: countsRes.rows[0],
        category_distribution: categoryRes.rows,
        status_distribution: statusRes.rows,
        alerts: alertsRes.rows,
        recent_tickets: recentTicketsRes.rows,
      });
    }

    if (user.role === 'TECHNICIAN') {
      // Technician Metrics
      const techCountsRes = await query(
        `SELECT 
          COUNT(*)::INT as total_assigned,
          COUNT(*) FILTER (WHERE status NOT IN ('Resolved', 'Closed'))::INT as active_assigned,
          COUNT(*) FILTER (WHERE status = 'Resolved')::INT as resolved_count,
          COUNT(*) FILTER (WHERE status = 'Closed')::INT as closed_count
         FROM tickets
         WHERE assignee_user_id = $1;`,
        [user.id]
      );

      const statusRes = await query(
        `SELECT status, COUNT(*)::INT as count
         FROM tickets
         WHERE assignee_user_id = $1
         GROUP BY status
         ORDER BY count DESC;`,
        [user.id]
      );

      const assignedTicketsRes = await query(
        `SELECT t.id, t.ticket_code, t.title, t.description, t.status, t.resolution_notes,
                t.created_at, t.updated_at, a.id as asset_id, a.name as asset_name,
                a.asset_tag, a.category as asset_category, a.location
         FROM tickets t
         JOIN assets a ON t.asset_id = a.id
         WHERE t.assignee_user_id = $1
         ORDER BY t.updated_at DESC;`,
        [user.id]
      );

      const recentHistoryRes = await query(
        `SELECT id, issue_title, resolution, record_date
         FROM maintenance_records
         ORDER BY record_date DESC
         LIMIT 5;`
      );

      return NextResponse.json({
        role: user.role,
        summary: techCountsRes.rows[0],
        status_distribution: statusRes.rows,
        assigned_tickets: assignedTicketsRes.rows,
        recent_history: recentHistoryRes.rows,
      });
    }

    if (user.role === 'VENDOR') {
      // Vendor Metrics
      const vendorCountsRes = await query(
        `SELECT 
          COUNT(*)::INT as total_assigned,
          COUNT(*) FILTER (WHERE status NOT IN ('Resolved', 'Closed'))::INT as active_assigned,
          COUNT(*) FILTER (WHERE status = 'Resolved')::INT as resolved_count
         FROM tickets
         WHERE assignee_user_id = $1;`,
        [user.id]
      );

      const statusRes = await query(
        `SELECT status, COUNT(*)::INT as count
         FROM tickets
         WHERE assignee_user_id = $1
         GROUP BY status
         ORDER BY count DESC;`,
        [user.id]
      );

      const assignedTicketsRes = await query(
        `SELECT t.id, t.ticket_code, t.title, t.description, t.status, t.resolution_notes,
                t.created_at, t.updated_at, a.id as asset_id, a.name as asset_name,
                a.asset_tag, a.category as asset_category, a.location
         FROM tickets t
         JOIN assets a ON t.asset_id = a.id
         WHERE t.assignee_user_id = $1
         ORDER BY t.updated_at DESC;`,
        [user.id]
      );

      const vendorAssetsRes = await query(
        `SELECT DISTINCT a.id, a.asset_tag, a.name, a.category, a.location, a.manufacturer, a.model
         FROM assets a
         JOIN tickets t ON a.id = t.asset_id
         WHERE t.assignee_user_id = $1
         ORDER BY a.name ASC;`,
        [user.id]
      );

      return NextResponse.json({
        role: user.role,
        summary: vendorCountsRes.rows[0],
        status_distribution: statusRes.rows,
        assigned_tickets: assignedTicketsRes.rows,
        vendor_assets: vendorAssetsRes.rows,
      });
    }

    return NextResponse.json({ error: 'Unknown role' }, { status: 400 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
