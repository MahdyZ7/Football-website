import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/utils/db';
import { logAdminAction } from '../../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../../lib/utils/adminAuth';

// PATCH - Update feedback status (admin only)
export async function PATCH(req: NextRequest) {
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get feedback details
    const feedbackResult = await client.query(
      'SELECT id, title, type, status as old_status FROM feedback_submissions WHERE id = $1 FOR UPDATE',
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

    // Update the status
    await client.query(
      'UPDATE feedback_submissions SET status = $1 WHERE id = $2',
      [status, feedbackId]
    );

    await client.query('COMMIT');

    // Log after commit
    try {
      await logAdminAction(
        admin.userId,
        'update_feedback_status',
        `feedback:${feedbackId}`,
        feedback.title,
        `Changed status from "${feedback.old_status}" to "${status}" for ${feedback.type}: "${feedback.title}"`
      );
    } catch (logError) {
      console.error('Failed to log admin action (status was updated):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback status updated successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating feedback status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
