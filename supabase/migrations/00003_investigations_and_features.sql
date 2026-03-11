-- ============================================================
-- New features: investigations, edit intel, change password
-- ============================================================

-- ── Investigations (forums d'enquête) ──

CREATE TABLE investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  photo_url text,
  status_badge status_badge_type,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE investigation_intel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  content text NOT NULL,
  submitted_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE investigation_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  imgur_url text NOT NULL,
  added_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add updated_at to ninja_intel for edit tracking
ALTER TABLE ninja_intel ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX idx_investigations_created_at ON investigations(created_at);
CREATE INDEX idx_investigation_intel_investigation ON investigation_intel(investigation_id);
CREATE INDEX idx_investigation_photos_investigation ON investigation_photos(investigation_id);

-- Auto-update triggers
CREATE TRIGGER trg_investigations_updated_at
  BEFORE UPDATE ON investigations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_investigation_intel_updated_at
  BEFORE UPDATE ON investigation_intel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ninja_intel_updated_at
  BEFORE UPDATE ON ninja_intel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
