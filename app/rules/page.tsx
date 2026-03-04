'use client';

import React from 'react';
import Navbar from '../../components/pages/Navbar';
import Footer from '../../components/pages/footer';
import { Clock, CheckCircle, Users, UserX, Shield } from 'lucide-react';
import { useConfig } from '../../contexts/SiteConfigContext';

function formatDuration(days: number): string {
  if (days === 0) return 'No ban';
  if (days <= 4) return 'half a week ban';
  if (days <= 8) return '1 week ban';
  if (days <= 15) return '2 week ban';
  if (days <= 30) return '1 month ban';
  return `${days} day ban`;
}

// Parse **bold** markdown into React elements without dangerouslySetInnerHTML
function MarkdownLine({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

function RuleSection({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  const lines = content.split('\n').filter((l) => l.trim());

  return (
    <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-ft-primary font-bold">•</span>
            <MarkdownLine text={line} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RulesPage() {
  const { config } = useConfig();
  const { banDurations, lateThresholdMinutes } = config;

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

          <RuleSection
            icon={<Clock size={28} className="text-ft-primary" />}
            title="Time and Score"
            content={config.gameRules.timeAndScore}
          />

          <RuleSection
            icon={<Users size={28} className="text-ft-primary" />}
            title="Teams"
            content={config.gameRules.teams}
          />

          <RuleSection
            icon={<Shield size={28} className="text-ft-primary" />}
            title="Referee"
            content={config.gameRules.referee}
          />

          {/* Late TIG Section - includes dynamic ban rules */}
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <UserX size={28} className="text-ft-primary" />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Late TIG
              </h2>
            </div>
            <div className="space-y-4">
              <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                {config.gameRules.lateTig.split('\n').filter((l) => l.trim()).map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ft-primary font-bold">•</span>
                    <MarkdownLine text={line} />
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-4 rounded-lg border-2 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="font-bold mb-3 text-red-600">Late TIG Ban Rules:</p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>&lt; {lateThresholdMinutes} mins late:</strong> {formatDuration(banDurations.NOT_READY)}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>&gt; {lateThresholdMinutes} mins late:</strong> {formatDuration(banDurations.LATE)}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>No show:</strong> {formatDuration(banDurations.NO_SHOW)}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Cancellation:</strong> {formatDuration(banDurations.CANCEL)} - {formatDuration(banDurations.CANCEL_GAME_DAY)} depending on when cancellation is made</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Repeated offences</strong> will result in longer bans</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <RuleSection
            icon={<CheckCircle size={28} className="text-ft-primary" />}
            title="Conduct"
            content={config.gameRules.conduct}
          />

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
