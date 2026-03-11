import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/utils/db';
import { logAdminAction } from '../../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../../lib/utils/adminAuth';

// POST - Approve or reject a feedback submission (admin only)
export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  const { feedbackId, action } = body;

  // Validation
  if (!feedbackId || typeof feedbackId !== 'number') {
    return NextResponse.json(
      { success: false, error: 'Valid feedback ID is required' },
      { status: 400 }
    );
  }

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Action must be either "approve" or "reject"' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get feedback details
    const feedbackResult = await client.query(
      'SELECT id, title, type, status FROM feedback_submissions WHERE id = $1 FOR UPDATE',
      [feedbackId]
    );

    if (feedbackResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackResult.rows[0];

    // Update the feedback
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    await client.query(
      `UPDATE feedback_submissions
       SET status = $1, is_approved = $2, approved_by_user_id = $3, approved_at = NOW()
       WHERE id = $4`,
      [newStatus, isApproved, admin.userId, feedbackId]
    );

    await client.query('COMMIT');

    // Log after commit
    try {
      await logAdminAction(
        admin.userId,
        action === 'approve' ? 'approve_feedback' : 'reject_feedback',
        `feedback:${feedbackId}`,
        feedback.title,
        `${action === 'approve' ? 'Approved' : 'Rejected'} ${feedback.type}: "${feedback.title}"`
      );
    } catch (logError) {
      console.error('Failed to log admin action (feedback was updated):', logError);
    }

    return NextResponse.json({
      success: true,
      message: `Feedback ${action}d successfully`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
