import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: React.ReactNode;
  /** Optional padding override */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Remove shadow */
  noShadow?: boolean;
  /** Hover effect */
  hoverable?: boolean;
}

/**
 * Card Component
 * Single Responsibility: Render consistent card containers
 *
 * Consolidates 30+ card patterns into one reusable component
 *
 * @example
 * ```tsx
 * <Card>
 *   <h2>Title</h2>
 *   <p>Content</p>
 * </Card>
 *
 * <Card padding="lg" hoverable>
 *   Interactive content
 * </Card>
 * ```
 */
export function Card({
  children,
  padding = 'md',
  noShadow = false,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const classes = `
    rounded-lg border
    ${!noShadow ? 'shadow-[0_1px_2px_var(--shadow)]' : ''}
    ${paddingClasses[padding]}
    ${hoverable ? 'transition-colors duration-150 hover:border-[var(--text-secondary)]' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={classes}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  /** Header content (usually a title) */
  children: React.ReactNode;
  /** Additional actions/buttons for the header */
  actions?: React.ReactNode;
}

/**
 * CardHeader Component
 * For cards with a distinct header section
 */
export function CardHeader({ children, actions }: CardHeaderProps) {
  return (
    <div
      className="px-6 py-4 border-b flex items-center justify-between"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <h3 className="text-2xl" style={{ color: 'var(--text-primary)' }}>
        {children}
      </h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export interface CardContentProps {
  /** Content */
  children: React.ReactNode;
  /** Padding override */
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * CardContent Component
 * For card body content
 */
export function CardContent({ children, padding = 'md' }: CardContentProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return <div className={paddingClasses[padding]}>{children}</div>;
}

export interface CardFooterProps {
  /** Footer content */
  children: React.ReactNode;
}

/**
 * CardFooter Component
 * For cards with a distinct footer section
 */
export function CardFooter({ children }: CardFooterProps) {
  return (
    <div
      className="px-6 py-4 border-t"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {children}
    </div>
  );
}
