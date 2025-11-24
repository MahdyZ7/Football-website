import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import pool from '../../../lib/utils/db';

// GET - Fetch approved feedback submissions (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // Optional filter by type

    let query = `
      SELECT
        fs.id,
        fs.type,
        fs.title,
        fs.description,
        fs.status,
        fs.created_at,
        fs.updated_at,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 WHEN fv.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_score
      FROM feedback_submissions fs
      LEFT JOIN feedback_votes fv ON fs.id = fv.feedback_id
      WHERE fs.is_approved = true
    `;

    const params: string[] = [];

    if (type && ['feature', 'bug', 'feedback'].includes(type)) {
      params.push(type);
      query += ` AND fs.type = $${params.length}`;
    }

    query += `
      GROUP BY fs.id
      ORDER BY vote_score DESC, fs.created_at DESC
    `;

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      submissions: result.rows
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST - Submit new feedback (authenticated users only)
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
    const { type, title, description } = body;

    // Validation
    if (!type || !['feature', 'bug', 'feedback'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback type. Must be: feature, bug, or feedback' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0 || title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title is required and must be less than 200 characters' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    // Insert feedback submission
    const result = await pool.query(
      `INSERT INTO feedback_submissions (user_id, type, title, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, title, description, status, created_at`,
      [session.user.id, type, title.trim(), description.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. It will be visible once approved by an admin.',
      submission: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
