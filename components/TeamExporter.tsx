
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
      let textContent = '42 TEAMS LINEUPS\n';
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
        width: 1600,
        height: 900,
      });
      
      const link = document.createElement('a');
      link.download = `Matchday-lineups.${format}`;
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
        width: 1600,
        height: 900,
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
      pdf.save('Matchday-lineups.pdf');
    } catch (error) {
      console.error('Failed to export as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const getTeamConfig = (index: number) => {
    const configs = [
      {
        primaryColor: '#FDE047',
        secondaryColor: '#000000',
        textColor: '#000000',
        badgeBg: 'linear-gradient(145deg, #FDE047 0%, #FACC15 100%)',
      },
      {
        primaryColor: '#034694',
        secondaryColor: '#FFFFFF',
        textColor: '#FFFFFF',
        badgeBg: 'linear-gradient(145deg, #034694 0%, #0066CC 100%)',
      },
      {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        textColor: '#FFFFFF',
        badgeBg: 'linear-gradient(145deg, #000000 0%, #2D2D2D 100%)',
      }
    ];
    return configs[index];
  };

  const ExportPreview = () => (
    <div
      ref={exportRef}
      className="export-preview"
      style={{
        width: '1600px',
        height: '900px',
        background: '#0B1426',
        color: '#FFFFFF',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 80% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)
        `
      }}
    >
      <div style={{ 
        background: 'linear-gradient(135deg, #3B0764 0%, #1E1B4B 50%, #0F172A 100%)',
        padding: '30px 50px',
        borderBottom: '4px solid #8B5CF6',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(139, 92, 246, 0.03) 0px, rgba(139, 92, 246, 0.03) 2px, transparent 2px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.02) 0px, rgba(59, 130, 246, 0.02) 2px, transparent 2px, transparent 20px)
          `,
          zIndex: 1
        }}></div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontSize: '42px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              42 LEAGUE
            </div>
            <div style={{
              fontSize: '16px',
              color: '#8B5CF6',
              fontWeight: '600',
              letterSpacing: '1px',
              marginTop: '5px'
            }}>
              OFFICIAL TEAM LINEUPS
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#FFFFFF',
              marginBottom: '5px' 
            }}>
              MATCHDAY
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#CBD5E1',
              fontWeight: '500'
            }}>
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div style={{ 
        flex: 1,
        padding: '40px 50px',
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '40px'
      }}>
        {teams.map((team, index) => {
          const config = getTeamConfig(index);
          return (
            <div
              key={index}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '16px',
                padding: '0',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Team Header */}
              <div style={{
                background: config.badgeBg,
                padding: '25px 30px',
                textAlign: 'center',
                position: 'relative',
                borderBottom: '3px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: config.textColor,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                  textShadow: config.textColor === '#FFFFFF' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(255,255,255,0.3)'
                }}>
                  {team.name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: config.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
                }}>
                </div>
              </div>

              {/* Player List */}
              <div style={{
                padding: '30px',
                background: 'rgba(255, 255, 255, 0.98)',
                margin: '0',
                minHeight: '400px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: config.primaryColor,
                  textAlign: 'center',
                  marginBottom: '25px',
                  padding: '12px',
                  background: `${config.primaryColor}10`,
                  borderRadius: '8px',
                  border: `2px solid ${config.primaryColor}20`,
                  letterSpacing: '1px'
                }}>
                  STARTING ELEVEN
                </div>

                <div style={{ marginBottom: '25px' }}>
                  {team.players.length > 0 ? (
                    team.players.slice(0, 11).map((player, playerIndex) => (
                      <div
                        key={playerIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '4px',
                          background: config.badgeBg,
                          color: config.textColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '800',
                          marginRight: '15px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                        }}>
                          {playerIndex + 1}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1E293B',
                            marginBottom: '2px'
                          }}>
                            {player.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748B',
                            fontFamily: 'monospace',
                            fontWeight: '500'
                          }}>
                            @{player.intra}
                          </div>
                        </div>

                        <div style={{
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                        }}>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#94A3B8',
                      fontStyle: 'italic',
                      padding: '60px 20px',
                      fontSize: '14px'
                    }}>
                      No players selected
                    </div>
                  )}
                </div>

                {/* Team Statistics */}
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1px 1fr',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: config.primaryColor,
                        marginBottom: '5px'
                      }}>
                        {team.players.length}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#475569',
                        letterSpacing: '1px'
                      }}>
                        SQUAD SIZE
                      </div>
                    </div>
                    
                    <div style={{
                      width: '1px',
                      height: '40px',
                      background: '#CBD5E1'
                    }}></div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: config.primaryColor,
                        marginBottom: '5px'
                      }}>
                        {team.players.length > 0 
                          ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                          : '0.0'}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#475569',
                        letterSpacing: '1px'
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

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        padding: '25px 50px',
        borderTop: '2px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#94A3B8',
          fontWeight: '500'
        }}>
          42 Matchday Lineups
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#FFFFFF'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            letterSpacing: '1px'
          }}>
            LIVE
          </span>
          <span>{new Date().toLocaleDateString('en-GB')}</span>
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
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          color: 'white',
          border: 'none',
          padding: '16px 28px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.3s ease',
          fontFamily: '"Inter", "Helvetica Neue", sans-serif'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
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
            marginTop: '12px',
            background: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '220px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
        >
          <button
            onClick={() => exportAsPDF()}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
              e.currentTarget.style.color = '#1E293B';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#374151';
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
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
              e.currentTarget.style.color = '#1E293B';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#374151';
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
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              borderBottom: '1px solid #F1F5F9',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
              e.currentTarget.style.color = '#1E293B';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#374151';
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
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
              e.currentTarget.style.color = '#1E293B';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#374151';
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
