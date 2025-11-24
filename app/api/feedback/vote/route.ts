import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import pool from '../../../../lib/utils/db';

// POST - Vote on a feedback submission (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { feedbackId, voteType } = body;

    // Validation
    if (!feedbackId || typeof feedbackId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid feedback ID is required' },
        { status: 400 }
      );
    }

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Vote type must be either "upvote" or "downvote"' },
        { status: 400 }
      );
    }

    // Check if feedback exists and is approved
    const feedbackCheck = await pool.query(
      'SELECT id, is_approved FROM feedback_submissions WHERE id = $1',
      [feedbackId]
    );

    if (feedbackCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (!feedbackCheck.rows[0].is_approved) {
      return NextResponse.json(
        { success: false, error: 'Cannot vote on unapproved feedback' },
        { status: 403 }
      );
    }

    // Upsert vote (insert or update if already exists)
    await pool.query(
      `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (feedback_id, user_id)
       DO UPDATE SET vote_type = $3, created_at = NOW()`,
      [feedbackId, session.user.id, voteType]
    );

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

// DELETE - Remove vote from a feedback submission
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    await pool.query(
      'DELETE FROM feedback_votes WHERE feedback_id = $1 AND user_id = $2',
      [parseInt(feedbackId), session.user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully'
    });

  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
}

// GET - Get user's votes (for showing which items the user has voted on)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      'SELECT feedback_id, vote_type FROM feedback_votes WHERE user_id = $1',
      [session.user.id]
    );

    // Convert to a map for easy lookup
    const votes: Record<number, string> = {};
    result.rows.forEach(row => {
      votes[row.feedback_id] = row.vote_type;
    });

    return NextResponse.json({
      success: true,
      votes
    });

  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}
