import React, { useRef, useState } from 'react';
// Dynamic imports for client-side only to avoid SSR issues

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

interface TeamExporterProps {
  team1: Team;
  team2: Team;
  team3: Team;
}

const TeamExporter: React.FC<TeamExporterProps> = ({ team1, team2, team3 }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const teams = [team1, team2, team3];

  const copyToClipboard = async () => {
    try {
      setIsExporting(true);
      let textContent = 'FOOTBALL TEAM ROSTERS\n';
      textContent += '='.repeat(40) + '\n\n';
      teams.forEach((team, index) => {
        if (team.players.length > 0) {
          textContent += `${team.name.toUpperCase()}\n`;
          textContent += '-'.repeat(team.name.length + 4) + '\n';
          
          team.players.forEach((player, playerIndex) => {
            const rating = '⭐'.repeat(player.rating || 1);
            textContent += `${playerIndex + 1}. ${player.name} (${player.intra})\n`;
          });
          
          const avgRating = team.players.length > 0 
            ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
            : '0';
          textContent += `Average Rating: ${avgRating}\n`;
          textContent += `Players: ${team.players.length}/7\n\n`;
        }
      });

      await navigator.clipboard.writeText(textContent);
      alert('Team rosters copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    
    try {
      setIsExporting(true);
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(exportRef.current, {
        background: '#ffffff',
        useCORS: true,
        allowTaint: false,
        width: 1200,
        height: 800,
      });
      
      const link = document.createElement('a');
      link.download = `football-teams-roster.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      link.click();
    } catch (error) {
      console.error('Failed to export as image:', error);
      alert('Failed to export as image. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    
    try {
      setIsExporting(true);
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(exportRef.current, {
        background: '#ffffff',
        useCORS: true,
        allowTaint: false,
        width: 1200,
        height: 800,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('football-teams-roster.pdf');
    } catch (error) {
      console.error('Failed to export as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Helper function to get team-specific styling
  const getTeamStyling = (index: number) => {
    const styles = [
      // Borussia Dortmund - Authentic Yellow & Black
      {
        background: `linear-gradient(135deg, #FDE100 0%, #FFD700 40%, #FFAC00 100%)`,
        backgroundPattern: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 2px, transparent 2px, transparent 8px),
          repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 6px),
          radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
          radial-gradient(circle at 70% 30%, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
        `,
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: '4px solid #000000',
        textColor: '#000000',
        headerColor: '#FDE100',
        accentColor: '#000000'
      },
      // Chelsea FC - Authentic Blue & White
      {
        background: `linear-gradient(135deg, #034694 0%, #1f5ba6 50%, #0066cc 100%)`,
        backgroundPattern: `
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.1) 0px, rgba(255, 255, 255, 0.1) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 8px),
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        cardBg: 'rgba(255, 255, 255, 0.98)',
        cardBorder: '4px solid #034694',
        textColor: '#034694',
        headerColor: '#034694',
        accentColor: '#FFFFFF'
      },
      // Juventus FC - Authentic Black & White Stripes
      {
        background: `
          repeating-linear-gradient(90deg, 
            #000000 0px, #000000 30px, 
            #FFFFFF 30px, #FFFFFF 60px
          ),
          linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(255,255,255,0.1) 100%)
        `,
        backgroundPattern: `
          repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 10px),
          repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 8px),
          radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 2px, transparent 2px)
        `,
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: '4px solid #FFD700',
        textColor: '#000000',
        headerColor: '#000000',
        accentColor: '#FFD700'
      }
    ];
    return styles[index];
  };

  const ExportPreview = () => (
    <div
      ref={exportRef}
      className="export-preview"
      style={{
        width: '1200px',
        height: '800px',
        padding: '0',
        background: `
          radial-gradient(ellipse at center, #1a4a3a 0%, #0a2a1a 40%, #051a0a 100%),
          repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 22px),
          repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 22px)
        `,
        backgroundBlendMode: 'multiply, normal, normal',
        color: 'white',
        fontFamily: "'Roboto Condensed', 'Arial Black', Arial, sans-serif",
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Stadium Floodlight Effects */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '200px',
        background: `
          radial-gradient(ellipse 300px 100px at 20% 0%, rgba(255, 255, 255, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 300px 100px at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 300px 100px at 80% 0%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Main Header Section */}
      <div style={{ 
        background: `
          linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%),
          linear-gradient(45deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)
        `,
        padding: '25px 40px',
        borderBottom: '3px solid #FFD700',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Corner Design Elements */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
        }} />

        {/* Main Title */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '900',
            margin: '0',
            background: 'linear-gradient(45deg, #FFD700, #FFFFFF, #FFD700)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: "'Impact', 'Arial Black', sans-serif"
          }}>
            ⚽ TEAM LINEUPS ⚽
          </div>
          
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            marginTop: '8px',
            color: '#FFD700',
            textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
            letterSpacing: '2px'
          }}>
            OFFICIAL ROSTER ANNOUNCEMENT
          </div>
          
          <div style={{
            fontSize: '14px',
            marginTop: '5px',
            color: '#cccccc',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            letterSpacing: '1px'
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </div>
        </div>

        {/* Decorative Lines */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
        }} />
      </div>

      {/* Stadium Atmosphere Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 90% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
          linear-gradient(0deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '400px 400px, 400px 400px, 600px 600px, 30px 30px, 30px 30px',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flex: 1, padding: '20px', position: 'relative', zIndex: 2 }}>
        {teams.map((team, index) => {
          const styling = getTeamStyling(index);
          const teamNames = ['BORUSSIA DORTMUND', 'CHELSEA FC', 'JUVENTUS FC'];
          return (
            <div
              key={index}
              style={{
                flex: 1,
                background: `
                  linear-gradient(135deg, ${styling.cardBg} 0%, rgba(255,255,255,0.9) 100%),
                  ${styling.background}
                `,
                border: styling.cardBorder,
                borderRadius: '20px',
                padding: '0',
                color: styling.textColor,
                boxShadow: `
                  0 12px 25px rgba(0,0,0,0.4),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
                position: 'relative',
                overflow: 'hidden',
                backgroundBlendMode: 'normal, overlay'
              }}
            >
              {/* Team Header with Club Styling */}
              <div style={{
                background: styling.background,
                backgroundImage: styling.backgroundPattern,
                backgroundSize: '40px 40px, 25px 25px, 20px 20px, 15px 15px',
                padding: '20px 15px',
                borderRadius: '20px 20px 0 0',
                position: 'relative',
                borderBottom: `3px solid ${styling.accentColor}`
              }}>
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                  borderRadius: '20px 20px 0 0'
                }} />
                
                <h2 style={{ 
                  textAlign: 'center', 
                  margin: '0', 
                  fontSize: '18px',
                  color: 'white',
                  fontWeight: '900',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  position: 'relative',
                  zIndex: 2,
                  fontFamily: "'Impact', 'Arial Black', sans-serif"
                }}>
                  {teamNames[index]}
                </h2>
                
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: '5px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  position: 'relative',
                  zIndex: 2
                }}>
                  STARTING XI
                </div>
              </div>

              {/* Team Content */}
              <div style={{ padding: '20px' }}>
              
              <div style={{ marginBottom: '15px' }}>
                  {team.players.length > 0 ? (
                    team.players.map((player, playerIndex) => (
                      <div
                        key={playerIndex}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 15px',
                          margin: '8px 0',
                          background: `
                            linear-gradient(90deg, 
                              ${playerIndex % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(248,250,252,0.9)'} 0%, 
                              ${playerIndex % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(248,250,252,0.95)'} 100%
                            )
                          `,
                          borderRadius: '12px',
                          fontSize: '13px',
                          border: `1px solid ${styling.accentColor}20`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, ${styling.accentColor}, ${styling.headerColor})`,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}>
                            {playerIndex + 1}
                          </div>
                          <span style={{ 
                            fontWeight: '700',
                            color: styling.textColor,
                            fontSize: '14px'
                          }}>
                            {player.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            color: styling.headerColor,
                            fontFamily: "'Courier New', monospace",
                            fontWeight: '600',
                            background: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {player.intra}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      fontStyle: 'italic',
                      padding: '30px 20px',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '12px',
                      border: '2px dashed #ccc'
                    }}>
                      NO PLAYERS ASSIGNED
                    </div>
                  )}
                </div>

                {/* Team Stats Footer */}
                <div style={{ 
                  background: `linear-gradient(135deg, ${styling.headerColor}15, ${styling.accentColor}15)`,
                  borderRadius: '12px',
                  padding: '15px',
                  borderTop: `3px solid ${styling.accentColor}`,
                  marginTop: '15px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      flex: 1
                    }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '900',
                        color: styling.headerColor,
                        fontFamily: "'Impact', sans-serif"
                      }}>
                        {team.players.length}/7
                      </div>
                      <div style={{ 
                        fontSize: '10px',
                        color: styling.textColor,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        PLAYERS
                      </div>
                    </div>
                    
                    <div style={{
                      width: '2px',
                      height: '40px',
                      background: `linear-gradient(180deg, transparent, ${styling.accentColor}, transparent)`
                    }} />
                    
                    <div style={{ 
                      textAlign: 'center',
                      flex: 1
                    }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '900',
                        color: styling.headerColor,
                        fontFamily: "'Impact', sans-serif"
                      }}>
                        {team.players.length > 0 
                          ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                          : '0.0'
                        }
                      </div>
                      <div style={{ 
                        fontSize: '10px',
                        color: styling.textColor,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        AVG RATING
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
      })}
      </div>

      {/* Stadium Footer Banner */}
      <div style={{ 
        background: `
          linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%),
          linear-gradient(45deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)
        `,
        padding: '15px 40px',
        marginTop: 'auto',
        borderTop: '3px solid #FFD700',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            ⚽ OFFICIAL LINEUP ANNOUNCEMENT
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFD700',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            letterSpacing: '1px'
          }}>
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} • KICK-OFF IMMINENT
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ExportPreview />
      
      <button
        className="export-button"
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#218838';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#28a745';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isExporting ? '⏳ Exporting...' : '📤 Export Teams'}
      </button>

      {showExportMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '8px',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <button
            onClick={() => exportAsPDF()}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              borderBottom: '1px solid #eee',
              color: '#333'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📄 Export as PDF
          </button>
          
          <button
            onClick={() => exportAsImage('png')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              borderBottom: '1px solid #eee',
              color: '#333'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🖼️ Export as PNG
          </button>
          
          <button
            onClick={() => exportAsImage('jpeg')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              borderBottom: '1px solid #eee',
              color: '#333'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🖼️ Export as JPEG
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#333'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamExporter;