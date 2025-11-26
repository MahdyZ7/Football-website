'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './footer';
import { Button } from '../ui/Button';
import { TeamCardSkeleton } from '../Skeleton';
import { GuaranteedSpot } from '../../types/user';
import { useUsers } from '../../hooks/useQueries';
import { useTeamManagement } from '../../hooks/useTeamManagement';
import { useTeamBalance } from '../../hooks/useTeamBalance';
import { usePlayerRating } from '../../hooks/usePlayerRating';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { PlayerCard } from '../teams/PlayerCard';
import { TeamRoster } from '../teams/TeamRoster';

/**
 * Teams Page Component
 * Single Responsibility: Orchestrate team selection workflow
 *
 * Business logic extracted to custom hooks:
 * - useTeamManagement: Team state and player assignments
 * - useTeamBalance: Auto-balance algorithm
 * - usePlayerRating: Rating management
 * - useSessionStorage: State persistence
 *
 * UI components extracted:
 * - PlayerCard: Available player display
 * - TeamRoster: Team roster display
 * - StarRating: Rating component (in PlayerCard)
 *
 */

const TeamsImproved: React.FC = () => {
  const router = useRouter();
  const [teamMode, setTeamMode] = useState<2 | 3>(3);
  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();

  // Custom hooks for business logic
  const teamManagement = useTeamManagement({
    registeredUsers,
    teamMode,
    guaranteedSpot: GuaranteedSpot,
  });

  const { autoBalance } = useTeamBalance(teamMode);

  const { updatePlayerRating } = usePlayerRating({
    availablePlayers: teamManagement.availablePlayers,
    team1: teamManagement.team1,
    team2: teamManagement.team2,
    team3: teamManagement.team3,
    setAvailablePlayers: teamManagement.setAvailablePlayers,
    setTeam1: teamManagement.setTeam1,
    setTeam2: teamManagement.setTeam2,
    setTeam3: teamManagement.setTeam3,
  });

  // Session storage persistence
  const { storedValue, setValue, isInitialized, hasStoredValue } = useSessionStorage(
    'teamSelectionState',
    {
      team1: teamManagement.team1,
      team2: teamManagement.team2,
      team3: teamManagement.team3,
      availablePlayers: teamManagement.availablePlayers,
      discardedPlayers: teamManagement.discardedPlayers,
      teamMode,
    }
  );

  // Load saved state once the session storage hook has initialized.
  // Use a ref to ensure we only apply the persisted state once to avoid
  // repeatedly re-applying it and causing a render loop.
  const restoredRef = useRef(false);

  useEffect(() => {
    // Only apply a persisted storedValue if it actually came from sessionStorage.
    if (!isInitialized || loading || restoredRef.current || !hasStoredValue) return;

    if (storedValue) {
      teamManagement.setTeam1(storedValue.team1);
      teamManagement.setTeam2(storedValue.team2);
      teamManagement.setTeam3(storedValue.team3);
      teamManagement.setAvailablePlayers(storedValue.availablePlayers);
      // Note: discardedPlayers is managed internally by useTeamManagement
      if (storedValue.teamMode) setTeamMode(storedValue.teamMode);
    }

    restoredRef.current = true;
  }, [storedValue, isInitialized, loading, hasStoredValue]);

  // Save state whenever teams change (only after initialization)
  useEffect(() => {
    // Don't save until session storage has initialized and registered users finished loading.
    if (!isInitialized || loading) return;

    setValue({
      team1: teamManagement.team1,
      team2: teamManagement.team2,
      team3: teamManagement.team3,
      availablePlayers: teamManagement.availablePlayers,
      discardedPlayers: teamManagement.discardedPlayers,
      teamMode,
    });
  }, [
    teamManagement.team1,
    teamManagement.team2,
    teamManagement.team3,
    teamManagement.availablePlayers,
    teamManagement.discardedPlayers,
    teamMode,
    isInitialized,
  ]);

  // Auto-balance handler
  const handleAutoBalance = () => {
    const result = autoBalance(teamManagement.availablePlayers, {
      team1: teamManagement.team1,
      team2: teamManagement.team2,
      team3: teamManagement.team3,
    });

    teamManagement.setTeam1(result.team1);
    teamManagement.setTeam2(result.team2);
    teamManagement.setTeam3(result.team3);
    teamManagement.setAvailablePlayers(result.remaining);
  };

  // Toggle team mode (2 or 3 teams)
  const toggleTeamMode = () => {
    setTeamMode((prevMode) => {
      if (prevMode === 3) {
        // Move Team 3 players back to available when switching to 2-team mode
        teamManagement.setAvailablePlayers((prev) => [
          ...prev,
          ...teamManagement.team3.players,
        ]);
        teamManagement.setTeam3({ name: 'Team 3', players: [] });
        return 2;
      }
      return 3;
    });
  };

  // Navigate to roster page
  const navigateToRoster = () => {
    const teamsToExport =
      teamMode === 3
        ? [teamManagement.team1, teamManagement.team2, teamManagement.team3].filter(
            (team) => team.players.length > 0
          )
        : [teamManagement.team1, teamManagement.team2].filter(
            (team) => team.players.length > 0
          );

    const teamsData = encodeURIComponent(JSON.stringify(teamsToExport));
    router.push(`/roster?teams=${teamsData}`);
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              Team Selection
            </h1>
            <TeamCardSkeleton count={3} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (usersError) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              Team Selection
            </h1>
            <div className="rounded-lg shadow-md p-6 text-center bg-red-500 text-white">
              <p className="font-medium">Error loading players. Please refresh the page.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Controls */}
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-center mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Team Selection
            </h1>

            {/* Back Link */}
            <div className="mb-6">
              <Link href="/">
                <Button variant="primary">← Back to Registration</Button>
              </Link>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-col items-center gap-2 mb-6 text-center">
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {teamMode === 2 ? '2 Teams • 10 players each' : '3 Teams • 7 players each'}
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-semibold ${
                    teamMode === 2 ? 'text-ft-primary' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  2 Teams
                </span>
                <button
                  onClick={toggleTeamMode}
                  role="switch"
                  aria-checked={teamMode === 3}
                  aria-label="Toggle between 2 and 3 team modes"
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    teamMode === 3
                      ? 'bg-ft-primary focus:ring-ft-secondary'
                      : 'bg-blue-500 focus:ring-blue-300'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition duration-300 ${
                      teamMode === 3 ? 'translate-x-10' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold ${
                    teamMode === 3 ? 'text-ft-primary' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  3 Teams
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleAutoBalance} variant="primary" size="lg">
                ⚖️ Auto Balance
              </Button>
              <Button onClick={teamManagement.clearTeams} variant="secondary" size="lg">
                🗑️ Clear All
              </Button>
              <Button onClick={navigateToRoster} variant="primary" size="lg">
                📋 View Roster
              </Button>
            </div>
          </div>

          {/* Main Content - Available Players and Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Available Players Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Available Players ({teamManagement.availablePlayers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamManagement.availablePlayers.length === 0 ? (
                  <div
                    className="col-span-2 text-center py-8 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    All players assigned
                  </div>
                ) : (
                  teamManagement.availablePlayers.map((player, index) => (
                    <PlayerCard
                      key={player.intra}
                      player={player}
                      index={index}
                      onDiscard={teamManagement.discardPlayer}
                      onAddToTeam={teamManagement.addToTeam}
                      onRatingChange={updatePlayerRating}
                      teamMode={teamMode}
                      teamsFull={{
                        team1: teamManagement.isTeamFull(1),
                        team2: teamManagement.isTeamFull(2),
                        team3: teamManagement.isTeamFull(3),
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Live Team Rosters */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Teams
              </h2>
              <div className="space-y-4">
                {/* Team 1 */}
                <TeamRoster
                  team={teamManagement.team1}
                  teamNumber={1}
                  maxPlayers={teamMode === 2 ? 10 : 7}
                  color="blue"
                  onRemovePlayer={teamManagement.removeFromTeam}
                  onUpdateName={teamManagement.updateTeamName}
                  avgRating={teamManagement.getTeamStats(teamManagement.team1).avgRating}
                />

                {/* Team 2 */}
                <TeamRoster
                  team={teamManagement.team2}
                  teamNumber={2}
                  maxPlayers={teamMode === 2 ? 10 : 7}
                  color="green"
                  onRemovePlayer={teamManagement.removeFromTeam}
                  onUpdateName={teamManagement.updateTeamName}
                  avgRating={teamManagement.getTeamStats(teamManagement.team2).avgRating}
                />

                {/* Team 3 (only in 3-team mode) */}
                {teamMode === 3 && (
                  <TeamRoster
                    team={teamManagement.team3}
                    teamNumber={3}
                    maxPlayers={7}
                    color="orange"
                    onRemovePlayer={teamManagement.removeFromTeam}
                    onUpdateName={teamManagement.updateTeamName}
                    avgRating={teamManagement.getTeamStats(teamManagement.team3).avgRating}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Waiting List */}
          {teamManagement.waitingListPlayers.length > 0 && (
            <div
              className="rounded-lg shadow-md p-6 mb-8"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                ⏳ Waiting List ({teamManagement.waitingListPlayers.length})
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Players beyond the first {GuaranteedSpot}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {teamManagement.waitingListPlayers.map((player, index) => (
                  <div
                    key={player.intra}
                    className="flex items-center gap-2 p-3 rounded"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <span className="flex-shrink-0 px-2 py-1 rounded bg-ft-accent text-white text-xs font-bold">
                      #{GuaranteedSpot + index + 1}
                    </span>
                    <span className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discarded Players Section */}
          {teamManagement.discardedPlayers.length > 0 && (
            <div
              className="rounded-lg shadow-md p-6 mb-8"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                🗑️ Discarded Players ({teamManagement.discardedPlayers.length})
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Players who did not show up
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teamManagement.discardedPlayers.map((player) => (
                  <div
                    key={player.intra}
                    className="flex items-center justify-between p-3 rounded"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="flex-1">
                      <strong className="block" style={{ color: 'var(--text-primary)' }}>
                        {player.name}
                      </strong>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {player.intra}
                      </span>
                    </div>
                    <button
                      onClick={() => teamManagement.reAddPlayer(player)}
                      className="ml-3 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold
                                 transition-colors flex items-center justify-center"
                      title="Re-add player to available list"
                    >
                      ↩️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamsImproved;
