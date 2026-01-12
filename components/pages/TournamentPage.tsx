import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Zap } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./footer";

const TEAMS = {
  Falcon: { name: "Falcon", color: "#fe6640", logo: "/teams/falcon.png", gradient: "from-orange-500 to-red-600" },
  Leopard: { name: "Leopard", color: "#7111f8", logo: "/teams/leopard.png", gradient: "from-purple-500 to-indigo-700" },
  Oryx: { name: "Oryx", color: "#01eafa", logo: "/teams/oryx.png", gradient: "from-cyan-400 to-blue-500" },
  Wolves: { name: "Wolves", color: "#424242", logo: "/teams/wolves.png", gradient: "from-gray-600 to-gray-800" },
};

const LEAGUE_TABLE = [
	{ team: "Falcon", won: 1, drawn: 0, lost: 2, gf: 4, ga: 4 },
	{ team: "Leopard", won: 1, drawn: 0, lost: 2, gf: 1, ga: 6 },
	{ team: "Oryx", won: 1, drawn: 1, lost: 1, gf: 3, ga: 3 },
	{ team: "Wolves", won: 2, drawn: 1, lost: 0, gf: 5, ga: 1 },
];

const getPoints = (team: { won: number; drawn: number; lost: number }) => {
  return team.won * 3 + team.drawn;
}

const PREVIOUS_RESULTS = [
  { home: "Falcon", away: "Wolves", homeScore: 0, awayScore: 2, date: "Jan 5, 2026" },
  { home: "Leopard", away: "Oryx", homeScore: 1, awayScore: 0, date: "Jan 5, 2026" },
  { home: "Oryx", away: "Wolves", homeScore: 1, awayScore: 1, date: "Jan 8, 2026" },
  { home: "Leopard", away: "Falcon", homeScore: 0, awayScore: 4, date: "Jan 8, 2026" },
  { home: "Leopard", away: "Wolves", homeScore: 0, awayScore: 2, date: "Jan 12, 2026" },
  { home: "Falcon", away: "Oryx", homeScore: 1, awayScore: 2, date: "Jan 12, 2026" },
];

const NEXT_FIXTURES = [
  { home: "Oryx", away: "Leopard", date: "Jan 15, 2026", time: "21:00" },
  { home: "Wolves", away: "Falcon", date: "Jan 15, 2026", time: "21:30" },
  { home: "Wolves", away: "Leopard", date: "Jan 19, 2026", time: "21:00" },
  { home: "Oryx", away: "Falcon", date: "Jan 19, 2026", time: "21:30" },
  { home: "Wolves", away: "Oryx", date: "Jan 22, 2026", time: "21:00" },
  { home: "Falcon", away: "Leopard", date: "Jan 22, 2026", time: "21:30" },
];

