import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TeamExporter from '../components/TeamExporter';

// Sample team data for testing
const sampleTeams = {
  team1: {
    name: "Yellow Thunders",
    players: [
      { name: "Mohamed Salah", intra: "msalah", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Sadio Mané", intra: "smane", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Roberto Firmino", intra: "rfirmino", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Virgil van Dijk", intra: "vvandijk", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Jordan Henderson", intra: "jhenderson", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Andrew Robertson", intra: "arobertson", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Trent Alexander-Arnold", intra: "talexander", verified: true, created_at: "2024-01-01", rating: 4 }
    ]
  },
  team2: {
    name: "Blue Eagles",
    players: [
      { name: "N'Golo Kanté", intra: "nkante", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Mason Mount", intra: "mmount", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Thiago Silva", intra: "tsilva", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Reece James", intra: "rjames", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Ben Chilwell", intra: "bchilwell", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Kai Havertz", intra: "khavertz", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Romelu Lukaku", intra: "rlukaku", verified: true, created_at: "2024-01-01", rating: 5 }
    ]
  },
  team3: {
    name: "Black & White United",
    players: [
      { name: "Cristiano Ronaldo", intra: "cronaldo", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Paulo Dybala", intra: "pdybala", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Giorgio Chiellini", intra: "gchiellini", verified: true, created_at: "2024-01-01", rating: 5 },
      { name: "Federico Chiesa", intra: "fchiesa", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Weston McKennie", intra: "wmckennie", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Manuel Locatelli", intra: "mlocatelli", verified: true, created_at: "2024-01-01", rating: 4 },
      { name: "Dusan Vlahovic", intra: "dvlahovic", verified: true, created_at: "2024-01-01", rating: 5 }
    ]
  }
};

const ExportPreviewPage = () => {
  const router = useRouter();
  const [showExportPreview, setShowExportPreview] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button
          onClick={() => router.push('/teams')}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
          data-testid="button-back-teams"
        >
          ← Back to Teams
        </button>
        
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827'
        }}>
          Export Preview & Debug
        </h1>
      </nav>

      {/* Debug Controls */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Debug Controls
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <input
              type="checkbox"
              checked={showExportPreview}
              onChange={(e) => setShowExportPreview(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            Show Export Preview
          </label>
          
          <div style={{
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            This page shows exactly what gets exported
          </div>
        </div>
      </div>

      {/* Export Component */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Export Functionality Test
        </h2>
        
        <TeamExporter
          team1={sampleTeams.team1}
          team2={sampleTeams.team2}
          team3={sampleTeams.team3}
        />
      </div>

      {/* Visible Preview Section */}
      {showExportPreview && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151'
          }}>
            What Should Be Exported (Visible Preview)
          </h2>
          
          <div style={{
            border: '2px dashed #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9fafb'
          }}>
            <VisibleExportPreview
              team1={sampleTeams.team1}
              team2={sampleTeams.team2}
              team3={sampleTeams.team3}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified visible version of ExportPreview for debugging
const VisibleExportPreview = ({ team1, team2, team3 }: any) => {
  const teams = [team1, team2, team3];
  
  const getTeamStyling = (index: number) => {
    const styles = [
      {
        background: 'linear-gradient(135deg, #FFD700 0%, #FDB913 50%, #F0A500 100%)',
        headerBg: 'linear-gradient(90deg, #000000 0%, #1a1a1a 100%)',
        headerText: '#FFD700',
        cardBg: '#FFFFFF',
        numberBg: '#000000',
        numberColor: '#FFD700',
        borderColor: '#FFD700',
        playerNameColor: '#000000',
        playerInfoColor: '#666666',
        teamBadgeBg: '#FFD700',
        teamBadgeText: '#000000'
      },
      {
        background: 'linear-gradient(135deg, #003D7A 0%, #034694 50%, #0055A4 100%)',
        headerBg: 'linear-gradient(90deg, #034694 0%, #003D7A 100%)',
        headerText: '#FFFFFF',
        cardBg: '#FFFFFF',
        numberBg: '#034694',
        numberColor: '#FFFFFF',
        borderColor: '#034694',
        playerNameColor: '#034694',
        playerInfoColor: '#666666',
        teamBadgeBg: '#034694',
        teamBadgeText: '#FFFFFF'
      },
      {
        background: 'repeating-linear-gradient(90deg, #FFFFFF 0px, #FFFFFF 20px, #000000 20px, #000000 40px)',
        headerBg: 'linear-gradient(90deg, #000000 0%, #2a2a2a 100%)',
        headerText: '#FFFFFF',
        cardBg: '#FFFFFF',
        numberBg: '#000000',
        numberColor: '#FFFFFF',
        borderColor: '#000000',
        playerNameColor: '#000000',
        playerInfoColor: '#666666',
        teamBadgeBg: '#000000',
        teamBadgeText: '#FFFFFF'
      }
    ];
    return styles[index];
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      height: '600px',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
      position: 'relative',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        padding: '30px 40px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #FFD700'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: 900,
          letterSpacing: '3px',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          textShadow: '0 0 15px rgba(255,215,0,0.5)',
          marginBottom: '10px'
        }}>
          Match Day Lineup
        </h1>
        <div style={{
          fontSize: '14px',
          color: '#FFD700',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Teams */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '2px',
        background: '#0a0a0a'
      }}>
        {teams.map((team, teamIndex) => {
          const style = getTeamStyling(teamIndex);
          return (
            <div
              key={teamIndex}
              style={{
                flex: 1,
                background: style.background,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Team Header */}
              <div style={{
                background: style.headerBg,
                padding: '15px',
                borderBottom: `2px solid ${style.borderColor}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: style.teamBadgeBg,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '20px',
                    color: style.teamBadgeText,
                    border: `2px solid ${style.teamBadgeText}`
                  }}>
                    {teamIndex + 1}
                  </div>
                  
                  <h2 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 800,
                    color: style.headerText,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {team.name || `Team ${teamIndex + 1}`}
                  </h2>
                </div>
              </div>

              {/* Players */}
              <div style={{
                flex: 1,
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {team.players.slice(0, 7).map((player: any, playerIndex: number) => (
                  <div
                    key={playerIndex}
                    style={{
                      background: style.cardBg,
                      borderLeft: `3px solid ${style.borderColor}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: style.numberBg,
                      color: style.numberColor,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 900
                    }}>
                      {playerIndex + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: style.playerNameColor,
                        marginBottom: '2px'
                      }}>
                        {player.name}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: style.playerInfoColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontFamily: 'monospace' }}>{player.intra}</span>
                        {player.rating && (
                          <span style={{ color: '#FFD700' }}>
                            {'★'.repeat(player.rating)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team Stats */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px 15px',
                borderTop: `2px solid ${style.borderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: style.cardBg,
                  textTransform: 'uppercase'
                }}>
                  Squad: {team.players.length}/7
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: style.cardBg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  AVG: {
                    team.players.length > 0 
                      ? (team.players.reduce((sum: number, p: any) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                      : '0.0'
                  }
                  <span style={{ color: '#FFD700' }}>★</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExportPreviewPage;