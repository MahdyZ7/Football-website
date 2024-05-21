import { NextApiRequest, NextApiResponse } from "next";
import allowed_times from "../utils/allowed_times";
type ResponseData = {
	isAllowed: boolean;
};

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	if (req.method != "GET") {
		res.setHeader('Allow', ['GET']);
		res.status(405).end('Method Not Allowed');
		return;
	}
	
	const isAllowed = allowed_times();
	res.status(200).json({ isAllowed });

}
