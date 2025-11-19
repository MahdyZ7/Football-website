
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import allowed_times from "../../../lib/utils/allowed_times";
import player_limit_reached from "../../../lib/utils/player_limit";
import verifyLogin from "../../../lib/utils/verify_login";
import { User } from "../../../types/user";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";

export async function POST(req: NextRequest) {
  try {
    return handlePost(req);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return handleDelete(req);
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

  if (!allowed_times()) {
    return NextResponse.json({ error: "Registration is not allowed at this time." }, { status: 403 });
  }
  const json = await req.json();
  const user = json as User;
  console.log(json);

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
// Basic validation against SQL injection and XSS patterns
const dangerousPattern = /('|--|;|\/\*|\*\/|<|>|script|select|insert|update|delete|drop|union|exec|xp_)/i;
if (dangerousPattern.test(user.intra) || (user.name && dangerousPattern.test(user.name))) {
	return NextResponse.json({ error: "Invalid characters detected in input" }, { status: 400 });
}

  const result = await registerUser(user, parseInt(session.user.id));

  if (result.success) {
    return NextResponse.json({ name: user.name, id: user.intra }, { status: 200 });
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

  if (user.intra) {
    // Delete individual user
    if (typeof user.intra !== 'string' || user.intra.trim().length === 0) {
      return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
    }

    const result = await deleteUser({ ...user, intra: user.intra.trim() });

    // Log the action
    if (result.success) {
      await logAdminAction(
        parseInt(serviceAccountUserId),
        'automated_user_deletion',
        user.intra,
        user.name || 'Unknown',
        'Individual user deleted by automated service'
      );
    }

    return NextResponse.json(result, { status: result.status || 200 });
  } else {
    // Reset entire list (for scheduled weekly reset)
    const result = await resetList();

    // Log the action
    if (result.success) {
      await logAdminAction(
        parseInt(serviceAccountUserId),
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

async function registerUser(user: User, userId: number) {
  const client = await pool.connect();

  try {
    // Check if user is banned (check both by intra and by user_id)
    const banCheck = await client.query(
      "SELECT banned_until FROM banned_users WHERE (id = $1 OR user_id = $2) AND banned_until > NOW()",
      [user.intra, userId]
    );

    if (banCheck.rows.length > 0) {
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
      return { error: "Intra not found", status: 404 };
    }

    const { rows } = await client.query("SELECT name, intra FROM players");

    if (player_limit_reached(rows.length)) {
      return { error: "Player limit reached", status: 403 };
    }

    const player = rows.find(row => row.intra === user.intra);
    if (player) {
      return { error: "Player already exists", status: 409 };
    }

    const date = new Date();
    if (!verifiedInfo.verified) {
      date.setSeconds(date.getSeconds() + 10);
    }

    // Link registration to authenticated user
    await client.query(
      "INSERT INTO players (name, intra, verified, created_at, user_id) VALUES ($1, $2, $3, $4, $5)",
      [user.name, user.intra, verifiedInfo.verified, date, userId]
    );

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "Registration failed", status: 500 };
  } finally {
    client.release();
  }
}

async function resetList() {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM players");
    return { success: true };
  } catch {
    return { error: "Operation failed", status: 500 };
  } finally {
    client.release();
  }
}

async function deleteUser(user: User) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT name, intra FROM players");
    const player = rows.find(row => row.intra === user.intra);
    
    if (!player) {
      return { error: "User does not exist", status: 418 };
    }
    
    await client.query("DELETE FROM players WHERE intra = $1", [user.intra]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Delete operation failed", status: 500 };
  } finally {
    client.release();
  }
}
