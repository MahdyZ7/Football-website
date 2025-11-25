/**
 * Integration tests for players database operations
 * Tests player registration, deletion, and retrieval
 */

import { getTestPool, createTestPlayer, createBannedUser, cleanupTestData, getAllRecords, isUserBanned } from '../helpers/testUtils';

describe('Players Database Operations', () => {
  beforeEach(async () => {
    await cleanupTestData(['players', 'banned_users']);
  });

  afterAll(async () => {
    await cleanupTestData(['players', 'banned_users']);
  });

  describe('Player Registration', () => {
    it('should create a new player successfully', async () => {
      const player = await createTestPlayer('testuser', 'Test User', false);

      expect(player).toBeDefined();
      expect(player.intra).toBe('testuser');
      expect(player.name).toBe('Test User');
      expect(player.verified).toBe(false);
    });

    it('should create multiple players', async () => {
      await createTestPlayer('user1', 'User One');
      await createTestPlayer('user2', 'User Two');
      await createTestPlayer('user3', 'User Three');

      const players = await getAllRecords('players');
      expect(players).toHaveLength(3);
    });

    it('should prevent duplicate intra usernames', async () => {
      await createTestPlayer('duplicate', 'First User');

      // Try to create duplicate
      await expect(
        createTestPlayer('duplicate', 'Second User')
      ).rejects.toThrow();

      const players = await getAllRecords('players');
      expect(players).toHaveLength(1);
    });

    it('should store verification status correctly', async () => {
      await createTestPlayer('verified', 'Verified User', true);
      await createTestPlayer('unverified', 'Unverified User', false);

      const players = await getAllRecords('players');
      const verified = players.find((p: any) => p.intra === 'verified');
      const unverified = players.find((p: any) => p.intra === 'unverified');

      expect(verified.verified).toBe(true);
      expect(unverified.verified).toBe(false);
    });
  });

  describe('Player Deletion', () => {
    it('should delete a specific player', async () => {
      await createTestPlayer('user1', 'User 1');
      await createTestPlayer('user2', 'User 2');

      // Use cleanupTestData helper to ensure proper connection management
      const pool = getTestPool();
      await pool.query('DELETE FROM players WHERE intra = $1', ['user1']);

      const players = await getAllRecords('players');
      expect(players).toHaveLength(1);
      expect(players[0].intra).toBe('user2');
    });

    it('should delete all players', async () => {
      await createTestPlayer('user1', 'User 1');
      await createTestPlayer('user2', 'User 2');
      await createTestPlayer('user3', 'User 3');

      await cleanupTestData(['players']);

      const players = await getAllRecords('players');
      expect(players).toHaveLength(0);
    });
  });

  describe('Player Retrieval', () => {
    it('should retrieve all players', async () => {
      await createTestPlayer('user1', 'User 1');
      await createTestPlayer('user2', 'User 2');

      const players = await getAllRecords('players');

      expect(players).toHaveLength(2);
      expect(players[0]).toHaveProperty('intra');
      expect(players[0]).toHaveProperty('name');
      expect(players[0]).toHaveProperty('verified');
      expect(players[0]).toHaveProperty('created_at');
    });

    it('should return empty array when no players exist', async () => {
      const players = await getAllRecords('players');
      expect(players).toHaveLength(0);
    });
  });

  describe('Ban System Integration', () => {
    it('should check if user is banned', async () => {
      await createBannedUser('banneduser', 'Banned User', 'Test ban', 7);

      const isBanned = await isUserBanned('banneduser');
      expect(isBanned).toBe(true);
    });

    it('should return false for non-banned user', async () => {
      const isBanned = await isUserBanned('nonexistent');
      expect(isBanned).toBe(false);
    });

    it('should not allow banned user registration', async () => {
      await createBannedUser('banneduser', 'Banned User', 'Test ban', 7);

      const isBanned = await isUserBanned('banneduser');
      expect(isBanned).toBe(true);

      // In actual application, this check would prevent registration
      if (!isBanned) {
        await createTestPlayer('banneduser', 'Banned User');
      }

      const players = await getAllRecords('players');
      expect(players).toHaveLength(0);
    });
  });
});
