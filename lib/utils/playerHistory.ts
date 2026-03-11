import { PoolClient } from "pg";

export type ReliabilityEventType =
  | "registration_confirmed"
  | "registration_waitlisted"
  | "waitlist_promoted"
  | "self_cancel"
  | "late"
  | "no_show"
  | "admin_removed"
  | "ban_applied"
  | "ban_removed";

export async function recordReliabilityEvent(
  client: PoolClient,
  params: {
    intra: string;
    userId?: string | null;
    eventType: ReliabilityEventType;
    reason?: string | null;
    relatedBanUntil?: Date | string | null;
  }
) {
  await client.query(
    `INSERT INTO player_reliability_events (intra, user_id, event_type, reason, related_ban_until)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      params.intra,
      params.userId ?? null,
      params.eventType,
      params.reason ?? null,
      params.relatedBanUntil ?? null,
    ]
  );
}
