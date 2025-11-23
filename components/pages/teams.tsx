'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import LoadingSpinner from "../LoadingSpinner";
import { GuaranteedSpot } from "../../types/user";
import { useUsers } from "../../hooks/useQueries";

type User = {
  name: string;
  intra: string;
  verified: boolean;
  created_at: string;
  rating?: number;
};

type Team = {
  name: string;
  players: User[];
};

const TeamsImproved: React.FC = () => {
  const router = useRouter();
  const [teamMode, setTeamMode] = useState<2 | 3>(3);
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [waitingListPlayers, setWaitingListPlayers] = useState<User[]>([]);
  const [discardedPlayers, setDiscardedPlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: "Team 1", players: [] });
  const [team2, setTeam2] = useState<Team>({ name: "Team 2", players: [] });
  const [team3, setTeam3] = useState<Team>({ name: "Team 3", players: [] });

  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();

  useEffect(() => {
    if (registeredUsers.length > 0) {
      const eligiblePlayers = registeredUsers.slice(0, GuaranteedSpot).map(user => ({ ...user, rating: 1 }));
      const waitingPlayers = registeredUsers.slice(GuaranteedSpot);

      setAvailablePlayers(eligiblePlayers);
      setWaitingListPlayers(waitingPlayers);
    }
  }, [registeredUsers]);

  const updatePlayerRating = (playerId: string, rating: number) => {
    const updateInList = (players: User[]) =>
      players.map(player => player.intra === playerId ? { ...player, rating } : player);

    setAvailablePlayers(updateInList);
    setTeam1(prev => ({ ...prev, players: updateInList(prev.players) }));
    setTeam2(prev => ({ ...prev, players: updateInList(prev.players) }));
    setTeam3(prev => ({ ...prev, players: updateInList(prev.players) }));
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1 justify-center my-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onRatingChange(star)}
            className={`text-2xl cursor-pointer transition-all duration-200 hover:scale-110 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const addToTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    const targetTeam = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;
    const maxPlayersPerTeam = teamMode === 2 ? 10 : 7;

    if (targetTeam.players.length >= maxPlayersPerTeam) return;
    if (teamNumber === 3 && teamMode === 2) return;

    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: [...prev.players, player] }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, players: [...prev.players, player] }));
    } else {
      setTeam3(prev => ({ ...prev, players: [...prev.players, player] }));
    }
    setAvailablePlayers(prev => prev.filter(p => p.intra !== player.intra));
  };

  const removeFromTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== player.intra) }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== player.intra) }));
    } else {
      setTeam3(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== player.intra) }));
    }
    setAvailablePlayers(prev => [...prev, player]);
  };

  const discardPlayer = (player: User) => {
    setAvailablePlayers(prev => prev.filter(p => p.intra !== player.intra));
    setDiscardedPlayers(prev => [...prev, player]);

    // Try to move first waiting list player to available if there's space
    if (waitingListPlayers.length > 0) {
      const nextPlayer = waitingListPlayers[0];
      setWaitingListPlayers(prev => prev.slice(1));
      setAvailablePlayers(prev => [...prev.filter(p => p.intra !== player.intra), { ...nextPlayer, rating: 1 }]);
    }
  };

  const reAddPlayer = (player: User) => {
    setDiscardedPlayers(prev => prev.filter(p => p.intra !== player.intra));
    setAvailablePlayers(prev => [...prev, player]);
  };

  const autoBalance = () => {
    const allEligiblePlayers = [...availablePlayers, ...team1.players, ...team2.players, ...team3.players];
    const sortedPlayers = allEligiblePlayers.sort((a, b) => (b.rating || 1) - (a.rating || 1));

    if (teamMode === 2) {
      const teams: User[][] = [[], []];
      const randomFirstPick = Math.floor(Math.random() * 2);
      const pickOrder: number[] = [];

      for (let round = 0; round < 10; round++) {
        if (round % 2 === 0) {
          pickOrder.push(randomFirstPick, (randomFirstPick + 1) % 2);
        } else {
          pickOrder.push((randomFirstPick + 1) % 2, randomFirstPick);
        }
      }

      sortedPlayers.slice(0, 20).forEach((player, index) => {
        teams[pickOrder[index]].push(player);
      });

      setTeam1({ name: team1.name, players: teams[0] });
      setTeam2({ name: team2.name, players: teams[1] });
      setTeam3({ name: team3.name, players: [] });
      setAvailablePlayers(sortedPlayers.slice(20));
    } else {
      const teams: User[][] = [[], [], []];
      const randomFirstPick = Math.floor(Math.random() * 3);
      const pickOrder: number[] = [];

      for (let round = 0; round < 7; round++) {
        if (round % 2 === 0) {
          pickOrder.push(randomFirstPick, (randomFirstPick + 1) % 3, (randomFirstPick + 2) % 3);
        } else {
          pickOrder.push((randomFirstPick + 2) % 3, (randomFirstPick + 1) % 3, randomFirstPick);
        }
      }

      sortedPlayers.slice(0, 21).forEach((player, index) => {
        teams[pickOrder[index]].push(player);
      });

      setTeam1({ name: team1.name, players: teams[0] });
      setTeam2({ name: team2.name, players: teams[1] });
      setTeam3({ name: team3.name, players: teams[2] });
      setAvailablePlayers(sortedPlayers.slice(21));
    }
  };

  const clearTeams = () => {
    const allCurrentPlayers = [...availablePlayers, ...team1.players, ...team2.players, ...team3.players, ...discardedPlayers];
    const ratingMap = new Map();
    allCurrentPlayers.forEach(player => {
      ratingMap.set(player.intra, player.rating || 1);
    });

    const eligiblePlayers = registeredUsers.slice(0, GuaranteedSpot).map(user => ({
      ...user,
      rating: ratingMap.get(user.intra) || 1
    }));

    setAvailablePlayers(eligiblePlayers);
    setTeam1({ name: "Team 1", players: [] });
    setTeam2({ name: "Team 2", players: [] });
    setTeam3({ name: "Team 3", players: [] });
    setDiscardedPlayers([]);
  };

  const updateTeamName = (teamNumber: 1 | 2 | 3, newName: string) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, name: newName }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, name: newName }));
    } else {
      setTeam3(prev => ({ ...prev, name: newName }));
    }
  };

  const toggleTeamMode = () => {
    setTeamMode(prevMode => {
      if (prevMode === 3) {
        setAvailablePlayers(prev => [...prev, ...team3.players]);
        setTeam3(prev => ({ ...prev, players: [] }));
        return 2;
      }
      return 3;
    });
  };

  const getTeamStats = (team: Team) => {
    const avgRating = team.players.length > 0
      ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
      : '0';
    return { avgRating, count: team.players.length };
  };

  const navigateToRoster = () => {
    // Prepare teams data for the roster page
    const teamsToExport = teamMode === 3
      ? [team1, team2, team3].filter(team => team.players.length > 0)
      : [team1, team2].filter(team => team.players.length > 0);

    // Encode teams data as URL parameter
    const teamsData = encodeURIComponent(JSON.stringify(teamsToExport));
    router.push(`/roster?teams=${teamsData}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
              Team Selection
            </h1>
            <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <LoadingSpinner message="Loading players..." />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Controls */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
              Team Selection
            </h1>

            {/* Back Link */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary
                           text-white font-medium rounded transition-all duration-200 transform hover:scale-105"
              >
                ← Back to Registration
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
              <button
                onClick={autoBalance}
                className="px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white font-medium rounded
                           transition-all duration-200 transform hover:scale-105"
              >
                ⚖️ Auto Balance
              </button>
              <button
                onClick={clearTeams}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded
                           transition-all duration-200 transform hover:scale-105"
              >
                🗑️ Clear All
              </button>
              <button
                onClick={navigateToRoster}
                className="px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white font-medium rounded
                           transition-all duration-200 transform hover:scale-105"
              >
                📋 View Roster
              </button>
            </div>
          </div>

          {/* Main Content - Unified View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Available Players Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Available Players ({availablePlayers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availablePlayers.length === 0 ? (
                  <div className="col-span-2 text-center py-8 rounded-lg" style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)'
                  }}>
                    All players assigned
                  </div>
                ) : (
                  availablePlayers.map((player, index) => (
                    <div
                      key={player.intra}
                      className="rounded-lg p-4 shadow-md"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ft-primary text-white text-sm font-bold">
                          #{index + 1}
                        </span>
                        <button
                          onClick={() => discardPlayer(player)}
                          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                          title="Remove player (didn't show up)"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mb-3">
                        <strong className="block" style={{ color: 'var(--text-primary)' }}>
                          {player.name}
                        </strong>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {player.intra}
                        </span>
                      </div>

                      <StarRating
                        rating={player.rating || 1}
                        onRatingChange={(rating) => updatePlayerRating(player.intra, rating)}
                      />

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => addToTeam(player, 1)}
                          disabled={team1.players.length >= (teamMode === 2 ? 10 : 7)}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded
                                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          T1 {team1.players.length >= (teamMode === 2 ? 10 : 7) ? '(Full)' : ''}
                        </button>
                        <button
                          onClick={() => addToTeam(player, 2)}
                          disabled={team2.players.length >= (teamMode === 2 ? 10 : 7)}
                          className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded
                                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          T2 {team2.players.length >= (teamMode === 2 ? 10 : 7) ? '(Full)' : ''}
                        </button>
                        {teamMode === 3 && (
                          <button
                            onClick={() => addToTeam(player, 3)}
                            disabled={team3.players.length >= 7}
                            className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded
                                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            T3 {team3.players.length >= 7 ? '(Full)' : ''}
                          </button>
                        )}
                      </div>
                    </div>
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
                <div className="rounded-lg p-4 shadow-md border-l-4 border-blue-500" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={team1.name}
                      onChange={(e) => updateTeamName(1, e.target.value)}
                      className="flex-1 px-3 py-2 rounded border font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Team 1 Name"
                    />
                    <span className="ml-3 px-3 py-1 rounded-full bg-blue-500 text-white font-bold text-sm">
                      {team1.players.length}/{teamMode === 2 ? 10 : 7}
                    </span>
                  </div>

                  <div className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Average Rating: {getTeamStats(team1).avgRating} ★
                  </div>

                  <div className="space-y-2">
                    {team1.players.length === 0 ? (
                      <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                        No players assigned
                      </div>
                    ) : (
                      team1.players.map((player, index) => (
                        <div
                          key={player.intra}
                          className="flex items-center gap-3 p-2 rounded"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <span className="flex-shrink-0 w-8 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <strong style={{ color: 'var(--text-primary)' }}>{player.name}</strong>
                            <span className="ml-2 text-yellow-400">{'★'.repeat(player.rating || 1)}</span>
                          </div>
                          <button
                            onClick={() => removeFromTeam(player, 1)}
                            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                            title="Remove from team"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Team 2 */}
                <div className="rounded-lg p-4 shadow-md border-l-4 border-green-500" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={team2.name}
                      onChange={(e) => updateTeamName(2, e.target.value)}
                      className="flex-1 px-3 py-2 rounded border font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Team 2 Name"
                    />
                    <span className="ml-3 px-3 py-1 rounded-full bg-green-500 text-white font-bold text-sm">
                      {team2.players.length}/{teamMode === 2 ? 10 : 7}
                    </span>
                  </div>

                  <div className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Average Rating: {getTeamStats(team2).avgRating} ★
                  </div>

                  <div className="space-y-2">
                    {team2.players.length === 0 ? (
                      <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                        No players assigned
                      </div>
                    ) : (
                      team2.players.map((player, index) => (
                        <div
                          key={player.intra}
                          className="flex items-center gap-3 p-2 rounded"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <span className="flex-shrink-0 w-8 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <strong style={{ color: 'var(--text-primary)' }}>{player.name}</strong>
                            <span className="ml-2 text-yellow-400">{'★'.repeat(player.rating || 1)}</span>
                          </div>
                          <button
                            onClick={() => removeFromTeam(player, 2)}
                            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                            title="Remove from team"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Team 3 */}
                {teamMode === 3 && (
                  <div className="rounded-lg p-4 shadow-md border-l-4 border-orange-500" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={team3.name}
                        onChange={(e) => updateTeamName(3, e.target.value)}
                        className="flex-1 px-3 py-2 rounded border font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Team 3 Name"
                      />
                      <span className="ml-3 px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-sm">
                        {team3.players.length}/7
                      </span>
                    </div>

                    <div className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Average Rating: {getTeamStats(team3).avgRating} ★
                    </div>

                    <div className="space-y-2">
                      {team3.players.length === 0 ? (
                        <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                          No players assigned
                        </div>
                      ) : (
                        team3.players.map((player, index) => (
                          <div
                            key={player.intra}
                            className="flex items-center gap-3 p-2 rounded"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <span className="flex-shrink-0 w-8 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>
                              #{index + 1}
                            </span>
                            <div className="flex-1">
                              <strong style={{ color: 'var(--text-primary)' }}>{player.name}</strong>
                              <span className="ml-2 text-yellow-400">{'★'.repeat(player.rating || 1)}</span>
                            </div>
                            <button
                              onClick={() => removeFromTeam(player, 3)}
                              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                              title="Remove from team"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Waiting List */}
          {waitingListPlayers.length > 0 && (
            <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                ⏳ Waiting List ({waitingListPlayers.length})
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Players beyond the first {GuaranteedSpot}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {waitingListPlayers.map((player, index) => (
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
          {discardedPlayers.length > 0 && (
            <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                🗑️ Discarded Players ({discardedPlayers.length})
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Players who did not show up
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {discardedPlayers.map((player) => (
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
                      onClick={() => reAddPlayer(player)}
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
