import { PoolClient } from "pg";
import { getSiteConfig } from "../config/server";
import { recordReliabilityEvent } from "./playerHistory";

const REGISTRATION_LOCK_KEY = 42_001;

export interface RegistrationStatusNotification {
  type: "promoted" | "demoted";
  userId: string | null;
  email: string | null;
  playerName: string;
  intra: string;
  waitlistPosition: number | null;
}

type PlayerRow = {
  intra: string;
  name: string;
  user_id: string | null;
  email: string | null;
  registration_status: "confirmed" | "waitlisted";
  waitlist_position: number | null;
  promoted_at: string | null;
};

export async function acquireRegistrationLock(client: PoolClient) {
  await client.query("SELECT pg_advisory_xact_lock($1)", [REGISTRATION_LOCK_KEY]);
}

export async function reconcileRegistrationOrder(
  client: PoolClient
): Promise<RegistrationStatusNotification[]> {
  const config = await getSiteConfig();
  const notifications: RegistrationStatusNotification[] = [];

  const result = await client.query<PlayerRow>(
    `SELECT p.intra, p.name, p.user_id, u.email, p.registration_status, p.waitlist_position, p.promoted_at
     FROM players p
     LEFT JOIN users u ON u.id = p.user_id
     WHERE COALESCE(p.is_banned, FALSE) = FALSE
     ORDER BY p.created_at ASC, p.intra ASC
     FOR UPDATE OF p`
  );

  let waitlistPosition = 0;

  for (let index = 0; index < result.rows.length; index += 1) {
    const player = result.rows[index];
    const nextStatus = index < config.guaranteedSpots ? "confirmed" : "waitlisted";
    const nextWaitlistPosition = nextStatus === "waitlisted" ? ++waitlistPosition : null;
    const statusChanged =
      player.registration_status !== nextStatus ||
      player.waitlist_position !== nextWaitlistPosition;

    if (!statusChanged) {
      continue;
    }

    const promoted = player.registration_status === "waitlisted" && nextStatus === "confirmed";
    const demoted = player.registration_status === "confirmed" && nextStatus === "waitlisted";

    await client.query(
      `UPDATE players
       SET registration_status = $2,
           waitlist_position = $3,
           promoted_at = CASE
             WHEN $4 THEN NOW()
             WHEN $2 = 'waitlisted' THEN NULL
             ELSE promoted_at
           END,
           last_notified_at = CASE WHEN $4 OR $5 THEN NOW() ELSE last_notified_at END
       WHERE intra = $1`,
      [player.intra, nextStatus, nextWaitlistPosition, promoted, demoted]
    );

    if (promoted) {
      await recordReliabilityEvent(client, {
        intra: player.intra,
        userId: player.user_id,
        eventType: "waitlist_promoted",
        reason: "Promoted from waitlist after registration order was recalculated",
      });
      notifications.push({
        type: "promoted",
        userId: player.user_id,
        email: player.email,
        playerName: player.name,
        intra: player.intra,
        waitlistPosition: null,
      });
      continue;
    }

    if (demoted) {
      notifications.push({
        type: "demoted",
        userId: player.user_id,
        email: player.email,
        playerName: player.name,
        intra: player.intra,
        waitlistPosition: nextWaitlistPosition,
      });
    }
  }

  return notifications;
}
