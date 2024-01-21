// pages/api/register.ts

import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ServerApiVersion } from "mongodb";
// import Database from "@replit/database";

// const db = new Database();
const uri = process.env.MONGODB_URI ?? "";
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

type User = {
	name: string;
	id: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		await client.connect();
		if (req.method === "POST") {
			const { name, id } = req.body as User;
			const playersCollection = client
				.db("42football")
				.collection("players");
			const idExists = await playersCollection.findOne({ id });
			if (idExists) {
				// ID already in use, send a conflict response
				res.status(409).json({
					message: `A user with the ID ${id} already exists.`,
				});
				return;
			}
			// ID is unique, add new user to the list
			await playersCollection.insertOne({ name, id });
			res.status(200).json({ name, id });
		} else if (req.method === "DELETE") {
			const secretHeader = req.headers["x-secret-header"];
			const mySecret = process.env["resetuser"];
			if (!secretHeader || secretHeader !== mySecret) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const playersCollection = client
				.db("42football")
				.collection("players");
			if (req.body.id) {
				const userIdToDelete = req.body.id;
				await playersCollection.deleteOne({ id: userIdToDelete });
				res.status(200).json({
					message: `User with ID ${userIdToDelete} deleted.`,
				});
				return;
			}
			try {
				await playersCollection.deleteMany({});
				res.status(200).json({ message: "User list has been reset." });
			} catch (error) {
				res.status(500).json({ message: "Internal Server Error" });
			}
		} else {
			res.status(405).end();
		}
	} catch (error) {
		res.status(500).json({ error: "Error connecting to database" });
	}
}
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     const { name, id } = req.body as User;

//     // Retrieve the current list of users
//     const users: User[] = ((await db.get("users")) as User[]) || [];

//     // Check for a user with the same ID
//     const idExists = users.some((user) => user.id === id);

//     if (idExists) {
//       // ID already in use, send a conflict response
//       res
//         .status(409)
//         .json({ message: `A user with the ID ${id} already exists.` });
//       return;
//     }

//     // ID is unique, add new user to the list
//     users.push({ name, id });
//     await db.set("users", users);
//     res.status(200).json({ name, id });
//   } else if (req.method === "DELETE") {
//     const secretHeader = req.headers["x-secret-header"];
//     const mySecret = process.env["resetuser"];
//     if (!secretHeader || secretHeader !== mySecret) {
//       res.status(401).json({ message: "Unauthorized" });
//       return;
//     }
//     const users: User[] = ((await db.get("users")) as User[]) || [];
//     if (req.body.id) {
//       const userIdToDelete = req.body.id;
//       const updatedUsers = users.filter((user) => user.id !== userIdToDelete);
//       db.set("users", updatedUsers);
//       res
//         .status(200)
//         .json({ message: `User with ID ${userIdToDelete} deleted.` });
//       return;
//     }
//     try {
//       db.set("users", []);
//       res.status(200).json({ message: "User list has been reset." });
//     } catch (error) {
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     // Method not allowed
//     res.status(405).end();
//   }
// }
