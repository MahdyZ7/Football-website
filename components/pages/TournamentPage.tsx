import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";

const TEAMS = {
  falcon: { name: "Falcon", color: "#fe6640" },
  leopard: { name: "Leopard", color: "#7111f8" },
  oryx: { name: "Oryx", color: "#01eafa" },
  wolves: { name: "Wolves", color: "#424242" },
};

const LEAGUE_TABLE = [
  { team: "falcon", played: 6, won: 4, drawn: 1, lost: 1, gf: 12, ga: 5, points: 13 },
  { team: "leopard", played: 6, won: 3, drawn: 2, lost: 1, gf: 10, ga: 6, points: 11 },
  { team: "oryx", played: 6, won: 2, drawn: 1, lost: 3, gf: 8, ga: 9, points: 7 },
  { team: "wolves", played: 6, won: 1, drawn: 0, lost: 5, gf: 4, ga: 14, points: 3 },
];

const PREVIOUS_RESULTS = [
  { home: "falcon", away: "wolves", homeScore: 3, awayScore: 0, date: "Jan 5, 2026" },
  { home: "leopard", away: "oryx", homeScore: 2, awayScore: 2, date: "Jan 5, 2026" },
  { home: "oryx", away: "falcon", homeScore: 1, awayScore: 2, date: "Jan 8, 2026" },
  { home: "wolves", away: "leopard", homeScore: 1, awayScore: 3, date: "Jan 8, 2026" },
];

const NEXT_FIXTURES = [
  { home: "falcon", away: "leopard", date: "Jan 15, 2026", time: "18:00" },
  { home: "oryx", away: "wolves", date: "Jan 15, 2026", time: "20:00" },
  { home: "leopard", away: "wolves", date: "Jan 19, 2026", time: "18:00" },
  { home: "falcon", away: "oryx", date: "Jan 19, 2026", time: "20:00" },
];

const TOP_SCORERS = [
  { name: "Ahmed Al-Rashid", team: "falcon", goals: 5 },
  { name: "Marcus Chen", team: "leopard", goals: 4 },
  { name: "Yusuf Ibrahim", team: "falcon", goals: 3 },
  { name: "Daniel Santos", team: "oryx", goals: 3 },
  { name: "Omar Khalil", team: "leopard", goals: 2 },
  { name: "Tariq Hassan", team: "oryx", goals: 2 },
  { name: "James Wilson", team: "wolves", goals: 2 },
  { name: "Karim Nasser", team: "wolves", goals: 1 },
];

type TeamKey = keyof typeof TEAMS;

const TournamentPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);

  const getTeamStyle = (teamKey: string) => ({
    backgroundColor: TEAMS[teamKey as TeamKey].color,
    color: teamKey === "oryx" ? "#000" : "#fff",
  });

  const getTeamBadge = (teamKey: string) => (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold mr-2"
      style={getTeamStyle(teamKey)}
    >
      {TEAMS[teamKey as TeamKey].name.charAt(0)}
    </span>
  );

  const pageAccentColor = selectedTeam ? TEAMS[selectedTeam].color : "#00babc";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1
            className="text-4xl font-bold text-center mb-2"
            style={{ color: pageAccentColor }}
          >
            League Tournament
          </h1>
          <p className="text-center mb-8" style={{ color: "var(--text-secondary)" }}>
            Season 2025/26
          </p>

          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {Object.entries(TEAMS).map(([key, team]) => (
              <button
                key={key}
                onClick={() => setSelectedTeam(selectedTeam === key ? null : (key as TeamKey))}
                className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  selectedTeam === key ? "ring-4 ring-white ring-opacity-50" : ""
                }`}
                style={{
                  backgroundColor: team.color,
                  color: key === "oryx" ? "#000" : "#fff",
                }}
              >
                {team.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: pageAccentColor }}
              >
                <h2 className="text-xl font-bold text-white text-center">League Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Team</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>P</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>W</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>D</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>L</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>GD</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEAGUE_TABLE.map((row, idx) => (
                      <tr
                        key={row.team}
                        className={`border-b transition-colors ${
                          selectedTeam === row.team ? "ring-2 ring-inset" : ""
                        }`}
                        style={{
                          borderColor: "var(--border-color)",
                          backgroundColor: selectedTeam === row.team ? `${TEAMS[row.team as TeamKey].color}20` : undefined,
                        }}
                      >
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getTeamBadge(row.team)}
                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                              {TEAMS[row.team as TeamKey].name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{row.played}</td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{row.won}</td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{row.drawn}</td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{row.lost}</td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{row.gf - row.ga}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: pageAccentColor }}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: pageAccentColor }}
              >
                <h2 className="text-xl font-bold text-white text-center">Top Goal Scorers</h2>
              </div>
              <div className="p-4">
                {TOP_SCORERS.map((scorer, idx) => (
                  <div
                    key={scorer.name}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg mb-2 transition-colors ${
                      selectedTeam === scorer.team ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor: selectedTeam === scorer.team ? `${TEAMS[scorer.team as TeamKey].color}20` : "var(--bg-secondary)",
                      borderColor: TEAMS[scorer.team as TeamKey].color,
                    }}
                  >
                    <div className="flex items-center">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm"
                        style={{
                          backgroundColor: idx < 3 ? pageAccentColor : "var(--bg-card)",
                          color: idx < 3 ? "#fff" : "var(--text-secondary)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      {getTeamBadge(scorer.team)}
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {scorer.name}
                      </span>
                    </div>
                    <span
                      className="font-bold text-lg px-3 py-1 rounded"
                      style={{
                        backgroundColor: TEAMS[scorer.team as TeamKey].color,
                        color: scorer.team === "oryx" ? "#000" : "#fff",
                      }}
                    >
                      {scorer.goals}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: pageAccentColor }}
              >
                <h2 className="text-xl font-bold text-white text-center">Previous Results</h2>
              </div>
              <div className="p-4 space-y-3">
                {PREVIOUS_RESULTS.map((match, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-4 transition-colors"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <div className="text-xs text-center mb-2" style={{ color: "var(--text-secondary)" }}>
                      {match.date}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 justify-end">
                        <span className="font-medium mr-2" style={{ color: "var(--text-primary)" }}>
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home)}
                      </div>
                      <div
                        className="px-4 py-2 rounded-lg mx-4 font-bold text-lg min-w-[80px] text-center"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="flex items-center flex-1">
                        {getTeamBadge(match.away)}
                        <span className="font-medium ml-2" style={{ color: "var(--text-primary)" }}>
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: pageAccentColor }}
              >
                <h2 className="text-xl font-bold text-white text-center">Next Fixtures</h2>
              </div>
              <div className="p-4 space-y-3">
                {NEXT_FIXTURES.map((match, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-4 transition-colors"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <div className="text-xs text-center mb-2" style={{ color: "var(--text-secondary)" }}>
                      {match.date} • {match.time}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 justify-end">
                        <span className="font-medium mr-2" style={{ color: "var(--text-primary)" }}>
                          {TEAMS[match.home as TeamKey].name}
                        </span>
                        {getTeamBadge(match.home)}
                      </div>
                      <div
                        className="px-4 py-2 rounded-lg mx-4 font-bold text-sm"
                        style={{
                          backgroundColor: pageAccentColor,
                          color: "#fff",
                        }}
                      >
                        VS
                      </div>
                      <div className="flex items-center flex-1">
                        {getTeamBadge(match.away)}
                        <span className="font-medium ml-2" style={{ color: "var(--text-primary)" }}>
                          {TEAMS[match.away as TeamKey].name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TournamentPage;
