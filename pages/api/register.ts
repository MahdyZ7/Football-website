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
		if (req.method === "POST") {
			const user = req.body as User;
			const {name , id } = user;
			const result = await registerUser(user);
			if ( result.success )
				res.status(200).json({ name, id});
			else
				res.status(result.status || 400).json(result);
		} else if (req.method === "DELETE") {
			const secretHeader = req.headers["x-secret-header"];
			const mySecret = process.env["resetuser"];
			if (!secretHeader || !mySecret || secretHeader !== mySecret) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			if (req.body.id) {
				const result = await deleteUser(req.body);
				res.status(result.status || 200).json(result);
			} else {
				const result = await resetList();
				res.status(result.status || 200).json(result);
			}
		} else {
			res.status(405).end();
		}
	} catch (error) {
		res.status(500).json({ error: "Internel server error" });
	}
}

async function registerUser( user: User )
{
	const client = await pool.connect();
	try {
		const { rows } = await client.query("SELECT name, intra FROM players");
		const player = rows.find( row => row.intra === user.id );
		if ( player ) {
			return {
				error: "Player already exists",
				status: 409,
			};
		}
		await client.query("INSERT INTO players (name, intra) VALUES ($1, $2)", [ user.name, user.id ]);
		return {
			success: true,
		};
	
	} catch (error) {
		return {
			error: "An unexpected error occurred.",
			status: 500,
		};
	} finally {
		client.release();
	}
}

async function resetList()
{
	const client = await pool.connect();
	try {
		await client.query("DELETE FROM players");
		return {
			success: true
		};
	} catch (error) {
		return {
			error: "An unexpected error occurred.",
			status: 500,
		};
	} finally {
		client.release();
	}
}

async function deleteUser( user: User )
{
	const client = await pool.connect();
	try {
		const { rows } = await client.query("SELECT name, intra FROM players");
		const player = rows.find( row => row.intra === user.id );
		if ( !player ) {
			return {
				error: "User does not exist",
				status: 418
			};
		}
		await client.query("DELETE FROM players WHERE intra = $1", [ user.id ]);
		return {
			success: true
		};
	
	} catch (error) {
		return {
			error: "An unexpected error occurred.",
			status: 500
		};
	} finally {
		client.release();
	}
}

