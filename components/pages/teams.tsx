'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import { GuaranteedSpot } from "../../types/user";
import TeamExporter from "../TeamExporter";
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
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onRatingChange(star)}
            className={star <= rating ? 'star-filled' : 'star-empty'}
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

  const getTeamStats = (team: Team) => {
    const avgRating = team.players.length > 0
      ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
      : '0';
    return { avgRating, count: team.players.length };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="teams-container-v2">
          <div className="teams-header-v2">
            <h1>Team Selection</h1>
            <div className="loading-state">Loading players...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (usersError) {
    return (
      <>
        <Navbar />
        <div className="teams-container-v2">
          <div className="teams-header-v2">
            <h1>Team Selection</h1>
            <div className="error-state">Error loading players. Please refresh the page.</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="teams-container-v2">
        {/* Header with Controls */}
        <div className="teams-header-v2">
          <h1>Team Selection</h1>

          {/* Mode Selector */}
          <div className="mode-selector">
            <button
              onClick={() => setTeamMode(2)}
              className={`mode-btn ${teamMode === 2 ? 'active' : ''}`}
            >
              2 Teams (10 each)
            </button>
            <button
              onClick={() => setTeamMode(3)}
              className={`mode-btn ${teamMode === 3 ? 'active' : ''}`}
            >
              3 Teams (7 each)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={autoBalance} className="btn-primary">
              ⚖️ Auto Balance
            </button>
            <button onClick={clearTeams} className="btn-secondary">
              🗑️ Clear All
            </button>
            <TeamExporter team1={team1} team2={team2} team3={team3} />
          </div>
        </div>

        {/* Main Content - Unified View */}
        <div className="unified-view">
          {/* Available Players Section */}
          <div className="available-section">
            <h2>Available Players ({availablePlayers.length})</h2>
            <div className="player-grid">
              {availablePlayers.length === 0 ? (
                <div className="empty-state">All players assigned</div>
              ) : (
                availablePlayers.map((player, index) => (
                  <div key={player.intra} className="player-card-v2">
                    <div className="player-info-v2">
                      <span className="player-number">#{index + 1}</span>
                      <div className="player-details">
                        <strong>{player.name}</strong>
                        <span className="player-intra">{player.intra}</span>
                      </div>
                      <button
                        onClick={() => discardPlayer(player)}
                        className="discard-btn"
                        title="Remove player (didn't show up)"
                      >
                        ✕
                      </button>
                    </div>

                    <StarRating
                      rating={player.rating || 1}
                      onRatingChange={(rating) => updatePlayerRating(player.intra, rating)}
                    />

                    <div className="assign-buttons">
                      <button
                        onClick={() => addToTeam(player, 1)}
                        disabled={team1.players.length >= (teamMode === 2 ? 10 : 7)}
                        className="assign-btn team1-btn"
                      >
                        T1 {team1.players.length >= (teamMode === 2 ? 10 : 7) ? '(Full)' : ''}
                      </button>
                      <button
                        onClick={() => addToTeam(player, 2)}
                        disabled={team2.players.length >= (teamMode === 2 ? 10 : 7)}
                        className="assign-btn team2-btn"
                      >
                        T2 {team2.players.length >= (teamMode === 2 ? 10 : 7) ? '(Full)' : ''}
                      </button>
                      {teamMode === 3 && (
                        <button
                          onClick={() => addToTeam(player, 3)}
                          disabled={team3.players.length >= 7}
                          className="assign-btn team3-btn"
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
          <div className="teams-section">
            <h2>Teams</h2>
            <div className="view-teams">
            {/* Team 1 */}
            <div className="team-view-card team1-bg">
              <div className="team-view-header">
                <input
                  type="text"
                  value={team1.name}
                  onChange={(e) => updateTeamName(1, e.target.value)}
                  className="team-name-input-v2"
                  placeholder="Team 1 Name"
                />
                <span className="team-badge">{team1.players.length}/{teamMode === 2 ? 10 : 7}</span>
              </div>

              <div className="team-stats">
                <span>Average Rating: {getTeamStats(team1).avgRating} ★</span>
              </div>

              <div className="team-players-list">
                {team1.players.length === 0 ? (
                  <div className="empty-state">No players assigned</div>
                ) : (
                  team1.players.map((player, index) => (
                    <div key={player.intra} className="team-player-item">
                      <span className="player-position">#{index + 1}</span>
                      <div className="player-info-compact">
                        <strong>{player.name}</strong>
                        <span className="player-rating">{'★'.repeat(player.rating || 1)}</span>
                      </div>
                      <button
                        onClick={() => removeFromTeam(player, 1)}
                        className="remove-btn"
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
            <div className="team-view-card team2-bg">
              <div className="team-view-header">
                <input
                  type="text"
                  value={team2.name}
                  onChange={(e) => updateTeamName(2, e.target.value)}
                  className="team-name-input-v2"
                  placeholder="Team 2 Name"
                />
                <span className="team-badge">{team2.players.length}/{teamMode === 2 ? 10 : 7}</span>
              </div>

              <div className="team-stats">
                <span>Average Rating: {getTeamStats(team2).avgRating} ★</span>
              </div>

              <div className="team-players-list">
                {team2.players.length === 0 ? (
                  <div className="empty-state">No players assigned</div>
                ) : (
                  team2.players.map((player, index) => (
                    <div key={player.intra} className="team-player-item">
                      <span className="player-position">#{index + 1}</span>
                      <div className="player-info-compact">
                        <strong>{player.name}</strong>
                        <span className="player-rating">{'★'.repeat(player.rating || 1)}</span>
                      </div>
                      <button
                        onClick={() => removeFromTeam(player, 2)}
                        className="remove-btn"
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
              <div className="team-view-card team3-bg">
                <div className="team-view-header">
                  <input
                    type="text"
                    value={team3.name}
                    onChange={(e) => updateTeamName(3, e.target.value)}
                    className="team-name-input-v2"
                    placeholder="Team 3 Name"
                  />
                  <span className="team-badge">{team3.players.length}/7</span>
                </div>

                <div className="team-stats">
                  <span>Average Rating: {getTeamStats(team3).avgRating} ★</span>
                </div>

                <div className="team-players-list">
                  {team3.players.length === 0 ? (
                    <div className="empty-state">No players assigned</div>
                  ) : (
                    team3.players.map((player, index) => (
                      <div key={player.intra} className="team-player-item">
                        <span className="player-position">#{index + 1}</span>
                        <div className="player-info-compact">
                          <strong>{player.name}</strong>
                          <span className="player-rating">{'★'.repeat(player.rating || 1)}</span>
                        </div>
                        <button
                          onClick={() => removeFromTeam(player, 3)}
                          className="remove-btn"
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

        {/* Waiting List (Always visible) */}
        {waitingListPlayers.length > 0 && (
          <div className="waiting-list-section">
            <h3>⏳ Waiting List ({waitingListPlayers.length})</h3>
            <p className="text-muted text-sm">Players beyond the first {GuaranteedSpot}</p>
            <div className="waiting-list-grid">
              {waitingListPlayers.map((player, index) => (
                <div key={player.intra} className="waiting-player-card">
                  <span className="waiting-number">#{GuaranteedSpot + index + 1}</span>
                  <span>{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discarded Players Section */}
        {discardedPlayers.length > 0 && (
          <div className="discarded-list-section">
            <h3>🗑️ Discarded Players ({discardedPlayers.length})</h3>
            <p className="text-muted text-sm">Players who did not show up</p>
            <div className="discarded-list-grid">
              {discardedPlayers.map((player) => (
                <div key={player.intra} className="discarded-player-card">
                  <div className="discarded-player-info">
                    <strong>{player.name}</strong>
                    <span className="player-intra">{player.intra}</span>
                  </div>
                  <button
                    onClick={() => reAddPlayer(player)}
                    className="readd-btn"
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
      <Footer />
    </>
  );
};

export default TeamsImproved;
