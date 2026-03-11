import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../lib/utils/adminAuth';

// GET - Fetch all tournament votes with voter details (admin only)
export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const awardType = searchParams.get('awardType');
    const playerName = searchParams.get('playerName');

    let query = `
      SELECT
        tv.id,
        tv.award_type,
        tv.player_name,
        tv.player_team,
        tv.rank,
        tv.created_at,
        tv.updated_at,
        u.id as voter_id,
        u.name as voter_name,
        u.email as voter_email
      FROM tournament_award_votes tv
      JOIN users u ON tv.user_id = u.id
      WHERE 1=1
    `;

    const params: string[] = [];

    if (awardType && ['best_player', 'best_goalkeeper'].includes(awardType)) {
      params.push(awardType);
      query += ` AND tv.award_type = $${params.length}`;
    }

    if (playerName && playerName.trim().length > 0) {
      params.push(`%${playerName.trim()}%`);
      query += ` AND tv.player_name ILIKE $${params.length}`;
    }

    query += ` ORDER BY tv.award_type, tv.player_name, tv.rank, tv.created_at DESC`;

    const result = await pool.query(query, params);

    // Get summary statistics with weighted scoring (1st=4pts, 2nd=2pts, 3rd=1pt)
    const summaryResult = await pool.query(`
      SELECT
        award_type,
        player_name,
        player_team,
        SUM(CASE rank WHEN 1 THEN 4 WHEN 2 THEN 2 WHEN 3 THEN 1 ELSE 0 END) as weighted_score,
        COUNT(*) as vote_count,
        SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as first_place,
        SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) as second_place,
        SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) as third_place
      FROM tournament_award_votes
      GROUP BY award_type, player_name, player_team
      ORDER BY award_type, weighted_score DESC, first_place DESC
    `);

    // Group summary by award type
    const summary: Record<string, Array<{
      playerName: string;
      playerTeam: string;
      voteCount: number;
      score: number;
      firstPlace: number;
      secondPlace: number;
      thirdPlace: number;
    }>> = {
      best_player: [],
      best_goalkeeper: [],
    };

    summaryResult.rows.forEach(row => {
      summary[row.award_type].push({
        playerName: row.player_name,
        playerTeam: row.player_team,
        voteCount: parseInt(row.vote_count),
        score: parseInt(row.weighted_score) || 0,
        firstPlace: parseInt(row.first_place) || 0,
        secondPlace: parseInt(row.second_place) || 0,
        thirdPlace: parseInt(row.third_place) || 0,
      });
    });

    // Get total vote counts
    const totalResult = await pool.query(`
      SELECT
        award_type,
        COUNT(*) as total
      FROM tournament_award_votes
      GROUP BY award_type
    `);

    const totals: Record<string, number> = {
      best_player: 0,
      best_goalkeeper: 0,
    };

    totalResult.rows.forEach(row => {
      totals[row.award_type] = parseInt(row.total);
    });

    return NextResponse.json({
      success: true,
      votes: result.rows,
      summary,
      totals,
    });

  } catch (error) {
    console.error('Error fetching admin tournament votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// DELETE - Remove all votes for a user for an award type (admin only, for moderation)
export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const voterId = searchParams.get('voterId');
  const awardType = searchParams.get('awardType');

  if (!voterId || !awardType) {
    return NextResponse.json(
      { success: false, error: 'voterId and awardType are required' },
      { status: 400 }
    );
  }

  if (!['best_player', 'best_goalkeeper'].includes(awardType)) {
    return NextResponse.json(
      { success: false, error: 'Invalid award type' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get voter details and their votes for logging
    const voterResult = await client.query(
      `SELECT u.name as voter_name, u.email as voter_email
       FROM users u
       WHERE u.id = $1`,
      [voterId]
    );

    if (voterResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Voter not found' },
        { status: 404 }
      );
    }

    const voter = voterResult.rows[0];

    // Get the votes that will be deleted for logging
    const votesToDelete = await client.query(
      `SELECT player_name, rank FROM tournament_award_votes
       WHERE user_id = $1 AND award_type = $2
       ORDER BY rank`,
      [voterId, awardType]
    );

    if (votesToDelete.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'No votes found for this user and award type' },
        { status: 404 }
      );
    }

    // Build details string
    const voteDetails = votesToDelete.rows
      .map(v => `${v.rank === 1 ? '1st' : v.rank === 2 ? '2nd' : '3rd'}: ${v.player_name}`)
      .join(', ');

    // Delete all votes for this user and award type
    await client.query(
      'DELETE FROM tournament_award_votes WHERE user_id = $1 AND award_type = $2',
      [voterId, awardType]
    );

    await client.query('COMMIT');

    // Log after commit
    try {
      await logAdminAction(
        admin.userId,
        'delete_tournament_votes',
        voterId,
        voter.voter_name || voter.voter_email || 'Unknown voter',
        `Removed all ${awardType.replace('_', ' ')} votes: ${voteDetails}`
      );
    } catch (logError) {
      console.error('Failed to log admin action (votes were deleted):', logError);
    }

    return NextResponse.json({
      success: true,
      message: `All ${awardType.replace('_', ' ')} votes removed for ${voter.voter_name}`,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing tournament votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove votes' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
