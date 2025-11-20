import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";

// TIG Ban durations in days based on the rules from home.tsx
const TIG_BAN_DURATIONS = {
  NOT_READY: 3.5, // Half a week
  CANCEL: 7, // One week
  LATE: 7, // One week (late > 15 minutes)
  CANCEL_GAME_DAY: 14, // Two weeks (cancel on game day after 5 PM)
  NO_SHOW: 28, // Four weeks
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const json = await req.json();
    const { reason, intra } = json;

    // Validate reason
    if (!reason || !Object.keys(TIG_BAN_DURATIONS).includes(reason)) {
      return NextResponse.json({ error: "Invalid removal reason" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Check if the player exists and belongs to the current user
      const playerCheck = await client.query(
        "SELECT name, intra, user_id FROM players WHERE intra = $1",
        [intra]
      );

      if (playerCheck.rows.length === 0) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      const player = playerCheck.rows[0];

      // Allow self-removal only (user removing their own registration)
      if (player.user_id !== session.user.id) {
        return NextResponse.json({ error: "You can only remove your own registration" }, { status: 403 });
      }

      // Calculate ban duration
      const banDurationDays = TIG_BAN_DURATIONS[reason as keyof typeof TIG_BAN_DURATIONS];
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banDurationDays);

      // Get reason text
      const reasonKey = reason as keyof typeof TIG_BAN_DURATIONS;
      const reasonTextMap: Record<keyof typeof TIG_BAN_DURATIONS, string> = {
        NOT_READY: "Not ready when booking time starts",
        CANCEL: "Cancel reservation",
        LATE: "Late > 15 minutes",
        CANCEL_GAME_DAY: "Cancel reservation on game day after 5 PM",
        NO_SHOW: "No Show without notice"
      };
      const reasonText = reasonTextMap[reasonKey];

      // Remove player from registered list
      await client.query("DELETE FROM players WHERE intra = $1", [intra]);

      // Add to banned users
      await client.query(
        `INSERT INTO banned_users (id, name, reason, banned_until, user_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           reason = EXCLUDED.reason,
           banned_until = EXCLUDED.banned_until,
           user_id = EXCLUDED.user_id`,
        [intra, player.name, reasonText, bannedUntil, session.user.id]
      );

      // Log the action
      await logAdminAction(
        session.user.id,
        'self_remove',
        intra,
        player.name,
        `Self-removed and auto-banned: ${reasonText} (${banDurationDays} days)`
      );

      return NextResponse.json({
        success: true,
        message: `Registration removed. You are banned until ${bannedUntil.toLocaleDateString()}`,
        bannedUntil: bannedUntil.toISOString()
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in self-removal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
