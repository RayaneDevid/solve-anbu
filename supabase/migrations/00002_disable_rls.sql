-- ============================================================
-- Disable RLS on all tables
-- Custom auth is handled via Edge Functions + frontend guards
-- ============================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_intel DISABLE ROW LEVEL SECURITY;
ALTER TABLE ninja_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE personal_reports DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS codes_select ON registration_codes;
DROP POLICY IF EXISTS codes_insert ON registration_codes;
DROP POLICY IF EXISTS codes_update ON registration_codes;
DROP POLICY IF EXISTS ninja_records_select ON ninja_records;
DROP POLICY IF EXISTS ninja_records_insert ON ninja_records;
DROP POLICY IF EXISTS ninja_records_update ON ninja_records;
DROP POLICY IF EXISTS ninja_records_delete ON ninja_records;
DROP POLICY IF EXISTS ninja_intel_select ON ninja_intel;
DROP POLICY IF EXISTS ninja_intel_insert ON ninja_intel;
DROP POLICY IF EXISTS ninja_intel_delete ON ninja_intel;
DROP POLICY IF EXISTS ninja_photos_select ON ninja_photos;
DROP POLICY IF EXISTS ninja_photos_insert ON ninja_photos;
DROP POLICY IF EXISTS reports_select ON personal_reports;
DROP POLICY IF EXISTS reports_insert ON personal_reports;
DROP POLICY IF EXISTS reports_update ON personal_reports;
DROP POLICY IF EXISTS reports_delete ON personal_reports;
