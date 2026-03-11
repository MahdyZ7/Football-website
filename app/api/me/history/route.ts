import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import pool from "../../../../lib/utils/db";
import {
  findLegacyActiveBan,
  findLegacyOwnedRegistration,
} from "../../../../lib/utils/legacyOwnership";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const client = await pool.connect();

    try {
      const currentRegistration = await findLegacyOwnedRegistration(
        client,
        session.user.id
      );
      const activeBan = await findLegacyActiveBan(
        client,
        session.user.id,
        currentRegistration?.intra ?? null
      );
      const reliabilityResult = currentRegistration?.intra
        ? await client.query(
            `SELECT id, event_type, reason, related_ban_until, created_at
             FROM player_reliability_events
             WHERE user_id = $1
                OR (user_id IS NULL AND intra = $2)
             ORDER BY created_at DESC
             LIMIT 20`,
            [session.user.id, currentRegistration.intra]
          )
        : await client.query(
            `SELECT id, event_type, reason, related_ban_until, created_at
             FROM player_reliability_events
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [session.user.id]
          );

      return NextResponse.json({
        currentRegistration,
        activeBan,
        reliabilityEvents: reliabilityResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching player history:", error);
    return NextResponse.json({ error: "Failed to load player history" }, { status: 500 });
  }
}
