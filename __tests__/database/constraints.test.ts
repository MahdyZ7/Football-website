/**
 * Database Constraints and Relationships Tests
 * Ensures database integrity and prevents breaking changes to schema
 */

import { getTestPool, createTestUser, createTestPlayer, cleanupTestData } from '../helpers/testUtils';

describe('Database Constraints and Relationships', () => {
  beforeEach(async () => {
    await cleanupTestData(['feedback_votes', 'feedback_submissions', 'admin_logs', 'banned_users', 'players', 'money', 'users']);
  });

  afterAll(async () => {
    await cleanupTestData(['feedback_votes', 'feedback_submissions', 'admin_logs', 'banned_users', 'players', 'money', 'users']);
  });

  describe('Primary Key Constraints', () => {
    it('should enforce unique player intra', async () => {
      await createTestPlayer('duplicate', 'User 1');

      await expect(
        createTestPlayer('duplicate', 'User 2')
      ).rejects.toThrow();
    });

    it('should enforce unique user email', async () => {
      await createTestUser('duplicate@test.com', 'User 1');

      await expect(
        createTestUser('duplicate@test.com', 'User 2')
      ).rejects.toThrow();
    });

    it('should enforce unique banned user ID', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_until)
         VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
        ['banned1', 'User 1', 'Test']
      );

      await expect(
        pool.query(
          `INSERT INTO banned_users (id, name, reason, banned_until)
           VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
          ['banned1', 'User 2', 'Test']
        )
      ).rejects.toThrow();
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should CASCADE delete player when user is deleted', async () => {
      const user = await createTestUser('test@test.com', 'Test User', false, '00000000-0000-0000-0000-000000000099');
      await createTestPlayer('testuser', 'Test User', false, user.id);

      const pool = getTestPool();

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

      // Player should still exist but user_id should be NULL (SET NULL)
      const players = await pool.query('SELECT * FROM players WHERE intra = $1', ['testuser']);
      expect(players.rows).toHaveLength(1);
      expect(players.rows[0].user_id).toBeNull();
    });

    it('should CASCADE delete feedback_votes when feedback is deleted', async () => {
      const user = await createTestUser('test@test.com', 'Test', false, '00000000-0000-0000-0000-000000000001');
      const pool = getTestPool();

      // Create feedback
      const feedback = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id, is_approved)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['feature', 'Test', 'Description', user.id, true]
      );

      // Create vote
      await pool.query(
        `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
         VALUES ($1, $2, $3)`,
        [feedback.rows[0].id, user.id, 'upvote']
      );

      // Delete feedback
      await pool.query('DELETE FROM feedback_submissions WHERE id = $1', [feedback.rows[0].id]);

      // Votes should be deleted
      const votes = await pool.query('SELECT * FROM feedback_votes WHERE feedback_id = $1', [feedback.rows[0].id]);
      expect(votes.rows).toHaveLength(0);
    });

    it('should CASCADE delete feedback when user is deleted', async () => {
      const user = await createTestUser('test@test.com', 'Test', false, '00000000-0000-0000-0000-000000000001');
      const pool = getTestPool();

      // Create feedback
      await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4)`,
        ['feature', 'Test', 'Description', user.id]
      );

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

      // Feedback should be deleted
      const feedback = await pool.query('SELECT * FROM feedback_submissions WHERE user_id = $1', [user.id]);
      expect(feedback.rows).toHaveLength(0);
    });
  });

  describe('NOT NULL Constraints', () => {
    it('should require player name', async () => {
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO players (intra, name) VALUES ($1, $2)`,
          ['test', null]
        )
      ).rejects.toThrow();
    });

    it('should require banned_users reason', async () => {
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO banned_users (id, name, reason, banned_until)
           VALUES ($1, $2, $3, $4)`,
          ['test', 'Test', null, new Date()]
        )
      ).rejects.toThrow();
    });

    it('should require feedback title and description', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id)
           VALUES ($1, $2, $3, $4)`,
          ['feature', null, 'Description', user.id]
        )
      ).rejects.toThrow();

      await expect(
        pool.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id)
           VALUES ($1, $2, $3, $4)`,
          ['feature', 'Title', null, user.id]
        )
      ).rejects.toThrow();
    });
  });

  describe('CHECK Constraints', () => {
    it('should enforce valid feedback types', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id)
           VALUES ($1, $2, $3, $4)`,
          ['invalid', 'Title', 'Description', user.id]
        )
      ).rejects.toThrow();
    });

    it('should enforce valid feedback status', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO feedback_submissions (type, title, description, status, user_id)
           VALUES ($1, $2, $3, $4, $5)`,
          ['feature', 'Title', 'Description', 'invalid', user.id]
        )
      ).rejects.toThrow();
    });

    it('should enforce valid vote types', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      const feedback = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['feature', 'Test', 'Description', user.id]
      );

      await expect(
        pool.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedback.rows[0].id, user.id, 'invalid']
        )
      ).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should default player verified to false', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO players (name, intra) VALUES ($1, $2) RETURNING verified`,
        ['Test', 'test']
      );

      expect(result.rows[0].verified).toBe(false);
    });

    it('should default feedback is_approved to false', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4) RETURNING is_approved`,
        ['feature', 'Test', 'Description', user.id]
      );

      expect(result.rows[0].is_approved).toBe(false);
    });

    it('should default feedback status to pending', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4) RETURNING status`,
        ['feature', 'Test', 'Description', user.id]
      );

      expect(result.rows[0].status).toBe('pending');
    });

    it('should default user is_admin to false', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING is_admin`,
        ['test@test.com', 'Test']
      );

      expect(result.rows[0].is_admin).toBe(false);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique feedback_vote per user per feedback', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();

      const feedback = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['feature', 'Test', 'Description', user.id]
      );

      await pool.query(
        `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
         VALUES ($1, $2, $3)`,
        [feedback.rows[0].id, user.id, 'upvote']
      );

      // Should fail on duplicate vote
      await expect(
        pool.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedback.rows[0].id, user.id, 'downvote']
        )
      ).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should automatically set created_at for players', async () => {
      const pool = getTestPool();
      const before = new Date();

      const result = await pool.query(
        `INSERT INTO players (name, intra) VALUES ($1, $2) RETURNING created_at`,
        ['Test', 'test']
      );

      const after = new Date();
      const createdAt = new Date(result.rows[0].created_at);

      // Allow 2-second buffer for clock skew between app and database
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 2000);
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 2000);
    });

    it('should automatically set created_at for feedback', async () => {
      const user = await createTestUser('test@test.com', 'Test');
      const pool = getTestPool();
      const before = new Date();

      const result = await pool.query(
        `INSERT INTO feedback_submissions (type, title, description, user_id)
         VALUES ($1, $2, $3, $4) RETURNING created_at`,
        ['feature', 'Test', 'Description', user.id]
      );

      const after = new Date();
      const createdAt = new Date(result.rows[0].created_at);

      // Allow 2-second buffer for clock skew between app and database
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 2000);
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 2000);
    });
  });
});
