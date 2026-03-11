-- Migrate is_admin boolean to role varchar for databases created before the role column was introduced
-- Run once: npm run db:migrate:role

BEGIN;

DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
  END IF;

  -- Migrate is_admin = true to role = 'admin' (only if is_admin column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    UPDATE users SET role = 'admin' WHERE is_admin = TRUE AND (role IS NULL OR role = 'user');
    ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
  END IF;
END $$;

COMMIT;
