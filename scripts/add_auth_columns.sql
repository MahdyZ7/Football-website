-- Add user_id foreign key to players table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE players ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX players_user_id_idx ON players(user_id);
  END IF;
END $$;

-- Add user_id foreign key to banned_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banned_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE banned_users ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX banned_users_user_id_idx ON banned_users(user_id);
  END IF;
END $$;

-- Add performed_by_user_id foreign key to admin_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'performed_by_user_id'
  ) THEN
    ALTER TABLE admin_logs ADD COLUMN performed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX admin_logs_performed_by_idx ON admin_logs(performed_by_user_id);
  END IF;
END $$;
