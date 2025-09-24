
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
      textContent += '='.repeat(40) + '\n\n';
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
          textContent += `Players: ${team.players.length}/7\n\n`;
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
        width: 1200,
        height: 800,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `football-lineups.${format}`;
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

  // Get team-specific styling inspired by PES 2011
  const getTeamStyling = (index: number) => {
    const styles = [
      // Borussia Dortmund - Black and Yellow
      {
        primaryColor: '#FDE047',
        secondaryColor: '#000000',
        accentColor: '#FACC15',
        textColor: '#000000',
        clubName: 'BVB',
        gradient: 'linear-gradient(135deg, #FDE047 0%, #FACC15 50%, #FEF08A 100%)',
        borderColor: '#000000'
      },
      // Chelsea - Blue and White
      {
        primaryColor: '#1D4ED8',
        secondaryColor: '#FFFFFF',
        accentColor: '#2563EB',
        textColor: '#FFFFFF',
        clubName: 'CFC',
        gradient: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
        borderColor: '#FFFFFF'
      },
      // Juventus - Black and White Stripes
      {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        accentColor: '#374151',
        textColor: '#FFFFFF',
        clubName: 'JUV',
        gradient: 'linear-gradient(135deg, #000000 0%, #374151 50%, #1F2937 100%)',
        borderColor: '#FFFFFF'
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
        background: '#0F172A',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 1) 100%)
        `,
        color: '#FFFFFF',
        fontFamily: '"Arial Black", Arial, sans-serif',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        overflow: 'hidden'
      }}
    >
      {/* Header Section - PES 2011 Style */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #1D4ED8 0%, #2563EB 50%, #1D4ED8 100%)',
          padding: '20px 0',
          borderRadius: '10px',
          border: '3px solid #FFFFFF',
          boxShadow: '0 0 20px rgba(29, 78, 216, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.1) 10px,
                rgba(255, 255, 255, 0.1) 20px
              )
            `
          }} />
          <h1 style={{ 
            fontSize: '42px', 
            margin: '0',
            fontWeight: '900',
            color: '#FFFFFF',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
            letterSpacing: '3px',
            position: 'relative',
            zIndex: 1
          }}>
            STARTING LINEUPS
          </h1>
          <div style={{ 
            fontSize: '16px', 
            marginTop: '8px',
            color: '#E2E8F0',
            fontWeight: '600',
            position: 'relative',
            zIndex: 1
          }}>
            {new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Teams Grid - PES 2011 Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '30px', 
        flex: 1,
        alignItems: 'stretch'
      }}>
        {teams.map((team, index) => {
          const styling = getTeamStyling(index);
          return (
            <div
              key={index}
              style={{
                background: styling.gradient,
                border: `4px solid ${styling.borderColor}`,
                borderRadius: '15px',
                padding: '25px',
                position: 'relative',
                boxShadow: `
                  0 10px 25px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                overflow: 'hidden'
              }}
            >
              {/* Team Header */}
              <div style={{
                background: styling.secondaryColor,
                color: styling.primaryColor === '#FDE047' ? '#000000' : styling.primaryColor,
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: `2px solid ${styling.borderColor}`,
                textAlign: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ 
                  margin: '0',
                  fontSize: '24px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {team.name}
                </h2>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  marginTop: '5px',
                  opacity: 0.8
                }}>
                  {styling.clubName}
                </div>
              </div>
              
              {/* Players List */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '10px',
                padding: '15px',
                color: '#1F2937',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                minHeight: '280px'
              }}>
                {team.players.length > 0 ? (
                  team.players.map((player, playerIndex) => (
                    <div
                      key={playerIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 15px',
                        margin: '8px 0',
                        background: playerIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: styling.primaryColor,
                          color: styling.primaryColor === '#FDE047' ? '#000000' : '#FFFFFF',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '900',
                          border: `2px solid ${styling.borderColor}`
                        }}>
                          {playerIndex + 1}
                        </div>
                        <span style={{ fontWeight: '700' }}>
                          {player.name}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#64748B',
                        fontFamily: 'monospace',
                        background: '#F1F5F9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        {player.intra}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#64748B', 
                    fontStyle: 'italic',
                    padding: '40px 20px',
                    fontSize: '16px'
                  }}>
                    No players assigned
                  </div>
                )}
              </div>

              {/* Team Stats Footer */}
              <div style={{ 
                marginTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '12px 15px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: '#1F2937'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  <div>PLAYERS</div>
                  <div style={{ color: styling.primaryColor, fontSize: '16px' }}>
                    {team.players.length}/7
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  <div>AVG RATING</div>
                  <div style={{ color: styling.primaryColor, fontSize: '16px' }}>
                    {team.players.length > 0 
                      ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '30px',
        textAlign: 'center',
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.3) 50%, rgba(59, 130, 246, 0.2) 100%)',
        padding: '15px',
        borderRadius: '10px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        fontSize: '14px',
        fontWeight: '600',
        color: '#E2E8F0'
      }}>
        Generated on {new Date().toLocaleDateString('en-GB')} • Football Team Management System
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
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
          color: 'white',
          border: '3px solid #FFFFFF',
          padding: '15px 25px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 6px 15px rgba(29, 78, 216, 0.4)',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(29, 78, 216, 0.6)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 15px rgba(29, 78, 216, 0.4)';
        }}
      >
        {isExporting ? '⏳ EXPORTING...' : '📋 EXPORT LINEUPS'}
      </button>

      {showExportMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '10px',
            background: '#FFFFFF',
            border: '3px solid #1D4ED8',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
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
              padding: '15px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              borderBottom: '2px solid #E2E8F0',
              color: '#1F2937',
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
            📄 Export as PDF
          </button>
          
          <button
            onClick={() => exportAsImage('png')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '15px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              borderBottom: '2px solid #E2E8F0',
              color: '#1F2937',
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
            🖼️ Export as PNG
          </button>
          
          <button
            onClick={() => exportAsImage('jpeg')}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '15px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              borderBottom: '2px solid #E2E8F0',
              color: '#1F2937',
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
            🖼️ Export as JPEG
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '15px 20px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1F2937',
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
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamExporter;
