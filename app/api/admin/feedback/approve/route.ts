import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import pool from '../../../../../lib/utils/db';

// POST - Approve or reject a feedback submission (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
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

    // Get feedback details
    const feedbackResult = await pool.query(
      'SELECT id, title, type, status FROM feedback_submissions WHERE id = $1',
      [feedbackId]
    );

    if (feedbackResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackResult.rows[0];

    // Update the feedback
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    await pool.query(
      `UPDATE feedback_submissions
       SET status = $1, is_approved = $2, approved_by_user_id = $3, approved_at = NOW()
       WHERE id = $4`,
      [newStatus, isApproved, session.user.id, feedbackId]
    );

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (performed_by_user_id, action, target_info, details)
       VALUES ($1, $2, $3, $4)`,
      [
        session.user.id,
        action === 'approve' ? 'approve_feedback' : 'reject_feedback',
        `Feedback #${feedbackId}`,
        `${action === 'approve' ? 'Approved' : 'Rejected'} ${feedback.type}: "${feedback.title}"`
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Feedback ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
