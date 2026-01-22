'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Trophy, Award, Shield, User, Trash2, ArrowLeft, Search, Filter } from 'lucide-react';
import { useAdminTournamentVotes, useAdminDeleteTournamentVotes } from '../../../hooks/useQueries';
import { Skeleton } from '../../../components/Skeleton';
import Navbar from '../../../components/pages/Navbar';
import Footer from '../../../components/pages/footer';
import { TOURNAMENT_TEAMS } from '../../../lib/constants/tournament';

interface Vote {
  id: number;
  award_type: string;
  player_name: string;
  player_team: string;
  rank: number;
  created_at: string;
  updated_at: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
}

interface VoteSummary {
  playerName: string;
  playerTeam: string;
  voteCount: number;
  score: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
}

interface GroupedVotes {
  voterId: string;
  voterName: string;
  voterEmail: string;
  awardType: string;
  votes: Array<{ rank: number; playerName: string; playerTeam: string }>;
  createdAt: string;
}

const RANK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '1st', color: '#ffd700' },
  2: { label: '2nd', color: '#c0c0c0' },
  3: { label: '3rd', color: '#cd7f32' },
};

export default function AdminTournamentVotesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [selectedAwardType, setSelectedAwardType] = useState<string>('all');
  const [searchPlayer, setSearchPlayer] = useState<string>('');

  const filters = {
    awardType: selectedAwardType === 'all' ? undefined : selectedAwardType,
    playerName: searchPlayer.trim() || undefined,
  };

  const { data: votesData, isLoading } = useAdminTournamentVotes(filters);
  const deleteMutation = useAdminDeleteTournamentVotes();

  const votes: Vote[] = votesData?.votes || [];
  const summary = votesData?.summary || { best_player: [], best_goalkeeper: [] };
  const totals = votesData?.totals || { best_player: 0, best_goalkeeper: 0 };

  // Group votes by user and award type
  const groupedVotes = useMemo(() => {
    const groups: Record<string, GroupedVotes> = {};

    votes.forEach(vote => {
      const key = `${vote.voter_id}-${vote.award_type}`;
      if (!groups[key]) {
        groups[key] = {
          voterId: vote.voter_id,
          voterName: vote.voter_name,
          voterEmail: vote.voter_email,
          awardType: vote.award_type,
          votes: [],
          createdAt: vote.created_at,
        };
      }
      groups[key].votes.push({
        rank: vote.rank,
        playerName: vote.player_name,
        playerTeam: vote.player_team,
      });
    });

    // Sort votes within each group by rank
    Object.values(groups).forEach(group => {
      group.votes.sort((a, b) => a.rank - b.rank);
    });

    return Object.values(groups).sort((a, b) => {
      // Sort by award type, then by voter name
      if (a.awardType !== b.awardType) {
        return a.awardType.localeCompare(b.awardType);
      }
      return (a.voterName || '').localeCompare(b.voterName || '');
    });
  }, [votes]);

  const handleDeleteVotes = async (voterId: string, awardType: string, voterName: string) => {
    if (!confirm(`Remove all ${awardType.replace('_', ' ')} votes from ${voterName}?`)) return;

    try {
      await deleteMutation.mutateAsync({ voterId, awardType });
      toast.success('Votes removed successfully');
    } catch {
      toast.error('Failed to remove votes');
    }
  };

  const getTeamColor = (teamName: string) => {
    return TOURNAMENT_TEAMS[teamName as keyof typeof TOURNAMENT_TEAMS]?.color || '#888';
  };

  const getTeamLogo = (teamName: string) => {
    return TOURNAMENT_TEAMS[teamName as keyof typeof TOURNAMENT_TEAMS]?.logo || '';
  };

  // Redirect if not admin
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full space-y-4 p-8">
          <Skeleton width="60%" height={32} className="mx-auto" />
          <Skeleton width="100%" height={48} />
          <Skeleton width="80%" height={24} className="mx-auto" />
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 mb-6 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Tournament Votes Audit
              </h1>
            </div>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              View and manage all votes for tournament awards (4 pts / 2 pts / 1 pt scoring)
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Total Ballot Submissions
              </p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {groupedVotes.length}
              </p>
            </div>
            <div className="rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Best Player Ballots
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {groupedVotes.filter(g => g.awardType === 'best_player').length}
              </p>
            </div>
            <div className="rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Best Goalkeeper Ballots
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {groupedVotes.filter(g => g.awardType === 'best_goalkeeper').length}
              </p>
            </div>
          </div>

          {/* Vote Standings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Best Player Standings */}
            <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <Award className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Best Player Standings
                </h2>
              </div>
              <div className="p-4">
                {summary.best_player.length === 0 ? (
                  <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>No votes yet</p>
                ) : (
                  <div className="space-y-2">
                    {(summary.best_player as VoteSummary[]).map((item, idx) => (
                      <div
                        key={`${item.playerName}-${item.playerTeam}`}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-500 text-black' :
                              idx === 1 ? 'bg-gray-400 text-black' :
                              idx === 2 ? 'bg-amber-700 text-white' :
                              'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className="w-8 h-8 rounded-full overflow-hidden border-2"
                            style={{ borderColor: getTeamColor(item.playerTeam) }}
                          >
                            <img
                              src={getTeamLogo(item.playerTeam)}
                              alt={item.playerTeam}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.playerName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.playerTeam}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className="font-bold px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${getTeamColor(item.playerTeam)}30`,
                              color: getTeamColor(item.playerTeam),
                            }}
                          >
                            {item.score} pts
                          </span>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {item.firstPlace}x1st / {item.secondPlace}x2nd / {item.thirdPlace}x3rd
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Best Goalkeeper Standings */}
            <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <Shield className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Best Goalkeeper Standings
                </h2>
              </div>
              <div className="p-4">
                {summary.best_goalkeeper.length === 0 ? (
                  <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>No votes yet</p>
                ) : (
                  <div className="space-y-2">
                    {(summary.best_goalkeeper as VoteSummary[]).map((item, idx) => (
                      <div
                        key={`${item.playerName}-${item.playerTeam}`}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-500 text-black' :
                              idx === 1 ? 'bg-gray-400 text-black' :
                              idx === 2 ? 'bg-amber-700 text-white' :
                              'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className="w-8 h-8 rounded-full overflow-hidden border-2"
                            style={{ borderColor: getTeamColor(item.playerTeam) }}
                          >
                            <img
                              src={getTeamLogo(item.playerTeam)}
                              alt={item.playerTeam}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.playerName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.playerTeam}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className="font-bold px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${getTeamColor(item.playerTeam)}30`,
                              color: getTeamColor(item.playerTeam),
                            }}
                          >
                            {item.score} pts
                          </span>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {item.firstPlace}x1st / {item.secondPlace}x2nd / {item.thirdPlace}x3rd
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Award Type
                </label>
                <select
                  value={selectedAwardType}
                  onChange={(e) => setSelectedAwardType(e.target.value)}
                  className="w-full px-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All Awards</option>
                  <option value="best_player">Best Player</option>
                  <option value="best_goalkeeper">Best Goalkeeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Search Player
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    value={searchPlayer}
                    onChange={(e) => setSearchPlayer(e.target.value)}
                    placeholder="Search by player name..."
                    className="w-full pl-10 pr-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Votes by User */}
          <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                All Ballots ({groupedVotes.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton width={120} height={20} />
                    <Skeleton width={100} height={20} />
                    <Skeleton width={150} height={20} />
                    <Skeleton width={200} height={20} />
                  </div>
                ))}
              </div>
            ) : groupedVotes.length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>No votes found matching your filters.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {groupedVotes.map((group) => (
                  <div
                    key={`${group.voterId}-${group.awardType}`}
                    className="p-4 hover:bg-opacity-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Voter Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {group.awardType === 'best_player' ? (
                              <Award className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Shield className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className="font-medium capitalize text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {group.awardType.replace('_', ' ')}
                            </span>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>•</span>
                          <div>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {group.voterName || 'Unknown'}
                            </span>
                            <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>
                              ({group.voterEmail})
                            </span>
                          </div>
                        </div>

                        {/* Ranked Votes */}
                        <div className="flex flex-wrap gap-3">
                          {group.votes.map((vote) => (
                            <div
                              key={vote.rank}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: RANK_LABELS[vote.rank]?.color || '#888', color: '#000' }}
                              >
                                {vote.rank}
                              </span>
                              <div
                                className="w-6 h-6 rounded-full overflow-hidden border"
                                style={{ borderColor: getTeamColor(vote.playerTeam) }}
                              >
                                <img
                                  src={getTeamLogo(vote.playerTeam)}
                                  alt={vote.playerTeam}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {vote.playerName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                          Submitted: {new Date(group.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteVotes(group.voterId, group.awardType, group.voterName || 'Unknown')}
                        disabled={deleteMutation.isPending}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex-shrink-0"
                        title="Remove all votes for this ballot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
