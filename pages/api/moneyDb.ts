// pages/api/money.js
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      "SELECT date, name, intra, amount, paid FROM money"
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching money data" });
  }
}
