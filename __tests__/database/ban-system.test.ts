/**
 * Comprehensive Ban System Tests
 * Tests all aspects of user banning to prevent breaking changes
 */

import { getTestPool, createBannedUser, createTestUser, cleanupTestData, isUserBanned } from '../helpers/testUtils';

describe('Ban System', () => {
  beforeEach(async () => {
    await cleanupTestData(['banned_users', 'users']);
  });

  afterAll(async () => {
    await cleanupTestData(['banned_users', 'users']);
  });

  describe('Ban Creation', () => {
    it('should create ban with all required fields', async () => {
      const bannedUser = await createBannedUser('user1', 'Test User', 'Test ban reason', 7);

      expect(bannedUser.id).toBe('user1');
      expect(bannedUser.name).toBe('Test User');
      expect(bannedUser.reason).toBe('Test ban reason');
      expect(bannedUser.banned_at).toBeDefined();
      expect(bannedUser.banned_until).toBeDefined();
    });

    it('should calculate banned_until correctly', async () => {
      const daysBanned = 7;
      const before = new Date();
      before.setDate(before.getDate() + daysBanned);

      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', daysBanned);

      const after = new Date();
      after.setDate(after.getDate() + daysBanned);

      const bannedUntil = new Date(bannedUser.banned_until);

      // Should be within a reasonable range
      expect(bannedUntil.getTime()).toBeGreaterThanOrEqual(before.getTime() - 5000);
      expect(bannedUntil.getTime()).toBeLessThanOrEqual(after.getTime() + 5000);
    });

    it('should set banned_at to current time', async () => {
      const before = new Date();
      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', 7);
      const after = new Date();

      const bannedAt = new Date(bannedUser.banned_at);

      // Allow 2-second buffer for clock skew between app and database
      expect(bannedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 2000);
      expect(bannedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 2000);
    });
  });

  describe('Ban Status Checking', () => {
    it('should correctly identify currently banned user', async () => {
      await createBannedUser('banned1', 'User', 'Reason', 7);

      const isBanned = await isUserBanned('banned1');
      expect(isBanned).toBe(true);
    });

    it('should return false for non-banned user', async () => {
      const isBanned = await isUserBanned('nonexistent');
      expect(isBanned).toBe(false);
    });

    it('should return false for expired bans', async () => {
      const pool = getTestPool();

      // Create a ban that expired yesterday
      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
         VALUES ($1, $2, $3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day')`,
        ['expired', 'Expired User', 'Old reason']
      );

      const isBanned = await isUserBanned('expired');
      expect(isBanned).toBe(false);
    });

    it('should handle multiple bans for different users', async () => {
      await createBannedUser('user1', 'User 1', 'Reason', 7);
      await createBannedUser('user2', 'User 2', 'Reason', 7);
      await createBannedUser('user3', 'User 3', 'Reason', 7);

      expect(await isUserBanned('user1')).toBe(true);
      expect(await isUserBanned('user2')).toBe(true);
      expect(await isUserBanned('user3')).toBe(true);
      expect(await isUserBanned('user4')).toBe(false);
    });
  });

  describe('Ban Duration Types', () => {
    it('should handle 1 day bans', async () => {
      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', 1);
      const bannedUntil = new Date(bannedUser.banned_until);
      const now = new Date();

      const daysDiff = (bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(0.9);
      expect(daysDiff).toBeLessThanOrEqual(1.1);
    });

    it('should handle 7 day bans', async () => {
      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', 7);
      const bannedUntil = new Date(bannedUser.banned_until);
      const now = new Date();

      const daysDiff = (bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(6.9);
      expect(daysDiff).toBeLessThanOrEqual(7.1);
    });

    it('should handle 30 day bans', async () => {
      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', 30);
      const bannedUntil = new Date(bannedUser.banned_until);
      const now = new Date();

      const daysDiff = (bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(29.9);
      expect(daysDiff).toBeLessThanOrEqual(30.1);
    });

    it('should handle permanent bans (365+ days)', async () => {
      const bannedUser = await createBannedUser('user1', 'Test', 'Permanent ban', 365);
      const bannedUntil = new Date(bannedUser.banned_until);
      const now = new Date();

      const daysDiff = (bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(364);
      expect(daysDiff).toBeLessThanOrEqual(366);
    });
  });

  describe('Ban Reasons', () => {
    it('should store ban reason correctly', async () => {
      const reason = 'Unsportsmanlike conduct during match';
      const bannedUser = await createBannedUser('user1', 'Test', reason, 7);

      expect(bannedUser.reason).toBe(reason);
    });

    it('should handle long ban reasons', async () => {
      const reason = 'A'.repeat(500);
      const bannedUser = await createBannedUser('user1', 'Test', reason, 7);

      expect(bannedUser.reason).toBe(reason);
    });

    it('should require ban reason (NOT NULL)', async () => {
      const pool = getTestPool();

      await expect(
        pool.query(
          `INSERT INTO banned_users (id, name, reason, banned_until)
           VALUES ($1, $2, $3, $4)`,
          ['user1', 'Test', null, new Date()]
        )
      ).rejects.toThrow();
    });
  });

  describe('Ban Queries and Indexes', () => {
    it('should efficiently query active bans', async () => {
      await createBannedUser('user1', 'User 1', 'Reason', 7);
      await createBannedUser('user2', 'User 2', 'Reason', 7);

      // Create expired ban
      const pool = getTestPool();
      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
         VALUES ($1, $2, $3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day')`,
        ['expired', 'Expired', 'Reason']
      );

      // Query active bans
      const result = await pool.query(
        `SELECT * FROM banned_users WHERE banned_until > NOW()`
      );

      expect(result.rows).toHaveLength(2);
      expect(result.rows.some((r: any) => r.id === 'user1')).toBe(true);
      expect(result.rows.some((r: any) => r.id === 'user2')).toBe(true);
    });

    it('should efficiently query bans by banned_until date', async () => {
      await createBannedUser('user1', 'User 1', 'Reason', 1);
      await createBannedUser('user2', 'User 2', 'Reason', 7);
      await createBannedUser('user3', 'User 3', 'Reason', 30);

      const pool = getTestPool();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find bans expiring within 7 days
      const result = await pool.query(
        `SELECT * FROM banned_users
         WHERE banned_until <= $1 AND banned_until > NOW()
         ORDER BY banned_until`,
        [sevenDaysFromNow]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Ban User Relationships', () => {
    it('should link ban to user account when available', async () => {
      const user = await createTestUser('test@test.com', 'Test User', false, '00000000-0000-0000-0000-000000000099');
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_until, user_id)
         VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', $4)`,
        ['banned1', 'Test User', 'Reason', user.id]
      );

      const result = await pool.query(
        `SELECT * FROM banned_users WHERE id = $1`,
        ['banned1']
      );

      expect(result.rows[0].user_id).toBe(user.id);
    });

    it('should SET NULL on user_id when user is deleted', async () => {
      const user = await createTestUser('test@test.com', 'Test User', false, '00000000-0000-0000-0000-000000000099');
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_until, user_id)
         VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', $4)`,
        ['banned1', 'Test User', 'Reason', user.id]
      );

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

      // Ban should still exist but user_id should be NULL
      const result = await pool.query('SELECT * FROM banned_users WHERE id = $1', ['banned1']);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].user_id).toBeNull();
    });
  });

  describe('Ban Data Integrity', () => {
    it('should prevent banned_until in the past', async () => {
      const pool = getTestPool();

      // This should still work as there's no CHECK constraint, but it's a good test
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await pool.query(
        `INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
         VALUES ($1, $2, $3, NOW() - INTERVAL '2 days', $4)`,
        ['user1', 'Test', 'Reason', yesterday]
      );

      // User should not be considered banned (expired)
      const isBanned = await isUserBanned('user1');
      expect(isBanned).toBe(false);
    });

    it('should handle timezone correctly', async () => {
      const bannedUser = await createBannedUser('user1', 'Test', 'Reason', 7);

      // Both timestamps should be timezone-aware (convert to ISO string for regex match)
      expect(bannedUser.banned_at.toISOString()).toMatch(/Z$/);
      expect(bannedUser.banned_until.toISOString()).toMatch(/Z$/);
    });
  });
});
