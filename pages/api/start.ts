import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		
		try {
			
			const bashScript = `
			#!/bin/bash
				docker run -it --cap-add=SYS_PTRACE --security-opt seccomp=unconfined --security-opt apparmor=unconfined --rm -v "$PWD:/home/Developer" mahdyz7/rust_container
			`;

			res.setHeader('Content-Type', 'text/plain');

			res.status(200).send(bashScript);

		} catch (error) {
			console.error("Error fetching players:", error);
			res.status(500).json({ error: "An unexpected error occurred.", details: error });
		} finally {
		}
	} else {
		// Method not allowed
		res.status(405).end();
	}
}
