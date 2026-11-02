import { query } from './db';

/**
 * Idempotently evaluates all warranties against CURRENT_DATE and ensures
 * in-app alerts exist for active Facility Managers if an existing warranty
 * has naturally reached the 30-day window or expired without requiring DML edits.
 *
 * Enforces deduplication using the UNIQUE(user_id, dedupe_key) database constraint.
 */
export async function syncWarrantyNotifications(): Promise<number> {
  const syncSql = `
    INSERT INTO notifications (user_id, asset_id, type, message, dedupe_key)
    SELECT 
      u.id AS user_id,
      w.asset_id,
      CASE 
        WHEN w.end_date < CURRENT_DATE THEN 'WARRANTY_EXPIRED'
        ELSE 'WARRANTY_EXPIRING'
      END AS type,
      CASE 
        WHEN w.end_date < CURRENT_DATE THEN 
          'URGENT: Warranty for asset ' || COALESCE(a.name, 'Equipment') || ' (' || COALESCE(a.asset_tag, '') || ') expired on ' || w.end_date
        ELSE 
          'ATTENTION: Warranty for asset ' || COALESCE(a.name, 'Equipment') || ' (' || COALESCE(a.asset_tag, '') || ') expires in ' || (w.end_date - CURRENT_DATE) || ' days (' || w.end_date || ')'
      END AS message,
      CASE 
        WHEN w.end_date < CURRENT_DATE THEN 
          'WARRANTY_EXPIRED:' || w.asset_id || ':' || w.end_date
        ELSE 
          'WARRANTY_EXPIRING:' || w.asset_id || ':' || w.end_date
      END AS dedupe_key
    FROM warranties w
    JOIN assets a ON w.asset_id = a.id
    CROSS JOIN users u
    WHERE u.role = 'FACILITY_MANAGER' 
      AND u.is_active = TRUE
      AND w.end_date <= CURRENT_DATE + INTERVAL '30 days'
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  `;

  const res = await query(syncSql);
  return res.rowCount || 0;
}
