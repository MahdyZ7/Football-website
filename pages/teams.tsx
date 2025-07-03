
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";

const MAXPLAYERS = 21;

type User = {
  name: string;
  id: string;
  verified: boolean;
  created_at: string;
  rating?: number;
};

type Team = {
  name: string;
  players: User[];
};

const Teams: React.FC = () => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [waitingListPlayers, setWaitingListPlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: "Team 1", players: [] });
  const [team2, setTeam2] = useState<Team>({ name: "Team 2", players: [] });
  const [team3, setTeam3] = useState<Team>({ name: "Team 3", players: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only include verified players and first 21 for team selection
          const verifiedPlayers = data.filter(user => user.verified);
          const eligiblePlayers = data.slice(0, MAXPLAYERS).map(user => ({ ...user, rating: 1 }));
          const waitingPlayers = data.slice(MAXPLAYERS);

          setRegisteredUsers(data);
          setAvailablePlayers(eligiblePlayers);
          setWaitingListPlayers(waitingPlayers);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching registered users:", error);
        setRegisteredUsers([]);
        setAvailablePlayers([]);
        setWaitingListPlayers([]);
        setLoading(false);
      });
  }, []);

  const updatePlayerRating = (playerId: string, rating: number) => {
    setAvailablePlayers(prev => 
      prev.map(player => 
        player.id === playerId ? { ...player, rating } : player
      )
    );
    
    // Also update rating in teams
    setTeam1(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId ? { ...player, rating } : player
      )
    }));
    
    setTeam2(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId ? { ...player, rating } : player
      )
    }));
    
    setTeam3(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId ? { ...player, rating } : player
      )
    }));
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3].map((star) => (
          <span
            key={star}
            onClick={() => onRatingChange(star)}
            style={{
              cursor: 'pointer',
              color: star <= rating ? '#FFD700' : '#ccc',
              fontSize: '16px'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const addToTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    const targetTeam = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;

    // Check if team already has 7 players
    if (targetTeam.players.length >= 7) {
      return; // Don't add if team is full
    }

    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: [...prev.players, player] }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, players: [...prev.players, player] }));
    } else {
      setTeam3(prev => ({ ...prev, players: [...prev.players, player] }));
    }
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const removeFromTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: prev.players.filter(p => p.id !== player.id) }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, players: prev.players.filter(p => p.id !== player.id) }));
    } else {
      setTeam3(prev => ({ ...prev, players: prev.players.filter(p => p.id !== player.id) }));
    }
    setAvailablePlayers(prev => [...prev, player]);
  };

  const autoBalance = () => {
    const allEligiblePlayers = [...availablePlayers, ...team1.players, ...team2.players, ...team3.players];

    // Sort by rating (highest first) then shuffle within rating groups for fairness
    const sortedPlayers = allEligiblePlayers.sort((a, b) => (b.rating || 1) - (a.rating || 1));
    
    // Distribute players evenly across teams by rating
    const team1Players: User[] = [];
    const team2Players: User[] = [];
    const team3Players: User[] = [];
    
    sortedPlayers.forEach((player, index) => {
      if (index % 3 === 0 && team1Players.length < 7) {
        team1Players.push(player);
      } else if (index % 3 === 1 && team2Players.length < 7) {
        team2Players.push(player);
      } else if (team3Players.length < 7) {
        team3Players.push(player);
      } else if (team1Players.length < 7) {
        team1Players.push(player);
      } else if (team2Players.length < 7) {
        team2Players.push(player);
      }
    });

    const remainingPlayers = allEligiblePlayers.slice(21);

    setTeam1({ name: "Team 1", players: team1Players });
    setTeam2({ name: "Team 2", players: team2Players });
    setTeam3({ name: "Team 3", players: team3Players });
    setAvailablePlayers(remainingPlayers);
  };

  const clearTeams = () => {
    const verifiedPlayers = registeredUsers.filter(user => user);
    const eligiblePlayers = verifiedPlayers.slice(0, MAXPLAYERS).map(user => ({ ...user, rating: user.rating || 1 }));

    setAvailablePlayers(eligiblePlayers);
    setTeam1({ name: "Team 1", players: [] });
    setTeam2({ name: "Team 2", players: [] });
    setTeam3({ name: "Team 3", players: [] });
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <h1>Team Selection</h1>
          <p style={{ textAlign: 'center' }}>Loading players...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Team Selection (3 Teams of 7)</h1>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button 
            onClick={autoBalance}
            style={{ marginRight: '1rem', background: 'var(--ft-primary)' }}
          >
            Auto Balance Teams
          </button>
          <button 
            onClick={clearTeams}
            style={{ background: 'var(--ft-accent)' }}
          >
            Clear All Teams
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Available Players for Team Selection */}
          <div className="card">
            <h3>Available for Teams ({availablePlayers.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availablePlayers.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  All eligible players assigned to teams
                </p>
              ) : (
                availablePlayers.map((player, index) => (
                  <div
                    key={player.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      margin: '0.5rem 0',
                      padding: '0.8rem',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>#{index + 1} {player.name} ({player.id})</span>
                      <StarRating 
                        rating={player.rating || 1} 
                        onRatingChange={(rating) => updatePlayerRating(player.id, rating)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => addToTeam(player, 1)}
                        disabled={team1.players.length >= 7}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.7rem',
                          background: team1.players.length >= 7 ? '#666' : 'var(--ft-primary)',
                          cursor: team1.players.length >= 7 ? 'not-allowed' : 'pointer',
                          opacity: team1.players.length >= 7 ? 0.6 : 1,
                          flex: 1
                        }}
                      >
                        T1 {team1.players.length >= 7 ? '(Full)' : ''}
                      </button>
                      <button
                        onClick={() => addToTeam(player, 2)}
                        disabled={team2.players.length >= 7}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.7rem',
                          background: team2.players.length >= 7 ? '#666' : 'var(--ft-secondary)',
                          cursor: team2.players.length >= 7 ? 'not-allowed' : 'pointer',
                          opacity: team2.players.length >= 7 ? 0.6 : 1,
                          flex: 1
                        }}
                      >
                        T2 {team2.players.length >= 7 ? '(Full)' : ''}
                      </button>
                      <button
                        onClick={() => addToTeam(player, 3)}
                        disabled={team3.players.length >= 7}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.7rem',
                          background: team3.players.length >= 7 ? '#666' : '#28a745',
                          cursor: team3.players.length >= 7 ? 'not-allowed' : 'pointer',
                          opacity: team3.players.length >= 7 ? 0.6 : 1,
                          flex: 1
                        }}
                      >
                        T3 {team3.players.length >= 7 ? '(Full)' : ''}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team 1 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                value={team1.name}
                onChange={(e) => updateTeamName(1, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  width: '100%'
                }}
              />
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                ({team1.players.length}/7)
              </span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {team1.players.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No players assigned
                </p>
              ) : (
                team1.players.map((player, index) => (
                  <div
                    key={player.id}
                    style={{
                      background: 'var(--ft-primary)',
                      color: 'white',
                      margin: '0.5rem 0',
                      padding: '0.8rem',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{index + 1}. {player.name} ({player.id})</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarRating 
                          rating={player.rating || 1} 
                          onRatingChange={(rating) => updatePlayerRating(player.id, rating)}
                        />
                        <button
                          onClick={() => removeFromTeam(player, 1)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            background: 'var(--ft-accent)',
                            color: 'white'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                value={team2.name}
                onChange={(e) => updateTeamName(2, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  width: '100%'
                }}
              />
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                ({team2.players.length}/7)
              </span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {team2.players.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No players assigned
                </p>
              ) : (
                team2.players.map((player, index) => (
                  <div
                    key={player.id}
                    style={{
                      background: 'var(--ft-secondary)',
                      color: 'white',
                      margin: '0.5rem 0',
                      padding: '0.8rem',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{index + 1}. {player.name} ({player.id})</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarRating 
                          rating={player.rating || 1} 
                          onRatingChange={(rating) => updatePlayerRating(player.id, rating)}
                        />
                        <button
                          onClick={() => removeFromTeam(player, 2)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            background: 'var(--ft-accent)',
                            color: 'white'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team 3 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                value={team3.name}
                onChange={(e) => updateTeamName(3, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  width: '100%'
                }}
              />
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                ({team3.players.length}/7)
              </span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {team3.players.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No players assigned
                </p>
              ) : (
                team3.players.map((player, index) => (
                  <div
                    key={player.id}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      margin: '0.5rem 0',
                      padding: '0.8rem',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{index + 1}. {player.name} ({player.id})</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarRating 
                          rating={player.rating || 1} 
                          onRatingChange={(rating) => updatePlayerRating(player.id, rating)}
                        />
                        <button
                          onClick={() => removeFromTeam(player, 3)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            background: 'var(--ft-accent)',
                            color: 'white'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Waiting List for players beyond 21 */}
        {waitingListPlayers.length > 0 && (
          <div className="card">
            <h3>Waiting List ({waitingListPlayers.length})</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Players beyond the first 21 registered (not eligible for current game)
            </p>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {waitingListPlayers.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    margin: '0.5rem 0',
                    padding: '0.8rem',
                    borderRadius: '4px',
                    opacity: 0.7
                  }}
                >
                  #{MAXPLAYERS + index + 1} {player.name} ({player.id})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="card">
          <h3>Team Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div>
              <h4 style={{ color: 'var(--ft-primary)' }}>{team1.name}</h4>
              <p>{team1.players.length} players</p>
              <p>Avg Rating: {team1.players.length > 0 ? (team1.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team1.players.length).toFixed(1) : '0'}</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--ft-secondary)' }}>{team2.name}</h4>
              <p>{team2.players.length} players</p>
              <p>Avg Rating: {team2.players.length > 0 ? (team2.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team2.players.length).toFixed(1) : '0'}</p>
            </div>
            <div>
              <h4 style={{ color: '#28a745' }}>{team3.name}</h4>
              <p>{team3.players.length} players</p>
              <p>Avg Rating: {team3.players.length > 0 ? (team3.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team3.players.length).toFixed(1) : '0'}</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)' }}>Available</h4>
              <p>{availablePlayers.length} players</p>
            </div>
            {waitingListPlayers.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--text-secondary)' }}>Waiting List</h4>
                <p>{waitingListPlayers.length} players</p>
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
