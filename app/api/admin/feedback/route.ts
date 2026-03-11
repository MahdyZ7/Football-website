import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../lib/utils/adminAuth';

// GET - Fetch all feedback submissions (admin only, includes pending)
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
    const status = searchParams.get('status'); // Optional filter
    const type = searchParams.get('type'); // Optional filter

    let query = `
      SELECT
        fs.id,
        fs.type,
        fs.title,
        fs.description,
        fs.status,
        fs.is_approved,
        fs.approved_at,
        fs.created_at,
        fs.updated_at,
        u.name as submitter_name,
        u.email as submitter_email,
        u.id as submitter_id,
        approver.name as approved_by_name,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 WHEN fv.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_score
      FROM feedback_submissions fs
      JOIN users u ON fs.user_id = u.id
      LEFT JOIN users approver ON fs.approved_by_user_id = approver.id
      LEFT JOIN feedback_votes fv ON fs.id = fv.feedback_id
      WHERE 1=1
    `;

    const params: string[] = [];

    if (status && ['pending', 'approved', 'rejected', 'in_progress', 'completed'].includes(status)) {
      params.push(status);
      query += ` AND fs.status = $${params.length}`;
    }

    if (type && ['feature', 'bug', 'feedback'].includes(type)) {
      params.push(type);
      query += ` AND fs.type = $${params.length}`;
    }

    query += `
      GROUP BY fs.id, u.name, u.email, u.id, approver.name
      ORDER BY
        CASE WHEN fs.status = 'pending' THEN 0 ELSE 1 END,
        fs.created_at DESC
    `;

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      submissions: result.rows
    });

  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a feedback submission (admin only)
export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const feedbackId = searchParams.get('id');

  if (!feedbackId) {
    return NextResponse.json(
      { success: false, error: 'Feedback ID is required' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get feedback details for logging
    const feedbackResult = await client.query(
      'SELECT title, type FROM feedback_submissions WHERE id = $1 FOR UPDATE',
      [parseInt(feedbackId)]
    );

    if (feedbackResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackResult.rows[0];

    // Delete the feedback (cascades to votes)
    await client.query('DELETE FROM feedback_submissions WHERE id = $1', [parseInt(feedbackId)]);

    await client.query('COMMIT');

    // Log after commit
    try {
      await logAdminAction(
        admin.userId,
        'delete_feedback',
        `feedback:${feedbackId}`,
        feedback.title,
        `Deleted ${feedback.type}: "${feedback.title}"`
      );
    } catch (logError) {
      console.error('Failed to log admin action (feedback was deleted):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
