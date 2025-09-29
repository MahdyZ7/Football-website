
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import allowed_times from "../../../lib/utils/allowed_times";
import player_limit_reached from "../../../lib/utils/player_limit";
import verifyLogin from "../../../lib/utils/verify_login";
import { User } from "../../../types/user";

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
  if (!allowed_times()) {
    return NextResponse.json({ error: "Registration is not allowed at this time." }, { status: 403 });
  }

  const user = await req.json() as User;
  
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

  const result = await registerUser(user);

  if (result.success) {
    return NextResponse.json({ name: user.name, id: user.intra }, { status: 200 });
  }
  return NextResponse.json(result, { status: result.status || 400 });
}

async function handleDelete(req: NextRequest) {
  const secretHeader = req.headers.get("x-secret-header");
  const mySecret = process.env["resetuser"];
  const user = await req.json() as User;

  if (!secretHeader || !mySecret || secretHeader !== mySecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.intra) {
    // Input validation for delete
    if (typeof user.intra !== 'string' || user.intra.trim().length === 0) {
      return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
    }

    const result = await deleteUser({ ...user, intra: user.intra.trim() });
    return NextResponse.json(result, { status: result.status || 200 });
  }

  const result = await resetList();
  return NextResponse.json(result, { status: result.status || 200 });
}

async function registerUser(user: User) {
  const client = await pool.connect();
  
  try {
    // Check if user is banned
    const banCheck = await client.query(
      "SELECT banned_until FROM banned_users WHERE id = $1 AND banned_until > NOW()",
      [user.intra]
    );
    
    if (banCheck.rows.length > 0) {
      return { 
        error: "Access denied", 
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

    await client.query(
      "INSERT INTO players (name, intra, verified, created_at) VALUES ($1, $2, $3, $4)",
      [user.name, user.intra, false, date]
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
