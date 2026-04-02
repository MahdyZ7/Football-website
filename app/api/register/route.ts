
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { isRegistrationAllowed } from "../../../lib/utils/allowed_times";
import verifyLogin from "../../../lib/utils/verify_login";
import { User } from "../../../types/user";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";
import { getSiteConfig } from "../../../lib/config/server";
import { recordReliabilityEvent } from "../../../lib/utils/playerHistory";
import { sendRegistrationStatusNotifications } from "../../../lib/utils/notifications";
import {
  acquireRegistrationLock,
  reconcileRegistrationOrder,
  RegistrationStatusNotification,
} from "../../../lib/utils/waitlist";

export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await handleDelete(req);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handlePost(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required. Please sign in to register." }, { status: 401 });
  }

  const allowed = await isRegistrationAllowed();
  if (!allowed) {
    return NextResponse.json({ error: "Registration is not allowed at this time." }, { status: 403 });
  }
  const json = await req.json();
  const user = json as User;

  // Input validation
  if (!user || typeof user !== 'object') {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!user.intra || typeof user.intra !== 'string' || user.intra.trim().length === 0) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (user.name && typeof user.name !== 'string') {
    return NextResponse.json({ error: "Invalid name format" }, { status: 400 });
  }

  // Sanitize inputs
  user.intra = user.intra.trim();
  if (user.name) {
    user.name = user.name.trim();
  }
  if (user.name && user.name.length > 255) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }
  if (user.intra.length > 50) {
    return NextResponse.json({ error: "Invalid intra login" }, { status: 400 });
  }

  const result = await registerUser(user, session.user.id);

  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(result, { status: result.status || 400 });
}

async function handleDelete(req: NextRequest) {
  // Validate API key for service account access
  const apiKey = req.headers.get("x-api-key");
  const validApiKey = process.env.SERVICE_API_KEY;
  const serviceAccountUserId = process.env.SERVICE_ACCOUNT_USER_ID;

  if (!apiKey || !validApiKey || apiKey !== validApiKey) {
    console.error("Unauthorized DELETE attempt - invalid API key");
    return NextResponse.json({ error: "Unauthorized - Invalid API key" }, { status: 401 });
  }

  if (!serviceAccountUserId) {
    console.error("SERVICE_ACCOUNT_USER_ID not configured");
    return NextResponse.json({ error: "Service account not configured" }, { status: 500 });
  }

  const json = await req.json();
  const user = json as User;

  let statusNotifications: RegistrationStatusNotification[] = [];

  if (user.intra) {
    // Delete individual user
    if (typeof user.intra !== 'string' || user.intra.trim().length === 0) {
      return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
    }

    const result = await deleteUser({ ...user, intra: user.intra.trim() });
    statusNotifications = result.statusNotifications ?? [];

    // Log the action
    if (result.success) {
      await logAdminAction(
        serviceAccountUserId,
        'automated_user_deletion',
        user.intra,
        user.name || 'Unknown',
        'Individual user deleted by automated service'
      );
    }

    await sendRegistrationStatusNotifications(statusNotifications);

    const { statusNotifications: _sn, ...response } = result;
    return NextResponse.json(response, { status: result.status || 200 });
  } else {
    // Reset entire list (for scheduled weekly reset)
    const result = await resetList();

    // Log the action
    if (result.success) {
      await logAdminAction(
        serviceAccountUserId,
        'scheduled_list_reset',
        undefined,
        undefined,
        'Automated weekly player list reset'
      );
      console.log(`✅ Player list reset completed by service account (User ID: ${serviceAccountUserId})`);
    }

    return NextResponse.json(result, { status: result.status || 200 });
  }
}

