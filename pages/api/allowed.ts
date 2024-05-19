import { NextApiRequest, NextApiResponse } from "next";
// unused for now
export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<{ isAllowed: boolean }>
) {
	if (req.method != "GET") {
		res.setHeader('Allow', ['GET']);
		res.status(405).end('Method Not Allowed');
		return;
	}
	const currentTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
	const currentDay = currentTime.getDay();
	const currentHour = currentTime.getHours();

	// Sunday is 0 and Wednesday is 3 in getDay()
	// Check if the current day is Sunday or Wednesday after 12 PM (noon)
	// and before 8 PM the next day (20 hours)
	const isAllowed =
		(currentDay === 0 && currentHour >= 12) ||
		(currentDay === 1 && currentHour < 21) ||
		(currentDay === 3 && currentHour >= 12) ||
		(currentDay === 4 && currentHour < 21) || true;
	res.status(200).json({ isAllowed });
}
