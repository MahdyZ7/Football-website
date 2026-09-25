import React from 'react';
import styles from './home.module.css';

const SHIRT_PATH =
  'M19 3 L8 7.5 L1.5 17 L9.5 23 L14 19.5 L14 54 L46 54 L46 19.5 L50.5 23 L58.5 17 L52 7.5 L41 3 Q30 12 19 3 Z';

type ShirtState = 'taken' | 'own' | 'empty' | 'bench';

function Shirt({ label, state }: { label: string; state: ShirtState }) {
  const filled = state !== 'empty';
  const fill = state === 'bench' ? 'var(--hm-bib)' : filled ? 'var(--hm-taken)' : 'none';
  const ink =
    state === 'bench' ? 'var(--hm-bib-ink)' : filled ? 'var(--hm-taken-ink)' : 'var(--hm-empty)';
  return (
    <svg viewBox="0 0 60 56" className={styles.shirtSvg} aria-hidden="true" focusable="false">
      <path
        d={SHIRT_PATH}
        fill={fill}
        stroke={state === 'own' ? 'var(--hm-bib)' : filled ? fill : 'var(--hm-empty)'}
        strokeWidth={state === 'own' ? 3.5 : 1.5}
        strokeDasharray={filled ? undefined : '3 3'}
        strokeLinejoin="round"
      />
      <text
        x="30"
        y="44"
        textAnchor="middle"
        fill={ink}
        className={styles.display}
        style={{ fontWeight: 800, fontSize: label.length > 2 ? 17 : 22 }}
      >
        {label}
      </text>
    </svg>
  );
}

export interface RackPlayer {
  name: string;
  intra: string;
  isOwn: boolean;
}

interface KitRackProps {
  confirmed: RackPlayer[];
  bench: RackPlayer[];
  spots: number;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/**
 * The guaranteed spots as numbered shirts, taken in registration order, plus the
 * bench for the waitlist. Decorative: the squad sheet below is the accessible list.
 */
export function KitRack({ confirmed, bench, spots }: KitRackProps) {
  const slots = Array.from({ length: spots }, (_, i) => confirmed[i]);
  const summary = `${Math.min(confirmed.length, spots)} of ${spots} shirts taken${
    bench.length ? `, ${bench.length} on the bench` : ''
  }`;

  return (
    <figure className="m-0" aria-label={summary}>
      <div className={styles.rack}>
        {slots.map((player, i) => (
          <div
            key={player?.intra ?? `empty-${i}`}
            className={`${styles.shirt} ${player ? styles.hang : ''}`}
            style={{ '--i': i } as React.CSSProperties}
          >
            <Shirt label={String(i + 1)} state={player ? (player.isOwn ? 'own' : 'taken') : 'empty'} />
            <span className={`${styles.shirtName} ${player?.isOwn ? styles.shirtNameOwn : ''}`}>
              {player ? (player.isOwn ? 'You' : firstName(player.name)) : ' '}
            </span>
          </div>
        ))}
      </div>

      {bench.length > 0 && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--hm-line)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--hm-ink-soft)' }}>
            On the bench, in order. A shirt opens up when someone drops out.
          </p>
          <div className={styles.rack}>
            {bench.map((player, i) => (
              <div
                key={player.intra}
                className={`${styles.shirt} ${styles.hang}`}
                style={{ '--i': spots + i } as React.CSSProperties}
              >
                <Shirt label={`S${i + 1}`} state="bench" />
                <span className={`${styles.shirtName} ${player.isOwn ? styles.shirtNameOwn : ''}`}>
                  {player.isOwn ? 'You' : firstName(player.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}
