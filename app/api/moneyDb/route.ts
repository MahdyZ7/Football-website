import { NextResponse } from "next/server";
import pool from "../../../lib/utils/db";

export async function GET() {
	const client = await pool.connect();
	try {
		const { rows } = await client.query(
			"SELECT date, name, intra, amount, paid FROM money ORDER BY date"
		);
		return NextResponse.json(rows, { status: 200 });
	} catch {
		return NextResponse.json({ error: "Error fetching money data" }, { status: 500 });
	} finally {
		client.release();
	}
}
