// pages/api/register.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type User = {
  name: string;
  id: string;
};

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

const getUsers = (): User[] => {
  const dir = path.join(process.cwd(), 'data');

  try {
	// Ensure the directory exists, create it if it doesn't
	if (!fs.existsSync(dir)) {
	  fs.mkdirSync(dir, { recursive: true });
	}

	const jsonData = fs.readFileSync(dataFilePath, 'utf8');
	return jsonData ? JSON.parse(jsonData) : [];
  } catch (error) {
	// Handle the case where the file does not exist after verifying the directory does exist
	  //	if (error instanceof Error && error as NodeJS.ErrnoException).code === 'ENOENT') {

	if (error instanceof Error) {
	  fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
	  return [];
	} else {
	  throw error;
	}
  }
};

export const resetUsers = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
	const { name, id } = req.body as User;

	// Retrieve the current list of users
	const users = getUsers();

	// Check for a user with the same ID
	const idExists = users.some(user => user.id === id);

	if (idExists) {
	  // ID already in use, send a conflict response
	  res.status(409).json({ message: `A user with the ID ${id} already exists.` });
	  return;
	}

	// ID is unique, add new user to the list
	users.push({ name, id });
	fs.writeFileSync(dataFilePath, JSON.stringify(users), 'utf8');
	res.status(200).json({ name, id });
  } else if (req.method === 'DELETE') {
    const secretHeader = req.headers['x-secret-header'];
	const mySecret = process.env['resetuser']
    if (!secretHeader || secretHeader !== mySecret) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    try {
      resetUsers();
      res.status(200).json({ message: 'User list has been reset.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
	// Method not allowed
	res.status(405).end();
  }
}

