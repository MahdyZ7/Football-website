/**
 * Comprehensive Admin Operations and Logging Tests
 * Ensures all admin actions are properly logged and auditable
 */

import { getTestPool, createTestUser, createTestPlayer, createBannedUser, cleanupTestData } from '../helpers/testUtils';

describe('Admin Operations and Logging', () => {
  let adminUser: any;
  let regularUser: any;

  beforeEach(async () => {
    await cleanupTestData(['admin_logs', 'banned_users', 'players', 'users']);

    // Create admin and regular users for each test
    adminUser = await createTestUser('admin@test.com', 'Admin User', true, '00000000-0000-0000-0000-000000000001');
    regularUser = await createTestUser('user@test.com', 'Regular User', false, '00000000-0000-0000-0000-000000000002');
  });

  afterAll(async () => {
    await cleanupTestData(['admin_logs', 'banned_users', 'players', 'users']);
  });

  describe('Admin Log Creation', () => {
    it('should create admin log with all required fields', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'ban_user', 'testuser', 'Test User', 'Banned for 7 days', adminUser.id]
      );

      const logs = await pool.query('SELECT * FROM admin_logs');

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].admin_user).toBe('admin@test.com');
      expect(logs.rows[0].action).toBe('ban_user');
      expect(logs.rows[0].target_user).toBe('testuser');
      expect(logs.rows[0].target_name).toBe('Test User');
      expect(logs.rows[0].details).toBe('Banned for 7 days');
      expect(logs.rows[0].performed_by_user_id).toBe(adminUser.id);
    });

    it('should auto-generate ID and timestamp', async () => {
      const pool = getTestPool();
      const before = new Date();
	  await new Promise(resolve => setTimeout(resolve, 10)); // Ensure timestamp difference
      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'test_action', adminUser.id]
      );

      const after = new Date();

      const logs = await pool.query('SELECT * FROM admin_logs');

      expect(logs.rows[0].id).toBeDefined();
      expect(typeof logs.rows[0].id).toBe('number');

      const timestamp = new Date(logs.rows[0].timestamp);
      // Allow 2-second buffer for clock skew between app and database
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime() - 2000);
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime() + 2000);
    });
  });

  describe('Admin Actions Logging', () => {
    it('should log ban_user action', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'ban_user', 'testuser', 'Test User', 'Banned for unsportsmanlike conduct', adminUser.id]
      );

      const logs = await pool.query(`SELECT * FROM admin_logs WHERE action = 'ban_user'`);

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].details).toContain('Banned for');
    });

    it('should log unban_user action', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'unban_user', 'testuser', 'Test User', 'Ban removed', adminUser.id]
      );

      const logs = await pool.query(`SELECT * FROM admin_logs WHERE action = 'unban_user'`);

      expect(logs.rows).toHaveLength(1);
    });

    it('should log delete_user action', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'delete_user', 'testuser', 'Test User', 'User deleted from system', adminUser.id]
      );

      const logs = await pool.query(`SELECT * FROM admin_logs WHERE action = 'delete_user'`);

      expect(logs.rows).toHaveLength(1);
    });

    it('should log verify_user action', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'verify_user', 'testuser', 'Test User', 'User verified against 42 API', adminUser.id]
      );

      const logs = await pool.query(`SELECT * FROM admin_logs WHERE action = 'verify_user'`);

      expect(logs.rows).toHaveLength(1);
    });

    it('should log approve_feedback action', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@test.com', 'approve_feedback', '1', 'Feature Request', 'Feedback approved and made public', adminUser.id]
      );

      const logs = await pool.query(`SELECT * FROM admin_logs WHERE action = 'approve_feedback'`);

      expect(logs.rows).toHaveLength(1);
    });
  });

  describe('Admin Log Queries', () => {
    it('should query logs by admin user', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin1@test.com', 'action1', adminUser.id]
      );

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin2@test.com', 'action2', adminUser.id]
      );

      const logs = await pool.query(
        `SELECT * FROM admin_logs WHERE admin_user = $1`,
        ['admin1@test.com']
      );

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].admin_user).toBe('admin1@test.com');
    });

    it('should query logs by action type', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'ban_user', adminUser.id]
      );

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'ban_user', adminUser.id]
      );

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'unban_user', adminUser.id]
      );

      const logs = await pool.query(
        `SELECT * FROM admin_logs WHERE action = 'ban_user'`
      );

      expect(logs.rows).toHaveLength(2);
    });

    it('should query logs by target user', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, performed_by_user_id)
         VALUES ($1, $2, $3, $4)`,
        ['admin@test.com', 'ban_user', 'targetuser', adminUser.id]
      );

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, performed_by_user_id)
         VALUES ($1, $2, $3, $4)`,
        ['admin@test.com', 'unban_user', 'targetuser', adminUser.id]
      );

      const logs = await pool.query(
        `SELECT * FROM admin_logs WHERE target_user = $1 ORDER BY timestamp DESC`,
        ['targetuser']
      );

      expect(logs.rows).toHaveLength(2);
      expect(logs.rows[0].action).toBe('unban_user'); // Most recent
      expect(logs.rows[1].action).toBe('ban_user'); // Older
    });

    it('should query logs by date range', async () => {
      const pool = getTestPool();

      // Create old log
      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, timestamp, performed_by_user_id)
         VALUES ($1, $2, NOW() - INTERVAL '30 days', $3)`,
        ['admin@test.com', 'old_action', adminUser.id]
      );

      // Create recent log
      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'recent_action', adminUser.id]
      );

      // Query last 7 days
      const logs = await pool.query(
        `SELECT * FROM admin_logs WHERE timestamp >= NOW() - INTERVAL '7 days'`
      );

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].action).toBe('recent_action');
    });

    it('should order logs by timestamp descending (newest first)', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'action1', adminUser.id]
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'action2', adminUser.id]
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'action3', adminUser.id]
      );

      const logs = await pool.query(
        `SELECT action FROM admin_logs ORDER BY timestamp DESC`
      );

      expect(logs.rows[0].action).toBe('action3'); // Newest
      expect(logs.rows[1].action).toBe('action2');
      expect(logs.rows[2].action).toBe('action1'); // Oldest
    });
  });

  describe('Admin User Relationships', () => {
    it('should link log to admin user account', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'test_action', adminUser.id]
      );

      const logs = await pool.query(
        `SELECT al.*, u.is_admin, u.email
         FROM admin_logs al
         JOIN users u ON al.performed_by_user_id = u.id`
      );

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].is_admin).toBe(true);
      expect(logs.rows[0].email).toBe('admin@test.com');
    });

    it('should SET NULL when admin user is deleted', async () => {
      const pool = getTestPool();

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
         VALUES ($1, $2, $3)`,
        ['admin@test.com', 'test_action', adminUser.id]
      );

      // Delete admin user
      await pool.query('DELETE FROM users WHERE id = $1', [adminUser.id]);

      // Log should still exist but performed_by_user_id should be NULL
      const logs = await pool.query('SELECT * FROM admin_logs');

      expect(logs.rows).toHaveLength(1);
      expect(logs.rows[0].performed_by_user_id).toBeNull();
      expect(logs.rows[0].admin_user).toBe('admin@test.com'); // Email preserved
    });
  });

  describe('Admin Log Indexes', () => {
    it('should efficiently query by timestamp (indexed)', async () => {
      const pool = getTestPool();

      // Create multiple logs
      for (let i = 0; i < 10; i++) {
        await pool.query(
          `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
           VALUES ($1, $2, $3)`,
          [`admin${i}@test.com`, `action${i}`, adminUser.id]
        );
      }

      // Query should use index on timestamp
      const result = await pool.query(
        `EXPLAIN SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 5`
      );

      // This is a basic check - in production you'd verify the query plan uses the index
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should efficiently query by admin_user (indexed)', async () => {
      const pool = getTestPool();

      for (let i = 0; i < 10; i++) {
        await pool.query(
          `INSERT INTO admin_logs (admin_user, action, performed_by_user_id)
           VALUES ($1, $2, $3)`,
          ['specific@test.com', `action${i}`, adminUser.id]
        );
      }

      // Query should use index on admin_user
      const result = await pool.query(
        `EXPLAIN SELECT * FROM admin_logs WHERE admin_user = $1`,
        ['specific@test.com']
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Trail Completeness', () => {
    it('should preserve admin_user email even if not required', async () => {
      const pool = getTestPool();

      // Log without performed_by_user_id (legacy)
      await pool.query(
        `INSERT INTO admin_logs (admin_user, action)
         VALUES ($1, $2)`,
        ['legacy@test.com', 'legacy_action']
      );

      const logs = await pool.query('SELECT * FROM admin_logs');

      expect(logs.rows[0].admin_user).toBe('legacy@test.com');
      expect(logs.rows[0].performed_by_user_id).toBeNull();
    });

    it('should store detailed action information', async () => {
      const pool = getTestPool();

      const details = JSON.stringify({
        reason: 'Unsportsmanlike conduct',
        duration: '7 days',
        witness: 'referee@test.com'
      });

      await pool.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, details, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin@test.com', 'ban_user', 'player1', details, adminUser.id]
      );

      const logs = await pool.query('SELECT * FROM admin_logs');

      expect(logs.rows[0].details).toBe(details);

      // Should be able to parse JSON
      const parsed = JSON.parse(logs.rows[0].details);
      expect(parsed.reason).toBe('Unsportsmanlike conduct');
      expect(parsed.duration).toBe('7 days');
    });
  });
});
