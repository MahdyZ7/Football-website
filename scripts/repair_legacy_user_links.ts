import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

type Command = "report" | "link-player";

function usage() {
  console.log("Usage:");
  console.log("  npm run db:repair:legacy-links report");
  console.log("  npm run db:repair:legacy-links link-player <intra> <userId>");
}

async function report() {
  const client = await pool.connect();

  try {
    const [players, bans, events] = await Promise.all([
      client.query(
        `SELECT intra, name, created_at
         FROM players
         WHERE user_id IS NULL
         ORDER BY created_at DESC`
      ),
      client.query(
        `SELECT id AS intra, name, reason, banned_until
         FROM banned_users
         WHERE user_id IS NULL
         ORDER BY banned_at DESC`
      ),
      client.query(
        `SELECT id, intra, event_type, created_at
         FROM player_reliability_events
         WHERE user_id IS NULL
         ORDER BY created_at DESC`
      ),
    ]);

    console.log(`Unlinked players (${players.rowCount ?? 0}):`, players.rows);
    console.log(`Unlinked bans (${bans.rowCount ?? 0}):`, bans.rows);
    console.log(`Unlinked reliability events (${events.rowCount ?? 0}):`, events.rows);
  } finally {
    client.release();
  }
}

async function linkPlayer(intra: string, userId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT id, email, name
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      throw new Error(`User ${userId} not found.`);
    }

    const playerResult = await client.query(
      `UPDATE players
       SET user_id = $2
       WHERE intra = $1
       RETURNING intra, name`,
      [intra, userId]
    );
    if (playerResult.rows.length === 0) {
      throw new Error(`Player ${intra} not found.`);
    }

    const banResult = await client.query(
      `UPDATE banned_users
       SET user_id = $2
       WHERE id = $1
         AND user_id IS NULL
       RETURNING id`,
      [intra, userId]
    );

    const eventResult = await client.query(
      `UPDATE player_reliability_events
       SET user_id = $2
       WHERE intra = $1
         AND user_id IS NULL
       RETURNING id`,
      [intra, userId]
    );

    await client.query("COMMIT");

    console.log(`Linked player ${intra} to user ${userId}.`);
    console.log(`Updated bans: ${banResult.rowCount ?? 0}`);
    console.log(`Updated reliability events: ${eventResult.rowCount ?? 0}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const [, , rawCommand, ...args] = process.argv;
  const command = rawCommand as Command | undefined;

  if (!command) {
    usage();
    process.exitCode = 1;
    return;
  }

  try {
    if (command === "report") {
      await report();
      return;
    }

    if (command === "link-player") {
      const [intra, userId] = args;
      if (!intra || !userId) {
        throw new Error("link-player requires <intra> <userId>.");
      }

      await linkPlayer(intra, userId);
      return;
    }

    usage();
    process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
