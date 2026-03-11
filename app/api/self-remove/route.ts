import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";
import { calculateCancelBanDurationAsync } from "../../../lib/utils/TIG_list";
import { getSiteConfig } from "../../../lib/config/server";
import { recordReliabilityEvent } from "../../../lib/utils/playerHistory";
import { sendRegistrationStatusNotifications } from "../../../lib/utils/notifications";
import {
  acquireRegistrationLock,
  reconcileRegistrationOrder,
  RegistrationStatusNotification,
} from "../../../lib/utils/waitlist";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const json = await req.json();
    const { reason, intra } = json;

    if (!intra || typeof intra !== 'string' || intra.trim().length === 0 || intra.length > 50) {
      return NextResponse.json({ error: "Intra login is required" }, { status: 400 });
    }

    const client = await pool.connect();
    let statusNotifications: RegistrationStatusNotification[] = [];

    try {
      await client.query('BEGIN');
      await acquireRegistrationLock(client);

      // Check if the player exists and belongs to the current user
      const playerCheck = await client.query(
        "SELECT name, intra, user_id, created_at, registration_status FROM players WHERE intra = $1 FOR UPDATE",
        [intra]
      );

      if (playerCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      const player = playerCheck.rows[0];

      // Allow self-removal only (user removing their own registration)
      if (player.user_id !== session.user.id) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: "You can only remove your own registration" }, { status: 403 });
      }

      // Check if within grace period for no-ban removal
      const config = await getSiteConfig();
      const registrationTime = new Date(player.created_at);
      const now = new Date();
      const minutesSinceRegistration = (now.getTime() - registrationTime.getTime()) / (1000 * 60);

      if (!reason && minutesSinceRegistration <= config.gracePeriodMinutes) {
        // No-ban removal within grace period
        await client.query("DELETE FROM players WHERE intra = $1", [intra]);
        statusNotifications = await reconcileRegistrationOrder(client);
        await recordReliabilityEvent(client, {
          intra,
          userId: session.user.id,
          eventType: 'self_cancel',
          reason: `Removed during ${config.gracePeriodMinutes}-minute grace period`,
        });

        await client.query('COMMIT');

        await logAdminAction(
          session.user.id,
          'self_remove_no_ban',
          intra,
          player.name,
          `Self-removed within ${config.gracePeriodMinutes}-minute grace period (no ban applied)`
        );

        await sendRegistrationStatusNotifications(statusNotifications);

        return NextResponse.json({
          success: true,
          message: `Registration removed successfully (no ban applied - within ${config.gracePeriodMinutes}-minute grace period)`,
        }, { status: 200 });
      }

      // Validate reason is provided for ban removal
      if (!reason) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: `Removal reason is required after ${config.gracePeriodMinutes}-minute grace period` }, { status: 400 });
      }

      // Validate reason
      const validReasons = ['CANCEL'];
      if (!validReasons.includes(reason)) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: "Invalid removal reason for self-removal" }, { status: 400 });
      }

      // Calculate ban duration based on timing
      const banDurationDays = await calculateCancelBanDurationAsync();
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banDurationDays);

      // Determine reason text based on when cancellation happened
      const reasonText = banDurationDays === config.banDurations.CANCEL_GAME_DAY
        ? `Cancel reservation on game day after ${config.gameDayBanThresholdHour}:00`
        : "Cancel reservation";

      // Remove player from registered list
      await client.query("DELETE FROM players WHERE intra = $1", [intra]);
      statusNotifications = await reconcileRegistrationOrder(client);

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

      await recordReliabilityEvent(client, {
        intra,
        userId: session.user.id,
        eventType: 'self_cancel',
        reason: reasonText,
        relatedBanUntil: bannedUntil,
      });
      await recordReliabilityEvent(client, {
        intra,
        userId: session.user.id,
        eventType: 'ban_applied',
        reason: reasonText,
        relatedBanUntil: bannedUntil,
      });

      await client.query('COMMIT');

      // Log the action
      await logAdminAction(
        session.user.id,
        'self_remove',
        intra,
        player.name,
        `Self-removed and auto-banned: ${reasonText} (${banDurationDays} days)`
      );

      await sendRegistrationStatusNotifications(statusNotifications);

      return NextResponse.json({
        success: true,
        message: `Registration removed. You are banned until ${bannedUntil.toLocaleDateString()}`,
        bannedUntil: bannedUntil.toISOString()
      }, { status: 200 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in self-removal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
