/**
 * Comprehensive User Management Tests
 * Tests user registration, verification, and admin operations
 */

import { getTestPool, createTestUser, createTestPlayer, cleanupTestData, getAllRecords } from '../helpers/testUtils';

describe('User Management', () => {
  beforeEach(async () => {
    await cleanupTestData(['money', 'players', 'users']);
  });

  afterAll(async () => {
    await cleanupTestData(['money', 'players', 'users']);
  });

  describe('User Creation', () => {
    it('should create user with all fields', async () => {
      const user = await createTestUser('test@example.com', 'Test User', false, '00000000-0000-0000-0000-000000000001');

      expect(user.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.is_admin).toBe(false);
      expect(user.created_at).toBeDefined();
    });

    it('should create admin user', async () => {
      const user = await createTestUser('admin@example.com', 'Admin User', true);

      expect(user.is_admin).toBe(true);
    });

    it('should auto-generate UUID if not provided', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
        ['test@example.com', 'Test']
      );

      // UUID should be generated
      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should set created_at timestamp', async () => {
      const before = new Date();
      const user = await createTestUser('test@example.com', 'Test');
      const after = new Date();

      const createdAt = new Date(user.created_at);
      // Allow 2-second buffer for clock skew between app and database
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 2000);
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 2000);
    });
  });

  describe('User Verification', () => {
    it('should track player verification status', async () => {
      await createTestPlayer('verified', 'Verified User', true);
      await createTestPlayer('unverified', 'Unverified User', false);

      const pool = getTestPool();
      const verified = await pool.query('SELECT * FROM players WHERE intra = $1', ['verified']);
      const unverified = await pool.query('SELECT * FROM players WHERE intra = $1', ['unverified']);

      expect(verified.rows[0].verified).toBe(true);
      expect(unverified.rows[0].verified).toBe(false);
    });

    it('should allow toggling verification status', async () => {
      await createTestPlayer('test', 'Test', false);

      const pool = getTestPool();

      // Toggle to verified
      await pool.query('UPDATE players SET verified = $1 WHERE intra = $2', [true, 'test']);
      let result = await pool.query('SELECT verified FROM players WHERE intra = $1', ['test']);
      expect(result.rows[0].verified).toBe(true);

      // Toggle back to unverified
      await pool.query('UPDATE players SET verified = $1 WHERE intra = $2', [false, 'test']);
      result = await pool.query('SELECT verified FROM players WHERE intra = $1', ['test']);
      expect(result.rows[0].verified).toBe(false);
    });

    it('should query verified users', async () => {
      await createTestPlayer('user1', 'User 1', true);
      await createTestPlayer('user2', 'User 2', true);
      await createTestPlayer('user3', 'User 3', false);

      const pool = getTestPool();
      const result = await pool.query('SELECT * FROM players WHERE verified = true');

      expect(result.rows).toHaveLength(2);
    });
  });

  describe('User Roles', () => {
    it('should default role to user', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING role`,
        ['test@example.com', 'Test']
      );

      expect(result.rows[0].role).toBe('user');
    });

    it('should allow setting service role', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING role`,
        ['service@example.com', 'Service Account', 'service']
      );

      expect(result.rows[0].role).toBe('service');
    });

    it('should allow setting admin role', async () => {
      const pool = getTestPool();

      const result = await pool.query(
        `INSERT INTO users (email, name, role, is_admin) VALUES ($1, $2, $3, $4) RETURNING role, is_admin`,
        ['admin@example.com', 'Admin', 'admin', true]
      );

      expect(result.rows[0].role).toBe('admin');
      expect(result.rows[0].is_admin).toBe(true);
    });
  });

  describe('User Deletion', () => {
    it('should delete user and SET NULL on related records', async () => {
      const user = await createTestUser('test@example.com', 'Test', false, '00000000-0000-0000-0000-000000000001');
      await createTestPlayer('testuser', 'Test', false, user.id);

      const pool = getTestPool();

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

      // User should be gone
      const users = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      expect(users.rows).toHaveLength(0);

      // Player should exist but user_id should be NULL
      const players = await pool.query('SELECT * FROM players WHERE intra = $1', ['testuser']);
      expect(players.rows).toHaveLength(1);
      expect(players.rows[0].user_id).toBeNull();
    });

    it('should CASCADE delete user feedback', async () => {
      const user = await createTestUser('test@example.com', 'Test');
      const pool = getTestPool();

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

  describe('Player Registration', () => {
    it('should track registration order by created_at', async () => {
      await createTestPlayer('user1', 'First', false);
      await new Promise(resolve => setTimeout(resolve, 10));

      await createTestPlayer('user2', 'Second', false);
      await new Promise(resolve => setTimeout(resolve, 10));

      await createTestPlayer('user3', 'Third', false);

      const pool = getTestPool();
      const result = await pool.query('SELECT intra FROM players ORDER BY created_at');

      expect(result.rows[0].intra).toBe('user1');
      expect(result.rows[1].intra).toBe('user2');
      expect(result.rows[2].intra).toBe('user3');
    });

    it('should count total registrations', async () => {
      await createTestPlayer('user1', 'User 1');
      await createTestPlayer('user2', 'User 2');
      await createTestPlayer('user3', 'User 3');

      const pool = getTestPool();
      const result = await pool.query('SELECT COUNT(*) FROM players');

      expect(parseInt(result.rows[0].count)).toBe(3);
    });

    it('should count verified vs unverified', async () => {
      await createTestPlayer('user1', 'User 1', true);
      await createTestPlayer('user2', 'User 2', true);
      await createTestPlayer('user3', 'User 3', false);
      await createTestPlayer('user4', 'User 4', false);
      await createTestPlayer('user5', 'User 5', false);

      const pool = getTestPool();
      const verified = await pool.query('SELECT COUNT(*) FROM players WHERE verified = true');
      const unverified = await pool.query('SELECT COUNT(*) FROM players WHERE verified = false');

      expect(parseInt(verified.rows[0].count)).toBe(2);
      expect(parseInt(unverified.rows[0].count)).toBe(3);
    });
  });

  describe('Player Limits and Waitlist', () => {
    it('should track registration capacity', async () => {
      // Create 21 players (guaranteed spots)
      for (let i = 1; i <= 21; i++) {
        await createTestPlayer(`user${i}`, `User ${i}`);
      }

      const pool = getTestPool();
      const result = await pool.query('SELECT COUNT(*) FROM players');
      const count = parseInt(result.rows[0].count);

      expect(count).toBe(21);

      // Additional players would be waitlist
      await createTestPlayer('waitlist1', 'Waitlist User 1');
      const newCount = await pool.query('SELECT COUNT(*) FROM players');
      expect(parseInt(newCount.rows[0].count)).toBe(22);
    });

    it('should identify waitlist players', async () => {
      // Create 21 guaranteed + 3 waitlist
      for (let i = 1; i <= 24; i++) {
        await createTestPlayer(`user${i}`, `User ${i}`);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const pool = getTestPool();

      // Get players in registration order
      const result = await pool.query('SELECT intra FROM players ORDER BY created_at');

      // First 21 are guaranteed
      expect(result.rows.length).toBeGreaterThanOrEqual(21);

      // Last 3 would be waitlist
      const waitlistStart = Math.max(0, result.rows.length - 3);
      const waitlistPlayers = result.rows.slice(waitlistStart);

      waitlistPlayers.forEach((player: any, index: number) => {
        expect(player.intra).toBe(`user${24 - 2 + index}`);
      });
    });
  });

  describe('Player Data Integrity', () => {
    it('should prevent empty player names', async () => {
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO players (name, intra) VALUES ($1, $2)`,
          ['', 'test']
        )
      ).rejects.toThrow();
    });

    it('should prevent empty intra usernames', async () => {
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO players (name, intra) VALUES ($1, $2)`,
          ['Test', '']
        )
      ).rejects.toThrow();
    });

    it('should handle special characters in names', async () => {
      const name = "O'Brien-Smith (Test)";
      const player = await createTestPlayer('test', name);

      expect(player.name).toBe(name);
    });

    it('should handle unicode characters in names', async () => {
      const name = 'José María';
      const player = await createTestPlayer('test', name);

      expect(player.name).toBe(name);
    });
  });
});
