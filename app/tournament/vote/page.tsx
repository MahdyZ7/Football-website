'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, User, Shield, ArrowLeft, X, Clock, AlertTriangle, Info, Medal, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '../../../components/pages/Navbar';
import Footer from '../../../components/pages/footer';
import { useTournamentVotes, useSubmitTournamentVotes, useRemoveTournamentVotes } from '../../../hooks/useQueries';
import {
  TOURNAMENT_TEAMS,
  ELIGIBLE_PLAYERS,
  ELIGIBLE_GOALKEEPERS,
  getTimeRemaining,
  type TeamKey,
  type EligiblePlayer,
} from '../../../lib/constants/tournament';

type RankKey = 'first' | 'second' | 'third';
type RankedVote = { playerName: string; playerTeam: string } | null;
type RankedVotes = { first: RankedVote; second: RankedVote; third: RankedVote };
type LocalSelections = { first: EligiblePlayer | null; second: EligiblePlayer | null; third: EligiblePlayer | null };

interface VoteTally {
  name: string;
  team: string;
  score: number;
  votes: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
}

const RANK_INFO: Record<RankKey, { label: string; shortLabel: string; points: number; color: string; bgColor: string; num: number }> = {
  first: { label: '1st Choice', shortLabel: '1st', points: 4, color: '#ffd700', bgColor: 'rgba(255,215,0,0.2)', num: 1 },
  second: { label: '2nd Choice', shortLabel: '2nd', points: 2, color: '#c0c0c0', bgColor: 'rgba(192,192,192,0.2)', num: 2 },
  third: { label: '3rd Choice', shortLabel: '3rd', points: 1, color: '#cd7f32', bgColor: 'rgba(205,127,50,0.2)', num: 3 },
};

const RANKS: RankKey[] = ['first', 'second', 'third'];

// Countdown Timer Component
const CountdownTimer = ({ onExpire }: { onExpire: () => void }) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeRemaining> | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeRemaining());

    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  if (!mounted || !timeLeft) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-gray-300 font-medium">Voting ends in</span>
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold animate-pulse"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))',
                  border: '1px solid rgba(255,215,0,0.3)',
                  color: '#ffd700',
                }}
              >
                --
              </div>
              <span className="text-xs text-gray-400 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center justify-center gap-2 text-red-400">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold">Voting has ended</span>
      </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold"
        style={{
          background: 'linear-gradient(145deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))',
          border: '1px solid rgba(255,215,0,0.3)',
          color: '#ffd700',
        }}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-yellow-400" />
        <span className="text-gray-300 font-medium">Voting ends in</span>
      </div>
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <TimeBlock value={timeLeft.days} label="Days" />
        <span className="text-xl text-yellow-400 font-bold">:</span>
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <span className="text-xl text-yellow-400 font-bold">:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-xl text-yellow-400 font-bold">:</span>
        <TimeBlock value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
};

// Voting Closed Banner
const VotingClosedBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-6 mb-8 text-center"
    style={{
      background: 'linear-gradient(145deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
      border: '1px solid rgba(239,68,68,0.3)',
    }}
  >
    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
    <h2 className="text-2xl font-bold text-red-400 mb-2">Voting Has Ended</h2>
    <p className="text-gray-400">
      The voting period for tournament awards has closed. Thank you to everyone who participated!
    </p>
  </motion.div>
);

// Fan Award Disclaimer Banner
const DisclaimerBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl p-4 mb-6 flex items-start gap-3"
    style={{
      background: 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
      border: '1px solid rgba(59,130,246,0.3)',
    }}
  >
    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-blue-300 font-medium text-sm">Fan Award Disclaimer</p>
      <p className="text-gray-400 text-sm mt-1">
        This is a <span className="text-blue-300 font-medium">fan-voted award</span> and is not affiliated with the official tournament prizes.
        Results reflect the preferences of participating fans only.
      </p>
	  <p className="text-gray-400 text-sm mt-1">
		Four players from each house were selected. May the best player win!
		</p>
    </div>
  </motion.div>
);

