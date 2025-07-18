// pages/api/money.js
import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const client = await pool.connect();
	try {
		const { rows } = await client.query(
			"SELECT date, name, intra, amount, paid FROM money ORDER BY date"
		);
		res.status(200).json(rows);
	} catch {
		res.status(500).json({ error: "Error fetching money data" });
	} finally {
		client.release();
	}
}
