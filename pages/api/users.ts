// pages/api/users.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Database from '@replit/database';

const db = new Database();

// Helper function to read users from the Replit Database
const readUsersFromDatabase = async (): Promise<any[]> => {
  try {
    const users: any[] = await db.get('users') as [] || [];
    return users;
  } catch (error) {
    throw error;
  }
};

// Helper function to write users to the Replit Database
const writeUsersToDatabase = async (users: any[]) => {
  await db.set('users', users);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await readUsersFromDatabase();
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

      const users = await readUsersFromDatabase();

      if (users.some((user: any) => user.id === id)) {
        res.status(409).json({ error: `User with UID "${id}" already exists.` });
        return;
      }

      const newUser = { name, id };
      users.push(newUser);
      await writeUsersToDatabase(users);

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}