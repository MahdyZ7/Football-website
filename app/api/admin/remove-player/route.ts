import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../lib/utils/adminAuth';
import { TIG_BAN_DURATIONS } from '../../../../lib/utils/TIG_list';
import { recordReliabilityEvent } from '../../../../lib/utils/playerHistory';
import { sendRegistrationStatusNotifications } from '../../../../lib/utils/notifications';
import {
  acquireRegistrationLock,
  reconcileRegistrationOrder,
  RegistrationStatusNotification,
} from '../../../../lib/utils/waitlist';

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { intra, reason } = body;

  if (!intra) {
    return NextResponse.json({ error: 'Intra login is required' }, { status: 400 });
  }

  if (!reason || !Object.keys(TIG_BAN_DURATIONS).includes(reason)) {
    return NextResponse.json({ error: 'Valid TIG reason is required' }, { status: 400 });
  }

  const client = await pool.connect();
  let statusNotifications: RegistrationStatusNotification[] = [];
  let player: { name: string; intra: string; user_id: string | null; registration_status: string };
  let wasNoBan = false;
  let reasonText = '';
  let banDurationDays = 0;
  let bannedUntil: Date | null = null;

  try {
    await client.query('BEGIN');
    await acquireRegistrationLock(client);

    // Get player info before deletion
    const playerResult = await client.query(
      'SELECT name, intra, user_id, registration_status FROM players WHERE intra = $1 FOR UPDATE',
      [intra]
    );

    if (playerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    player = playerResult.rows[0];

    // Delete the player
    await client.query('DELETE FROM players WHERE intra = $1', [intra]);
    statusNotifications = await reconcileRegistrationOrder(client);

    // If NO_BAN, just remove without banning
    if (reason === 'NO_BAN') {
      await recordReliabilityEvent(client, {
        intra: player.intra,
        userId: player.user_id,
        eventType: 'admin_removed',
        reason: 'Admin removed player without ban',
      });
      wasNoBan = true;
      await client.query('COMMIT');
    } else {
      // Calculate ban duration for admin-only reasons
      banDurationDays = TIG_BAN_DURATIONS[reason as keyof typeof TIG_BAN_DURATIONS];
      bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banDurationDays);

      // Get reason text
      const reasonKey = reason as keyof typeof TIG_BAN_DURATIONS;
      const reasonTextMap: Record<keyof typeof TIG_BAN_DURATIONS, string> = {
        NOT_READY: "Not ready when booking time starts",
        CANCEL: "Cancel reservation",
        CANCEL_GAME_DAY: "Cancel reservation on game day after 5 PM",
        LATE: "Late > 15 minutes",
        NO_SHOW: "No Show without notice",
        NO_BAN: "Removed without ban"
      };
      reasonText = reasonTextMap[reasonKey];

      // Add to banned users
      await client.query(
        `INSERT INTO banned_users (id, name, reason, banned_until, user_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           reason = EXCLUDED.reason,
           banned_until = EXCLUDED.banned_until,
           user_id = EXCLUDED.user_id`,
        [player.intra, player.name, reasonText, bannedUntil, player.user_id]
      );

      await recordReliabilityEvent(client, {
        intra: player.intra,
        userId: player.user_id,
        eventType: 'admin_removed',
        reason: reasonText,
        relatedBanUntil: bannedUntil,
      });
      await recordReliabilityEvent(client, {
        intra: player.intra,
        userId: player.user_id,
        eventType: 'ban_applied',
        reason: reasonText,
        relatedBanUntil: bannedUntil,
      });

      await client.query('COMMIT');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }

  // Post-commit logging and notifications (non-critical)
  try {
    if (wasNoBan) {
      await logAdminAction(
        admin.userId,
        'player_removed_by_admin_no_ban',
        player!.intra,
        player!.name,
        `Admin removed player without ban`
      );
    } else {
      await logAdminAction(
        admin.userId,
        'player_removed_by_admin',
        player!.intra,
        player!.name,
        `Admin removed player and applied TIG ban: ${reasonText} (${banDurationDays} days)`
      );
    }
    await sendRegistrationStatusNotifications(statusNotifications);
  } catch (postCommitError) {
    console.error('Post-commit operations failed (player was removed):', postCommitError);
  }

  if (wasNoBan) {
    return NextResponse.json({
      success: true,
      message: `Player ${player!.name} removed successfully (no ban applied)`
    }, { status: 200 });
  }

  return NextResponse.json({
    success: true,
    message: `Player ${player!.name} removed and banned until ${bannedUntil!.toLocaleDateString()}`
  }, { status: 200 });
}
