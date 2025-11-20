import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { auth } from '../../../../auth';

// TIG Ban durations in days
const TIG_BAN_DURATIONS = {
  NOT_READY: 3.5,
  CANCEL: 7,
  LATE: 7,
  CANCEL_GAME_DAY: 14,
  NO_SHOW: 28,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { intra, reason } = await req.json();

    if (!intra) {
      return NextResponse.json({ error: 'Intra login is required' }, { status: 400 });
    }

    if (!reason || !Object.keys(TIG_BAN_DURATIONS).includes(reason)) {
      return NextResponse.json({ error: 'Valid TIG reason is required' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Get player info before deletion
      const playerResult = await client.query(
        'SELECT name, intra, user_id FROM players WHERE intra = $1',
        [intra]
      );

      if (playerResult.rows.length === 0) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }

      const player = playerResult.rows[0];

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

      // Delete the player
      await client.query('DELETE FROM players WHERE intra = $1', [intra]);

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

      // Log the admin action
      await logAdminAction(
        session.user.id,
        'player_removed_by_admin',
        player.intra,
        player.name,
        `Admin removed player and applied TIG ban: ${reasonText} (${banDurationDays} days)`
      );

      return NextResponse.json({
        success: true,
        message: `Player ${player.name} removed and banned until ${bannedUntil.toLocaleDateString()}`
      }, { status: 200 });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error removing player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
