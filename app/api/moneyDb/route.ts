import { NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { getAuthenticatedAdmin } from "../../../lib/utils/adminAuth";

export async function GET() {
	const admin = await getAuthenticatedAdmin();

	if (!admin) {
		return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
	}

	const client = await pool.connect();
	try {
		const { rows } = await client.query(
			"SELECT date, name, intra, amount, paid FROM money ORDER BY date"
		);
		return NextResponse.json(
			rows.map((row) => ({
				date: row.date,
				name: row.name,
				intra: row.intra,
				amount: row.amount,
				paid: row.paid,
			})),
			{ status: 200 }
		);
	} catch {
		return NextResponse.json({ error: "Error fetching money data" }, { status: 500 });
	} finally {
		client.release();
	}
}
