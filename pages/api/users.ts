// pages/api/users.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Define the path to the users file
const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users from the file
const readUsersFromFile = () => {
  try {
	const data = fs.readFileSync(dataFilePath, 'utf8');
  return data ? JSON.parse(data) : [];
} catch (error) {
  // If the file doesn't exist or is empty, return an empty array
  if (error instanceof SyntaxError) {
    return [];
  }
  throw error;
}
};

// Helper function to write users to the file
const writeUsersToFile = (users: any[]) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
	try {
	  const users = readUsersFromFile();
	  res.status(200).json(users);
	} catch (error) {
	  res.status(500).json({ error: 'An unexpected error occurred.' });
	}
  } else if (req.method === 'POST') {
	try {
	  const { name, id } = req.body;
	  if (!name || !id) {
		res.status(400).json({ error: 'Name and UID are required.' });
		return;
	  }

	  const users = readUsersFromFile();

	  if (users.some((user: any) => user.id === id)) {
		res.status(409).json({ error: `User with UID "${id}" already exists.` });
		return;
	  }

	  const newUser = { name, id };
	  users.push(newUser);
	  writeUsersToFile(users);

	  res.status(201).json(newUser);
	} catch (error) {
	  res.status(500).json({ error: 'An unexpected error occurred.' });
	}
  } else {
	res.setHeader('Allow', ['GET', 'POST']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
