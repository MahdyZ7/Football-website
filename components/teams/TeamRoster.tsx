import React from 'react';
import { Input, IconButton } from '../ui';
import { FiX } from 'react-icons/fi';

/**
 * TeamRoster Component
 * Single Responsibility: Display a team roster with player management
 *
 * Features:
 * - Editable team name
 * - Player count badge
 * - Average rating display
 * - Player list with remove buttons
 * - Empty state message
 * - Color-coded border for team identification
 *
 * Extracted from TeamsImproved component (lines 474-698)
 */

type User = {
  name: string;
  intra: string;
  verified: boolean;
  created_at: string;
  rating?: number;
};

type Team = {
  name: string;
  players: User[];
};

interface TeamRosterProps {
  /** The team data */
  team: Team;
  /** Team number (1, 2, or 3) */
  teamNumber: 1 | 2 | 3;
  /** Maximum players allowed in team */
  maxPlayers: number;
  /** Color scheme for team identification */
  color: 'blue' | 'green' | 'orange';
  /** Callback when player is removed from team */
  onRemovePlayer: (player: User, teamNumber: 1 | 2 | 3) => void;
  /** Callback when team name is updated */
  onUpdateName: (teamNumber: 1 | 2 | 3, name: string) => void;
  /** Average team rating */
  avgRating: string;
}

/**
 * Get color classes for team identification
 */
const getColorClasses = (color: 'blue' | 'green' | 'orange') => {
  const colorMap = {
    blue: {
      border: 'border-blue-500',
      badge: 'bg-blue-500',
      ring: 'focus:ring-blue-500',
    },
    green: {
      border: 'border-green-500',
      badge: 'bg-green-500',
      ring: 'focus:ring-green-500',
    },
    orange: {
      border: 'border-orange-500',
      badge: 'bg-orange-500',
      ring: 'focus:ring-orange-500',
    },
  };
  return colorMap[color];
};

export function TeamRoster({
  team,
  teamNumber,
  maxPlayers,
  color,
  onRemovePlayer,
  onUpdateName,
  avgRating,
}: TeamRosterProps) {
  const colors = getColorClasses(color);

  return (
    <div
      className={`rounded-lg p-4 shadow-md border-l-4 ${colors.border}`}
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header - Team Name and Count */}
      <div className="flex items-center justify-between mb-3">
        <Input
          type="text"
          value={team.name}
          onChange={(e) => onUpdateName(teamNumber, e.target.value)}
          className={`flex-1 px-3 py-2 rounded border font-semibold text-lg focus:outline-none focus:ring-2 ${colors.ring}`}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
          placeholder={`Team ${teamNumber} Name`}
          aria-label={`Team ${teamNumber} name`}
        />
        <span
          className={`ml-3 px-3 py-1 rounded-full ${colors.badge} text-white font-bold text-sm`}
          aria-label={`${team.players.length} of ${maxPlayers} players`}
        >
          {team.players.length}/{maxPlayers}
        </span>
      </div>

      {/* Average Rating */}
      <div
        className="mb-3 text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        Average Rating: {avgRating} ★
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {team.players.length === 0 ? (
          <div
            className="text-center py-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            No players assigned
          </div>
        ) : (
          team.players.map((player, index) => (
            <div
              key={player.intra}
              className="flex items-center gap-3 p-2 rounded"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {/* Position Number */}
              <span
                className="flex-shrink-0 w-8 text-center font-bold"
                style={{ color: 'var(--text-secondary)' }}
              >
                #{index + 1}
              </span>

              {/* Player Info */}
              <div className="flex-1">
                <strong style={{ color: 'var(--text-primary)' }}>
                  {player.name}
                </strong>
                <span className="ml-2 text-yellow-400">
                  {'★'.repeat(player.rating || 1)}
                </span>
              </div>

              {/* Remove Button */}
              <IconButton
                onClick={() => onRemovePlayer(player, teamNumber)}
                variant="danger"
                size="sm"
                icon={<FiX size={16} />}
                label="Remove from team"
                aria-label={`Remove ${player.name} from team ${teamNumber}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
