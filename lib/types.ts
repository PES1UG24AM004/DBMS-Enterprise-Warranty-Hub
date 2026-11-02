export type UserRole = 'FACILITY_MANAGER' | 'TECHNICIAN' | 'VENDOR';

export const ASSET_CATEGORIES = [
  'Computers and Laptops',
  'Printers and Scanners',
  'Mobile Devices',
  'Monitors and Televisions',
  'Kitchen Appliances',
  'Washing Machines',
  'Air Conditioners',
  'Other Electronics',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  'Reported',
  'Assigned',
  'Acknowledged',
  'In Progress',
  'Resolved',
  'Closed',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_WARRANTY';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  serial_number: string | null;
  purchase_date: string;
  purchase_price: number | null;
  supplier_name: string;
  location: string | null;
  department: string | null;
  assigned_to_user_id: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields from views/queries
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  warranty_id?: string | null;
  warranty_provider?: string | null;
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  warranty_status?: WarrantyStatus;
  days_remaining?: number | null;
}

export interface Warranty {
  id: string;
  asset_id: string;
  warranty_provider: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_code: string;
  asset_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  assignee_user_id: string | null;
  created_by_user_id: string;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  asset_name?: string;
  asset_tag?: string;
  asset_category?: string;
  assignee_name?: string | null;
  assignee_email?: string | null;
  assignee_role?: UserRole | null;
  creator_name?: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  ticket_id: string | null;
  issue_title: string;
  issue_description: string;
  resolution: string;
  performed_by_user_id: string | null;
  record_date: string;
  created_at: string;
  // Extra fields when queried / joined
  asset_name?: string;
  asset_tag?: string;
  asset_category?: string;
  performed_by_name?: string | null;
  similarity?: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  asset_id: string | null;
  ticket_id: string | null;
  type: string;
  message: string;
  dedupe_key: string;
  read_at: string | null;
  created_at: string;
  asset_tag?: string;
  asset_name?: string;
}

export interface LedgerEntry {
  id: string;
  asset_id: string;
  event_type: string;
  details: string;
  previous_assignee_id: string | null;
  new_assignee_id: string | null;
  performed_by_user_id: string;
  created_at: string;
  previous_assignee_name?: string | null;
  new_assignee_name?: string | null;
  performed_by_name?: string | null;
  asset_tag?: string;
  asset_name?: string;
}
