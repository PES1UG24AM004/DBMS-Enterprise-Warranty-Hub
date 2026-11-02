import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { withTransaction } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['FACILITY_MANAGER']);
    const assetId = params.id;
    const body = await req.json();
    const { new_assignee_id, simulate_failure } = body;

    // Start database transaction
    const outcome = await withTransaction(async (client) => {
      // 1. Fetch current asset status and previous assignee
      const assetCheck = await client.query(
        'SELECT id, asset_tag, name, assigned_to_user_id FROM assets WHERE id = $1 FOR UPDATE;',
        [assetId]
      );

      if (assetCheck.rows.length === 0) {
        throw new Error('Asset not found.');
      }

      const asset = assetCheck.rows[0];
      const previousAssigneeId = asset.assigned_to_user_id;

      // 2. Validate new assignee if provided
      let newAssigneeName = 'Unassigned';
      if (new_assignee_id) {
        const userCheck = await client.query(
          'SELECT id, full_name, is_active FROM users WHERE id = $1;',
          [new_assignee_id]
        );
        if (userCheck.rows.length === 0) {
          throw new Error('Selected assignee does not exist.');
        }
        if (!userCheck.rows[0].is_active) {
          throw new Error('Cannot assign asset to an inactive user.');
        }
        newAssigneeName = userCheck.rows[0].full_name;
      }

      // Intentional transaction failure simulation for DBMS demonstration if requested
      if (simulate_failure) {
        throw new Error('SIMULATED_TRANSACTION_FAILURE: Forced error to demonstrate ROLLBACK behavior.');
      }

      // 3. Update asset's assigned_to_user_id
      await client.query(
        'UPDATE assets SET assigned_to_user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
        [new_assignee_id || null, assetId]
      );

      // 4. Insert corresponding ledger audit entry
      const detailMsg = new_assignee_id
        ? `Reassigned to ${newAssigneeName} by ${user.full_name}.`
        : `De-assigned (unallocated) by ${user.full_name}.`;

      const ledgerRes = await client.query(
        `INSERT INTO asset_maintenance_ledger (
          asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
        ) VALUES ($1, 'ASSET_REASSIGNED', $2, $3, $4, $5)
        RETURNING id, created_at;`,
        [assetId, detailMsg, previousAssigneeId, new_assignee_id || null, user.id]
      );

      return {
        asset_id: assetId,
        asset_tag: asset.asset_tag,
        previous_assignee_id: previousAssigneeId,
        new_assignee_id: new_assignee_id || null,
        new_assignee_name: newAssigneeName,
        ledger_entry_id: ledgerRes.rows[0].id,
        timestamp: ledgerRes.rows[0].created_at,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Asset reassigned and ledger updated atomically within PostgreSQL transaction.',
      transaction: outcome,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied. Facility Managers only.' }, { status: 403 });
    }
    console.error('Asset assignment transaction error (rolled back):', err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        rolled_back: true,
      },
      { status: 400 }
    );
  }
}
