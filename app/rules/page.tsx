'use client';

import Navbar from '../../components/pages/Navbar';
import Footer from '../../components/pages/footer';
import { FiClock, FiAlertCircle, FiCheckCircle, FiUsers, FiUserX, FiShield } from 'react-icons/fi';

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Game Rules
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Please read and follow these rules to ensure fair play and an enjoyable experience for everyone.
            </p>
          </div>

          {/* Time and Score Section */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <FiClock size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Time and Score
              </h2>
            </div>
            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Games are <strong>10 minutes long</strong> or until a team scores <strong>2 goals</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span><strong>Winner stays on</strong>, loser rotates out.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>In case of a draw, the team that played consecutive games is out.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>If the first game ends in a draw, a <strong>coin toss</strong> will decide which team is out.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Game ends with referee&apos;s call.</span>
              </li>
            </ul>
          </div>

          {/* Teams Section */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <FiUsers size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Teams
              </h2>
            </div>
            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Three teams of <strong>7 players each</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>First two teams wear colored bibs, third team waits off the field.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>The waiting team rotates in after each game with the losing team.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Team selection is done <strong>5 minutes</strong> before the pitch booking starts.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>If a player is late for team selection, they are presumed to be unregistered.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Unregistered and waiting list players can join the game as <strong>substitutes only</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>In case of missing players, due to late arrival or injury, players from the waiting team or waiting list can substitute in.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>The referee has the final say on substitutions skill level and fairness.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Rebalancing teams is at the discretion of all teams involved.</span>
              </li>
            </ul>
          </div>

          {/* Referee Section */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <FiShield size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Referee
              </h2>
            </div>
            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>A referee is chosen for each game from the <strong>waiting team</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>Their decision is <strong>final</strong> and they can arbitrate any disagreement.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>This includes decisions on fouls, goals, and rule interpretations.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>The referee is responsible for <strong>game time</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>They also have a final say in substituting missing, late or injured players with another player of comparable skill level from the waiting team.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>The referees are fallible human beings, <strong>respect their decisions</strong> despite any shortcomings.</span>
              </li>
            </ul>
          </div>

          {/* Late TIG Section */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <FiUserX size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Late TIG
              </h2>
            </div>
            <div className="space-y-4">
              <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex gap-2">
                  <span className="text-ft-primary font-bold">•</span>
                  <span>Late players forfeit their position and can join as <strong>substitutes only</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-ft-primary font-bold">•</span>
                  <span>Joining as a substitute can only happen if the substituted player forfeits their position voluntarily.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-ft-primary font-bold">•</span>
                  <span>Players are responsible for removing themselves from the roster if they do not intend to show up.</span>
                </li>
              </ul>

              <div className="mt-4 p-4 rounded-lg border-2 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="font-bold mb-3 text-red-600">Late TIG Ban Rules:</p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>&lt; 15 mins late:</strong> half a week ban</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>&gt; 15 mins late:</strong> 1 week ban</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>No show:</strong> 1 month ban</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Cancellation:</strong> 1 week - 1 month ban depending on when cancellation is made</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Repeated offences</strong> will result in longer bans</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conduct Section */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <FiCheckCircle size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Conduct
              </h2>
            </div>
            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>This is a <strong>friendly game</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span>No aggressive behavior or foul language.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-ft-primary font-bold">•</span>
                <span className="text-red-600 font-semibold">Any use of physical violence outside the game will result in <strong>immediate banning</strong> from future games.</span>
              </li>
            </ul>
          </div>

          {/* Fair Play Notice */}
          <div className="mt-8 p-6 rounded-lg border-l-4 border-ft-primary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Fair Play & Sportsmanship
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Remember, this is a friendly competition. Respect your opponents, the referee, and the rules.
              Let&apos;s create a positive and enjoyable environment for everyone to play football!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
