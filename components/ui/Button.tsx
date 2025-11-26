import React, { ButtonHTMLAttributes } from 'react';

/**
 * Button Variants
 * Consistent button styles across the application
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Button Component
 * Single Responsibility: Render consistent, accessible buttons
 *
 * Consolidates 15+ button patterns into one reusable component
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Register Now
 * </Button>
 *
 * <Button variant="danger" size="sm" loading={isDeleting}>
 *   Delete
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps, ref) {
  // Base classes for all buttons
  const baseClasses = `
    font-medium rounded transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-flex items-center justify-center gap-2
  `;

  // Variant-specific classes
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `
      bg-ft-primary hover:bg-ft-secondary text-white
      focus:ring-ft-primary transform hover:scale-105 active:scale-[0.98]
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-600 hover:bg-gray-700 text-white
      focus:ring-gray-500 transform hover:scale-105 active:scale-[0.98]
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-red-500 transform hover:scale-110 active:scale-95
    `,
    ghost: `
      hover:bg-gray-100 dark:hover:bg-gray-700
      focus:ring-gray-300
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white
      focus:ring-green-500 transform hover:scale-105 active:scale-[0.98]
    `,
	outline: `
	  border border-gray-300 hover:bg-gray-100 text-gray-700
	  focus:ring-gray-300 transform hover:scale-105 active:scale-[0.98]
	`
  };

  // Size-specific classes
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  // Combine all classes
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {typeof children === 'string' && children.includes('ing') ? children : 'Loading...'}
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
});

/**
 * IconButton Component
 * For buttons that only contain an icon
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Accessible label for screen readers */
  label: string;
}

export function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonProps) {
  const sizeMap: Record<ButtonSize, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`rounded-full ${sizeMap[size]} ${className}`}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  );
}