// How It Works Section
const HowItWorksSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="rounded-xl p-5 mb-8"
    style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.1)',
    }}
  >
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <Medal className="w-5 h-5 text-yellow-400" />
      How Ranked Choice Voting Works
    </h3>
    <div className="grid grid-cols-3 gap-3 mb-4">
      {RANKS.map((rank) => {
        const info = RANK_INFO[rank];
        return (
          <div
            key={rank}
            className="rounded-lg p-3 text-center"
            style={{ background: info.bgColor, border: `1px solid ${info.color}40` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
              style={{ background: info.color, color: '#000' }}
            >
              {info.num}
            </div>
            <p className="font-semibold text-white text-sm">{info.shortLabel}</p>
            <p className="text-xl font-bold" style={{ color: info.color }}>
              {info.points} pts
            </p>
          </div>
        );
      })}
    </div>
    <p className="text-gray-400 text-sm text-center">
      Select your top 3 choices for each award by clicking the rank buttons on each player.
      Submit all selections at once to record your votes.
    </p>
  </motion.div>
);

export default function TournamentVotePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [votingExpired, setVotingExpired] = useState(false);

  // Local selections (before submitting)
  const [localBestPlayer, setLocalBestPlayer] = useState<LocalSelections>({ first: null, second: null, third: null });
  const [localGoalkeeper, setLocalGoalkeeper] = useState<LocalSelections>({ first: null, second: null, third: null });

  const shuffledPlayers = useMemo(() => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };
    return [...ELIGIBLE_PLAYERS]
      .map((player, i) => ({ player, sort: seededRandom(i) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ player }) => player);
  }, []);

  const shuffledGoalkeepers = useMemo(() => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 100;
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };
    return [...ELIGIBLE_GOALKEEPERS]
      .map((player, i) => ({ player, sort: seededRandom(i) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ player }) => player);
  }, []);

  const { data: votesData, isLoading } = useTournamentVotes();
  const submitVotesMutation = useSubmitTournamentVotes();
  const removeVotesMutation = useRemoveTournamentVotes();

  const tallies = votesData?.tallies || { best_player: [], best_goalkeeper: [] };
  const userVotes: Record<string, RankedVotes> = votesData?.userVotes || {
    best_player: { first: null, second: null, third: null },
    best_goalkeeper: { first: null, second: null, third: null },
  };
  const votingOpen = votesData?.votingOpen ?? true;

  // Check if user has submitted votes (from server)
  const hasSubmittedBestPlayer = userVotes.best_player.first !== null;
  const hasSubmittedGoalkeeper = userVotes.best_goalkeeper.first !== null;

  useEffect(() => {
    if (votesData && !votesData.votingOpen) {
      setVotingExpired(true);
    }
  }, [votesData]);

  // Stringify user votes for stable dependency comparison
  const bestPlayerVotesJson = JSON.stringify(userVotes.best_player);
  const goalkeeperVotesJson = JSON.stringify(userVotes.best_goalkeeper);

  // Initialize local selections from server data when available
  useEffect(() => {
    if (hasSubmittedBestPlayer) {
      const votes = userVotes.best_player;
      setLocalBestPlayer({
        first: votes.first ? { name: votes.first.playerName, team: votes.first.playerTeam as TeamKey } : null,
        second: votes.second ? { name: votes.second.playerName, team: votes.second.playerTeam as TeamKey } : null,
        third: votes.third ? { name: votes.third.playerName, team: votes.third.playerTeam as TeamKey } : null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmittedBestPlayer, bestPlayerVotesJson]);

  useEffect(() => {
    if (hasSubmittedGoalkeeper) {
      const votes = userVotes.best_goalkeeper;
      setLocalGoalkeeper({
        first: votes.first ? { name: votes.first.playerName, team: votes.first.playerTeam as TeamKey } : null,
        second: votes.second ? { name: votes.second.playerName, team: votes.second.playerTeam as TeamKey } : null,
        third: votes.third ? { name: votes.third.playerName, team: votes.third.playerTeam as TeamKey } : null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmittedGoalkeeper, goalkeeperVotesJson]);

  const handleSelectRank = (
    awardType: 'best_player' | 'best_goalkeeper',
    player: EligiblePlayer,
    rank: RankKey
  ) => {
    const setSelections = awardType === 'best_player' ? setLocalBestPlayer : setLocalGoalkeeper;
    const currentSelections = awardType === 'best_player' ? localBestPlayer : localGoalkeeper;

    // Check if player is already selected at another rank
    const existingRank = RANKS.find(r => {
      const sel = currentSelections[r];
      return sel && sel.name === player.name && sel.team === player.team;
    });

    if (existingRank && existingRank !== rank) {
      // Move player from existing rank to new rank
      setSelections(prev => ({
        ...prev,
        [existingRank]: null,
        [rank]: player,
      }));
    } else if (existingRank === rank) {
      // Deselect
      setSelections(prev => ({
        ...prev,
        [rank]: null,
      }));
    } else {
      // Select new player for this rank
      setSelections(prev => ({
        ...prev,
        [rank]: player,
      }));
    }
  };

  const handleSubmitVotes = async (awardType: 'best_player' | 'best_goalkeeper') => {
    if (!session) {
      toast.error('Please sign in to vote');
      return;
    }

    if (votingExpired || !votingOpen) {
      toast.error('Voting has ended');
      return;
    }

    const selections = awardType === 'best_player' ? localBestPlayer : localGoalkeeper;

    if (!selections.first || !selections.second || !selections.third) {
      toast.error('Please select all 3 ranked choices before submitting');
      return;
    }

    try {
      await submitVotesMutation.mutateAsync({
        awardType,
        votes: [
          { playerName: selections.first.name, playerTeam: selections.first.team, rank: 1 },
          { playerName: selections.second.name, playerTeam: selections.second.team, rank: 2 },
          { playerName: selections.third.name, playerTeam: selections.third.team, rank: 3 },
        ],
      });
      toast.success('Votes submitted successfully!');
    } catch {
      toast.error('Failed to submit votes');
    }
  };

  const handleClearVotes = async (awardType: 'best_player' | 'best_goalkeeper') => {
    if (!session) return;

    if (votingExpired || !votingOpen) {
      toast.error('Voting has ended - votes cannot be changed');
      return;
    }

    const hasSubmitted = awardType === 'best_player' ? hasSubmittedBestPlayer : hasSubmittedGoalkeeper;
    const setSelections = awardType === 'best_player' ? setLocalBestPlayer : setLocalGoalkeeper;

    if (hasSubmitted) {
      try {
        await removeVotesMutation.mutateAsync(awardType);
        toast.success('Votes cleared');
      } catch {
        toast.error('Failed to clear votes');
        return;
      }
    }

    setSelections({ first: null, second: null, third: null });
  };

  const handleExpire = useCallback(() => {
    setVotingExpired(true);
  }, []);

  const getTeamColor = (teamName: string) => {
    return TOURNAMENT_TEAMS[teamName as TeamKey]?.color || '#888';
  };

  const getTeamLogo = (teamName: string) => {
    return TOURNAMENT_TEAMS[teamName as TeamKey]?.logo || '';
  };

  const getPlayerSelectedRank = (
    awardType: 'best_player' | 'best_goalkeeper',
    player: EligiblePlayer
  ): RankKey | null => {
    const selections = awardType === 'best_player' ? localBestPlayer : localGoalkeeper;
    for (const rank of RANKS) {
      const sel = selections[rank];
      if (sel && sel.name === player.name && sel.team === player.team) {
        return rank;
      }
    }
    return null;
  };

  const renderSelectionSlot = (selection: EligiblePlayer | null, rank: RankKey) => {
    const info = RANK_INFO[rank];

    return (
      <div
        key={rank}
        className="rounded-lg p-2 min-h-[60px] flex items-center gap-2"
        style={{
          background: selection ? info.bgColor : 'rgba(255,255,255,0.03)',
          border: `2px solid ${selection ? info.color : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: info.color, color: '#000' }}
        >
          {info.num}
        </div>
        {selection ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0"
              style={{ borderColor: getTeamColor(selection.team) }}
            >
              <img src={getTeamLogo(selection.team)} alt={selection.team} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-xs truncate">{selection.name}</p>
              <p className="text-[10px] text-gray-400">{selection.team}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Select {info.shortLabel}</span>
        )}
      </div>
    );
  };

  const renderPlayerCard = (
    player: EligiblePlayer,
    awardType: 'best_player' | 'best_goalkeeper',
    talliesForAward: VoteTally[]
  ) => {
    const selectedRank = getPlayerSelectedRank(awardType, player);
    const tally = talliesForAward.find(t => t.name === player.name && t.team === player.team);
    const teamColor = getTeamColor(player.team);
    const canInteract = !votingExpired && votingOpen;
    const hasSubmitted = awardType === 'best_player' ? hasSubmittedBestPlayer : hasSubmittedGoalkeeper;

    return (
      <div
        key={`${player.name}-${player.team}`}
        className={`relative p-3 rounded-xl border transition-all duration-200 ${
          selectedRank ? '' : ''
        }`}
        style={{
          borderColor: selectedRank ? RANK_INFO[selectedRank].color : 'rgba(255,255,255,0.1)',
          backgroundColor: selectedRank ? RANK_INFO[selectedRank].bgColor : 'rgba(255,255,255,0.03)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: teamColor }}
          >
            <img src={getTeamLogo(player.team)} alt={player.team} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{player.name}</p>
            <p className="text-xs text-gray-400">{player.team}</p>
          </div>
          {/* Only show scores after voting ends */}
          {(votingExpired || !votingOpen) && tally && tally.score > 0 && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: `${teamColor}30`, color: teamColor }}
            >
              {tally.score} pts
            </span>
          )}
        </div>

        {/* Rank selection buttons */}
        {canInteract && !hasSubmitted && (
          <div className="flex gap-2 mt-3">
            {RANKS.map((rank) => {
              const info = RANK_INFO[rank];
              const isSelected = selectedRank === rank;
              const selections = awardType === 'best_player' ? localBestPlayer : localGoalkeeper;
              const slotTaken = selections[rank] !== null && !isSelected;

              return (
                <button
                  key={rank}
                  onClick={() => handleSelectRank(awardType, player, rank)}
                  disabled={slotTaken}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? 'text-black'
                      : slotTaken
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? info.color : slotTaken ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? info.color : slotTaken ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {info.shortLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Show selected rank badge when submitted */}
        {hasSubmitted && selectedRank && (
          <div className="absolute top-2 right-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: RANK_INFO[selectedRank].color, color: '#000' }}
            >
              {RANK_INFO[selectedRank].num}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVoteSection = (
    title: string,
    icon: React.ReactNode,
    awardType: 'best_player' | 'best_goalkeeper',
    talliesForAward: VoteTally[]
  ) => {
    const selections = awardType === 'best_player' ? localBestPlayer : localGoalkeeper;
    const players = awardType === 'best_goalkeeper' ? shuffledGoalkeepers : shuffledPlayers;
    const hasSubmitted = awardType === 'best_player' ? hasSubmittedBestPlayer : hasSubmittedGoalkeeper;
    const allSelected = selections.first && selections.second && selections.third;
    const canInteract = !votingExpired && votingOpen;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden backdrop-blur-xl"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, #ffd70080, #ffd70040)" }}
        >
          {icon}
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="p-4 md:p-6">
          {/* Current Selections Display */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {renderSelectionSlot(selections.first, 'first')}
            {renderSelectionSlot(selections.second, 'second')}
            {renderSelectionSlot(selections.third, 'third')}
          </div>

          {/* Submit/Clear Buttons */}
          {canInteract && (
            <div className="flex gap-2 mb-4">
              {!hasSubmitted ? (
                <button
                  onClick={() => handleSubmitVotes(awardType)}
                  disabled={!allSelected || submitVotesMutation.isPending}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    allSelected
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitVotesMutation.isPending ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {allSelected ? 'Submit Votes' : 'Select all 3 to submit'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleClearVotes(awardType)}
                  disabled={removeVotesMutation.isPending}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {removeVotesMutation.isPending ? 'Clearing...' : 'Clear & Change Votes'}
                </button>
              )}
            </div>
          )}

          {hasSubmitted && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Votes submitted!</span>
            </div>
          )}

          {/* Player Selection */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {players.map((player) => renderPlayerCard(player, awardType, talliesForAward))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: "#0a0a0f" }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/tournament"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournament
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1
                className="text-3xl md:text-4xl font-black tracking-tight"
                style={{
                  backgroundImage: "linear-gradient(135deg, #ffd700, #ffaa00, #ffd700)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Tournament Fans Awards
              </h1>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto mb-4">
              Cast your ranked votes for the best player and goalkeeper
            </p>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4 max-w-md mx-auto mb-4"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <CountdownTimer onExpire={handleExpire} />
            </motion.div>
          </motion.div>

          {/* Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Voting Closed Banner */}
          {(votingExpired || !votingOpen) && <VotingClosedBanner />}

          {/* How It Works */}
          <HowItWorksSection />

          {/* Auth Required Message */}
          {sessionStatus === 'loading' ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : !session ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 text-center max-w-md mx-auto"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Sign in to Vote</h2>
              <p className="text-gray-400 mb-6">
                You need to be signed in to cast your ranked votes for the tournament awards.
              </p>
              <button
                onClick={() => signIn()}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105"
              >
                Sign In to Vote
              </button>
            </motion.div>
          ) : (
            <>
              {/* Voting Sections */}
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[500px] rounded-2xl animate-pulse"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderVoteSection(
                    "Best Player",
                    <Award className="w-6 h-6 text-yellow-400" />,
                    "best_player",
                    tallies.best_player
                  )}

                  {renderVoteSection(
                    "Best Goalkeeper",
                    <Shield className="w-6 h-6 text-yellow-400" />,
                    "best_goalkeeper",
                    tallies.best_goalkeeper
                  )}
                </div>
              )}

              {/* Vote Tallies Section - Only shown after voting ends */}
              {(votingExpired || !votingOpen) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 rounded-2xl overflow-hidden backdrop-blur-xl"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))" }}
                  >
                    <Star className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Final Results</h2>
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>

                  <div className="p-4 md:p-6">
                    <p className="text-gray-400 text-sm text-center mb-4">
                      Scores: 1st = 4 pts, 2nd = 2 pts, 3rd = 1 pt
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Best Player Standings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-400" />
                          Best Player
                        </h3>
                        {tallies.best_player.length === 0 ? (
                          <p className="text-gray-500 text-sm">No votes were cast</p>
                        ) : (
                          <div className="space-y-2">
                            {tallies.best_player.slice(0, 5).map((tally: VoteTally, idx: number) => (
                              <div
                                key={`${tally.name}-${tally.team}`}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      idx === 0 ? 'bg-yellow-500 text-black' :
                                      idx === 1 ? 'bg-gray-400 text-black' :
                                      idx === 2 ? 'bg-amber-700 text-white' :
                                      'bg-gray-700 text-gray-300'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div
                                    className="w-8 h-8 rounded-full overflow-hidden border"
                                    style={{ borderColor: getTeamColor(tally.team) }}
                                  >
                                    <img src={getTeamLogo(tally.team)} alt={tally.team} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{tally.name}</p>
                                    <p className="text-xs text-gray-500">{tally.team}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span
                                    className="font-bold px-3 py-1 rounded-full text-sm"
                                    style={{
                                      backgroundColor: `${getTeamColor(tally.team)}30`,
                                      color: getTeamColor(tally.team),
                                    }}
                                  >
                                    {tally.score} pts
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {tally.firstPlace}x1st / {tally.secondPlace}x2nd / {tally.thirdPlace}x3rd
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Best Goalkeeper Standings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-yellow-400" />
                          Best Goalkeeper
                        </h3>
                        {tallies.best_goalkeeper.length === 0 ? (
                          <p className="text-gray-500 text-sm">No votes were cast</p>
                        ) : (
                          <div className="space-y-2">
                            {tallies.best_goalkeeper.slice(0, 5).map((tally: VoteTally, idx: number) => (
                              <div
                                key={`${tally.name}-${tally.team}`}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      idx === 0 ? 'bg-yellow-500 text-black' :
                                      idx === 1 ? 'bg-gray-400 text-black' :
                                      idx === 2 ? 'bg-amber-700 text-white' :
                                      'bg-gray-700 text-gray-300'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div
                                    className="w-8 h-8 rounded-full overflow-hidden border"
                                    style={{ borderColor: getTeamColor(tally.team) }}
                                  >
                                    <img src={getTeamLogo(tally.team)} alt={tally.team} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{tally.name}</p>
                                    <p className="text-xs text-gray-500">{tally.team}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span
                                    className="font-bold px-3 py-1 rounded-full text-sm"
                                    style={{
                                      backgroundColor: `${getTeamColor(tally.team)}30`,
                                      color: getTeamColor(tally.team),
                                    }}
                                  >
                                    {tally.score} pts
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {tally.firstPlace}x1st / {tally.secondPlace}x2nd / {tally.thirdPlace}x3rd
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
