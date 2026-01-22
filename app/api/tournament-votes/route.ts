import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import pool from '../../../lib/utils/db';
import {
  isVotingOpen,
  findEligiblePlayer,
  VOTING_DEADLINE,
} from '../../../lib/constants/tournament';

// Ranked voting points: 1st = 4pts, 2nd = 2pts, 3rd = 1pt
const RANK_POINTS: Record<number, number> = { 1: 4, 2: 2, 3: 1 };

// GET - Get current user's votes and vote tallies (weighted by rank)
export async function GET() {
  try {
    const session = await auth();

    // Get vote tallies with weighted scoring (public)
    const talliesResult = await pool.query(`
      SELECT
        award_type,
        player_name,
        player_team,
        SUM(CASE rank WHEN 1 THEN 4 WHEN 2 THEN 2 WHEN 3 THEN 1 ELSE 0 END) as weighted_score,
        COUNT(*) as vote_count,
        SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as first_place_votes,
        SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) as second_place_votes,
        SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) as third_place_votes
      FROM tournament_award_votes
      GROUP BY award_type, player_name, player_team
      ORDER BY award_type, weighted_score DESC, first_place_votes DESC
    `);

    // Format tallies by award type
    const tallies: Record<string, Array<{
      name: string;
      team: string;
      score: number;
      votes: number;
      firstPlace: number;
      secondPlace: number;
      thirdPlace: number;
    }>> = {
      best_player: [],
      best_goalkeeper: [],
    };

    talliesResult.rows.forEach(row => {
      tallies[row.award_type].push({
        name: row.player_name,
        team: row.player_team,
        score: parseInt(row.weighted_score) || 0,
        votes: parseInt(row.vote_count) || 0,
        firstPlace: parseInt(row.first_place_votes) || 0,
        secondPlace: parseInt(row.second_place_votes) || 0,
        thirdPlace: parseInt(row.third_place_votes) || 0,
      });
    });

    // If user is authenticated, get their ranked votes
    type RankedVote = { playerName: string; playerTeam: string };
    let userVotes: Record<string, { first: RankedVote | null; second: RankedVote | null; third: RankedVote | null }> = {
      best_player: { first: null, second: null, third: null },
      best_goalkeeper: { first: null, second: null, third: null },
    };

    if (session?.user?.id) {
      const userVotesResult = await pool.query(
        'SELECT award_type, player_name, player_team, rank FROM tournament_award_votes WHERE user_id = $1',
        [session.user.id]
      );

      userVotesResult.rows.forEach(row => {
        const rankKey = row.rank === 1 ? 'first' : row.rank === 2 ? 'second' : 'third';
        userVotes[row.award_type][rankKey] = {
          playerName: row.player_name,
          playerTeam: row.player_team,
        };
      });
    }

    return NextResponse.json({
      success: true,
      tallies,
      userVotes,
      isAuthenticated: !!session?.user?.id,
      votingOpen: isVotingOpen(),
      votingDeadline: VOTING_DEADLINE.toISOString(),
      rankPoints: RANK_POINTS,
    });

  } catch (error) {
    console.error('Error fetching tournament votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST - Submit all ranked votes at once (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    // Check if voting is still open
    if (!isVotingOpen()) {
      return NextResponse.json(
        { success: false, error: 'Voting has ended' },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to vote' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { awardType, votes } = body;

    // Validation
    if (!awardType || !['best_player', 'best_goalkeeper'].includes(awardType)) {
      return NextResponse.json(
        { success: false, error: 'Award type must be "best_player" or "best_goalkeeper"' },
        { status: 400 }
      );
    }

    // Votes should be an array of { playerName, playerTeam, rank }
    if (!Array.isArray(votes) || votes.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Must submit exactly 3 ranked votes (1st, 2nd, 3rd)' },
        { status: 400 }
      );
    }

    // Validate each vote and check for duplicates
    const validatedVotes: Array<{ name: string; team: string; rank: number }> = [];
    const seenPlayers = new Set<string>();
    const seenRanks = new Set<number>();

    for (const vote of votes) {
      const { playerName, playerTeam, rank } = vote;

      if (!rank || ![1, 2, 3].includes(rank)) {
        return NextResponse.json(
          { success: false, error: 'Each vote must have rank 1, 2, or 3' },
          { status: 400 }
        );
      }

      if (seenRanks.has(rank)) {
        return NextResponse.json(
          { success: false, error: `Duplicate rank ${rank} in votes` },
          { status: 400 }
        );
      }
      seenRanks.add(rank);

      if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Player name is required for each vote' },
          { status: 400 }
        );
      }

      if (!playerTeam || typeof playerTeam !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Player team is required for each vote' },
          { status: 400 }
        );
      }

      // Find eligible player
      const eligiblePlayer = findEligiblePlayer(playerName, playerTeam, awardType);
      if (!eligiblePlayer) {
        return NextResponse.json(
          { success: false, error: `${playerName} is not eligible for this award` },
          { status: 400 }
        );
      }

      const playerKey = `${eligiblePlayer.name}-${eligiblePlayer.team}`;
      if (seenPlayers.has(playerKey)) {
        return NextResponse.json(
          { success: false, error: `Cannot vote for ${eligiblePlayer.name} more than once` },
          { status: 400 }
        );
      }
      seenPlayers.add(playerKey);

      validatedVotes.push({
        name: eligiblePlayer.name,
        team: eligiblePlayer.team,
        rank,
      });
    }

    // Delete existing votes for this award type and insert new ones in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove all existing votes for this user and award type
      await client.query(
        'DELETE FROM tournament_award_votes WHERE user_id = $1 AND award_type = $2',
        [session.user.id, awardType]
      );

      // Insert all new votes
      for (const vote of validatedVotes) {
        await client.query(
          `INSERT INTO tournament_award_votes (user_id, award_type, player_name, player_team, rank)
           VALUES ($1, $2, $3, $4, $5)`,
          [session.user.id, awardType, vote.name, vote.team, vote.rank]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: 'All votes recorded successfully',
    });

  } catch (error) {
    console.error('Error recording votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record votes' },
      { status: 500 }
    );
  }
}

// DELETE - Remove all votes for an award type (authenticated users only)
export async function DELETE(req: NextRequest) {
  try {
    // Check if voting is still open
    if (!isVotingOpen()) {
      return NextResponse.json(
        { success: false, error: 'Voting has ended' },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const awardType = searchParams.get('awardType');

    if (!awardType || !['best_player', 'best_goalkeeper'].includes(awardType)) {
      return NextResponse.json(
        { success: false, error: 'Valid award type is required' },
        { status: 400 }
      );
    }

    // Remove all votes for this award type
    await pool.query(
      'DELETE FROM tournament_award_votes WHERE user_id = $1 AND award_type = $2',
      [session.user.id, awardType]
    );

    return NextResponse.json({
      success: true,
      message: 'All votes removed successfully',
    });

  } catch (error) {
    console.error('Error removing votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove votes' },
      { status: 500 }
    );
  }
}
