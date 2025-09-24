
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
      let textContent = 'FOOTBALL TEAM LINEUPS\n';
      textContent += '='.repeat(50) + '\n\n';
      teams.forEach((team, index) => {
        if (team.players.length > 0) {
          textContent += `${team.name.toUpperCase()}\n`;
          textContent += '-'.repeat(team.name.length + 4) + '\n';
          
          team.players.forEach((player, playerIndex) => {
            textContent += `${playerIndex + 1}. ${player.name} (${player.intra})\n`;
          });
          
          const avgRating = team.players.length > 0 
            ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
            : '0';
          textContent += `Average Rating: ${avgRating}\n`;
          textContent += `Squad Size: ${team.players.length}/7\n\n`;
        }
      });

      await navigator.clipboard.writeText(textContent);
      alert('Team lineups copied to clipboard!');
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
        width: 1400,
        height: 900,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `football-lineups.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
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
        width: 1400,
        height: 900,
        scale: 2,
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
      pdf.save('football-lineups.pdf');
    } catch (error) {
      console.error('Failed to export as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Team configurations with authentic football club colors
  const getTeamConfig = (index: number) => {
    const configs = [
      // Borussia Dortmund - Yellow & Black
      {
        name: 'Borussia Dortmund',
        primaryColor: '#FDE047', // Bright yellow
        secondaryColor: '#000000', // Black
        accentColor: '#FACC15', // Golden yellow
        textColor: '#000000',
        badgeGradient: 'linear-gradient(135deg, #FDE047 0%, #FACC15 50%, #EAB308 100%)',
        backgroundPattern: `
          radial-gradient(circle at 20% 30%, rgba(253, 224, 71, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(250, 204, 21, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%)
        `,
        clubBadge: '⚡',
        established: '1909'
      },
      // Chelsea - Blue & White
      {
        name: 'Chelsea FC',
        primaryColor: '#034694', // Chelsea blue
        secondaryColor: '#FFFFFF', // White
        accentColor: '#FFD700', // Gold
        textColor: '#FFFFFF',
        badgeGradient: 'linear-gradient(135deg, #034694 0%, #0066CC 50%, #4169E1 100%)',
        backgroundPattern: `
          radial-gradient(circle at 25% 25%, rgba(3, 70, 148, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(0, 102, 204, 0.1) 0%, transparent 50%),
          linear-gradient(60deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
          linear-gradient(-30deg, rgba(255, 215, 0, 0.03) 25%, transparent 25%)
        `,
        clubBadge: '🦁',
        established: '1905'
      },
      // Juventus - Black & White stripes
      {
        name: 'Juventus FC',
        primaryColor: '#000000', // Black
        secondaryColor: '#FFFFFF', // White
        accentColor: '#D4AF37', // Gold
        textColor: '#FFFFFF',
        badgeGradient: 'linear-gradient(135deg, #000000 0%, #2D2D2D 50%, #1A1A1A 100%)',
        backgroundPattern: `
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0px, rgba(255, 255, 255, 0.1) 20px, transparent 20px, transparent 40px),
          repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.05) 0px, rgba(212, 175, 55, 0.05) 10px, transparent 10px, transparent 20px),
          radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%)
        `,
        clubBadge: '👑',
        established: '1897'
      }
    ];
    return configs[index];
  };

  const ExportPreview = () => (
    <div
      ref={exportRef}
      className="export-preview"
      style={{
        width: '1400px',
        height: '900px',
        padding: '40px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        color: 'white',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
        `
      }}
    >
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '30px',
        borderRadius: '20px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          letterSpacing: '2px'
        }}>
          TEAM LINEUPS
        </div>
        <div style={{
          fontSize: '18px',
          color: '#E2E8F0',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <span>⚽ MATCHDAY</span>
          <span style={{ color: '#FFD700' }}>•</span>
          <span>{new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <span style={{ color: '#FFD700' }}>•</span>
          <span>OFFICIAL LINEUPS</span>
        </div>
      </div>

      {/* Teams Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '30px', 
        flex: 1 
      }}>
        {teams.map((team, index) => {
          const config = getTeamConfig(index);
          return (
            <div
              key={index}
              style={{
                background: config.badgeGradient,
                borderRadius: '25px',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
                border: `3px solid ${config.accentColor}`,
                backgroundImage: config.backgroundPattern,
                backgroundSize: '60px 60px, 80px 80px, 40px 40px, 40px 40px'
              }}
            >
              {/* Club Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '25px',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '15px',
                border: `2px solid ${config.accentColor}20`
              }}>
                <div style={{
                  fontSize: '36px',
                  marginBottom: '8px'
                }}>
                  {config.clubBadge}
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: config.textColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  marginBottom: '5px',
                  letterSpacing: '1px'
                }}>
                  {team.name || config.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: config.accentColor,
                  fontWeight: '600',
                  opacity: 0.9
                }}>
                  EST. {config.established}
                </div>
              </div>

              {/* Squad List */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                padding: '20px',
                minHeight: '320px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: config.primaryColor,
                  marginBottom: '15px',
                  textAlign: 'center',
                  padding: '10px',
                  background: `${config.accentColor}20`,
                  borderRadius: '8px',
                  border: `2px solid ${config.accentColor}40`
                }}>
                  STARTING XI
                </div>

                {team.players.length > 0 ? (
                  team.players.slice(0, 11).map((player, playerIndex) => (
                    <div
                      key={playerIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 15px',
                        margin: '8px 0',
                        background: playerIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                        borderRadius: '10px',
                        border: `2px solid ${config.primaryColor}10`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: config.badgeGradient,
                          color: config.textColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          {playerIndex + 1}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: config.primaryColor,
                            lineHeight: '1.2'
                          }}>
                            {player.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            fontFamily: 'monospace',
                            fontWeight: '500'
                          }}>
                            @{player.intra}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          background: `${config.accentColor}20`,
                          color: config.primaryColor,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          ⭐ {player.rating || 1}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#64748B',
                    fontStyle: 'italic',
                    padding: '40px 20px',
                    fontSize: '14px'
                  }}>
                    No players selected
                  </div>
                )}

                {/* Team Stats */}
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: `${config.primaryColor}05`,
                  borderRadius: '10px',
                  border: `2px solid ${config.primaryColor}20`
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: config.primaryColor
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '800' }}>
                        {team.players.length}
                      </div>
                      <div>SQUAD SIZE</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      color: config.primaryColor
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '800' }}>
                        {team.players.length > 0 
                          ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                          : '0.0'}
                      </div>
                      <div>AVG RATING</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Badge */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        border: '2px solid #FFD700'
      }}>
        <span style={{ fontSize: '18px' }}>⚽</span>
        <span>OFFICIAL LINEUP</span>
        <span style={{ color: '#FFD700' }}>•</span>
        <span>{new Date().toLocaleDateString('en-GB')}</span>
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
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: 'white',
          border: 'none',
          padding: '14px 24px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 6px 12px rgba(22, 163, 74, 0.3)',
          transition: 'all 0.3s ease',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #15803D 0%, #166534 100%)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(22, 163, 74, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(22, 163, 74, 0.3)';
        }}
      >
        {isExporting ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⚽</span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>📋</span>
            <span>Export Lineups</span>
          </>
        )}
      </button>

      {showExportMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '10px',
            background: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '200px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => exportAsPDF()}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>📄</span>
            <span>Export as PDF</span>
          </button>
          
          <button
            onClick={() => exportAsImage('png')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>🖼️</span>
            <span>Export as PNG</span>
          </button>
          
          <button
            onClick={() => exportAsImage('jpeg')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>🖼️</span>
            <span>Export as JPEG</span>
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>📋</span>
            <span>Copy to Clipboard</span>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TeamExporter;
