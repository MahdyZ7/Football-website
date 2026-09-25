import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './home.module.css';

interface SignUpPanelProps {
  name: string;
  intra: string;
  errors: { name: string; intra: string };
  nameInputRef: React.RefObject<HTMLInputElement>;
  intraInputRef: React.RefObject<HTMLInputElement>;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
  isSubmitting: boolean;
  isAllowed: boolean;
  loading: boolean;
  /** e.g. "Sunday at noon" */
  opensAt: string | null;
  timeUntilNext: string;
  /** Set when the signed-in player already holds a shirt or a bench spot. */
  ownSpot: { kind: 'shirt' | 'bench'; number: number } | null;
  benchMode: boolean;
  onNameChange: (value: string) => void;
  onIntraChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, field: 'name' | 'intra') => void;
  onSubmit: (event: React.FormEvent) => void;
}

function FieldError({ id, message }: { id: string; message: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm" style={{ color: '#c2410c' }}>
      {message}
    </p>
  );
}

export function SignUpPanel({
  nameInputRef, intraInputRef, submitButtonRef, onNameChange, onIntraChange, onKeyDown, onSubmit, ...props
}: SignUpPanelProps) {
  const { data: session, status } = useSession();
  const isBanned = session?.user?.isBanned ?? false;
  const {
    name, intra, errors, isSubmitting, isAllowed, loading, opensAt, timeUntilNext, ownSpot, benchMode,
  } = props;

  const heading = ownSpot
    ? ownSpot.kind === 'shirt'
      ? `You're in, shirt ${ownSpot.number}.`
      : `You're on the bench, sub ${ownSpot.number}.`
    : 'Take a shirt';

  let buttonLabel = benchMode ? 'Join the bench' : 'Take a shirt';
  if (loading) buttonLabel = 'Checking sign-up…';
  else if (isSubmitting) buttonLabel = 'Taking your shirt…';
  else if (isBanned) buttonLabel = "You can't sign up while banned";
  else if (!isAllowed) buttonLabel = opensAt ? `Sign-up opens ${opensAt}` : 'Sign-up is closed';

  return (
    <section
      aria-labelledby="signup-heading"
      className="rounded-lg p-6 md:p-7 border"
      style={{ backgroundColor: 'var(--hm-surface)', borderColor: 'var(--hm-line)' }}
    >
      <h2
        id="signup-heading"
        className={styles.panelTitle}
      >
        {heading}
      </h2>

      {ownSpot && (
        <p className="mt-2 text-[0.9375rem]" style={{ color: 'var(--hm-ink-soft)' }}>
          Can&apos;t make it? Remove yourself from the squad sheet below. You can also sign up a friend here.
        </p>
      )}

      {status !== 'loading' && !session ? (
        <div className="mt-4">
          <p className="text-[0.9375rem] mb-5" style={{ color: 'var(--hm-ink-soft)' }}>
            Sign in with Google or GitHub to take a shirt. First time here? Your account is created when you sign in.
          </p>
          <Link href="/auth/signin" className={styles.cta}>
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              className={styles.field}
              value={name}
              autoComplete="name"
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, 'name')}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isBanned}
              required
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div>
            <label htmlFor="intra" className="block text-sm font-medium mb-1.5">
              Intra login
            </label>
            <input
              ref={intraInputRef}
              id="intra"
              type="text"
              className={styles.field}
              value={intra}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => onIntraChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, 'intra')}
              aria-invalid={errors.intra ? true : undefined}
              aria-describedby={errors.intra ? 'intra-error' : undefined}
              disabled={isBanned}
              required
            />
            <FieldError id="intra-error" message={errors.intra} />
          </div>

          <button
            ref={submitButtonRef}
            type="submit"
            className={styles.cta}
            disabled={loading || isSubmitting || !isAllowed || isBanned}
            aria-busy={isSubmitting || undefined}
          >
            {buttonLabel}
          </button>

          {!isAllowed && !loading && timeUntilNext && (
            <p className="text-sm m-0 tabular-nums" style={{ color: 'var(--hm-ink-soft)' }}>
              {timeUntilNext === 'Registration should be open now'
                ? 'Sign-up should open any moment. Refresh if the button stays grey.'
                : `Opens in ${timeUntilNext}.`}
            </p>
          )}
          {benchMode && isAllowed && (
            <p className="text-sm m-0" style={{ color: 'var(--hm-ink-soft)' }}>
              All shirts are taken. You&apos;ll get the first one that opens up.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