const TOP_SCORERS = [
  { name: "Zubidullah", team: "Falcon", goals: 3 },
  { name: "Fisal", team: "Wolves", goals: 2 },
  { name: "Moh'd Alfaqih", team: "Wolves", goals: 2 },
  { name: "Akram", team: "Leopard", goals: 1 },
  { name: "Moh'd Desogi", team: "Wolves", goals: 1 },
  { name: "Haitham", team: "Oryx", goals: 1 },
  { name: "Moh'd Eid", team: "Falcon", goals: 1 },
  { name: "Ranem", team: "Falcon", goals: 1 },
  { name: "Khalil", team: "Oryx", goals: 1 },
  { name: "Abdulla Gazi", team: "Oryx", goals: 1 },
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

const TournamentPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
	if (PREVIOUS_RESULTS.filter(m => m.home === a.team || m.away === a.team).length > 0 && PREVIOUS_RESULTS.filter(m => m.home === b.team || m.away === b.team).length > 0) {
		const aPoints = PREVIOUS_RESULTS.reduce((acc, match) => {
			if (match.home === a.team) {
				if (match.homeScore > match.awayScore) return acc + 3;
				if (match.homeScore === match.awayScore) return acc + 1;
			} else if (match.away === a.team) {
				if (match.awayScore > match.homeScore) return acc + 3;
				if (match.awayScore === match.homeScore) return acc + 1;
			}
			return acc;
		}, 0);
		const bPoints = PREVIOUS_RESULTS.reduce((acc, match) => {
			if (match.home === b.team) {
				if (match.homeScore > match.awayScore) return acc + 3;
				if (match.homeScore === match.awayScore) return acc + 1;
			} else if (match.away === b.team) {
				if (match.awayScore > match.homeScore) return acc + 3;
				if (match.awayScore === match.homeScore) return acc + 1;
			}
			return acc;
		}, 0);
		if (aPoints !== bPoints) {
			return bPoints - aPoints;
		}
	}
	return 1;
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
      {mounted && (
        <>
          {teamColors.map((color, i) => (
            <React.Fragment key={color}>
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
              className="inline-flex items-center gap-3 mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-10 h-10 text-yellow-400" />
              <motion.h1
                className="text-5xl md:text-7xl font-black tracking-tight"
                style={{
                  background: `linear-gradient(135deg, ${pageAccentColor}, #ffd700, ${pageAccentColor})`,
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
                42 Coallistion Clash
              </motion.h1>
              <Trophy className="w-10 h-10 text-yellow-400" />
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center gap-2 mb-6"
              variants={itemVariants}
            >
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-xl text-gray-300 font-light tracking-widest uppercase">
                Season 2026
              </span>
              <Star className="w-5 h-5 text-yellow-400" />
            </motion.div>

            <motion.p
              className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
              variants={itemVariants}
            >
              The ultimate showdown. Only one house will claim the glory!
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
                className={`relative px-6 py-4 rounded-2xl font-bold text-lg transition-all overflow-hidden group`}
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
                <span className="relative z-10 flex items-center gap-3">
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {team.name}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                className="px-6 py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pageAccentColor}dd, ${pageAccentColor}99)`,
                }}
              >
                <h2 className="text-2xl font-bold text-white">League Standings</h2>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-4 text-left text-sm font-bold text-gray-400">#</th>
                      <th className="px-3 py-4 text-left text-sm font-bold text-gray-400">Team</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">P</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">W</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">D</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">L</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">GD</th>
                      <th className="px-3 py-4 text-center text-sm font-bold text-gray-400">Pts</th>
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
                        <td className="px-3 py-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0 ? "bg-yellow-500 text-black" :
                              idx === 1 ? "bg-gray-400 text-black" :
                              idx === 2 ? "bg-amber-700 text-white" :
                              "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            {getTeamBadge(row.team)}
                            <span className="font-semibold text-white">
                              {TEAMS[row.team as TeamKey].name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center text-gray-300">{row.won + row.drawn + row.lost}</td>
                        <td className="px-3 py-4 text-center text-green-400 font-semibold">{row.won}</td>
                        <td className="px-3 py-4 text-center text-yellow-400">{row.drawn}</td>
                        <td className="px-3 py-4 text-center text-red-400">{row.lost}</td>
                        <td className="px-3 py-4 text-center text-gray-300">{row.gf - row.ga > 0 ? `+${row.gf - row.ga}` : row.gf - row.ga}</td>
                        <td className="px-3 py-4">
                          <motion.span
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg"
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
                className="px-6 py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pageAccentColor}dd, ${pageAccentColor}99)`,
                }}
              >
                <h2 className="text-2xl font-bold text-white">Top Scorers</h2>
              </div>
              <div className="p-4 space-y-3">
                {TOP_SCORERS.slice(0, 6).map((scorer, idx) => (
                  <motion.div
                    key={scorer.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all"
                    style={{
                      background: selectedTeam === scorer.team
                        ? `linear-gradient(135deg, ${TEAMS[scorer.team as TeamKey].color}30, ${TEAMS[scorer.team as TeamKey].color}10)`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${TEAMS[scorer.team as TeamKey].color}30`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black" :
                          idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" :
                          idx === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                          "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {idx === 0 ? <Award className="w-5 h-5" /> : idx + 1}
                      </div>
                      {getTeamBadge(scorer.team, "sm")}
                      <div>
                        <span className="font-semibold text-white block">{scorer.name}</span>
                        <span className="text-xs text-gray-500">{TEAMS[scorer.team as TeamKey].name}</span>
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xl"
                      style={{
                        background: `linear-gradient(135deg, ${TEAMS[scorer.team as TeamKey].color}, ${TEAMS[scorer.team as TeamKey].color}99)`,
                        color: scorer.team === "Oryx" ? "#000" : "#fff",
                        boxShadow: `0 0 20px ${TEAMS[scorer.team as TeamKey].color}40`,
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Zap className="w-4 h-4" />
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
                className="px-6 py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pageAccentColor}dd, ${pageAccentColor}99)`,
                }}
              >
                <h2 className="text-2xl font-bold text-white">Recent Results</h2>
              </div>
              <div className="p-4 space-y-4">
                {PREVIOUS_RESULTS.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-xs text-center mb-3 text-gray-500 font-medium tracking-wider uppercase">
                      {match.date}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-semibold text-white text-lg">
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home)}
                      </div>
                      <motion.div
                        className="px-6 py-3 rounded-2xl mx-4 font-black text-2xl min-w-[100px] text-center"
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
                        <span className="mx-2 text-gray-500">-</span>
                        <span style={{ color: match.awayScore > match.homeScore ? "#4ade80" : match.awayScore < match.homeScore ? "#f87171" : "#fbbf24" }}>
                          {match.awayScore}
                        </span>
                      </motion.div>
                      <div className="flex items-center gap-3 flex-1">
                        {getTeamBadge(match.away)}
                        <span className="font-semibold text-white text-lg">
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
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
                className="px-6 py-5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pageAccentColor}dd, ${pageAccentColor}99)`,
                }}
              >
                <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
              </div>
              <div className="p-4 space-y-3">
                {NEXT_FIXTURES.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-2xl p-4 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-3">
                      <span className="text-gray-500 font-medium">{match.date}</span>
                      <span
                        className="px-3 py-1 rounded-full font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${pageAccentColor}30, ${pageAccentColor}10)`,
                          color: pageAccentColor,
                        }}
                      >
                        {match.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-semibold text-white">
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home, "sm")}
                      </div>
                      <motion.div
                        className="px-4 py-2 rounded-xl mx-3 font-bold text-sm"
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
                      <div className="flex items-center gap-2 flex-1">
                        {getTeamBadge(match.away, "sm")}
                        <span className="font-semibold text-white">
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

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
