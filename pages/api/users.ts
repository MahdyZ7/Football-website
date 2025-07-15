import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const client = await pool.connect();
		try {
			const { rows } = await client.query("SELECT name, intra, verified, created_at FROM players ORDER BY created_at ASC");

			const players = rows.map(row => ({
				name: row.name,
				id: row.intra,
				verified: row.verified,
				created_at: row.created_at,
			}));

			res.status(200).json(players);

		} catch (error) {
			console.error("Error fetching players:", error);
			res.status(500).json({ error: "Database error" });
		} finally {
			client.release();
		}
	} else {
		// Method not allowed
		res.status(405).end();
	}
}
