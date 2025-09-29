import { NextResponse } from "next/server";
import allowed_times from "../../../lib/utils/allowed_times";

export async function GET() {
	const isAllowed = allowed_times();
	return NextResponse.json({ isAllowed }, { status: 200 });
}
