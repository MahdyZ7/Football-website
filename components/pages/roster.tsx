import { useRef, useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Star, Download, Share2, Copy, FileImage, FileText, Clipboard, ArrowLeft } from "lucide-react";
import redPlayer from "../../assets/soccer_player_in_red_kit.png";
import bluePlayer from "../../assets/soccer_player_in_blue_kit.png";
import whitePlayer from "../../assets/soccer_player_in_white_kit.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { toast } from "sonner"; // Assuming sonner is used based on file list, or I can use useToast

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
  image: StaticImageData;
  players: { number: number; name: string; position: string }[];
  theme: string;
};



// Team Data
var TEAMS: Team[] = [
  {
    id: "red",
    name: "THE CRIMSONS",
    founded: "EST. 1892",
    colors: {
      primary: "#C8102E", // Red
      accent: "#F6EA7B", // Gold
      text: "#FFFFFF",
      secondaryText: "rgba(255, 255, 255, 0.7)",
    },
    font: "Oswald",
    image: redPlayer,
    players: [
      { number: 10, name: "ALEXANDER", position: "FORWARD" },
      { number: 8, name: "GERRARD", position: "MIDFIELDER" },
      { number: 4, name: "VIRGIL", position: "DEFENDER" },
      { number: 11, name: "SALAH", position: "WINGER" },
      { number: 1, name: "BECKER", position: "GOALKEEPER" },
      { number: 26, name: "ROBERTSON", position: "DEFENDER" },
      { number: 66, name: "TRENT", position: "DEFENDER" },
    ],
    theme: "crimson",
  },
  {
    id: "blue",
    name: "ROYAL BLUES",
    founded: "EST. 1905",
    colors: {
      primary: "#034694", // Royal Blue
      accent: "#FFFFFF", // White
      text: "#FFFFFF",
      secondaryText: "rgba(255, 255, 255, 0.7)",
    },
    font: "Montserrat",
    image: bluePlayer,
    players: [
      { number: 9, name: "DROGBA", position: "STRIKER" },
      { number: 26, name: "TERRY", position: "CAPTAIN" },
      { number: 1, name: "CECH", position: "GOALKEEPER" },
      { number: 8, name: "LAMPARD", position: "MIDFIELDER" },
      { number: 10, name: "HAZARD", position: "WINGER" },
      { number: 3, name: "COLE", position: "DEFENDER" },
      { number: 6, name: "SILVA", position: "DEFENDER" },
    ],
    theme: "royal",
  },
  {
    id: "white",
    name: "LILYWHITES",
    founded: "EST. 1882",
    colors: {
      primary: "#FFFFFF", // White
      accent: "#132257", // Navy
      text: "#132257",
      secondaryText: "rgba(19, 34, 87, 0.6)",
    },
    font: "Raleway",
    image: whitePlayer,
    players: [
      { number: 7, name: "SON", position: "FORWARD" },
      { number: 10, name: "KANE", position: "STRIKER" },
      { number: 23, name: "ERIKSON", position: "MIDFIELDER" },
      { number: 11, name: "BALE", position: "WINGER" },
      { number: 14, name: "MODRIC", position: "MIDFIELDER" },
      { number: 1, name: "LLORIS", position: "GOALKEEPER" },
      { number: 26, name: "KING", position: "DEFENDER" },
    ],
    theme: "lily",
  },
];

