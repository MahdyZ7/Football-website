import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrateTournamentVotes() {
  const client = await pool.connect();

  try {
    console.log('Starting tournament voting system migration...\n');

    await client.query('BEGIN');

    // Create tournament_award_votes table
    console.log('Creating tournament_award_votes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_award_votes (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        award_type VARCHAR(20) NOT NULL CHECK (award_type IN ('best_player', 'best_goalkeeper')),
        player_name VARCHAR(100) NOT NULL,
        player_team VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, award_type)
      )
    `);
    console.log('✓ tournament_award_votes table created');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tournament_votes_user_id ON tournament_award_votes(user_id);
      CREATE INDEX IF NOT EXISTS idx_tournament_votes_award_type ON tournament_award_votes(award_type);
      CREATE INDEX IF NOT EXISTS idx_tournament_votes_player ON tournament_award_votes(player_name, player_team);
      CREATE INDEX IF NOT EXISTS idx_tournament_votes_created ON tournament_award_votes(created_at DESC);
    `);
    console.log('✓ Indexes created');

    // Create function to update updated_at timestamp
    console.log('Creating trigger function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_tournament_votes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_tournament_votes_timestamp ON tournament_award_votes;
      CREATE TRIGGER trigger_update_tournament_votes_timestamp
      BEFORE UPDATE ON tournament_award_votes
      FOR EACH ROW
      EXECUTE FUNCTION update_tournament_votes_updated_at();
    `);
    console.log('✓ Trigger created');

    await client.query('COMMIT');

    console.log('\n✅ Tournament voting system migration completed successfully!');
    console.log('\nCreated table:');
    console.log('  - tournament_award_votes (stores votes for best player and best goalkeeper)');
    console.log('\nNext steps:');
    console.log('  1. Restart your development server');
    console.log('  2. Visit /tournament/vote to cast votes');
    console.log('  3. Admins can audit votes at /admin/tournament-votes');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateTournamentVotes().catch(console.error);
