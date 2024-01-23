// pages/api/register.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

type User = {
	name: string;
	id: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const client = await pool.connect();
		if (req.method === "POST") {
			const { name, id } = req.body as User;
			const { rows } = await client.query(
				"SELECT name, intra FROM players"
			);
			const players = rows.map((row) => ({
				name: row.name,
				id: row.intra,
			}));
			// Check for a user with the same ID
			const idExists = players.some((player) => player.id === id);
			if (idExists) {
				// ID already in use, send a conflict response
				res.status(409).json({
					message: `A user with the ID ${id} already exists.`,
				});
				return;
			}
			// ID is unique, add new user to the list
			await client.query(
				"INSERT INTO players (name, intra) VALUES ($1, $2)",
				[name, id]
			);
			res.status(200).json({ name, id });
		} else if (req.method === "DELETE") {
			const secretHeader = req.headers["x-secret-header"];
			const mySecret = process.env["resetuser"];
			if (!secretHeader || secretHeader !== mySecret) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}

			if (req.body.id) {
				const userIdToDelete = req.body.id;
				await client.query("DELETE FROM players WHERE intra = $1", [
					userIdToDelete,
				]);
				res.status(200).json({
					message: `User with ID ${userIdToDelete} deleted.`,
				});
				return;
			}
			try {
				await client.query("DELETE FROM players");
				res.status(200).json({ message: "User list has been reset." });
			} catch (error) {
				res.status(500).json({ message: "Internal Server Error" });
			}
		} else {
			res.status(405).end();
		}
	} catch (error) {
		res.status(500).json({ error: "Error connecting to database" });
	}
}
