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

const Teams: React.FC = () => {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [waitingListPlayers, setWaitingListPlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: "Team 1", players: [] });
  const [team2, setTeam2] = useState<Team>({ name: "Team 2", players: [] });
  const [team3, setTeam3] = useState<Team>({ name: "Team 3", players: [] });
  const [removedPlayers, setRemovedPlayers] = useState<User[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<User | null>(null);
  const [dragSource, setDragSource] = useState<'available' | 'team1' | 'team2' | 'team3' | null>(null);

  // React Query hook
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
    setAvailablePlayers(prev => 
      prev.map(player => 
        player.intra === playerId ? { ...player, rating } : player
      )
    );

    setTeam1(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.intra === playerId ? { ...player, rating } : player
      )
    }));

    setTeam2(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.intra === playerId ? { ...player, rating } : player
      )
    }));

    setTeam3(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.intra === playerId ? { ...player, rating } : player
      )
    }));
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onRatingChange(star)}
            style={{
              color: star <= rating ? '#FFD700' : '#ccc',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleDragStart = (e: React.DragEvent, player: User, source: 'available' | 'team1' | 'team2' | 'team3') => {
    setDraggedPlayer(player);
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, target: 'available' | 'team1' | 'team2' | 'team3') => {
    e.preventDefault();

    if (!draggedPlayer || !dragSource || dragSource === target) {
      return;
    }

    // Remove from source
    if (dragSource === 'available') {
      setAvailablePlayers(prev => prev.filter(p => p.intra !== draggedPlayer.intra));
    } else if (dragSource === 'team1') {
      setTeam1(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== draggedPlayer.intra) }));
    } else if (dragSource === 'team2') {
      setTeam2(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== draggedPlayer.intra) }));
    } else if (dragSource === 'team3') {
      setTeam3(prev => ({ ...prev, players: prev.players.filter(p => p.intra !== draggedPlayer.intra) }));
    }

    // Add to target
    if (target === 'available') {
      setAvailablePlayers(prev => [...prev, draggedPlayer]);
    } else if (target === 'team1' && team1.players.length < 7) {
      setTeam1(prev => ({ ...prev, players: [...prev.players, draggedPlayer] }));
    } else if (target === 'team2' && team2.players.length < 7) {
      setTeam2(prev => ({ ...prev, players: [...prev.players, draggedPlayer] }));
    } else if (target === 'team3' && team3.players.length < 7) {
      setTeam3(prev => ({ ...prev, players: [...prev.players, draggedPlayer] }));
    }

    setDraggedPlayer(null);
    setDragSource(null);
  };

  const addToTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    const targetTeam = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;

    if (targetTeam.players.length >= 7) {
      return;
    }

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

  const autoBalance = () => {
    const allEligiblePlayers = [...availablePlayers, ...team1.players, ...team2.players, ...team3.players];
    const sortedPlayers = allEligiblePlayers.sort((a, b) => (b.rating || 1) - (a.rating || 1));

    const teams: User[][] = [[], [], []];

	const randomfirstpick = Math.floor(Math.random() * 3);

    const pickOrder: number[] = [];
    for (let round = 0; round < 7; round++) {
      if (round % 2 === 0) {
        pickOrder.push(randomfirstpick, (randomfirstpick + 1) % 3, (randomfirstpick + 2) % 3);
      } else {
        pickOrder.push((randomfirstpick + 2) % 3, (randomfirstpick + 1) % 3, randomfirstpick);
      }
    }

    // Assign players using snake draft order
    sortedPlayers.slice(0, 21).forEach((player, index) => {
      const teamIndex = pickOrder[index];
      teams[teamIndex].push(player);
    });

    const remainingPlayers = allEligiblePlayers.slice(21);

    setTeam1({ name: team1.name, players: teams[0] });
    setTeam2({ name: team2.name, players: teams[1] });
    setTeam3({ name: team3.name, players: teams[2] });
    setAvailablePlayers(remainingPlayers);
  };

  const removeFromEligible = (playerId: string) => {
    const removedPlayer = availablePlayers.find(p => p.intra === playerId);
    if (!removedPlayer) return;

    const updatedAvailable = availablePlayers.filter(p => p.intra !== playerId);
    setRemovedPlayers(prev => [...prev, removedPlayer]);

    if (waitingListPlayers.length > 0) {
      const nextPlayer = waitingListPlayers[0];
      const promotedPlayer = { ...nextPlayer, rating: 1 };

      setAvailablePlayers([...updatedAvailable, promotedPlayer]);
      setWaitingListPlayers(prev => prev.slice(1));
    } else {
      setAvailablePlayers(updatedAvailable);
    }
  };

  const restoreRemovedPlayer = (playerId: string) => {
    const playerToRestore = removedPlayers.find(p => p.intra === playerId);
    if (!playerToRestore) return;

    setRemovedPlayers(prev => prev.filter(p => p.intra !== playerId));

    if (availablePlayers.length >= GuaranteedSpot) {
      const playerToWaitingList = availablePlayers[availablePlayers.length - 1];
      setWaitingListPlayers(prev => [playerToWaitingList, ...prev]);
      setAvailablePlayers(prev => [...prev.slice(0, -1), playerToRestore]);
    } else {
      setAvailablePlayers(prev => [...prev, playerToRestore]);
    }
  };

  const clearTeams = () => {
    const allCurrentPlayers = [...availablePlayers, ...team1.players, ...team2.players, ...team3.players];
    const ratingMap = new Map();
    allCurrentPlayers.forEach(player => {
      ratingMap.set(player.intra, player.rating || 1);
    });

    const verifiedPlayers = registeredUsers.filter(user => user);
    const eligiblePlayers = verifiedPlayers.slice(0, GuaranteedSpot).map(user => ({ 
      ...user, 
      rating: ratingMap.get(user.intra) || 1 
    }));

    setAvailablePlayers(eligiblePlayers);
    setTeam1({ name: "Team 1", players: [] });
    setTeam2({ name: "Team 2", players: [] });
    setTeam3({ name: "Team 3", players: [] });
    setRemovedPlayers([]);
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

  const PlayerCard = ({ player, index, source, showTeamButtons = false }: { 
    player: User; 
    index: number; 
    source: 'available' | 'team1' | 'team2' | 'team3';
    showTeamButtons?: boolean;
  }) => (
    <div
      className="player-card"
      draggable
      onDragStart={(e) => handleDragStart(e, player, source)}
    >
      <div className="player-info">
        <span className="player-name">
          {index >= 0 && `${index + 1}. `}{player.name} ({player.intra})
        </span>
        <div className="player-actions">
          <StarRating 
            rating={player.rating || 1} 
            onRatingChange={(rating) => updatePlayerRating(player.intra, rating)}
          />
          {source === 'available' && (
            <button
              className="icon-button"
              onClick={() => removeFromEligible(player.intra)}
              title="Remove from eligible players"
            >
              🗑️
            </button>
          )}
          {source !== 'available' && (
            <button
              className="icon-button"
              onClick={() => removeFromTeam(player, source === 'team1' ? 1 : source === 'team2' ? 2 : 3)}
              title="Remove from team"
            >
              ❌
            </button>
          )}
        </div>
      </div>
      {showTeamButtons && (
        <div className="team-buttons">
          <button
            className="team-button team1"
            onClick={() => addToTeam(player, 1)}
            disabled={team1.players.length >= 7}
            title="Add to Team 1"
          >
            <span>🟦</span> T1 {team1.players.length >= 7 ? '(Full)' : ''}
          </button>
          <button
            className="team-button team2"
            onClick={() => addToTeam(player, 2)}
            disabled={team2.players.length >= 7}
            title="Add to Team 2"
          >
            <span>🟩</span> T2 {team2.players.length >= 7 ? '(Full)' : ''}
          </button>
          <button
            className="team-button team3"
            onClick={() => addToTeam(player, 3)}
            disabled={team3.players.length >= 7}
            title="Add to Team 3"
          >
            <span>🟨</span> T3 {team3.players.length >= 7 ? '(Full)' : ''}
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="teams-container">
        <Navbar />
          <div className="teams-header">
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
        <div className="teams-container">
        <Navbar />
          <div className="teams-header">
            <h1>Team Selection</h1>
            <div className="error-state" style={{ color: '#ff8080', textAlign: 'center', padding: '2rem' }}>
              Error loading players. Please refresh the page.
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="teams-container">
		<Navbar />
	    <div className="teams-header">
          <h1>Team Selection (3 Teams of 7)</h1>
          <div className="teams-controls">
            <button onClick={autoBalance}>
              ⚖️ Auto Balance Teams
            </button>
            <button onClick={clearTeams}>
              🗑️ Clear All Teams
            </button>
            <TeamExporter team1={team1} team2={team2} team3={team3} />
          </div>
        </div>

        <div className="teams-grid">
          {/* Available Players */}
          <div 
            className="team-card available-players"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'available')}
          >
            <div className="team-header">
              <h3>Available Players ({availablePlayers.length})</h3>
            </div>
            <div className="player-list">
              {availablePlayers.length === 0 ? (
                <div className="empty-state">
                  All eligible players assigned to teams
                </div>
              ) : (
                availablePlayers.map((player, index) => (
                  <PlayerCard 
                    key={player.intra} 
                    player={player} 
                    index={index} 
                    source="available"
                    showTeamButtons={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Team 1 */}
          <div 
            className="team-card team1-players"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'team1')}
          >
            <div className="team-header">
              <input
                type="text"
                value={team1.name}
                onChange={(e) => updateTeamName(1, e.target.value)}
                className="team-name-input"
                placeholder="Team 1 Name"
              />
              <span className="team-count">({team1.players.length}/7)</span>
            </div>
            <div className="player-list">
              {team1.players.length === 0 ? (
                <div className="empty-state">
                  Drag players here or use buttons
                </div>
              ) : (
                team1.players.map((player, index) => (
                  <PlayerCard 
                    key={player.intra} 
                    player={player} 
                    index={index} 
                    source="team1"
                  />
                ))
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div 
            className="team-card team2-players"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'team2')}
          >
            <div className="team-header">
              <input
                type="text"
                value={team2.name}
                onChange={(e) => updateTeamName(2, e.target.value)}
                className="team-name-input"
                placeholder="Team 2 Name"
              />
              <span className="team-count">({team2.players.length}/7)</span>
            </div>
            <div className="player-list">
              {team2.players.length === 0 ? (
                <div className="empty-state">
                  Drag players here or use buttons
                </div>
              ) : (
                team2.players.map((player, index) => (
                  <PlayerCard 
                    key={player.intra} 
                    player={player} 
                    index={index} 
                    source="team2"
                  />
                ))
              )}
            </div>
          </div>

          {/* Team 3 */}
          <div 
            className="team-card team3-players"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'team3')}
          >
            <div className="team-header">
              <input
                type="text"
                value={team3.name}
                onChange={(e) => updateTeamName(3, e.target.value)}
                className="team-name-input"
                placeholder="Team 3 Name"
              />
              <span className="team-count">({team3.players.length}/7)</span>
            </div>
            <div className="player-list">
              {team3.players.length === 0 ? (
                <div className="empty-state">
                  Drag players here or use buttons
                </div>
              ) : (
                team3.players.map((player, index) => (
                  <PlayerCard 
                    key={player.intra} 
                    player={player} 
                    index={index} 
                    source="team3"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Removed Players Section */}
        {removedPlayers.length > 0 && (
          <div className="summary-card">
            <h3>Recently Removed Players ({removedPlayers.length})</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Players removed from team selection (can be restored)
            </p>
            <div className="player-list" style={{ maxHeight: '200px' }}>
              {removedPlayers.map((player) => (
                <div key={player.intra} className="player-card">
                  <div className="player-info">
                    <span className="player-name">{player.name} ({player.intra})</span>
                    <button
                      className="icon-button"
                      onClick={() => restoreRemovedPlayer(player.intra)}
                      title="Restore player"
                    >
                      ↩️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting List */}
        {waitingListPlayers.length > 0 && (
          <div className="summary-card">
            <h3>Waiting List ({waitingListPlayers.length})</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Players beyond the first 21 registered (not eligible for current game)
            </p>
            <div className="player-list" style={{ maxHeight: '200px' }}>
              {waitingListPlayers.map((player, index) => (
                <div key={player.intra} className="player-card">
                  <span className="player-name">
                    #{GuaranteedSpot + index + 1} {player.name} ({player.intra})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Summary */}
        <div className="summary-card">
          <h3>Team Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <h4 style={{ color: 'var(--ft-primary)' }}>🟦 {team1.name}</h4>
              <p>{team1.players.length} players</p>
              <p>Avg Rating: {team1.players.length > 0 ? (team1.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team1.players.length).toFixed(1) : '0'}</p>
            </div>
            <div className="summary-item">
              <h4 style={{ color: 'var(--ft-secondary)' }}>🟩 {team2.name}</h4>
              <p>{team2.players.length} players</p>
              <p>Avg Rating: {team2.players.length > 0 ? (team2.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team2.players.length).toFixed(1) : '0'}</p>
            </div>
            <div className="summary-item">
              <h4 style={{ color: '#28a745' }}>🟨 {team3.name}</h4>
              <p>{team3.players.length} players</p>
              <p>Avg Rating: {team3.players.length > 0 ? (team3.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team3.players.length).toFixed(1) : '0'}</p>
            </div>
            <div className="summary-item">
              <h4 style={{ color: 'var(--text-secondary)' }}>📋 Available</h4>
              <p>{availablePlayers.length} players</p>
            </div>
            {waitingListPlayers.length > 0 && (
              <div className="summary-item">
                <h4 style={{ color: 'var(--text-secondary)' }}>⏳ Waiting</h4>
                <p>{waitingListPlayers.length} players</p>
              </div>
            )}
            {removedPlayers.length > 0 && (
              <div className="summary-item">
                <h4 style={{ color: 'var(--ft-accent)' }}>🗑️ Removed</h4>
                <p>{removedPlayers.length} players</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Teams;