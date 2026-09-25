import React from 'react';
import Link from 'next/link';
import { useConfig } from '../../contexts/SiteConfigContext';
import styles from './home.module.css';

function duration(days: number): string {
  if (days === 0) return 'no ban';
  if (days <= 4) return 'half a week out';
  if (days <= 8) return 'one week out';
  if (days <= 15) return 'two weeks out';
  if (days <= 30) return 'four weeks out';
  return `${days} days out`;
}

/** Late TIG: what happens when you drop out late or don't show. */
export function HouseRules() {
  const { config } = useConfig();
  const { banDurations, gracePeriodMinutes, lateThresholdMinutes, gameDayBanThresholdHour } = config;

  const rules: Array<[string, string]> = [
    [
      'Cancel your spot',
      `${duration(banDurations.CANCEL)}, or ${duration(banDurations.CANCEL_GAME_DAY)} if it's game day after ${gameDayBanThresholdHour}:00`,
    ],
    ['Not ready when the booking starts', duration(banDurations.NOT_READY)],
    [`More than ${lateThresholdMinutes} minutes late`, duration(banDurations.LATE)],
    ["Don't show up without telling anyone", duration(banDurations.NO_SHOW)],
  ];

  return (
    <section aria-labelledby="rules-heading">
      <h2 id="rules-heading" className={styles.title}>
        Late TIG
      </h2>
      <p className="mt-2 mb-4 max-w-[60ch]" style={{ color: 'var(--hm-ink-soft)' }}>
        Changed your mind? Remove yourself within {gracePeriodMinutes} minutes of signing up and there&apos;s no
        ban. After that, these apply.
      </p>
      <dl className="m-0 max-w-[60ch]">
        {rules.map(([action, result]) => (
          <div
            key={action}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 py-3 border-b"
            style={{ borderColor: 'var(--hm-line)' }}
          >
            <dt className="font-semibold">{action}</dt>
            <dd className="m-0" style={{ color: 'var(--hm-ink-soft)' }}>
              {result.charAt(0).toUpperCase() + result.slice(1)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4">
        <Link href="/banned-players" className={styles.textLink}>
          See who is banned right now
        </Link>
      </p>
    </section>
  );
}