function RosterContent() {
  const rosterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>(TEAMS);

  // Load team data from URL params
  useEffect(() => {
    const teamsData = searchParams.get('teams');
    if (teamsData) {
      try {
        const parsedTeams = JSON.parse(decodeURIComponent(teamsData));

        // Map the incoming teams to the roster format
        const updatedTeams = TEAMS.slice(0, parsedTeams.length).map((defaultTeam: Team, index: number) => {
          const incomingTeam = parsedTeams[index];

          // Create player objects with intra as position
          const players = incomingTeam.players.map((player: any, playerIndex: number) => ({
            number: playerIndex + 1,
            name: player.name.toUpperCase(),
            position: player.intra.toUpperCase()
          }));

          return {
            ...defaultTeam,
            players: players
            // Keep the original team name from TEAMS, not from incoming data
          };
        });

        setTeams(updatedTeams);
      } catch (error) {
        console.error("Failed to parse teams data:", error);
      }
    }
  }, [searchParams]);

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf' | 'clipboard') => {
    if (!rosterRef.current) return;

    setIsExporting(true);
    const toastId = toast.loading("Generating export...");

    try {
      // Small delay to allow UI to update if needed
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(rosterRef.current, {
        scale: 2, // Better quality
        useCORS: true,
        backgroundColor: "#0a0a0a", // Match neutral-950
        logging: false,
      });

      if (format === 'clipboard') {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              toast.success("Copied to clipboard!", { id: toastId });
            } catch (err) {
              console.error(err);
              toast.error("Failed to copy to clipboard", { id: toastId });
            }
          }
        });
      } else if (format === 'pdf') {
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
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Back to Teams Link */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/teams">
          <Button
            variant="outline"
            className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </Link>
      </div>

      {/* Export Controls */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white transition-all"
              disabled={isExporting}
            >
              {isExporting ? (
                <span className="animate-pulse">Exporting...</span>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-black/90 border-white/10 text-white backdrop-blur-xl">
            <DropdownMenuLabel>Export Roster</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => handleExport('png')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <FileImage className="w-4 h-4 mr-2 text-blue-400" />
              <span>Download PNG</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('jpeg')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <FileImage className="w-4 h-4 mr-2 text-orange-400" />
              <span>Download JPEG</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <FileText className="w-4 h-4 mr-2 text-red-400" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => handleExport('clipboard')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <Clipboard className="w-4 h-4 mr-2 text-green-400" />
              <span>Copy to Clipboard</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area to Capture */}
      <div
        ref={rosterRef}
        className="roster-container h-screen w-full bg-neutral-950 flex scroll-smooth"
      >
        {teams.map((team, index) => (
          <TeamColumn key={team.id} team={team} index={index} />
        ))}
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        .roster-container {
          /* Default: landscape mode */
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .roster-container::-webkit-scrollbar {
          display: none;
        }

        /* Portrait mode */
        @media (orientation: portrait) {
          .roster-container {
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
            scroll-snap-type: y mandatory;
          }
        }
      `}</style>
    </div>
  );
}

function TeamColumn({ team, index }: { team: Team; index: number }) {
  const isWhite = team.id === "white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
      className={`
        team-column
        relative flex flex-col
        ${isWhite ? "bg-white" : ""}
        group
      `}
      style={{
        backgroundColor: isWhite ? "#FFFFFF" : team.colors.primary,
        fontFamily: team.font,
        color: team.colors.text,
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
      }}
    >
      {/* Background Texture & Hero Image Blend */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Hero Image as Background Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <Image
            src={team.image} 
            alt="Team Hero"
            className={`
              absolute w-[150%] max-w-none md:w-full h-full object-cover opacity-20 grayscale mix-blend-multiply
              transition-transform duration-1000 group-hover:scale-105
              ${isWhite ? 'opacity-10' : 'opacity-30'}
            `}
            style={{ objectPosition: "top center" }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${isWhite ? 'from-white/80 via-white/90 to-white' : 'from-black/20 via-black/60 to-black/90'}`}></div>
      </div>

      {/* Team Header - Compact */}
      <div className="relative z-20 pt-6 md:pt-8 px-4 text-center shrink-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="text-[10px] tracking-[0.3em] opacity-70 font-bold mb-1"
        >
          {team.founded}
        </motion.div>
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-black uppercase tracking-tighter leading-none mb-3 drop-shadow-lg">
          {team.name}
        </h2>
        <div 
          className="h-1 w-16 mx-auto mb-4" 
          style={{ backgroundColor: team.colors.accent }}
        ></div>
      </div>

      {/* Players List - Compact Table Style */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-8 pb-8 min-h-0">
        <div className="flex flex-col gap-1 md:gap-2 w-full max-w-md mx-auto">
          {team.players.map((player, i) => (
            <PlayerRow key={i} player={player} team={team} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PlayerRow({ player, team, index }: { player: any; team: Team; index: number }) {
  const isWhite = team.id === "white";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + (index * 0.05) }}
      whileHover={{ x: 10, scale: 1.02 }}
      className="group/row relative flex items-center gap-4 py-2 md:py-3 px-3 md:px-4 rounded cursor-pointer transition-colors duration-200"
    >
      {/* Hover Background */}
      <div 
        className="absolute inset-0 rounded opacity-0 group-hover/row:opacity-10 transition-opacity duration-200"
        style={{ backgroundColor: isWhite ? 'black' : 'white' }}
      ></div>
      
      {/* Left Accent Bar (on hover) */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 transition-all duration-200 group-hover/row:h-3/4"
        style={{ backgroundColor: team.colors.accent }}
      ></div>

      {/* Number */}
      <div 
        className="text-xl md:text-2xl font-bold w-8 text-center opacity-50 group-hover/row:opacity-100 transition-opacity"
        style={{ fontFamily: team.font }}
      >
        {player.number}
      </div>

      {/* Name & Position Container */}
      <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-1">
        <div className="text-lg md:text-xl font-bold uppercase tracking-wide leading-none">
          {player.name}
        </div>
        <div 
          className="text-[10px] md:text-[10px] font-bold tracking-widest opacity-60 uppercase mt-0.5 md:mt-0"
          style={{ color: team.colors.secondaryText }}
        >
          {player.position}
        </div>
      </div>

      {/* Icon (Visible on Hover) */}
      <Star 
        size={14} 
        className="opacity-0 group-hover/row:opacity-100 transition-opacity -translate-x-2 group-hover/row:translate-x-0 duration-200"
        fill={team.colors.accent}
        stroke={team.colors.accent}
      />
    </motion.div>
  );
}

// Add global styles for team columns
const TeamColumnStyles = () => (
  <style jsx global>{`
    .team-column {
      /* Default: landscape mode */
      flex: 1;
      min-width: 0;
      height: 100%;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .team-column:last-child {
      border-right: 0;
    }

    /* Landscape mode on small screens - reduce font sizes */
    @media (orientation: landscape) and (max-height: 600px) {
      /* Team header */
      .team-column h2 {
        font-size: 1.25rem !important; /* Reduced from 3xl */
        margin-bottom: 0.5rem !important;
      }

      .team-column .pt-6 {
        padding-top: 0.75rem !important;
      }

      .team-column .mb-4 {
        margin-bottom: 0.5rem !important;
      }

      /* Player rows - make more compact */
      .team-column .group\\/row {
        padding-top: 0.25rem !important;
        padding-bottom: 0.25rem !important;
        gap: 0.5rem !important;
      }

      /* Player number */
      .team-column .group\\/row > div:first-of-type {
        font-size: 0.875rem !important; /* Smaller number */
        width: 1.5rem !important;
      }

      /* Player name */
      .team-column .group\\/row .text-lg {
        font-size: 0.875rem !important; /* sm */
      }

      /* Player position */
      .team-column .group\\/row .text-\\[10px\\] {
        font-size: 0.625rem !important; /* Even smaller */
      }

      /* Reduce padding in player list container */
      .team-column .px-4 {
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }

      .team-column .pb-8 {
        padding-bottom: 1rem !important;
      }
    }

    /* Portrait mode */
    @media (orientation: portrait) {
      .team-column {
        min-height: 100vh;
        width: 100%;
        flex-shrink: 0;
        height: auto;
        border-right: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .team-column:last-child {
        border-bottom: 0;
      }
    }
  `}</style>
);

export default function Roster() {
  return (
    <>
      <TeamColumnStyles />
      <Suspense fallback={<div className="h-screen w-full bg-neutral-950 flex items-center justify-center text-white">Loading...</div>}>
        <RosterContent />
      </Suspense>
    </>
  );
}
