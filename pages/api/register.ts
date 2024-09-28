import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { UserInfo } from "../../types/user";
import allowed_times from "../utils/allowed_times";
import player_limit_reached from "../utils/player_limit";
import  verifyLogin  from "../../utils/verify_login";


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
			if (!allowed_times()) {
				res.status(403).json({ error: "Registration is not allowed at this time." });
				return;
			}
			const user = req.body as User;
			const { name, id } = user;
			// let name_md: string, id_md: string = validInput(user);
			// if (!name_md || !id_md)
			// 	res.status(400).json({ error: "Invalid input." });
			const result = await registerUser(user);
			if (result.success)
				res.status(200).json({ name, id });
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

async function registerUser(user: User) {
	const client = await pool.connect();
	try {
		var verified_info: UserInfo = await verifyLogin(user.id);
		if (verified_info.valid && !verified_info.error) {
			user.id = verified_info.intra;
			user.name = verified_info.name;
		}
		if (!verified_info.valid && !user.name)
			return {
				error: "Intra not found",
				status: 404,
			}

		const { rows } = await client.query("SELECT name, intra FROM players");
		const player = rows.find(row => row.intra === user.id);
		if (player_limit_reached(rows.length))
			return {
				error: "Player limit reached",
				status: 403,
			};
		if (player) {
			return {
				error: "Player already exists",
				status: 409,
			};
		}
		const date = new Date();
		if ( !verified_info.valid)
			date.setSeconds(date.getSeconds() + 10)
		await client.query("INSERT INTO players (name, intra, verified, created_at) VALUES ($1, $2, $3, $4)", [user.name, user.id, verified_info.valid, date]);
		return {
			success: true,
		};

	} catch (error) {
		console.error("Error fetching players:", error);
		return {
			error: "An unexpected error occurred.",
			status: 500,
		};
	} finally {
		client.release();
	}
}

async function resetList() {
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

async function deleteUser(user: User) {
	const client = await pool.connect();
	try {
		const { rows } = await client.query("SELECT name, intra FROM players");
		const player = rows.find(row => row.intra === user.id);
		if (!player) {
			return {
				error: "User does not exist",
				status: 418
			};
		}
		await client.query("DELETE FROM players WHERE intra = $1", [user.id]);
		return {
			success: true
		};

	} catch (error) {
		console.error(error);
		return {
			error: "An unexpected error occurred.",
			status: 500
		};
	} finally {
		client.release();
	}
}

// async function validInput(user: User){
// 	pt_name = user.name;
// 	pt_id = user.id;
// 	pt_name = pt_name.trim().toLowerCase();
// 	pt_id = pt_id.trim().toLowerCase();
// 	return pt_name && pt_id;
// }