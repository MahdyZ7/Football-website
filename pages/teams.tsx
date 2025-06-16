
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";

const MAXPLAYERS = 18;
type User = {
  name: string;
  id: string;
  verified: boolean;
  created_at: string;
};

type Team = {
  name: string;
  players: User[];
};

const Teams: React.FC = () => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: "Team 1", players: [] });
  const [team2, setTeam2] = useState<Team>({ name: "Team 2", players: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only include verified players for team selection
          const verifiedPlayers = data.filter(user => user.verified);
          setRegisteredUsers(data);
          setAvailablePlayers(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching registered users:", error);
        setRegisteredUsers([]);
        setAvailablePlayers([]);
        setLoading(false);
      });
  }, []);

  const addToTeam = (player: User, teamNumber: 1 | 2) => {
    const targetTeam = teamNumber === 1 ? team1 : team2;
    
    // Check if team already has 9 players
    if (targetTeam.players.length >= 9) {
      return; // Don't add if team is full
    }
    
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: [...prev.players, player] }));
    } else {
      setTeam2(prev => ({ ...prev, players: [...prev.players, player] }));
    }
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const removeFromTeam = (player: User, teamNumber: 1 | 2) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: prev.players.filter(p => p.id !== player.id) }));
    } else {
      setTeam2(prev => ({ ...prev, players: prev.players.filter(p => p.id !== player.id) }));
    }
    setAvailablePlayers(prev => [...prev, player]);
  };

  const autoBalance = () => {
    const allPlayers = [...availablePlayers, ...team1.players, ...team2.players];
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
    
    // Assign up to 9 players per team
    const team1Players = shuffled.slice(0, MAXPLAYERS/2);
    const team2Players = shuffled.slice(MAXPLAYERS/2, MAXPLAYERS);
    const remainingPlayers = shuffled.slice(MAXPLAYERS);
    
    setTeam1({ name: "Team 1", players: team1Players });
    setTeam2({ name: "Team 2", players: team2Players });
    setAvailablePlayers(remainingPlayers);
  };

  const clearTeams = () => {
    setAvailablePlayers(registeredUsers);
    setTeam1({ name: "Team 1", players: [] });
    setTeam2({ name: "Team 2", players: [] });
  };

  const updateTeamName = (teamNumber: 1 | 2, newName: string) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, name: newName }));
    } else {
      setTeam2(prev => ({ ...prev, name: newName }));
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
        <h1>Team Selection</h1>
        
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
          {/* Available Players */}
          <div className="card">
            <h3>Waiting List ({availablePlayers.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availablePlayers.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  All players assigned to teams
                </p>
              ) : (
                availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      margin: '0.5rem 0',
                      padding: '0.8rem',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{player.name} ({player.id})</span>
                    <div>
                      <button
                        onClick={() => addToTeam(player, 1)}
                        disabled={team1.players.length >= 9}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.8rem',
                          marginRight: '0.5rem',
                          background: team1.players.length >= 9 ? '#666' : 'var(--ft-primary)',
                          cursor: team1.players.length >= 9 ? 'not-allowed' : 'pointer',
                          opacity: team1.players.length >= 9 ? 0.6 : 1
                        }}
                      >
                        Team 1 {team1.players.length >= 9 ? '(Full)' : ''}
                      </button>
                      <button
                        onClick={() => addToTeam(player, 2)}
                        disabled={team2.players.length >= 9}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.8rem',
                          background: team2.players.length >= 9 ? '#666' : 'var(--ft-secondary)',
                          cursor: team2.players.length >= 9 ? 'not-allowed' : 'pointer',
                          opacity: team2.players.length >= 9 ? 0.6 : 1
                        }}
                      >
                        Team 2 {team2.players.length >= 9 ? '(Full)' : ''}
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
                ({team1.players.length}/9)
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
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{index + 1}. {player.name} ({player.id})</span>
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
                ({team2.players.length}/9)
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
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{index + 1}. {player.name} ({player.id})</span>
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <h3>Team Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div>
              <h4 style={{ color: 'var(--ft-primary)' }}>{team1.name}</h4>
              <p>{team1.players.length} players</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--ft-secondary)' }}>{team2.name}</h4>
              <p>{team2.players.length} players</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)' }}>Waiting List</h4>
              <p>{availablePlayers.length} players</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Teams;
