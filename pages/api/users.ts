import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const client = new MongoClient(uri);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		let players = [];
		try {
			// Connect to the MongoDB client
			await client.connect();

			// Get the players collection
			const playersCollection = client
				.db("42football")
				.collection("players");

			// Find all players
			players = await playersCollection.find().toArray();

			// Send the players as a response
			res.status(200).json(players);
			client.close();
		} catch (error) {
			console.error("Error fetching players:", error);
			res.status(500).json({ error: "An unexpected error occurred." });
		} finally {
			// Close the MongoDB client
			//    await client.close();
		}
	} else {
		// Method not allowed
		res.status(405).end();
	}
}
