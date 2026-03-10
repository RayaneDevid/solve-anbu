// ── User ──
export type UserRole = 'anbu' | 'chef_anbu';
export type UserStatus = 'pending' | 'active' | 'deactivated';

export interface User {
  id: string;
  rp_name: string;
  codename: string;
  role: UserRole;
  status: UserStatus;
  registration_code_id: string;
  created_at: string;
  updated_at: string;
}

// ── Registration Codes ──
export type CodeStatus = 'available' | 'used' | 'revoked';

export interface RegistrationCode {
  id: string;
  code: string;
  status: CodeStatus;
  generated_by: string;
  used_by: string | null;
  created_at: string;
  used_at: string | null;
}

// ── Ninja Records ──
export type Village = 'konoha' | 'suna' | 'kiri' | 'oto' | 'nukenin' | 'samurai' | 'deserteur';
export type StatusBadge = 'surveillance' | 'traque' | 'mort';

export interface NinjaRecord {
  id: string;
  name: string;
  village: Village;
  photo_url: string | null;
  status_badge: StatusBadge | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Ninja Intel ──
export interface NinjaIntel {
  id: string;
  ninja_record_id: string;
  content: string;
  submitted_by: string;
  created_at: string;
  // Joined field
  submitter_codename?: string | null;
}

// ── Ninja Photos ──
export interface NinjaPhoto {
  id: string;
  ninja_record_id: string;
  imgur_url: string;
  added_by: string;
  created_at: string;
}

// ── Personal Reports ──
export interface PersonalReport {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
