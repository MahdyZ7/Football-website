-- Site Configuration Tables
-- Single-row config table with JSONB for flexible schema

CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1
);

-- Snapshot/restore point table for config history
CREATE TABLE IF NOT EXISTS site_config_snapshots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  config_version INTEGER NOT NULL,
  is_auto BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_config_snapshots_created ON site_config_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_snapshots_auto ON site_config_snapshots(is_auto);
