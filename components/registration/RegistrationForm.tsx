import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Input } from '../ui/Input';
import { Button, ButtonProps } from '../ui/Button';

interface RegistrationFormProps {
  name: string;
  intra: string;
  errors: {
    name: string;
    intra: string;
  };
  nameInputRef: React.RefObject<HTMLInputElement>;
  intraInputRef: React.RefObject<HTMLInputElement>;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
  isSubmitting: boolean;
  isAllowed: boolean;
  timeUntilNext: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onIntraChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, field: 'name' | 'intra') => void;
  onSubmit: (event: React.FormEvent) => void;
}

/**
 * RegistrationForm Component
 * Single Responsibility: Render and handle the registration form UI
 */
export function RegistrationForm({
  name,
  intra,
  errors,
  nameInputRef,
  intraInputRef,
  submitButtonRef,
  isSubmitting,
  isAllowed,
  timeUntilNext,
  loading,
  onNameChange,
  onIntraChange,
  onKeyDown,
  onSubmit
}: RegistrationFormProps) {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
        Football Registration
	</h1>
      <p className="text-center text-m">Game time: 9 PM - Mondays and Thursdays</p>
      <p className="text-center text-m">Registration opens: 12 noon - Sundays and Wednesdays</p>
      <p className="text-center text-m mb-6">Location: Outddor Pitch 2 - Active Al Maria</p>

      {/* Authentication Notice */}
      {!session && (
        <div className="max-w-md mx-auto mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-center text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            🔐 Please <Link href="/auth/signin" className="underline font-bold hover:text-ft-primary transition-colors">sign in</Link> to register for matches
          </p>
          <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
            New here? An account will be created automatically when you sign in
          </p>
        </div>
      )}

      {/* Registration Form */}
      <form
        onSubmit={onSubmit}
        className="max-w-md mx-auto p-8 rounded-lg shadow-md mb-12"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <Input
          ref={nameInputRef}
          label="Name"
          type="text"
          id="name"
          value={name}
          autoComplete="name"
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'name')}
          error={errors.name}
          required
          fullWidth
        />

        <div className="mt-4">
          <Input
            ref={intraInputRef}
            label="Intra login"
            type="text"
            id="intra"
            value={intra}
            autoComplete="username"
            inputMode="text"
            onChange={(e) => onIntraChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, 'intra')}
            error={errors.intra}
            required
            fullWidth
          />
        </div>

        {!loading && (
          <>
            <div className="mt-6">
              <Button
                ref={submitButtonRef}
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isAllowed}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Register Now'}
              </Button>
            </div>
            {!isAllowed && (
              <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-center text-sm font-medium text-orange-700 dark:text-orange-300">
                  📅 Next registration: {timeUntilNext}
                </p>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
