import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// This endpoint has been disabled due to security concerns
	// It previously provided privileged Docker commands that could be exploited
	res.status(404).json({ error: "Endpoint not found" });
}
