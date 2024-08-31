import { NextApiRequest, NextApiResponse } from "next";
import verifyLogin from "../../utils/verify_login";
import { UserInfo } from "../../types/user";

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
	
	const {name, intra, valid, error } = await verifyLogin("Ahsalem");
	if (error)
		res.status(500);
	else if (!valid)
		res.status(403);
	else
		res.status(200).json({ isAllowed: true });
}
