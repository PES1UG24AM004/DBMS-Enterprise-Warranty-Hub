-- Enterprise Warranty Hub (EWH)
-- Migration 001: Initial Database Schema with pgvector, Triggers, and Views

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Clean up existing objects if re-running
DROP VIEW IF EXISTS critical_asset_dashboard CASCADE;
DROP VIEW IF EXISTS asset_warranty_status CASCADE;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('FACILITY_MANAGER', 'TECHNICIAN', 'VENDOR')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'Computers and Laptops',
    'Printers and Scanners',
    'Mobile Devices',
    'Monitors and Televisions',
    'Kitchen Appliances',
    'Washing Machines',
    'Air Conditioners',
    'Other Electronics'
  )),
  manufacturer VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255),
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(12, 2),
  supplier_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  department VARCHAR(255),
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_assets_tag ON assets(asset_tag);

-- 5. Warranties Table (One current warranty per asset)
CREATE TABLE IF NOT EXISTS warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  warranty_provider VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranties_asset_id ON warranties(asset_id);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(end_date);

-- 6. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Reported' CHECK (status IN (
    'Reported',
    'Assigned',
    'Acknowledged',
    'In Progress',
    'Resolved',
    'Closed'
  )),
  assignee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_asset_id ON tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- 7. Maintenance Records Table (Historical knowledge base with pgvector embedding)
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  ticket_id UUID UNIQUE REFERENCES tickets(id) ON DELETE SET NULL,
  dedupe_key VARCHAR(255) UNIQUE,
  issue_title VARCHAR(255) NOT NULL,
  issue_description TEXT NOT NULL,
  resolution TEXT NOT NULL,
  performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  embedding vector(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure dedupe_key column and unique index exist if table was already created
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS dedupe_key VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_records_dedupe ON maintenance_records(dedupe_key);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset ON maintenance_records(asset_id);
-- HNSW index on vector column for cosine distance
CREATE INDEX IF NOT EXISTS idx_maintenance_records_embedding ON maintenance_records 
USING hnsw (embedding vector_cosine_ops);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  dedupe_key VARCHAR(255) NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_notifications_user_dedupe UNIQUE (user_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);

-- 9. Asset Maintenance Ledger Table (Transaction demonstration ledger)
CREATE TABLE IF NOT EXISTS asset_maintenance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  previous_assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  new_assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_asset_id ON asset_maintenance_ledger(asset_id);

-- 10. Trigger Function: updated_at timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
CREATE TRIGGER trg_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_warranties_updated_at ON warranties;
CREATE TRIGGER trg_warranties_updated_at
  BEFORE UPDATE ON warranties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Trigger Function: Automatic Warranty Alert Creation
CREATE OR REPLACE FUNCTION process_warranty_alert()
RETURNS TRIGGER AS $$
DECLARE
  mgr_record RECORD;
  asset_record RECORD;
  v_type VARCHAR(50);
  v_msg TEXT;
  v_key VARCHAR(255);
  days_left INT;
BEGIN
  -- Determine if warranty is expired or expiring within 30 days
  days_left := NEW.end_date - CURRENT_DATE;

  IF NEW.end_date < CURRENT_DATE THEN
    v_type := 'WARRANTY_EXPIRED';
    v_key := 'WARRANTY_EXPIRED:' || NEW.asset_id || ':' || NEW.end_date;
  ELSIF days_left <= 30 AND days_left >= 0 THEN
    v_type := 'WARRANTY_EXPIRING';
    v_key := 'WARRANTY_EXPIRING:' || NEW.asset_id || ':' || NEW.end_date;
  ELSE
    RETURN NEW;
  END IF;

  -- Fetch asset details for message
  SELECT asset_tag, name INTO asset_record FROM assets WHERE id = NEW.asset_id;

  IF v_type = 'WARRANTY_EXPIRED' THEN
    v_msg := 'URGENT: Warranty for asset ' || COALESCE(asset_record.name, 'Equipment') || ' (' || COALESCE(asset_record.asset_tag, '') || ') expired on ' || NEW.end_date;
  ELSE
    v_msg := 'ATTENTION: Warranty for asset ' || COALESCE(asset_record.name, 'Equipment') || ' (' || COALESCE(asset_record.asset_tag, '') || ') expires in ' || days_left || ' days (' || NEW.end_date || ')';
  END IF;

  -- Create in-app notifications for all active FACILITY_MANAGER users
  FOR mgr_record IN SELECT id FROM users WHERE role = 'FACILITY_MANAGER' AND is_active = TRUE LOOP
    INSERT INTO notifications (user_id, asset_id, type, message, dedupe_key)
    VALUES (mgr_record.id, NEW.asset_id, v_type, v_msg, v_key)
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warranty_alert ON warranties;
CREATE TRIGGER trg_warranty_alert
  AFTER INSERT OR UPDATE OF end_date, start_date ON warranties
  FOR EACH ROW
  EXECUTE FUNCTION process_warranty_alert();

-- 12. Database Views

-- View 1: asset_warranty_status
CREATE OR REPLACE VIEW asset_warranty_status AS
SELECT 
  a.id AS asset_id,
  a.asset_tag,
  a.name AS asset_name,
  a.category,
  a.manufacturer,
  a.model,
  a.serial_number,
  a.location,
  a.department,
  a.purchase_date,
  a.purchase_price,
  a.supplier_name,
  a.assigned_to_user_id,
  u.full_name AS assigned_to_name,
  u.email AS assigned_to_email,
  w.id AS warranty_id,
  w.warranty_provider,
  w.start_date AS warranty_start_date,
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
LEFT JOIN users u ON a.assigned_to_user_id = u.id;

-- View 2: critical_asset_dashboard
CREATE OR REPLACE VIEW critical_asset_dashboard AS
SELECT 
  aws.asset_id,
  aws.asset_tag,
  aws.asset_name,
  aws.category,
  aws.location,
  aws.assigned_to_name,
  aws.warranty_provider,
  aws.warranty_end_date,
  aws.warranty_status,
  aws.days_remaining,
  COUNT(t.id) FILTER (WHERE t.status NOT IN ('Resolved', 'Closed'))::INT AS open_tickets_count,
  COALESCE(
    ARRAY_AGG(t.ticket_code) FILTER (WHERE t.status NOT IN ('Resolved', 'Closed')),
    ARRAY[]::VARCHAR[]
  ) AS open_ticket_codes
FROM asset_warranty_status aws
LEFT JOIN tickets t ON aws.asset_id = t.asset_id
WHERE aws.warranty_status IN ('EXPIRING_SOON', 'EXPIRED')
   OR (t.id IS NOT NULL AND t.status NOT IN ('Resolved', 'Closed'))
GROUP BY 
  aws.asset_id, aws.asset_tag, aws.asset_name, aws.category,
  aws.location, aws.assigned_to_name, aws.warranty_provider,
  aws.warranty_end_date, aws.warranty_status, aws.days_remaining;
