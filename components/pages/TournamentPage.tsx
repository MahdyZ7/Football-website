import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Zap, Scale, Vote, X } from "lucide-react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./footer";
import { useTournamentAudio } from "../../contexts/TournamentAudioContext";

const TEAMS = {
  Falcon: { name: "Falcon", color: "#fe6640", logo: "/teams/falcon.png", gradient: "from-orange-500 to-red-600" },
  Leopard: { name: "Leopard", color: "#7111f8", logo: "/teams/leopard.png", gradient: "from-purple-500 to-indigo-700" },
  Oryx: { name: "Oryx", color: "#01eafa", logo: "/teams/oryx.png", gradient: "from-cyan-400 to-blue-500" },
  Wolves: { name: "Wolves", color: "#424242", logo: "/teams/wolves.png", gradient: "from-gray-600 to-gray-800" },
};

const LEAGUE_TABLE = [
	{ team: "Falcon", won: 1, drawn: 2, lost: 3, gf: 9, ga: 10 },
	{ team: "Leopard", won: 1, drawn: 2, lost: 3, gf: 2, ga: 10 },
	{ team: "Oryx", won: 3, drawn: 2, lost: 1, gf: 8, ga: 5 },
	{ team: "Wolves", won: 3, drawn: 2, lost: 1, gf: 9, ga: 3 },
];

const getPoints = (team: { won: number; drawn: number; lost: number }) => {
  return team.won * 3 + team.drawn;
}

const PREVIOUS_RESULTS = [
	{ home: "Wolves", away: "Leopard", homeScore: 3, awayScore: 0, date: "Jan 22, 2026", highlight: "Wolves capture the title against an abysmal display from Leopard" },
	{ home: "Oryx", away: "Falcon", homeScore: 4, awayScore: 2, date: "Jan 22, 2026", highlight: "Oryx, with a man down, dominate Falcon chasing a pipe dream that eludes them" },
	{ home: "Oryx", away: "Wolves", homeScore: 1, awayScore: 0, date: "Jan 19, 2026", highlight: "Injuries force Wolves to park the bus but the wheels fall off in the final minutes" },
	{ home: "Falcon", away: "Leopard", homeScore: 1, awayScore: 1, date: "Jan 19, 2026", highlight: "Leopards fail to turn their numeric advantage into goals after an early send-off" },
	{ home: "Wolves", away: "Falcon", homeScore: 1, awayScore: 1, date: "Jan 15, 2026", highlight: "A cagey affair ends in stalemate. Wolves barely hold on and keep a healthy distance on top" },
	{ home: "Oryx", away: "Leopard",homeScore: 0, awayScore: 0,  date: "Jan 15, 2026", highlight: "Leopard prove once again they have Oryx's number. They can take pride in sabotaging the defending champions' campaign" },
	{ home: "Falcon", away: "Oryx", homeScore: 1, awayScore: 2, date: "Jan 12, 2026", highlight: "Oryx with a quick double turn the table to win their first Game. The start of a comeback ???" },
	{ home: "Leopard", away: "Wolves", homeScore: 0, awayScore: 2, date: "Jan 12, 2026", highlight: "Wolves extend unbeaten run and it looks like they might run away with the title" },
	{ home: "Leopard", away: "Falcon", homeScore: 0, awayScore: 4, date: "Jan 8, 2026", highlight: "Falcons strike hard and fast. A display worthy of title contenders" },
	{ home: "Wolves", away: "Oryx", homeScore: 1, awayScore: 1, date: "Jan 8, 2026", highlight: "Wolves bite first but Oryx eke out a draw showing they are no easy prey" },
	{ home: "Leopard", away: "Oryx", homeScore: 1, awayScore: 0, date: "Jan 5, 2026", highlight: "Unregistered Akram capitalises on a defensive error to score the only goal" },
	{ home: "Falcon", away: "Wolves", homeScore: 0, awayScore: 2, date: "Jan 5, 2026", highlight: "Wolves crank a surprise double against title favorite Falcon" },
];

