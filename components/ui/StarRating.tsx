import React from 'react';

/**
 * StarRating Component
 * Single Responsibility: Display and manage star-based ratings
 *
 * Features:
 * - Interactive star rating (clickable if not readonly)
 * - Hover effects for better UX
 * - Multiple size variants (sm, md, lg)
 * - Readonly mode for display-only scenarios
 * - Customizable max rating (default 5)
 * - Full ARIA support for accessibility
 *
 * Extracted from TeamsImproved component to create reusable UI element
 */

interface StarRatingProps {
  /** Current rating value */
  rating: number;
  /** Maximum number of stars (default: 5) */
  maxRating?: number;
  /** Callback when rating changes (omit for readonly) */
  onRatingChange?: (rating: number) => void;
  /** Readonly mode - disables interaction (default: false) */
  readonly?: boolean;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * StarRating Component
 *
 * @example
 * // Interactive rating
 * <StarRating
 *   rating={3}
 *   onRatingChange={(rating) => console.log(rating)}
 * />
 *
 * @example
 * // Readonly display
 * <StarRating rating={4} readonly />
 *
 * @example
 * // Large size with 10 stars
 * <StarRating
 *   rating={7}
 *   maxRating={10}
 *   size="lg"
 *   onRatingChange={(rating) => updateRating(rating)}
 * />
 */
export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const isInteractive = !readonly && onRatingChange !== undefined;

  // Size classes
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // Generate array of star indices
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div
      className={`flex gap-1 justify-center my-2 ${className}`}
      role="group"
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      {stars.map((star) => {
        const isActive = star <= rating;

        return (
          <span
            key={star}
            onClick={isInteractive ? () => onRatingChange(star) : undefined}
            onKeyDown={
              isInteractive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRatingChange(star);
                    }
                  }
                : undefined
            }
            className={`
              ${sizeClasses[size]}
              ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
              ${isInteractive ? 'transition-all duration-200 hover:scale-110' : ''}
              ${isActive ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            `}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={isInteractive ? isActive : undefined}
            title={
              isInteractive
                ? `Rate ${star} star${star !== 1 ? 's' : ''}`
                : `${star} star${star !== 1 ? 's' : ''}`
            }
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/**
 * Compact StarRating for inline display (no interaction)
 * Useful for showing ratings in tables or lists
 */
export function StarRatingCompact({
  rating,
  maxRating = 5,
  className = '',
}: {
  rating: number;
  maxRating?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${
            i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
