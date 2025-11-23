import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";
import { TIG_BAN_DURATIONS } from "../../../lib/utils/TIG_list";
import { calculateCancelBanDuration } from "../../../lib/utils/TIG_list";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const json = await req.json();
    const { reason, intra } = json;

    const client = await pool.connect();

    try {
      // Check if the player exists and belongs to the current user
      const playerCheck = await client.query(
        "SELECT name, intra, user_id, created_at FROM players WHERE intra = $1",
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

      // Check if within 15-minute grace period for no-ban removal
      const registrationTime = new Date(player.created_at);
      const now = new Date();
      const minutesSinceRegistration = (now.getTime() - registrationTime.getTime()) / (1000 * 60);

      if (!reason && minutesSinceRegistration <= 15) {
        // No-ban removal within 15 minutes
        await client.query("DELETE FROM players WHERE intra = $1", [intra]);

        await logAdminAction(
          session.user.id,
          'self_remove_no_ban',
          intra,
          player.name,
          `Self-removed within 15-minute grace period (no ban applied)`
        );

        return NextResponse.json({
          success: true,
          message: `Registration removed successfully (no ban applied - within 15-minute grace period)`,
        }, { status: 200 });
      }

      // Validate reason is provided for ban removal
      if (!reason) {
        return NextResponse.json({ error: "Removal reason is required after 15-minute grace period" }, { status: 400 });
      }

      // Validate reason
      const validReasons = ['CANCEL'];
      if (!validReasons.includes(reason)) {
        return NextResponse.json({ error: "Invalid removal reason for self-removal" }, { status: 400 });
      }

      // Calculate ban duration based on timing
      const banDurationDays = calculateCancelBanDuration();
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banDurationDays);

      // Determine reason text based on when cancellation happened
      const reasonText = banDurationDays === TIG_BAN_DURATIONS.CANCEL_GAME_DAY
        ? "Cancel reservation on game day after 5 PM"
        : "Cancel reservation";

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
