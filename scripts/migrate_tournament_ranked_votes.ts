import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrateToRankedVotes() {
  const client = await pool.connect();

  try {
    console.log('Starting ranked voting system migration...\n');

    await client.query('BEGIN');

    // Check if rank column already exists
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tournament_award_votes' AND column_name = 'rank'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✓ rank column already exists, skipping migration');
      await client.query('COMMIT');
      return;
    }

    // Add rank column (default 1 for existing votes - they become 1st place votes)
    console.log('Adding rank column...');
    await client.query(`
      ALTER TABLE tournament_award_votes
      ADD COLUMN rank INTEGER NOT NULL DEFAULT 1 CHECK (rank IN (1, 2, 3))
    `);
    console.log('✓ rank column added');

    // Drop the old unique constraint
    console.log('Dropping old unique constraint...');
    await client.query(`
      ALTER TABLE tournament_award_votes
      DROP CONSTRAINT IF EXISTS tournament_award_votes_user_id_award_type_key
    `);
    console.log('✓ Old constraint dropped');

    // Create new unique constraint for (user_id, award_type, rank)
    console.log('Creating new unique constraint for ranked votes...');
    await client.query(`
      ALTER TABLE tournament_award_votes
      ADD CONSTRAINT tournament_award_votes_user_award_rank_key
      UNIQUE (user_id, award_type, rank)
    `);
    console.log('✓ New constraint created');

    // Create index on rank for better performance
    console.log('Creating rank index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tournament_votes_rank ON tournament_award_votes(rank)
    `);
    console.log('✓ Rank index created');

    await client.query('COMMIT');

    console.log('\n✅ Ranked voting migration completed successfully!');
    console.log('\nChanges made:');
    console.log('  - Added rank column (1, 2, or 3) to tournament_award_votes');
    console.log('  - Updated unique constraint to (user_id, award_type, rank)');
    console.log('  - Existing votes were converted to 1st place votes');
    console.log('\nScoring system:');
    console.log('  - 1st place = 4 points');
    console.log('  - 2nd place = 2 points');
    console.log('  - 3rd place = 1 point');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateToRankedVotes().catch(console.error);
