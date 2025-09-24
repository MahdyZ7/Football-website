import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      let textContent = '📋 FOOTBALL TEAM ROSTERS\n';
      textContent += '='.repeat(40) + '\n\n';
      teams.forEach((team, index) => {
        if (team.players.length > 0) {
          textContent += `🏆 ${team.name.toUpperCase()}\n`;
          textContent += '-'.repeat(team.name.length + 4) + '\n';
          
          team.players.forEach((player, playerIndex) => {
            const rating = '⭐'.repeat(player.rating || 1);
            textContent += `${playerIndex + 1}. ${player.name} (${player.intra})\n`;
          });
          
          const avgRating = team.players.length > 0 
            ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
            : '0';
          textContent += `📊 Average Rating: ${avgRating}\n`;
          textContent += `👥 Players: ${team.players.length}/7\n\n`;
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
      
      const canvas = await html2canvas(exportRef.current, {
        background: '#ffffff',
        useCORS: true,
        allowTaint: false,
        width: 1200,
        height: 800,
      });
      
      const imgData = canvas.toDataURL('image/png');
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
      // Valencia/Borussia Dortmund - Yellow theme
      {
        background: `linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)`,
        backgroundPattern: `
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
          linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%)
        `,
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: '3px solid #FF8C00',
        textColor: '#B8860B',
        headerColor: '#DAA520',
        accentColor: '#FF8C00'
      },
      // Chelsea/Inter Milan - Blue theme  
      {
        background: `linear-gradient(135deg, #034694 0%, #0068A8 50%, #4169E1 100%)`,
        backgroundPattern: `
          radial-gradient(circle at 30% 40%, rgba(255, 215, 0, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
          linear-gradient(60deg, rgba(255, 215, 0, 0.1) 25%, transparent 25%),
          linear-gradient(-30deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%)
        `,
        cardBg: 'rgba(255, 255, 255, 0.98)',
        cardBorder: '3px solid #FFD700',
        textColor: '#034694',
        headerColor: '#0068A8',
        accentColor: '#FFD700'
      },
      // Newcastle FC - Black and white theme
      {
        background: `linear-gradient(135deg, #241F20 0%, #36454F 50%, #2F4F4F 100%)`,
        backgroundPattern: `
          repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0px, rgba(255, 255, 255, 0.1) 10px, transparent 10px, transparent 20px),
          repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 5px, transparent 5px, transparent 15px),
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px)
        `,
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: '3px solid #FFD700',
        textColor: '#241F20',
        headerColor: '#36454F', 
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
        background: '#f0f0f0',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {teams.map((team, index) => {
        const styling = getTeamStyling(index);
        return (
          <div
            key={index}
            style={{
              height: '33.33%',
              background: styling.background,
              backgroundImage: styling.backgroundPattern,
              backgroundSize: '80px 80px, 60px 60px, 40px 40px, 30px 30px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '90%',
                maxWidth: '1000px',
                background: styling.cardBg,
                border: styling.cardBorder,
                borderRadius: '15px',
                padding: '25px',
                color: styling.textColor,
                boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <h2 style={{ 
                textAlign: 'center', 
                margin: '0 0 20px 0', 
                fontSize: '32px',
                color: styling.headerColor,
                borderBottom: `3px solid ${styling.accentColor}`,
                paddingBottom: '12px',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}>
                {index === 0 && '🟡'} {index === 1 && '🔵'} {index === 2 && '⚫'} {team.name}
              </h2>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '30px'
              }}>
                <div style={{ flex: 1 }}>
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
                          background: playerIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '10px',
                          fontSize: '16px',
                          border: `2px solid ${styling.accentColor}20`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                          {playerIndex + 1}. {player.name}
                        </span>
                        <span style={{ 
                          fontSize: '14px', 
                          color: '#666',
                          fontFamily: 'monospace',
                          background: styling.accentColor + '20',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          {player.intra}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      fontStyle: 'italic',
                      padding: '40px',
                      fontSize: '18px'
                    }}>
                      No players assigned
                    </div>
                  )}
                </div>

                <div style={{ 
                  minWidth: '200px',
                  background: `${styling.accentColor}20`,
                  border: `2px solid ${styling.accentColor}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                    👥 Players: {team.players.length}/7
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    📊 Avg Rating: {
                      team.players.length > 0 
                        ? (team.players.reduce((sum, p) => sum + (p.rating || 1), 0) / team.players.length).toFixed(1)
                        : '0'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Club emblem corner decoration */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              fontSize: '24px',
              opacity: 0.7
            }}>
              {index === 0 && '🟨⚡'} {index === 1 && '🔷👑'} {index === 2 && '⚫⚪'}
            </div>
          </div>
        );
      })}

      <div style={{ 
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 10,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        ⚽ FOOTBALL TEAM ROSTERS - {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
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