-- ============================================================
-- ANBU Database Schema
-- ============================================================

-- ── Custom enum types ──

CREATE TYPE user_role AS ENUM ('anbu', 'chef_anbu');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'deactivated');
CREATE TYPE code_status AS ENUM ('available', 'used', 'revoked');
CREATE TYPE village_type AS ENUM ('konoha', 'suna', 'kiri', 'oto', 'nukenin', 'samurai', 'deserteur');
CREATE TYPE status_badge_type AS ENUM ('surveillance', 'traque', 'mort');

-- ── Extension for uuid generation ──
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- ── Users ──
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rp_name text NOT NULL,
  codename text NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'anbu',
  status user_status NOT NULL DEFAULT 'pending',
  registration_code_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partial unique index: codename unique among non-deactivated accounts
CREATE UNIQUE INDEX idx_users_codename_active
  ON users (codename)
  WHERE status != 'deactivated';

-- ── Registration Codes ──
CREATE TABLE registration_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status code_status NOT NULL DEFAULT 'available',
  generated_by uuid REFERENCES users(id),
  used_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

-- FK from users to registration_codes (added after both tables exist)
ALTER TABLE users
  ADD CONSTRAINT fk_users_registration_code
  FOREIGN KEY (registration_code_id) REFERENCES registration_codes(id);

-- ── Ninja Records ──
CREATE TABLE ninja_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  village village_type NOT NULL,
  photo_url text,
  status_badge status_badge_type,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Ninja Intel ──
CREATE TABLE ninja_intel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ninja_record_id uuid NOT NULL REFERENCES ninja_records(id) ON DELETE CASCADE,
  content text NOT NULL,
  submitted_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Ninja Photos ──
CREATE TABLE ninja_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ninja_record_id uuid NOT NULL REFERENCES ninja_records(id) ON DELETE CASCADE,
  imgur_url text NOT NULL,
  added_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Personal Reports ──
CREATE TABLE personal_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_ninja_records_village ON ninja_records(village);
CREATE INDEX idx_ninja_records_status_badge ON ninja_records(status_badge);
CREATE INDEX idx_ninja_intel_record ON ninja_intel(ninja_record_id);
CREATE INDEX idx_ninja_photos_record ON ninja_photos(ninja_record_id);
CREATE INDEX idx_personal_reports_user ON personal_reports(user_id);
CREATE INDEX idx_registration_codes_status ON registration_codes(status);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ninja_records_updated_at
  BEFORE UPDATE ON ninja_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_personal_reports_updated_at
  BEFORE UPDATE ON personal_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_reports ENABLE ROW LEVEL SECURITY;

-- Helper: extract user id from JWT
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper: get user role from JWT claims
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_role', '')::user_role;
$$ LANGUAGE sql STABLE;

-- ── Users policies ──
-- Users can read non-sensitive fields of active users
CREATE POLICY users_select ON users
  FOR SELECT USING (true);

-- Only chef_anbu can update users
CREATE POLICY users_update ON users
  FOR UPDATE USING (auth_user_role() = 'chef_anbu');

-- ── Registration Codes policies ──
CREATE POLICY codes_select ON registration_codes
  FOR SELECT USING (auth_user_role() = 'chef_anbu');

CREATE POLICY codes_insert ON registration_codes
  FOR INSERT WITH CHECK (auth_user_role() = 'chef_anbu');

CREATE POLICY codes_update ON registration_codes
  FOR UPDATE USING (auth_user_role() = 'chef_anbu');

-- ── Ninja Records policies ──
-- Any active user can read
CREATE POLICY ninja_records_select ON ninja_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

-- Any active user can insert
CREATE POLICY ninja_records_insert ON ninja_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

-- Any active user can update (for status_badge changes)
CREATE POLICY ninja_records_update ON ninja_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

-- Only chef_anbu can delete
CREATE POLICY ninja_records_delete ON ninja_records
  FOR DELETE USING (auth_user_role() = 'chef_anbu');

-- ── Ninja Intel policies ──
CREATE POLICY ninja_intel_select ON ninja_intel
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

CREATE POLICY ninja_intel_insert ON ninja_intel
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

CREATE POLICY ninja_intel_delete ON ninja_intel
  FOR DELETE USING (auth_user_role() = 'chef_anbu');

-- ── Ninja Photos policies ──
CREATE POLICY ninja_photos_select ON ninja_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

CREATE POLICY ninja_photos_insert ON ninja_photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth_user_id() AND status = 'active')
  );

-- ── Personal Reports policies ──
-- Own reports OR chef_anbu can read all
CREATE POLICY reports_select ON personal_reports
  FOR SELECT USING (
    user_id = auth_user_id() OR auth_user_role() = 'chef_anbu'
  );

CREATE POLICY reports_insert ON personal_reports
  FOR INSERT WITH CHECK (user_id = auth_user_id());

CREATE POLICY reports_update ON personal_reports
  FOR UPDATE USING (user_id = auth_user_id());

CREATE POLICY reports_delete ON personal_reports
  FOR DELETE USING (user_id = auth_user_id());
