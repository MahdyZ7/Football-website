/**
 * Tests for useTeamManagement hook
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useTeamManagement } from '@/hooks/useTeamManagement';

type TestUser = {
  name: string;
  intra: string;
  verified: boolean;
  created_at: string;
  registration_status?: 'confirmed' | 'waitlisted';
  waitlist_position?: number | null;
  is_banned?: boolean;
};

const createUser = (
  intra: string,
  overrides: Partial<TestUser> = {}
): TestUser => ({
  intra,
  name: intra.toUpperCase(),
  verified: true,
  created_at: `2026-03-09T00:00:0${intra.length}Z`,
  registration_status: 'confirmed',
  waitlist_position: null,
  ...overrides,
});

describe('useTeamManagement', () => {
  it('keeps manual assignments while pruning removed players and admitting promoted ones', async () => {
    const initialUsers = [
      createUser('alpha'),
      createUser('bravo'),
      createUser('charlie', {
        registration_status: 'waitlisted',
        waitlist_position: 1,
      }),
    ];

    const { result, rerender } = renderHook(
      ({ registeredUsers }) =>
        useTeamManagement({
          registeredUsers,
          teamMode: 2,
          guaranteedSpot: 2,
          playersPerTeam2Mode: 10,
          playersPerTeam3Mode: 7,
        }),
      {
        initialProps: {
          registeredUsers: initialUsers,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.availablePlayers.map((player) => player.intra)).toEqual(['alpha', 'bravo']);
      expect(result.current.waitingListPlayers.map((player) => player.intra)).toEqual(['charlie']);
    });

    act(() => {
      result.current.addToTeam(result.current.availablePlayers[0], 1);
    });

    expect(result.current.team1.players.map((player) => player.intra)).toEqual(['alpha']);
    expect(result.current.availablePlayers.map((player) => player.intra)).toEqual(['bravo']);

    rerender({
      registeredUsers: [
        createUser('alpha'),
        createUser('charlie', {
          registration_status: 'confirmed',
          waitlist_position: null,
        }),
      ],
    });

    await waitFor(() => {
      expect(result.current.team1.players.map((player) => player.intra)).toEqual(['alpha']);
      expect(result.current.availablePlayers.map((player) => player.intra)).toEqual(['charlie']);
      expect(result.current.waitingListPlayers).toEqual([]);
    });
  });
});
