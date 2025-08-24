
import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/db";
import allowed_times from "../utils/allowed_times";
import player_limit_reached from "../utils/player_limit";
import verifyLogin from "../../utils/verify_login";
import { User } from "../../types/user";
import { authenticateRequest } from "../../utils/clerkAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "POST":
        return handlePost(req, res);
      case "DELETE":
        return handleDelete(req, res);
      default:
        res.status(405).end();
    }
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  if (!allowed_times()) {
    return res.status(403).json({ error: "Registration is not allowed at this time." });
  }

  // Check if user is authenticated (optional - allows both auth and unauth)
  const authResult = await authenticateRequest(req);
  const isAuthenticated = authResult.isAuthenticated;

  const user = req.body as User;
  
  // Input validation
  if (!user || typeof user !== 'object') {
    return res.status(400).json({ error: "Invalid request body" });
  }
  
  if (!user.intra || typeof user.intra !== 'string' || user.intra.trim().length === 0) {
    return res.status(400).json({ error: "User ID is required" });
  }
  
  if (user.name && typeof user.name !== 'string') {
    return res.status(400).json({ error: "Invalid name format" });
  }
  
  // Sanitize inputs
  user.intra = user.intra.trim();
  if (user.name) {
    user.name = user.name.trim();
  }
// Basic validation against SQL injection and XSS patterns
const dangerousPattern = /('|--|;|\/\*|\*\/|<|>|script|select|insert|update|delete|drop|union|exec|xp_)/i;
if (dangerousPattern.test(user.intra) || (user.name && dangerousPattern.test(user.name))) {
	return res.status(400).json({ error: "Invalid characters detected in input" });
}
  
  const result = await registerUser(user, isAuthenticated);
  
  if (result.success) {
    return res.status(200).json({ 
      name: user.name, 
      id: user.intra, 
      authenticated: isAuthenticated,
      userEmail: authResult.user?.email || "TEMP EMAIL VALIDATION"
    });
  }
  return res.status(result.status || 400).json(result);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const secretHeader = req.headers["x-secret-header"];
  const mySecret = process.env["resetuser"];
   const user = req.body as User;
  
  if (!secretHeader || !mySecret || secretHeader !== mySecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.intra) {
    // Input validation for delete
    if (typeof user.intra !== 'string' || user.intra.trim().length === 0) {
      return res.status(400).json({ error: "Valid user ID is required" });
    }

    const result = await deleteUser({ ...req.body, intra: user.intra.trim() });
    return res.status(result.status || 200).json(result);
  }
  
  const result = await resetList();
  return res.status(result.status || 200).json(result);
}

async function registerUser(user: User, isAuthenticated: boolean = false) {
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
    if (!isAuthenticated) {
      date.setHours(date.getHours() + 46);
    }

    await client.query(
      "INSERT INTO players (name, intra, verified, created_at, email) VALUES ($1, $2, $3, $4, $5)",
      [user.name, user.intra, verifiedInfo.verified || isAuthenticated, date, user.email || "TEMP EMAIL VALIDATION"]
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
