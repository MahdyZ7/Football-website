import React, { useRef, useState } from 'react';

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
      let textContent = 'MATCH DAY LINEUP\n';
      textContent += '='.repeat(50) + '\n';
      textContent += new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + '\n\n';
      
      teams.forEach((team) => {
        if (team.players.length > 0) {
          textContent += `${team.name.toUpperCase()}\n`;
          textContent += '-'.repeat(team.name.length + 4) + '\n';
          
          team.players.forEach((player, playerIndex) => {
            textContent += `#${playerIndex + 1} ${player.name} (${player.intra})\n`;
          });
          
          const avgRating = team.players.length > 0 
            ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
            : '0';
          textContent += `\nSquad Size: ${team.players.length}/7\n`;
          textContent += `Average Rating: ${avgRating}⭐\n\n`;
        }
      });

      await navigator.clipboard.writeText(textContent);
      alert('Match day lineup copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const preloadFonts = async () => {
    // Preload Albert Sans font (Liverpool FC Albertus-style) using FontFace API
    try {
      const albertRegular = new FontFace('Albert Sans', 'url(https://fonts.gstatic.com/s/albertsans/v1/i7dOIFdwYjGaAMFtZd_QA1ZVYFeQGQyUV3U.woff2)');
      const albertBold = new FontFace('Albert Sans', 'url(https://fonts.gstatic.com/s/albertsans/v1/i7dJIFdwYjGaAMFtZd_QA1ZcYTuQFQyuXBo_RNy7OwYo.woff2)', { weight: '700' });
      const albertSemiBold = new FontFace('Albert Sans', 'url(https://fonts.gstatic.com/s/albertsans/v1/i7dJIFdwYjGaAMFtZd_QA1ZcYTuQFQyuXCo_RNy7OwYo.woff2)', { weight: '600' });
      
      await Promise.all([
        albertRegular.load(),
        albertBold.load(),
        albertSemiBold.load()
      ]);
      
      document.fonts.add(albertRegular);
      document.fonts.add(albertBold);
      document.fonts.add(albertSemiBold);
      
      // Wait for fonts to be applied
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn('Font preloading failed:', error);
      // Wait anyway to allow fallback fonts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Wait for fonts to load before capturing
      await preloadFonts();
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0a0a0a',
        useCORS: true,
        allowTaint: false,
        width: 1200,
        height: 800,
        scale: 2,
        logging: false,
        foreignObjectRendering: true,
        onclone: (clonedDoc: Document) => {
          // Force font family on all text elements in the cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              font-family: 'Albert Sans', 'Albertus MT', system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            if (el instanceof HTMLElement && el.style) {
              el.style.fontFamily = 'Albert Sans, Albertus MT, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
            }
          });
        }
      } as Parameters<typeof html2canvas>[1]);
      
      const link = document.createElement('a');
      link.download = `match-day-lineup.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : 1.0);
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
    if (!exportRef.current) {
      console.error('Export ref not found');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Wait for fonts to load and layout to commit
      await preloadFonts();
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Starting PDF export...', { element: exportRef.current });
      
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0a0a0a',
        useCORS: true,
        allowTaint: false,
        width: 1200,
        height: 800,
        logging: true,
        scale: 2,
        foreignObjectRendering: true,
        onclone: (clonedDoc: Document) => {
          // Force font family on all text elements in the cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              font-family: 'Albert Sans', 'Albertus MT', system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            if (el instanceof HTMLElement && el.style) {
              el.style.fontFamily = 'Albert Sans, Albertus MT, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
            }
          });
        }
      } as Parameters<typeof html2canvas>[1]);
      
      console.log('Canvas created for PDF:', { width: canvas.width, height: canvas.height });
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions');
      }
      
      const imgData = canvas.toDataURL('image/png');
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('match-day-lineup.pdf');
      
      console.log('PDF export successful');
    } catch (error) {
      console.error('Failed to export as PDF:', error);
      alert(`Failed to export as PDF: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // Keep visible for a moment then hide
      setTimeout(() => {
        setIsExporting(false);
        setShowExportMenu(false);
      }, 100);
    }
  };

  const getTeamStyling = (index: number) => {
    const styles = [
      {
        // Borussia Dortmund / Valencia style - Yellow and Black
        background: 'linear-gradient(135deg, #FFD700 0%, #FDB913 50%, #F0A500 100%)',
        accentBackground: '#000000',
        cardBg: '#FFFFFF',
        numberBg: '#000000',
        numberColor: '#FFD700',
        borderColor: '#FFD700',
        headerBg: 'linear-gradient(90deg, #000000 0%, #1a1a1a 100%)',
        headerText: '#FFD700',
        playerNameColor: '#000000',
        playerInfoColor: '#666666',
        statsColor: '#000000',
        stripesPattern: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
        teamBadgeBg: '#FFD700',
        teamBadgeText: '#000000',
        badgePattern: `
          linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.03) 45%, rgba(0,0,0,0.03) 55%, transparent 55%),
          linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.04) 55%, transparent 55%)
        `,
        badgeSize: '60px 60px, 60px 60px'
      },
      {
        // Chelsea / PSG style - Deep Blue
        background: 'linear-gradient(135deg, #003D7A 0%, #034694 50%, #0055A4 100%)',
        accentBackground: '#FFD700',
        cardBg: '#FFFFFF',
        numberBg: '#034694',
        numberColor: '#FFFFFF',
        borderColor: '#034694',
        headerBg: 'linear-gradient(90deg, #034694 0%, #003D7A 100%)',
        headerText: '#FFFFFF',
        playerNameColor: '#034694',
        playerInfoColor: '#666666',
        statsColor: '#034694',
        stripesPattern: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,215,0,0.1) 10px, rgba(255,215,0,0.1) 20px)',
        teamBadgeBg: '#034694',
        teamBadgeText: '#FFFFFF',
        badgePattern: `
          linear-gradient(60deg, transparent 45%, rgba(255,215,0,0.04) 45%, rgba(255,215,0,0.04) 55%, transparent 55%),
          linear-gradient(-60deg, transparent 45%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.03) 55%, transparent 55%)
        `,
        badgeSize: '70px 70px, 70px 70px'
      },
      {
        // Juventus / Newcastle style - Black and White stripes
        background: 'repeating-linear-gradient(90deg, #FFFFFF 0px, #FFFFFF 20px, #000000 20px, #000000 40px)',
        accentBackground: '#000000',
        cardBg: '#FFFFFF',
        numberBg: '#000000',
        numberColor: '#FFFFFF',
        borderColor: '#000000',
        headerBg: 'linear-gradient(90deg, #000000 0%, #2a2a2a 100%)',
        headerText: '#FFFFFF',
        playerNameColor: '#000000',
        playerInfoColor: '#666666',
        statsColor: '#000000',
        stripesPattern: 'none',
        teamBadgeBg: '#000000',
        teamBadgeText: '#FFFFFF',
        badgePattern: `
          linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.04) 45%, rgba(0,0,0,0.04) 55%, transparent 55%),
          linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.06) 55%, transparent 55%)
        `,
        badgeSize: '50px 50px, 50px 50px'
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
        background: '#0a0a0a',
        position: 'fixed',
        left: isExporting ? '0' : '-9999px',
        top: isExporting ? '0' : '-9999px',
        zIndex: isExporting ? 9999 : -1,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Albert Sans', 'Albertus MT', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Simplified field pattern background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 51%),
          linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 51%),
          radial-gradient(circle at 50% 50%, transparent 30%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 32%, transparent 32%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 400px 400px',
        backgroundPosition: 'center, center, center',
        pointerEvents: 'none',
        opacity: 0.6
      }} />
      
      {/* Stadium lights effect at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 10
      }} />
      
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        padding: '30px 40px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #FFD700',
        position: 'relative',
        zIndex: 5
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '48px',
          fontWeight: 900,
          letterSpacing: '4px',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(255,215,0,0.5), 0 4px 8px rgba(0,0,0,0.8)',
          marginBottom: '10px'
        }}>
          Match Day Lineup
        </h1>
        <div style={{
          fontSize: '18px',
          color: '#FFD700',
          fontWeight: 600,
          letterSpacing: '2px',
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

      {/* Teams Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '2px',
        background: '#0a0a0a',
        position: 'relative'
      }}>
        {teams.map((team, teamIndex) => {
          const style = getTeamStyling(teamIndex);
          return (
            <div
              key={teamIndex}
              style={{
                flex: 1,
                background: style.background,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Badge pattern texture overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: style.badgePattern,
                backgroundSize: style.badgeSize,
                pointerEvents: 'none',
                opacity: 0.5
              }} />
              
              {/* Stripes overlay for extra texture */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: style.stripesPattern,
                pointerEvents: 'none'
              }} />
              
              {/* Team Header */}
              <div style={{
                background: style.headerBg,
                padding: '20px',
                borderBottom: `3px solid ${style.borderColor}`,
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px'
                }}>
                  {/* Team Badge */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: style.teamBadgeBg,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '24px',
                    color: style.teamBadgeText,
                    border: `2px solid ${style.teamBadgeText}`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                    {teamIndex + 1}
                  </div>
                  
                  {/* Team Name */}
                  <h2 style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: 800,
                    color: style.headerText,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {team.name || `Team ${teamIndex + 1}`}
                  </h2>
                </div>
              </div>

              {/* Players List */}
              <div style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
                zIndex: 2
              }}>
                {team.players.length > 0 ? (
                  team.players.slice(0, 7).map((player, playerIndex) => (
                    <div
                      key={playerIndex}
                      style={{
                        background: style.cardBg,
                        borderLeft: `4px solid ${style.borderColor}`,
                        borderRadius: '8px',
                        padding: '12px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      {/* Jersey Number */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: style.numberBg,
                        color: style.numberColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 900,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {playerIndex + 1}
                      </div>

                      {/* Player Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: style.playerNameColor,
                          marginBottom: '2px'
                        }}>
                          {player.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: style.playerInfoColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{ fontFamily: 'monospace' }}>{player.intra}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '40px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: style.headerText,
                      fontSize: '18px',
                      fontWeight: 600,
                      opacity: 0.7
                    }}>
                      No Players Assigned
                    </div>
                  </div>
                )}
              </div>

              {/* Team Stats Footer */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px 20px',
                borderTop: `2px solid ${style.borderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(5px)',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: style.cardBg,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Squad: {team.players.length}/7
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: style.cardBg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  AVG: {
                    team.players.length > 0 
                      ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                      : '0.0'
                  }
                  <span style={{ color: '#FFD700' }}>★</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '15px',
        borderTop: '2px solid #FFD700',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 600
        }}>
          Official Lineup
        </div>
        <div style={{
          width: '2px',
          height: '20px',
          background: '#444'
        }} />
        <div style={{
          fontSize: '12px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 600
        }}>
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ExportPreview />
      
      <button
        className="px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white font-medium rounded
                           transition-all duration-200 transform hover:scale-105"
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting}
        data-testid="button-export-teams"

      >
        {isExporting ? '⏳ Exporting...' : '📤 Export Lineup'}
      </button>

      {showExportMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '8px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
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
              fontWeight: 600,
              borderBottom: '1px solid #eee',
              color: '#333',
              transition: 'background 0.2s ease'
            }}
            data-testid="button-export-pdf"
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
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              borderBottom: '1px solid #eee',
              color: '#333',
              transition: 'background 0.2s ease'
            }}
            data-testid="button-export-png"
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
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              borderBottom: '1px solid #eee',
              color: '#333',
              transition: 'background 0.2s ease'
            }}
            data-testid="button-export-jpeg"
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
              padding: '14px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              transition: 'background 0.2s ease'
            }}
            data-testid="button-copy-clipboard"
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