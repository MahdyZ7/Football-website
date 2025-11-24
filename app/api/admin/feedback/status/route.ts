import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import pool from '../../../../../lib/utils/db';

// PATCH - Update feedback status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { feedbackId, status } = body;

    // Validation
    if (!feedbackId || typeof feedbackId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid feedback ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'approved', 'rejected', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get feedback details
    const feedbackResult = await pool.query(
      'SELECT id, title, type, status as old_status FROM feedback_submissions WHERE id = $1',
      [feedbackId]
    );

    if (feedbackResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = feedbackResult.rows[0];

    // Update the status
    await pool.query(
      'UPDATE feedback_submissions SET status = $1 WHERE id = $2',
      [status, feedbackId]
    );

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (performed_by_user_id, action, target_info, details)
       VALUES ($1, $2, $3, $4)`,
      [
        session.user.id,
        'update_feedback_status',
        `Feedback #${feedbackId}`,
        `Changed status from "${feedback.old_status}" to "${status}" for ${feedback.type}: "${feedback.title}"`
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback status updated successfully'
    });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
