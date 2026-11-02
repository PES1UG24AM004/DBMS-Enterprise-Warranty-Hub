import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query, withTransaction } from '@/lib/db';
import { ASSET_CATEGORIES, AssetCategory } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();

    let sql = `
      SELECT 
        a.id, a.asset_tag, a.name, a.category, a.manufacturer, a.model,
        a.serial_number, a.purchase_date, a.purchase_price, a.supplier_name,
        a.location, a.department, a.assigned_to_user_id, a.created_at, a.updated_at,
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
    `;

    const params: any[] = [];

    if (user.role === 'VENDOR') {
      // Vendors only see assets associated with tickets assigned to them
      sql += `
        WHERE a.id IN (
          SELECT asset_id FROM tickets WHERE assignee_user_id = $1
        )
      `;
      params.push(user.id);
    }

    sql += ` ORDER BY a.created_at DESC;`;

    const res = await query(sql, params);
    return NextResponse.json({ assets: res.rows });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }
    console.error('Fetch assets error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['FACILITY_MANAGER']);
    const body = await req.json();

    const {
      asset_tag,
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
      assigned_to_user_id,
      warranty_provider,
      warranty_start_date,
      warranty_end_date,
    } = body;

    if (!name || !category || !manufacturer || !model || !purchase_date || !supplier_name) {
      return NextResponse.json(
        { error: 'Required asset fields: Name, Category, Manufacturer, Model, Purchase Date, Supplier.' },
        { status: 400 }
      );
    }

    if (!ASSET_CATEGORIES.includes(category as AssetCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${ASSET_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Auto-generate tag if not provided
    const finalTag =
      asset_tag?.trim() ||
      `AST-${category.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await withTransaction(async (client) => {
      // 1. Insert Asset
      const assetRes = await client.query(
        `INSERT INTO assets (
          asset_tag, name, category, manufacturer, model, serial_number,
          purchase_date, purchase_price, supplier_name, location, department,
          assigned_to_user_id, created_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;`,
        [
          finalTag,
          name.trim(),
          category,
          manufacturer.trim(),
          model.trim(),
          serial_number?.trim() || null,
          purchase_date,
          purchase_price ? parseFloat(purchase_price) : null,
          supplier_name.trim(),
          location?.trim() || null,
          department?.trim() || null,
          assigned_to_user_id || null,
          user.id,
        ]
      );

      const newAsset = assetRes.rows[0];

      // 2. Insert initial warranty if dates provided
      if (warranty_start_date && warranty_end_date) {
        if (new Date(warranty_end_date) < new Date(warranty_start_date)) {
          throw new Error('Warranty End Date cannot be before Warranty Start Date.');
        }

        await client.query(
          `INSERT INTO warranties (asset_id, warranty_provider, start_date, end_date)
           VALUES ($1, $2, $3, $4);`,
          [newAsset.id, warranty_provider?.trim() || null, warranty_start_date, warranty_end_date]
        );
      }

      // 3. If initially assigned, record into ledger
      if (assigned_to_user_id) {
        await client.query(
          `INSERT INTO asset_maintenance_ledger (
            asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
          ) VALUES ($1, 'ASSET_INITIAL_ASSIGNMENT', $2, NULL, $3, $4);`,
          [
            newAsset.id,
            `Asset initialized and assigned during creation by ${user.full_name}.`,
            assigned_to_user_id,
            user.id,
          ]
        );
      }

      return newAsset;
    });

    return NextResponse.json({ success: true, asset: result });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied. Facility Managers only.' }, { status: 403 });
    }
    console.error('Create asset error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create asset.' }, { status: 500 });
  }
}
