import React from 'react';
import { Button, IconButton } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import { FiX } from 'react-icons/fi';

/**
 * PlayerCard Component
 * Single Responsibility: Display an available player with assignment actions
 *
 * Features:
 * - Player information (name, intra, position number)
 * - Interactive star rating
 * - Discard button (player didn't show up)
 * - Team assignment buttons (T1, T2, T3)
 * - Disabled state when teams are full
 * - Accessible keyboard navigation
 *
 * Extracted from TeamsImproved component (lines 401-461)
 */

type User = {
  name: string;
  intra: string;
  verified: boolean;
  created_at: string;
  rating?: number;
};

interface PlayerCardProps {
  /** The player to display */
  player: User;
  /** Position in available players list (1-indexed) */
  index: number;
  /** Callback when player is discarded */
  onDiscard: (player: User) => void;
  /** Callback when player is added to a team */
  onAddToTeam: (player: User, teamNumber: 1 | 2 | 3) => void;
  /** Callback when rating changes */
  onRatingChange: (playerId: string, rating: number) => void;
  /** Current team mode (2 or 3 teams) */
  teamMode: 2 | 3;
  /** Whether each team is full */
  teamsFull: {
    team1: boolean;
    team2: boolean;
    team3: boolean;
  };
}

export function PlayerCard({
  player,
  index,
  onDiscard,
  onAddToTeam,
  onRatingChange,
  teamMode,
  teamsFull,
}: PlayerCardProps) {
  return (
    <div
      className="rounded-lg p-4 shadow-md"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header - Position and Discard */}
      <div className="flex items-start justify-between mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ft-primary text-white text-sm font-bold">
          #{index + 1}
        </span>
        <IconButton
          onClick={() => onDiscard(player)}
          variant="danger"
          size="sm"
          icon={<FiX size={16} />}
          label="Remove player (didn't show up)"
          aria-label={`Remove ${player.name} from available players`}
        />
      </div>

      {/* Player Info */}
      <div className="mb-3">
        <strong className="block" style={{ color: 'var(--text-primary)' }}>
          {player.name}
        </strong>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {player.intra}
        </span>
      </div>

      {/* Star Rating */}
      <StarRating
        rating={player.rating || 1}
        onRatingChange={(rating) => onRatingChange(player.intra, rating)}
        size="md"
      />

      {/* Team Assignment Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => onAddToTeam(player, 1)}
          disabled={teamsFull.team1}
          variant="primary"
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600"
          aria-label={`Add ${player.name} to Team 1${teamsFull.team1 ? ' (Full)' : ''}`}
        >
          T1 {teamsFull.team1 ? '(Full)' : ''}
        </Button>

        <Button
          onClick={() => onAddToTeam(player, 2)}
          disabled={teamsFull.team2}
          variant="success"
          size="sm"
          className="flex-1"
          aria-label={`Add ${player.name} to Team 2${teamsFull.team2 ? ' (Full)' : ''}`}
        >
          T2 {teamsFull.team2 ? '(Full)' : ''}
        </Button>

        {teamMode === 3 && (
          <Button
            onClick={() => onAddToTeam(player, 3)}
            disabled={teamsFull.team3}
            variant="primary"
            size="sm"
            className="flex-1 !bg-orange-500 hover:!bg-orange-600"
            aria-label={`Add ${player.name} to Team 3${teamsFull.team3 ? ' (Full)' : ''}`}
          >
            T3 {teamsFull.team3 ? '(Full)' : ''}
          </Button>
        )}
      </div>
    </div>
  );
}
