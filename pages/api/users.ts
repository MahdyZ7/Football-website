import { NextApiRequest, NextApiResponse } from "next";
import {Pool} from "pg";

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
	if (req.method === "GET") {
		const client = await pool.connect();
		try {
			const { rows } = await client.query("SELECT name, intra FROM players");

			const players = rows.map(row => ({
			    name: row.name,
			    id: row.intra
			}));
			
			res.status(200).json(players);

		} catch (error) {
			console.error("Error fetching players:", error);
            res.status(500).json({ error: "An unexpected error occurred.", details: error });
		} finally {
			client.release();
		}
	} else {
		// Method not allowed
		res.status(405).end();
	}
}
