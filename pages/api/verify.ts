import { NextApiRequest, NextApiResponse } from "next";
import verifyLogin from "../../utils/verify_login";

type ResponseData = {
	isAllowed: boolean;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	if (req.method != "GET") {
		res.setHeader('Allow', ['GET']);
		res.status(405).end('Method Not Allowed');
		return;
	}
	
	const {verified } = await verifyLogin("Ahsalem");
	if (!verified)
		res.status(403);
	else
		res.status(200).json({ isAllowed: true });
}
