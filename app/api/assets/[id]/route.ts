import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { ASSET_CATEGORIES, AssetCategory } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const assetId = params.id;

    const res = await query(
      `SELECT 
        a.*,
        u.full_name AS assigned_to_name, u.email AS assigned_to_email,
        w.id AS warranty_id, w.warranty_provider, w.start_date AS warranty_start_date,
        w.end_date AS warranty_end_date,
        CASE 
          WHEN w.end_date IS NULL THEN 'NO_WARRANTY'
          WHEN w.end_date < CURRENT_DATE THEN 'EXPIRED'
          WHEN w.end_date <= CURRENT_DATE + INTERVAL '30 days' AND w.end_date >= CURRENT_DATE THEN 'EXPIRING_SOON'
          ELSE 'ACTIVE'
        END AS warranty_status,
        CASE 
          WHEN w.end_date IS NOT NULL THEN (w.end_date - CURRENT_DATE)
          ELSE NULL
        END AS days_remaining
      FROM assets a
      LEFT JOIN warranties w ON a.id = w.asset_id
      LEFT JOIN users u ON a.assigned_to_user_id = u.id
      WHERE a.id = $1;`,
      [assetId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const asset = res.rows[0];

    // Vendor permission check: only if assigned to a ticket
    if (user.role === 'VENDOR') {
      const vendorCheck = await query(
        'SELECT id FROM tickets WHERE asset_id = $1 AND assignee_user_id = $2;',
        [assetId, user.id]
      );
      if (vendorCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied to this asset.' }, { status: 403 });
      }
    }

    return NextResponse.json({ asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['FACILITY_MANAGER']);
    const assetId = params.id;
    const body = await req.json();

    const {
      name,
      category,
      manufacturer,
      model,
      serial_number,
      purchase_date,
      purchase_price,
      supplier_name,
      location,
      department,
      warranty_provider,
      warranty_start_date,
      warranty_end_date,
    } = body;

    if (category && !ASSET_CATEGORIES.includes(category as AssetCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${ASSET_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    await query(
      `UPDATE assets SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        manufacturer = COALESCE($3, manufacturer),
        model = COALESCE($4, model),
        serial_number = COALESCE($5, serial_number),
        purchase_date = COALESCE($6, purchase_date),
        purchase_price = COALESCE($7, purchase_price),
        supplier_name = COALESCE($8, supplier_name),
        location = COALESCE($9, location),
        department = COALESCE($10, department),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11;`,
      [
        name ? name.trim() : null,
        category || null,
        manufacturer ? manufacturer.trim() : null,
        model ? model.trim() : null,
        serial_number ? serial_number.trim() : null,
        purchase_date || null,
        purchase_price ? parseFloat(purchase_price) : null,
        supplier_name ? supplier_name.trim() : null,
        location ? location.trim() : null,
        department ? department.trim() : null,
        assetId,
      ]
    );

    // If warranty updated
    if (warranty_start_date && warranty_end_date) {
      await query(
        `INSERT INTO warranties (asset_id, warranty_provider, start_date, end_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (asset_id) DO UPDATE SET
           warranty_provider = EXCLUDED.warranty_provider,
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           updated_at = CURRENT_TIMESTAMP;`,
        [assetId, warranty_provider ? warranty_provider.trim() : null, warranty_start_date, warranty_end_date]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied. Facility Managers only.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