// Calculate recent form for a team (returns array of 'W', 'D', 'L' for last N matches)
const getTeamForm = (teamName: string, maxMatches: number = 6): Array<'W' | 'D' | 'L'> => {
	const teamMatches = PREVIOUS_RESULTS
		.filter(m => m.home === teamName || m.away === teamName)
		.slice(-maxMatches)
		.reverse();

	return teamMatches.map(match => {
		const isHome = match.home === teamName;
		const teamScore = isHome ? match.homeScore : match.awayScore;
		const opponentScore = isHome ? match.awayScore : match.homeScore;

		if (teamScore > opponentScore) return 'W';
		if (teamScore < opponentScore) return 'L';
		return 'D';
	});	
}

const NEXT_FIXTURES: any[] = [
	
];

const TOP_SCORERS = [
  { name: "Zubidullah", team: "Falcon", goals: 6 },
  { name: "Moh'd Alfaqih", team: "Wolves", goals: 5 },
  { name: "Fisal", team: "Wolves", goals: 3 },
  { name: "Abdulla Gazi", team: "Oryx", goals: 3 },
  { name: "Akram", team: "Leopard", goals: 1 },
  { name: "Moh'd Desogi", team: "Wolves", goals: 1 },
  { name: "Haitham", team: "Oryx", goals: 1 },
  { name: "Moh'd Eid", team: "Falcon", goals: 1 },
  { name: "Ranem", team: "Falcon", goals: 1 },
  { name: "Khalil", team: "Oryx", goals: 1 },
  { name: "Abdulla Rashidov", team: "Leopard", goals: 1 },
  { name: "Hackeem", team: "Oryx", goals: 1 },
  { name: "Yussef", team: "Falcon", goals: 1 },
  { name: "Moh'd Ahmoudi", team: "Oryx", goals: 1 },
  { name: "Ahmed Yassin", team: "Oryx", goals: 1 },
];

type TeamKey = keyof typeof TEAMS;

const FloatingParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full opacity-60"
    style={{ backgroundColor: color }}
    initial={{ y: "100vh", x: Math.random() * 100 + "vw", opacity: 0 }}
    animate={{
      y: "-10vh",
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay: delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const GlowingOrb = ({ color, size, top, left, delay }: { color: string; size: number; top: string; left: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
    style={{
      backgroundColor: color,
      width: size,
      height: size,
      top,
      left,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.25, 0.15],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const VotePopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(20,20,30,0.98), rgba(10,10,15,0.98))",
              border: "1px solid rgba(255,215,0,0.3)",
              boxShadow: "0 0 60px rgba(255,215,0,0.2)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #ffd70080, #ffd70040)",
              }}
            >
              <div className="flex items-center gap-3">
                <Vote className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Tournament Fan Awards</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="inline-block mb-4"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Cast Your Vote!
                </h3>
                <p className="text-gray-400">
                  Help decide who deserves the Fans' favorite <span className="text-yellow-400 font-semibold">Player</span> and{" "}
                  <span className="text-yellow-400 font-semibold">Goalkeeper</span> awards for this tournament.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/tournament/vote"
                  className="block w-full py-3 px-6 rounded-xl font-bold text-center transition-all duration-200 transform hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ffd700, #ffaa00)",
                    color: "#000",
                    boxShadow: "0 0 30px rgba(255,215,0,0.3)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Award className="w-5 h-5" />
                    Vote Now
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full py-3 px-6 rounded-xl font-medium text-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const TournamentPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showVotePopup, setShowVotePopup] = useState(false);
  const { startAudio, hasStarted } = useTournamentAudio();

  // Play Bundesliga hymn once on first user interaction
  useEffect(() => {
    if (hasStarted) return;

    const playAudio = () => {
      startAudio();
      // Remove all listeners after playing
      window.removeEventListener('scroll', playAudio);
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
      window.removeEventListener('keydown', playAudio);
    };

    // Listen for user interactions
    window.addEventListener('scroll', playAudio, { once: true });
    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('touchstart', playAudio, { once: true });
    window.addEventListener('keydown', playAudio, { once: true });

    return () => {
      window.removeEventListener('scroll', playAudio);
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
      window.removeEventListener('keydown', playAudio);
    };
  }, [hasStarted, startAudio]);

  useEffect(() => {
    setMounted(true);

    // Show vote popup after a short delay if user hasn't dismissed it before
    const hasSeenPopup = sessionStorage.getItem('tournament-vote-popup-seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowVotePopup(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseVotePopup = () => {
    setShowVotePopup(false);
    sessionStorage.setItem('tournament-vote-popup-seen', 'true');
  };

  const getTeamStyle = (teamKey: string) => ({
    backgroundColor: TEAMS[teamKey as TeamKey].color,
    color: teamKey === "Oryx" ? "#000" : "#fff",
  });

  const sortedLeagueTable = [...LEAGUE_TABLE].sort((a, b) => {
	const pointsA = getPoints(a);
	const pointsB = getPoints(b);
	const gdA = a.gf - a.ga;
	const gdB = b.gf - b.ga;
	if (pointsA !== pointsB) 
		return pointsB - pointsA;
	if (gdA !== gdB) 
		return gdB - gdA;
	if (a.gf !== b.gf) 
		return b.gf - a.gf;
	// Head-to-head tiebreaker: only consider direct matches between these two teams
	const headToHeadMatches = PREVIOUS_RESULTS.filter(
		m => (m.home === a.team && m.away === b.team) || (m.home === b.team && m.away === a.team)
	);

	if (headToHeadMatches.length > 0) {
		let aH2HPoints = 0;
		let bH2HPoints = 0;
		let aH2HGf = 0;
		let bH2HGf = 0;

		for (const match of headToHeadMatches) {
			if (match.home === a.team) {
				if (match.homeScore > match.awayScore) aH2HPoints += 3;
				else if (match.homeScore < match.awayScore) bH2HPoints += 3;
				else { aH2HPoints += 1; bH2HPoints += 1; }
				aH2HGf += match.homeScore;
				bH2HGf += match.awayScore;
			} else {
				if (match.homeScore > match.awayScore) bH2HPoints += 3;
				else if (match.homeScore < match.awayScore) aH2HPoints += 3;
				else { aH2HPoints += 1; bH2HPoints += 1; }
				bH2HGf += match.homeScore;
				aH2HGf += match.awayScore;
			}
		}

		if (aH2HPoints !== bH2HPoints) {
			return bH2HPoints - aH2HPoints;
		}
		if (aH2HGf !== bH2HGf) {
			return bH2HGf - aH2HGf;
		}
	}
	return 0;
  });


  const getTeamBadge = (teamKey: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
    };
    return (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`inline-flex items-center justify-center rounded-full overflow-hidden shadow-lg ${sizeClasses[size]}`}
        style={{
          boxShadow: `0 0 20px ${TEAMS[teamKey as TeamKey].color}60`,
          border: `2px solid ${TEAMS[teamKey as TeamKey].color}`,
        }}
      >
        <img
          src={TEAMS[teamKey as TeamKey].logo}
          alt={`${TEAMS[teamKey as TeamKey].name} logo`}
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  };

  const pageAccentColor = selectedTeam ? TEAMS[selectedTeam].color : "#ffd700";
  const teamColors = Object.values(TEAMS).map(t => t.color);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: "#0a0a0f" }}>
      {/* Vote Popup */}
      <VotePopup isOpen={showVotePopup} onClose={handleCloseVotePopup} />

      {/* Floating Vote Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          href="/tournament/vote"
          className="flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg transition-all duration-200 transform hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #ffd700, #ffaa00)",
            color: "#000",
            boxShadow: "0 0 30px rgba(255,215,0,0.4)",
          }}
        >
          <Vote className="w-5 h-5" />
          <span className="hidden sm:inline">Vote for Awards</span>
          <span className="sm:hidden">Vote</span>
        </Link>
      </motion.div>

      {mounted && (
        <>
          {teamColors.map((color, i) => (
            <React.Fragment key={`team-particles-${i}`}>
              {[0, 1, 2].map(j => (
                <FloatingParticle key={`${i}-${j}`} delay={i * 2 + j} color={color} />
              ))}
            </React.Fragment>
          ))}
          <GlowingOrb color="#fe6640" size={400} top="10%" left="5%" delay={0} />
          <GlowingOrb color="#7111f8" size={350} top="50%" left="80%" delay={1} />
          <GlowingOrb color="#01eafa" size={300} top="70%" left="20%" delay={2} />
          <GlowingOrb color="#424242" size={250} top="20%" left="70%" delay={3} />
        </>
      )}

      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-center mb-12"
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center gap-2 md:gap-3 mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-6 h-6 md:w-10 md:h-10 text-yellow-400" />
              <motion.h1
                className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                style={{
                  color: "#ffd700",
                  backgroundImage: `linear-gradient(135deg, ${pageAccentColor}, #ffd700, ${pageAccentColor})`,
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                42 Coalition Clash
              </motion.h1>
              <Trophy className="w-6 h-6 md:w-10 md:h-10 text-yellow-400" />
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-2 mb-4 md:mb-6"
              variants={itemVariants}
            >
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              <span className="text-sm md:text-xl text-gray-300 font-light tracking-widest uppercase">
                Season 2026
              </span>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            </motion.div>

            <motion.p
              className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 px-4"
              variants={itemVariants}
            >
              The ultimate showdown. one house to claim glory!
            </motion.p>
          </motion.div>

          <motion.div
            className="flex justify-center gap-3 md:gap-6 mb-12 flex-wrap"
            variants={itemVariants}
          >
            {Object.entries(TEAMS).map(([key, team]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedTeam(selectedTeam === key ? null : (key as TeamKey))}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all overflow-hidden group`}
                style={{
                  background: `linear-gradient(135deg, ${team.color}, ${team.color}dd)`,
                  color: key === "Oryx" ? "#000" : "#fff",
                  boxShadow: selectedTeam === key
                    ? `0 0 40px ${team.color}80, 0 0 80px ${team.color}40`
                    : `0 4px 20px ${team.color}40`,
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
                />
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline">{team.name}</span>
                </span>
                {selectedTeam === key && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute -bottom-1 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
                    style={{ x: "-50%" }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: `0 0 40px ${pageAccentColor}20`,
              }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}cc)`,
                }}
              >
                <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-md">League Standings</h2>
              </div>
              <div className="overflow-x-auto p-2 md:p-4">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr
                      className="border-b border-white/20"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                    >
                      <th className="px-1 md:px-3 py-2 md:py-4 text-left font-bold text-gray-200">#</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-left font-bold text-gray-200">Team</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-gray-200">P</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-green-400">W</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-yellow-400">D</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-red-400">L</th>
                      <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-gray-200">GD</th>
                      <th className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-gray-200">Pts</th>
                      <th className="hidden md:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-gray-200">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeagueTable.map((row, idx) => (
                      <motion.tr
                        key={row.team}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`border-b border-white/5 transition-all hover:bg-white/5`}
                        style={{
                          backgroundColor: selectedTeam === row.team ? `${TEAMS[row.team as TeamKey].color}20` : undefined,
                        }}
                      >
                        <td className="px-1 md:px-3 py-2 md:py-4">
                          <div
                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                              idx === 0 ? "bg-yellow-500 text-black" :
                              idx === 1 ? "bg-gray-400 text-black" :
                              idx === 2 ? "bg-amber-700 text-white" :
                              "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-1 md:px-3 py-2 md:py-4">
                          <div className="flex items-center gap-1 md:gap-3">
                            {getTeamBadge(row.team, "sm")}
                            <span className="font-semibold text-white text-xs md:text-sm">
                              {TEAMS[row.team as TeamKey].name}
                            </span>
                          </div>
                        </td>
                        <td className="px-1 md:px-3 py-2 md:py-4 text-center text-gray-300">{row.won + row.drawn + row.lost}</td>
                        <td className="px-1 md:px-3 py-2 md:py-4 text-center text-green-400 font-semibold">{row.won}</td>
                        <td className="px-1 md:px-3 py-2 md:py-4 text-center text-yellow-400">{row.drawn}</td>
                        <td className="px-1 md:px-3 py-2 md:py-4 text-center text-red-400">{row.lost}</td>
                        <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center text-gray-300">{row.gf - row.ga > 0 ? `+${row.gf - row.ga}` : row.gf - row.ga}</td>
                        <td className="px-1 md:px-3 py-2 md:py-4">
                          <motion.span
                            className="inline-flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl font-bold text-sm md:text-lg"
                            style={{
                              background: `linear-gradient(135deg, ${TEAMS[row.team as TeamKey].color}, ${TEAMS[row.team as TeamKey].color}99)`,
                              color: row.team === "Oryx" ? "#000" : "#fff",
                              boxShadow: `0 0 15px ${TEAMS[row.team as TeamKey].color}50`,
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {row.won * 3 + row.drawn}
                          </motion.span>
                        </td>
                        <td className="hidden md:table-cell px-1 md:px-3 py-2 md:py-4">
                          <div className="flex items-center justify-center gap-1">
                            {getTeamForm(row.team).map((result, formIdx) => (
                              <motion.span
                                key={formIdx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 + formIdx * 0.05 }}
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  result === 'W' ? 'bg-green-500 text-white' :
                                  result === 'D' ? 'bg-yellow-500 text-black' :
                                  'bg-red-500 text-white'
                                }`}
                                title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                              >
                                {result}
                              </motion.span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: `0 0 40px ${pageAccentColor}20`,
              }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}cc)`,
                }}
              >
                <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-md">Top Scorers</h2>
              </div>
              <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                {TOP_SCORERS.slice(0, 6).map((scorer, idx) => (
                  <motion.div
                    key={scorer.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-2 md:p-4 rounded-xl md:rounded-2xl transition-all"
                    style={{
                      background: selectedTeam === scorer.team
                        ? `linear-gradient(135deg, ${TEAMS[scorer.team as TeamKey].color}30, ${TEAMS[scorer.team as TeamKey].color}10)`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${TEAMS[scorer.team as TeamKey].color}30`,
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-4">
                      <div
                        className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                          idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black" :
                          idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" :
                          idx === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                          "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {idx === 0 ? <Award className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
                      </div>
                      <div className="hidden sm:block">{getTeamBadge(scorer.team, "sm")}</div>
                      <div>
                        <span className="font-semibold text-white block text-xs md:text-sm">{scorer.name}</span>
                        <span className="text-[10px] md:text-xs text-gray-500">{TEAMS[scorer.team as TeamKey].name}</span>
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-bold text-sm md:text-xl"
                      style={{
                        background: `linear-gradient(135deg, ${TEAMS[scorer.team as TeamKey].color}, ${TEAMS[scorer.team as TeamKey].color}99)`,
                        color: scorer.team === "Oryx" ? "#000" : "#fff",
                        boxShadow: `0 0 20px ${TEAMS[scorer.team as TeamKey].color}40`,
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Zap className="w-3 h-3 md:w-4 md:h-4" />
                      {scorer.goals}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: `0 0 40px ${pageAccentColor}20`,
              }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}cc)`,
                }}
              >
                <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-md">Recent Results</h2>
              </div>
              <div className="p-2 md:p-4 space-y-2 md:space-y-4">
                {PREVIOUS_RESULTS.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl md:rounded-2xl p-3 md:p-5 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-xs text-center mb-2 md:mb-3 text-gray-500 font-medium tracking-wider uppercase">
                      {match.date}
                    </div>
                    <div className="flex items-center justify-between gap-2 md:gap-4">
                      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 flex-1 justify-end">
                        <span className="font-semibold text-white text-xs md:text-lg order-2 md:order-1 hidden sm:block">
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home, "sm")}
                      </div>
                      <motion.div
                        className="px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl mx-1 md:mx-4 font-black text-lg md:text-2xl min-w-[70px] md:min-w-[100px] text-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span style={{ color: match.homeScore > match.awayScore ? "#4ade80" : match.homeScore < match.awayScore ? "#f87171" : "#fbbf24" }}>
                          {match.homeScore}
                        </span>
                        <span className="mx-1 md:mx-2 text-gray-500">-</span>
                        <span style={{ color: match.awayScore > match.homeScore ? "#4ade80" : match.awayScore < match.homeScore ? "#f87171" : "#fbbf24" }}>
                          {match.awayScore}
                        </span>
                      </motion.div>
                      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 flex-1">
                        {getTeamBadge(match.away, "sm")}
                        <span className="font-semibold text-white text-xs md:text-lg hidden sm:block">
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
                    {/* Team names for very small screens */}
                    <div className="flex justify-between sm:hidden mt-2 text-xs text-gray-400">
                      <span>{TEAMS[match.home as TeamKey].name}</span>
                      <span>{TEAMS[match.away as TeamKey].name}</span>
                    </div>
                    {match.highlight && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10"
                      >
                        <p className="text-xs md:text-sm text-center text-gray-400 italic flex items-center justify-center gap-1 md:gap-2">
                          <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          <span className="line-clamp-2">{match.highlight}</span>
                          <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: `0 0 40px ${pageAccentColor}20`,
              }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}cc)`,
                }}
              >
                <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-md">Upcoming Matches</h2>
              </div>
              <div className="p-2 md:p-4 space-y-2 md:space-y-3">
				{NEXT_FIXTURES.length === 0 && (
				  <div className="p-4 text-center text-gray-400 italic">
					No upcoming matches scheduled.
				  </div>
				)}
                {NEXT_FIXTURES.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-xl md:rounded-2xl p-2 md:p-4 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] md:text-xs mb-2 md:mb-3">
                      <span className="text-gray-500 font-medium">{match.date}</span>
                      <span
                        className="px-2 md:px-3 py-1 rounded-full font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${pageAccentColor}30, ${pageAccentColor}10)`,
                          color: pageAccentColor,
                        }}
                      >
                        {match.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 md:gap-2">
                      <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                        <span className="font-semibold text-white text-xs md:text-base hidden sm:block">
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home, "sm")}
                      </div>
                      <motion.div
                        className="px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl mx-1 md:mx-3 font-bold text-xs md:text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}99)`,
                          color: "#fff",
                          boxShadow: `0 0 15px ${pageAccentColor}40`,
                        }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ 
                          boxShadow: [
                            `0 0 15px ${pageAccentColor}40`,
                            `0 0 25px ${pageAccentColor}60`,
                            `0 0 15px ${pageAccentColor}40`,
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        VS
                      </motion.div>
                      <div className="flex items-center gap-1 md:gap-2 flex-1">
                        {getTeamBadge(match.away, "sm")}
                        <span className="font-semibold text-white text-xs md:text-base hidden sm:block">
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
                    {/* Team names for very small screens */}
                    <div className="flex justify-between sm:hidden mt-2 text-[10px] text-gray-400">
                      <span>{TEAMS[match.home as TeamKey].name}</span>
                      <span>{TEAMS[match.away as TeamKey].name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-8 rounded-3xl overflow-hidden backdrop-blur-xl"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #4a5568dd, #4a556899)",
              }}
            >
              <Scale className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <h2 className="text-lg md:text-xl font-bold text-white">Tiebreaker Rules</h2>
            </div>
            <div className="p-3 md:p-6">
              <div className="mb-3 md:mb-4 p-2 md:p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-400 text-xs md:text-sm text-center font-medium">
                  These are my rules for this tournament, not official FIFA/UEFA or even 42 regulations.
                </p>
              </div>
              <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 text-center">
                When teams are tied on points, the following criteria are applied in order:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {[
                  { num: 1, title: "Points", desc: "Win=3, Draw=1" },
                  { num: 2, title: "Goal Diff", desc: "GF minus GA" },
                  { num: 3, title: "Goals For", desc: "Total goals scored" },
                  { num: 4, title: "H2H Pts", desc: "Direct match points" },
                  { num: 5, title: "H2H Goals", desc: "Direct match goals" },
                ].map((rule) => (
                  <motion.div
                    key={rule.num}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-2 md:p-4 rounded-xl text-center"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm mx-auto mb-1 md:mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${pageAccentColor}, ${pageAccentColor}99)`,
                        color: "#fff",
                      }}
                    >
                      {rule.num}
                    </div>
                    <h3 className="font-semibold text-white text-xs md:text-sm mb-1">{rule.title}</h3>
                    <p className="text-gray-500 text-[10px] md:text-xs">{rule.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <motion.p
              className="text-gray-500 text-sm flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              May the best team win! <Trophy className="w-4 h-4 text-yellow-400" />
            </motion.p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TournamentPage;