async function registerUser(user: User, userId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await acquireRegistrationLock(client);

    // Check if user is banned (check both by intra and by user_id)
    const banCheck = await client.query(
      "SELECT banned_until FROM banned_users WHERE (id = $1 OR user_id = $2) AND banned_until > NOW()",
      [user.intra, userId]
    );

    if (banCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        error: "You are currently banned from registering",
        status: 403
      };
    }

    const verifiedInfo: User = await verifyLogin(user.intra);

    if (verifiedInfo.verified) {
      user.intra = verifiedInfo.intra;
      user.name = verifiedInfo.name;
    }

    if (!verifiedInfo.verified && !user.name) {
      await client.query("ROLLBACK");
      return { error: "Intra not found", status: 404 };
    }

    // Check for existing registration by intra while holding the allocation lock
    const existingPlayer = await client.query(
      `SELECT intra, is_banned FROM players
       WHERE intra = $1
       LIMIT 1`,
      [user.intra]
    );

    if (existingPlayer.rows.length > 0) {
      const player = existingPlayer.rows[0];
      await client.query("ROLLBACK");
      if (player.is_banned) {
        return { error: "You are currently banned from registering", status: 403 };
      }
      return { error: "Player already exists", status: 409 };
    }

    const config = await getSiteConfig();
    const countResult = await client.query(
      "SELECT COUNT(*)::int AS total FROM players WHERE COALESCE(is_banned, FALSE) = FALSE"
    );
    const currentTotal = countResult.rows[0].total;
    if (currentTotal >= config.maxPlayers) {
      await client.query("ROLLBACK");
      return { error: "Player limit reached", status: 403 };
    }

    const confirmedResult = await client.query(
      "SELECT COUNT(*)::int AS total FROM players WHERE registration_status = 'confirmed' AND COALESCE(is_banned, FALSE) = FALSE"
    );
    const initialStatus = confirmedResult.rows[0].total < config.guaranteedSpots ? "confirmed" : "waitlisted";

    const date = new Date();
    if (!verifiedInfo.verified) {
      date.setSeconds(date.getSeconds() + 10);
    }

    await client.query(
      `INSERT INTO players
        (name, intra, verified, created_at, user_id, registration_status, waitlist_position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.name, user.intra, verifiedInfo.verified, date, userId, initialStatus, null]
    );

    await reconcileRegistrationOrder(client);

    const insertedPlayerResult = await client.query(
      `SELECT registration_status, waitlist_position
       FROM players
       WHERE intra = $1`,
      [user.intra]
    );
    const insertedPlayer = insertedPlayerResult.rows[0];
    const registrationStatus = insertedPlayer.registration_status;
    const waitlistPosition = insertedPlayer.waitlist_position;

    await recordReliabilityEvent(client, {
      intra: user.intra,
      userId,
      eventType: registrationStatus === "confirmed" ? "registration_confirmed" : "registration_waitlisted",
      reason: registrationStatus === "confirmed"
        ? "Registered with a confirmed place"
        : `Added to waitlist at position ${waitlistPosition}`,
    });

    await client.query("COMMIT");

    return {
      success: true,
      name: user.name,
      id: user.intra,
      registrationStatus,
      waitlistPosition,
      message: registrationStatus === "confirmed"
        ? "Registration successful. You have a confirmed spot."
        : `Registration successful. You are on the waitlist at position ${waitlistPosition}.`,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error registering user:", error);
    return { error: "Registration failed", status: 500 };
  } finally {
    client.release();
  }
}

async function resetList() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await acquireRegistrationLock(client);
    await client.query("DELETE FROM players");
    await client.query("COMMIT");
    return { success: true };
  } catch {
    await client.query("ROLLBACK");
    return { error: "Operation failed", status: 500 };
  } finally {
    client.release();
  }
}

async function deleteUser(user: User) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await acquireRegistrationLock(client);

    const { rows } = await client.query(
      "SELECT name, intra FROM players WHERE intra = $1 FOR UPDATE",
      [user.intra]
    );
    const player = rows[0];

    if (!player) {
      await client.query("ROLLBACK");
      return { error: "User does not exist", status: 404 };
    }
    
    await client.query("DELETE FROM players WHERE intra = $1", [user.intra]);
    const statusNotifications = await reconcileRegistrationOrder(client);

    await client.query("COMMIT");
    return { success: true, statusNotifications };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting user:", error);
    return { error: "Delete operation failed", status: 500 };
  } finally {
    client.release();
  }
}
