/**
 * Integration tests for feedback database operations
 * Tests feedback submissions, votes, and approval workflow
 */

import { getTestPool, createTestUser, cleanupTestData, getAllRecords } from '../helpers/testUtils';

describe('Feedback Database Operations', () => {
  let testUserId: string;
  let adminUserId: string;

  beforeEach(async () => {
    await cleanupTestData(['feedback_votes', 'feedback_submissions', 'users']);

    // Create test users
    const testUser = await createTestUser('test@example.com', 'Test User', false, '00000000-0000-0000-0000-000000000001');
    const adminUser = await createTestUser('admin@example.com', 'Admin User', true, '00000000-0000-0000-0000-000000000002');

    testUserId = testUser.id;
    adminUserId = adminUser.id;
  });

  afterAll(async () => {
    await cleanupTestData(['feedback_votes', 'feedback_submissions', 'users']);
  });

  describe('Feedback Submission', () => {
    it('should create feedback submission', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        const result = await client.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id, status, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          ['feature', 'Test Feature', 'Test description', testUserId, 'pending', false]
        );

        expect(result.rows[0]).toBeDefined();
        expect(result.rows[0].type).toBe('feature');
        expect(result.rows[0].status).toBe('pending');
        expect(result.rows[0].is_approved).toBe(false);
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should enforce valid feedback types', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        // Should fail with invalid type
        await expect(
          client.query(
            `INSERT INTO feedback_submissions (type, title, description, user_id)
             VALUES ($1, $2, $3, $4)`,
            ['invalid_type', 'Test', 'Description', testUserId]
          )
        ).rejects.toThrow();
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should enforce valid status values', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        // Should fail with invalid status
        await expect(
          client.query(
            `INSERT INTO feedback_submissions (type, title, description, user_id, status)
             VALUES ($1, $2, $3, $4, $5)`,
            ['feature', 'Test', 'Description', testUserId, 'invalid_status']
          )
        ).rejects.toThrow();
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });
  });

  describe('Feedback Approval', () => {
    it('should approve feedback', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        // Create feedback
        const insertResult = await client.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id, status, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          ['feature', 'Test Feature', 'Description', testUserId, 'pending', false]
        );

        const feedbackId = insertResult.rows[0].id;

        // Approve feedback
        await client.query(
          `UPDATE feedback_submissions
           SET status = $1, is_approved = $2, approved_by_user_id = $3
           WHERE id = $4`,
          ['approved', true, adminUserId, feedbackId]
        );

        // Verify
        const result = await client.query(
          'SELECT * FROM feedback_submissions WHERE id = $1',
          [feedbackId]
        );

        expect(result.rows[0].status).toBe('approved');
        expect(result.rows[0].is_approved).toBe(true);
        expect(result.rows[0].approved_by_user_id).toBe(adminUserId);
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should retrieve only approved feedback', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        // Create approved and pending feedback
        await client.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id, status, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          ['feature', 'Approved', 'Description', testUserId, 'approved', true]
        );

        await client.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id, status, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          ['feature', 'Pending', 'Description', testUserId, 'pending', false]
        );

        // Query only approved
        const result = await client.query(
          'SELECT * FROM feedback_submissions WHERE is_approved = true'
        );

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].title).toBe('Approved');
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });
  });

  describe('Voting System', () => {
    let feedbackId: number;

    beforeEach(async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        const result = await client.query(
          `INSERT INTO feedback_submissions (type, title, description, user_id, status, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          ['feature', 'Test', 'Description', testUserId, 'approved', true]
        );
        feedbackId = result.rows[0].id;
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should add upvote', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        await client.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedbackId, testUserId, 'upvote']
        );

        const votes = await getAllRecords('feedback_votes');
        expect(votes).toHaveLength(1);
        expect(votes[0].vote_type).toBe('upvote');
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should add downvote', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        await client.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedbackId, testUserId, 'downvote']
        );

        const votes = await getAllRecords('feedback_votes');
        expect(votes).toHaveLength(1);
        expect(votes[0].vote_type).toBe('downvote');
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should prevent duplicate votes from same user', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        await client.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedbackId, testUserId, 'upvote']
        );

        // Try to vote again
        await expect(
          client.query(
            `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
             VALUES ($1, $2, $3)`,
            [feedbackId, testUserId, 'upvote']
          )
        ).rejects.toThrow();

        const votes = await getAllRecords('feedback_votes');
        expect(votes).toHaveLength(1);
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });

    it('should delete votes when feedback is deleted (CASCADE)', async () => {
      const pool = getTestPool();
      const client = await pool.connect();

      try {
        // Add votes
        await client.query(
          `INSERT INTO feedback_votes (feedback_id, user_id, vote_type)
           VALUES ($1, $2, $3)`,
          [feedbackId, testUserId, 'upvote']
        );

        // Delete feedback
        await client.query(
          'DELETE FROM feedback_submissions WHERE id = $1',
          [feedbackId]
        );

        // Votes should be gone
        const votes = await getAllRecords('feedback_votes');
        expect(votes).toHaveLength(0);
      } finally {
        client.release();
        // Don't close the shared pool!
      }
    });
  });
});
