import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE players
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
      ADD COLUMN IF NOT EXISTS waitlist_position INTEGER,
      ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'players_registration_status_check'
        ) THEN
          ALTER TABLE players
          ADD CONSTRAINT players_registration_status_check
          CHECK (registration_status IN ('confirmed', 'waitlisted'));
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS player_reliability_events (
        id SERIAL PRIMARY KEY,
        intra VARCHAR(255) NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        reason TEXT,
        related_ban_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_generation_history (
        id SERIAL PRIMARY KEY,
        created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        source VARCHAR(50) NOT NULL DEFAULT 'auto_balance',
        team_mode INTEGER NOT NULL CHECK (team_mode IN (2, 3)),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS player_rating_history (
        id SERIAL PRIMARY KEY,
        team_generation_id INTEGER NOT NULL REFERENCES team_generation_history(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        intra VARCHAR(255) NOT NULL,
        player_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        assigned_team VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_outbox (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient_email VARCHAR(255),
        recipient_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
        provider_message_id TEXT,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        sent_at TIMESTAMP WITH TIME ZONE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS players_status_idx ON players(registration_status, created_at ASC);
      CREATE INDEX IF NOT EXISTS players_waitlist_position_idx ON players(waitlist_position) WHERE waitlist_position IS NOT NULL;
      CREATE INDEX IF NOT EXISTS player_reliability_user_idx ON player_reliability_events(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS player_reliability_intra_idx ON player_reliability_events(intra, created_at DESC);
      CREATE INDEX IF NOT EXISTS team_generation_created_idx ON team_generation_history(created_at DESC);
      CREATE INDEX IF NOT EXISTS player_rating_history_user_idx ON player_rating_history(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS notification_outbox_status_idx ON notification_outbox(status, created_at DESC);
    `);

    await client.query(`
      WITH ranked_waitlist AS (
        SELECT intra,
               ROW_NUMBER() OVER (ORDER BY created_at ASC, intra ASC) AS waitlist_position
        FROM players
        WHERE registration_status = 'waitlisted'
      )
      UPDATE players p
      SET waitlist_position = ranked_waitlist.waitlist_position
      FROM ranked_waitlist
      WHERE p.intra = ranked_waitlist.intra
    `);

    await client.query("COMMIT");
    console.log("Registration feature migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Registration feature migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

void migrate();
