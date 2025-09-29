import { NextResponse } from "next/server";
import verifyLogin from "../../../lib/utils/verify_login";

export async function GET() {
	const { verified } = await verifyLogin("Ahsalem");
	if (!verified) {
		return NextResponse.json({ isAllowed: false }, { status: 403 });
	} else {
		return NextResponse.json({ isAllowed: true }, { status: 200 });
	}
}
