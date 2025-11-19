import pool from '../lib/utils/db';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, name, email, role, "createdAt"
      FROM users
      ORDER BY id
    `);

    console.log('\n=== All Users ===');
    result.rows.forEach((user) => {
      const isAdmin = user.role === 'admin' ? ' [ADMIN]' : '';
      console.log(`ID: ${user.id} | ${user.name || 'No name'} (${user.email})${isAdmin}`);
    });
    console.log('');
  } finally {
    client.release();
  }
}

async function promoteToAdmin(userId: number) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users
      SET role = 'admin'
      WHERE id = $1
    `, [userId]);

    console.log(`✅ User ${userId} has been promoted to admin!`);
  } finally {
    client.release();
  }
}

async function removeAdmin(userId: number) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users
      SET role = 'user'
      WHERE id = $1
    `, [userId]);

    console.log(`✅ Admin privileges removed from user ${userId}!`);
  } finally {
    client.release();
  }
}

async function main() {
  console.log('=== Admin Management Tool ===\n');

  while (true) {
    console.log('Options:');
    console.log('1. List all users');
    console.log('2. Promote user to admin');
    console.log('3. Remove admin privileges');
    console.log('4. Exit');

    const choice = await question('\nChoose an option (1-4): ');

    switch (choice.trim()) {
      case '1':
        await listUsers();
        break;

      case '2':
        await listUsers();
        const promoteId = await question('Enter user ID to promote to admin: ');
        await promoteToAdmin(parseInt(promoteId));
        break;

      case '3':
        await listUsers();
        const removeId = await question('Enter user ID to remove admin from: ');
        await removeAdmin(parseInt(removeId));
        break;

      case '4':
        console.log('Goodbye!');
        rl.close();
        await pool.end();
        process.exit(0);
        break;

      default:
        console.log('Invalid option. Please choose 1-4.\n');
    }
  }
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  pool.end();
  process.exit(1);
});
