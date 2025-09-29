import { NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { User } from "../../../types/user";

export async function GET() {
	const client = await pool.connect();
	try {
		const { rows } = await client.query("SELECT name, intra, verified, created_at FROM players ORDER BY created_at ASC");

		const players = rows.map(row => ({
			name: row.name,
			intra: row.intra,
			verified: row.verified,
			created_at: row.created_at,
		} satisfies User));

		return NextResponse.json(players);

	} catch (error) {
		console.error("Error fetching players:", error);
		return NextResponse.json({ error: "Database error" }, { status: 500 });
	} finally {
		client.release();
	}
}
