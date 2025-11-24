import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrateFeedback() {
  const client = await pool.connect();

  try {
    console.log('Starting feedback system migration...\n');

    await client.query('BEGIN');

    // Create feedback_submissions table
    console.log('Creating feedback_submissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback_submissions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug', 'feedback')),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
        is_approved BOOLEAN NOT NULL DEFAULT false,
        approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ feedback_submissions table created');

    // Create feedback_votes table
    console.log('Creating feedback_votes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback_votes (
        id SERIAL PRIMARY KEY,
        feedback_id INTEGER NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(feedback_id, user_id)
      )
    `);
    console.log('✓ feedback_votes table created');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback_submissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_feedback_approved ON feedback_submissions(is_approved);
      CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback_submissions(type);
      CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_votes_feedback ON feedback_votes(feedback_id);
      CREATE INDEX IF NOT EXISTS idx_votes_user ON feedback_votes(user_id);
    `);
    console.log('✓ Indexes created');

    // Create function to update updated_at timestamp
    console.log('Creating trigger function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_feedback_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_feedback_timestamp ON feedback_submissions;
      CREATE TRIGGER trigger_update_feedback_timestamp
      BEFORE UPDATE ON feedback_submissions
      FOR EACH ROW
      EXECUTE FUNCTION update_feedback_updated_at();
    `);
    console.log('✓ Trigger created');

    await client.query('COMMIT');

    console.log('\n✅ Feedback system migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - feedback_submissions (stores feature requests, bug reports, and feedback)');
    console.log('  - feedback_votes (stores user votes on approved submissions)');
    console.log('\nNext steps:');
    console.log('  1. Restart your development server');
    console.log('  2. Visit /feedback to view and submit feedback');
    console.log('  3. Admins can manage submissions at /admin/feedback');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateFeedback().catch(console.error);
