import React, { useEffect, useState } from 'react';
import { Pencil, X, BadgeCheck } from 'lucide-react';
import type { User } from '../../types/user';
import styles from './home.module.css';

interface SquadSheetProps {
  confirmed: User[];
  bench: User[];
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isSignedIn: boolean;
  gracePeriodMinutes: number;
  onRemove: (intra: string) => void;
  onEditName: (intra: string, currentName: string) => void;
}

function Row({
  user, label, bench, canRemove, canEdit, isOwn, isAdmin, onRemove, onEditName,
}: {
  user: User;
  label: string;
  bench: boolean;
  canRemove: boolean;
  canEdit: boolean;
  isOwn: boolean;
  isAdmin: boolean;
  onRemove: (intra: string) => void;
  onEditName: (intra: string, currentName: string) => void;
}) {
  return (
    <li className={`${styles.row} ${isOwn ? styles.rowOwn : ''}`}>
      <span className={`${styles.rowNumber} ${bench ? styles.rowNumberBench : ''}`}>{label}</span>
      <div className="min-w-0">
        <div className="font-semibold truncate">
          {user.name}
          {isOwn && <span className="font-normal" style={{ color: 'var(--hm-ink-soft)' }}> (you)</span>}
        </div>
        <div className="text-sm flex items-center gap-1.5" style={{ color: 'var(--hm-ink-soft)' }}>
          <span className="truncate">{user.intra}</span>
          {user.verified ? (
            <BadgeCheck size={15} role="img" aria-label="Intra verified" style={{ color: 'var(--hm-taken)', flex: 'none' }} />
          ) : (
            <span style={{ color: '#c2410c' }}>intra not found</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit && (
          <button
            type="button"
            className={styles.iconAction}
            onClick={() => onEditName(user.intra, user.name)}
            aria-label={`Edit name for ${user.name}`}
            title="Edit your name (only shortly after signing up)"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
        )}
        {canRemove && (
          <button
            type="button"
            className={`${styles.iconAction} ${styles.iconActionDanger}`}
            onClick={() => onRemove(user.intra)}
            aria-label={isAdmin && !isOwn ? `Remove ${user.name}` : 'Remove me from the squad'}
            title={isAdmin && !isOwn ? 'Remove player (admin)' : 'Remove me from the squad'}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );
}

/** The squad in registration order: shirts first, then the bench. */
export function SquadSheet({
  confirmed, bench, loading, error, isAdmin, isSignedIn, gracePeriodMinutes, onRemove, onEditName,
}: SquadSheetProps) {
  // Re-evaluated every 30s so the edit-name window closes on time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const rowProps = (user: User) => {
    const isOwn = isSignedIn && !!user.owned_by_current_user;
    const minutes = user.created_at ? (now - new Date(user.created_at).getTime()) / 60000 : Infinity;
    return {
      isOwn,
      isAdmin,
      canRemove: isOwn || isAdmin,
      canEdit: isOwn && !user.verified && minutes <= gracePeriodMinutes,
      onRemove,
      onEditName,
    };
  };

  let body: React.ReactNode;
  if (loading) {
    body = (
      <p className="py-6" style={{ color: 'var(--hm-ink-soft)' }}>
        Loading the squad…
      </p>
    );
  } else if (error) {
    body = (
      <p className="py-6" role="alert" style={{ color: '#c2410c' }}>
        The squad sheet didn&apos;t load. Refresh the page to try again.
      </p>
    );
  } else if (confirmed.length === 0) {
    body = (
      <p className="py-6" style={{ color: 'var(--hm-ink-soft)' }}>
        Nobody has signed up yet. Shirt 1 is yours if you want it.
      </p>
    );
  } else {
    body = (
      <>
        <ol className="list-none m-0 p-0 md:columns-2 md:gap-10" aria-label="Players with a shirt">
          {confirmed.map((u, i) => (
            <Row key={u.intra} user={u} label={String(i + 1)} bench={false} {...rowProps(u)} />
          ))}
        </ol>
        {bench.length > 0 && (
          <>
            <h3 className={`${styles.display} text-[1.3125rem] font-extrabold mt-8 mb-1`}>
              Bench
            </h3>
            <ol className="list-none m-0 p-0 md:columns-2 md:gap-10" aria-label="Players on the bench">
              {bench.map((u, i) => (
                <Row key={u.intra} user={u} label={`S${i + 1}`} bench {...rowProps(u)} />
              ))}
            </ol>
          </>
        )}
      </>
    );
  }

  return (
    <section aria-labelledby="squad-heading">
      <h2 id="squad-heading" className={styles.title}>
        Squad sheet
      </h2>
      {body}
    </section>
  );
}
