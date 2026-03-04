import { NextResponse } from "next/server";
import { isRegistrationAllowed } from "../../../lib/utils/allowed_times";
import { getSiteConfig } from "../../../lib/config/server";

export async function GET() {
	const isAllowed = await isRegistrationAllowed();
	const config = await getSiteConfig();
	return NextResponse.json({
		isAllowed,
		forceClosed: config.registrationForceClosed,
	}, { status: 200 });
}
