import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Input Component
 * Single Responsibility: Render consistent, accessible text inputs
 *
 * Consolidates 8+ input patterns into one reusable component
 *
 * @example
 * ```tsx
 * <Input
 *   label="Name"
 *   value={name}
 *   onChange={handleChange}
 *   error={errors.name}
 *   required
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
            {required && <span className="ml-1 text-red-600">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`ds-field ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Textarea Component
 * For multi-line text input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
            {required && <span className="ml-1 text-red-600">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`ds-field ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Select label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Options */
  options?: Array<{ value: string; label: string }>;
}

/**
 * Select Component
 * For dropdown selection
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      required,
      options,
      children,
      ...props
    },
    ref
  ) => {
    const inputId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
            {required && <span className="ml-1 text-red-600">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`ds-field ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          aria-required={required}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
