import pool from "./db";
import type { RegistrationStatusNotification } from "./waitlist";

interface WaitlistStatusNotification {
  userId?: string | null;
  email?: string | null;
  playerName: string;
  intra: string;
  waitlistPosition?: number | null;
}

async function insertOutboxRecord(params: {
  type: "waitlist_promotion" | "waitlist_demotion";
  userId?: string | null;
  email?: string | null;
  subject: string;
  body: string;
  status?: "pending" | "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  error?: string | null;
}) {
  try {
    await pool.query(
      `INSERT INTO notification_outbox
        (type, recipient_email, recipient_user_id, subject, body, status, provider_message_id, error, sent_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $6 = 'sent' THEN NOW() ELSE NULL END)`,
      [
        params.type,
        params.email ?? null,
        params.userId ?? null,
        params.subject,
        params.body,
        params.status ?? "pending",
        params.providerMessageId ?? null,
        params.error ?? null,
      ]
    );
  } catch (error) {
    console.warn("notification_outbox insert failed (table may not exist):", error);
  }
}

function sanitizeNameForEmail(name: string): string {
  return name.replace(/[\r\n<>]/g, '').slice(0, 100);
}

export async function sendWaitlistPromotionEmail(notification: WaitlistStatusNotification) {
  const safeName = sanitizeNameForEmail(notification.playerName);
  const subject = "A football spot opened up for you";
  const body = `Hi ${safeName}, your waitlist slot has been promoted and you now have a confirmed place for the next football game.`;
  await sendWaitlistEmail(notification, subject, body, "waitlist_promotion");
}

export async function sendWaitlistDemotionEmail(notification: WaitlistStatusNotification) {
  const safeName = sanitizeNameForEmail(notification.playerName);
  const subject = "Your football registration moved back to the waitlist";
  const body = `Hi ${safeName}, your registration has moved back to the waitlist after an admin reversed a moderation change. Your current waitlist position is ${notification.waitlistPosition ?? "unknown"}.`;
  await sendWaitlistEmail(notification, subject, body, "waitlist_demotion");
}

export async function sendRegistrationStatusNotifications(notifications: RegistrationStatusNotification[]) {
  for (const notification of notifications) {
    if (notification.type === "promoted") {
      await sendWaitlistPromotionEmail(notification);
      continue;
    }

    await sendWaitlistDemotionEmail(notification);
  }
}

async function sendWaitlistEmail(
  notification: WaitlistStatusNotification,
  subject: string,
  body: string,
  type: "waitlist_promotion" | "waitlist_demotion"
) {
  if (!notification.email) {
    await insertOutboxRecord({
      userId: notification.userId,
      email: notification.email,
      subject,
      body,
      type,
      status: "skipped",
      error: "No recipient email available",
    });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    await insertOutboxRecord({
      userId: notification.userId,
      email: notification.email,
      subject,
      body,
      type,
      status: "skipped",
      error: "Email provider is not configured",
    });
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notification.email],
        subject,
        text: body,
      }),
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      await insertOutboxRecord({
        userId: notification.userId,
        email: notification.email,
        subject,
        body,
        type,
        status: "failed",
        error: String(responseBody?.message || response.statusText),
      });
      return;
    }

    await insertOutboxRecord({
      userId: notification.userId,
      email: notification.email,
      subject,
      body,
      type,
      status: "sent",
      providerMessageId: typeof responseBody?.id === "string" ? responseBody.id : null,
    });
  } catch (error) {
    await insertOutboxRecord({
      userId: notification.userId,
      email: notification.email,
      subject,
      body,
      type,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown email error",
    });
  }
}
