
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { UserInfo } from "../../types/user";
import allowed_times from "../utils/allowed_times";
import player_limit_reached from "../utils/player_limit";
import verifyLogin from "../../utils/verify_login";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

type User = {
  name: string;
  id: string;
};

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
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  if (!allowed_times()) {
    return res.status(403).json({ error: "Registration is not allowed at this time." });
  }

  const user = req.body as User;
  const result = await registerUser(user);
  
  if (result.success) {
    return res.status(200).json({ name: user.name, id: user.id });
  }
  return res.status(result.status || 400).json(result);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const secretHeader = req.headers["x-secret-header"];
  const mySecret = process.env["resetuser"];
  
  if (!secretHeader || !mySecret || secretHeader !== mySecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.body.id) {
    const result = await deleteUser(req.body);
    return res.status(result.status || 200).json(result);
  }
  
  const result = await resetList();
  return res.status(result.status || 200).json(result);
}

async function registerUser(user: User) {
  const client = await pool.connect();
  
  try {
    const verifiedInfo: UserInfo = await verifyLogin(user.id);
    
    if (verifiedInfo.valid && !verifiedInfo.error) {
      user.id = verifiedInfo.intra;
      user.name = verifiedInfo.name;
    }
    
    if (!verifiedInfo.valid && !user.name) {
      return { error: "Intra not found", status: 404 };
    }

    const { rows } = await client.query("SELECT name, intra FROM players");
    
    if (player_limit_reached(rows.length)) {
      return { error: "Player limit reached", status: 403 };
    }
    
    const player = rows.find(row => row.intra === user.id);
    if (player) {
      return { error: "Player already exists", status: 409 };
    }

    const date = new Date();
    if (!verifiedInfo.valid) {
      date.setSeconds(date.getSeconds() + 10);
    }

    await client.query(
      "INSERT INTO players (name, intra, verified, created_at) VALUES ($1, $2, $3, $4)",
      [user.name, user.id, verifiedInfo.valid, date]
    );

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  } finally {
    client.release();
  }
}

async function resetList() {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM players");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  } finally {
    client.release();
  }
}

async function deleteUser(user: User) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT name, intra FROM players");
    const player = rows.find(row => row.intra === user.id);
    
    if (!player) {
      return { error: "User does not exist", status: 418 };
    }
    
    await client.query("DELETE FROM players WHERE intra = $1", [user.id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  } finally {
    client.release();
  }
}
