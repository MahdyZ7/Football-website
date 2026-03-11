import { Pool, PoolClient } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

async function countRows(client: PoolClient, query: string) {
  const result = await client.query<{ total: number }>(query);
  return Number(result.rows[0]?.total ?? 0);
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const beforePlayers = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM players WHERE user_id IS NULL"
    );
    const beforeBans = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM banned_users WHERE user_id IS NULL"
    );
    const beforeEvents = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM player_reliability_events WHERE user_id IS NULL"
    );

    const playerByEmailLocal = await client.query(
      `WITH unique_email_matches AS (
         SELECT p.intra, MIN(u.id) AS user_id
         FROM players p
         JOIN users u
           ON LOWER(p.intra) = LOWER(SPLIT_PART(u.email, '@', 1))
         WHERE p.user_id IS NULL
         GROUP BY p.intra
         HAVING COUNT(*) = 1
       )
       UPDATE players p
       SET user_id = m.user_id
       FROM unique_email_matches m
       WHERE p.intra = m.intra
         AND p.user_id IS NULL`
    );

    const bansByPlayer = await client.query(
      `UPDATE banned_users b
       SET user_id = p.user_id
       FROM players p
       WHERE b.user_id IS NULL
         AND p.user_id IS NOT NULL
         AND b.id = p.intra`
    );

    const eventsByPlayer = await client.query(
      `UPDATE player_reliability_events e
       SET user_id = p.user_id
       FROM players p
       WHERE e.user_id IS NULL
         AND p.user_id IS NOT NULL
         AND e.intra = p.intra`
    );

    const afterPlayers = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM players WHERE user_id IS NULL"
    );
    const afterBans = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM banned_users WHERE user_id IS NULL"
    );
    const afterEvents = await countRows(
      client,
      "SELECT COUNT(*)::int AS total FROM player_reliability_events WHERE user_id IS NULL"
    );

    await client.query("COMMIT");

    console.log("Legacy user-link migration completed.");
    console.log(
      `Players linked: ${beforePlayers - afterPlayers} (${playerByEmailLocal.rowCount ?? 0} by email local-part)`
    );
    console.log(
      `Bans linked: ${beforeBans - afterBans} (${bansByPlayer.rowCount ?? 0} via linked players)`
    );
    console.log(
      `Reliability events linked: ${beforeEvents - afterEvents} (${eventsByPlayer.rowCount ?? 0} via linked players)`
    );

    if (afterPlayers > 0 || afterBans > 0 || afterEvents > 0) {
      console.log("Unlinked legacy rows remain and now require explicit manual review.");
      console.log("Use: npm run db:repair:legacy-links report");

      const samples = await Promise.all([
        client.query(
          `SELECT intra, name
           FROM players
           WHERE user_id IS NULL
           ORDER BY created_at DESC
           LIMIT 5`
        ),
        client.query(
          `SELECT id AS intra, name, reason
           FROM banned_users
           WHERE user_id IS NULL
           ORDER BY banned_at DESC
           LIMIT 5`
        ),
        client.query(
          `SELECT intra, event_type, created_at
           FROM player_reliability_events
           WHERE user_id IS NULL
           ORDER BY created_at DESC
           LIMIT 5`
        ),
      ]);

      console.log("Sample unlinked players:", samples[0].rows);
      console.log("Sample unlinked bans:", samples[1].rows);
      console.log("Sample unlinked events:", samples[2].rows);
      console.log(`Remaining counts => players: ${afterPlayers}, bans: ${afterBans}, events: ${afterEvents}`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Legacy user-link migration failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void main();
