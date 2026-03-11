import { PoolClient } from "pg";

type LegacyLinkedRow = {
  intra: string;
  user_id?: string | null;
};

export function getLegacyOwnedIntrasForRows<T extends LegacyLinkedRow>(
  rows: T[],
  currentUserId: string
): Set<string> {
  return new Set(
    rows
      .filter((row) => row.user_id === currentUserId)
      .map((row) => row.intra)
  );
}

export async function findLegacyOwnedRegistration(
  client: PoolClient,
  currentUserId: string
) {
  const linkedResult = await client.query(
    `SELECT intra, name, registration_status, waitlist_position, created_at, promoted_at
     FROM players
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [currentUserId]
  );

  return linkedResult.rows[0] ?? null;
}

export async function findLegacyActiveBan(
  client: PoolClient,
  currentUserId: string,
  intra?: string | null
) {
  const linkedBanResult = await client.query(
    `SELECT reason, banned_until
     FROM banned_users
     WHERE user_id = $1 AND banned_until > NOW()
     ORDER BY banned_until DESC
     LIMIT 1`,
    [currentUserId]
  );

  if (linkedBanResult.rows.length > 0) {
    return linkedBanResult.rows[0];
  }

  if (!intra) {
    return null;
  }

  const intraBanResult = await client.query(
    `SELECT reason, banned_until
     FROM banned_users
     WHERE user_id IS NULL
       AND id = $1
       AND banned_until > NOW()
     ORDER BY banned_until DESC
     LIMIT 1`,
    [intra]
  );

  return intraBanResult.rows[0] ?? null;
}
