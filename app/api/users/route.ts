import { NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { User } from "../../../types/user";
import { auth } from "../../../auth";
import { getLegacyOwnedIntrasForRows } from "../../../lib/utils/legacyOwnership";

export async function GET() {
	const client = await pool.connect();
	try {
		const session = await auth();
		const { rows } = await client.query(
			`SELECT name, intra, verified, created_at, is_banned,
			        registration_status, waitlist_position, promoted_at, user_id
			 FROM players
			 ORDER BY
			   CASE WHEN registration_status = 'confirmed' THEN 0 ELSE 1 END,
			   COALESCE(waitlist_position, 0) ASC,
			   created_at ASC`
		);

		const ownedIntras = session?.user?.id
			? getLegacyOwnedIntrasForRows(rows, session.user.id)
			: new Set<string>();

		const players = rows.map(row => ({
			name: row.name,
			intra: row.intra,
			verified: row.verified,
			created_at: row.created_at,
			is_banned: row.is_banned || false,
			registration_status: row.registration_status,
			waitlist_position: row.waitlist_position,
			promoted_at: row.promoted_at,
			owned_by_current_user: !!session?.user?.id && ownedIntras.has(row.intra),
		} satisfies User));

		return NextResponse.json(players);

	} catch (error) {
		console.error("Error fetching players:", error);
		return NextResponse.json({ error: "Database error" }, { status: 500 });
	} finally {
		client.release();
	}
}
