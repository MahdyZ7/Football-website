import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

type Team = {
  id: string;
  name: string;
  founded: string;
  colors: {
    primary: string;
    accent: string;
    text: string;
    secondaryText: string;
  };
  font: string;
  image: any;
  players: { number: number; name: string; position: string }[];
  theme: string;
};

/**
 * Custom hook for roster export functionality
 * Single Responsibility: Handle roster export in various formats (PNG, JPEG, PDF, clipboard)
 *
 * Extracted from RosterContent component to separate export logic from UI rendering
 */
export function useRosterExport(teams: Team[]) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (
    format: 'png' | 'jpeg' | 'pdf' | 'clipboard',
    rosterRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!rosterRef.current) return;

    setIsExporting(true);
    const toastId = toast.loading("Generating export...");

    try {
      if (format === 'clipboard') {
        // Generate text list of player names for each team
        const textContent = teams
          .map((team) => {
            const teamHeader = team.name;
            const playerList = team.players
              .map((player) => `${player.number}. ${player.name}`)
              .join('\n');
            return `${teamHeader}\n${playerList}`;
          })
          .join('\n\n');

        try {
          await navigator.clipboard.writeText(textContent);
          toast.success("Player list copied to clipboard!", { id: toastId });
        } catch (err) {
          console.error("Clipboard error:", err);
          toast.error("Failed to copy to clipboard. Please check browser permissions.", { id: toastId });
        }
      } else {
        // Small delay to allow UI to update if needed
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(rosterRef.current, {
          scale: 2, // Better quality
          useCORS: true,
          backgroundColor: "#0a0a0a", // Match neutral-950
          logging: false,
        });

        if (format === 'pdf') {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('team-rosters.pdf');
          toast.success("PDF downloaded!", { id: toastId });
        } else {
          const link = document.createElement('a');
          link.download = `team-rosters.${format}`;
          link.href = canvas.toDataURL(`image/${format}`);
          link.click();
          toast.success(`${format.toUpperCase()} downloaded!`, { id: toastId });
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExport
  };
}
