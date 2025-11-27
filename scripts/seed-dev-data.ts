import pool from '../lib/utils/db';
import { randomUUID } from 'crypto';

/**
 * Development Database Seeding Script
 *
 * This script populates the database with realistic dummy data for development and testing.
 *
 * Usage:
 *   npm run db:seed:dev
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function seedDatabase() {
  console.log(`${colors.bright}${colors.blue}🌱 Football League - Development Data Seeding${colors.reset}`);
  console.log('━'.repeat(60));
  console.log('');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data (in reverse order of dependencies)
    console.log(`${colors.cyan}🧹 Clearing existing data...${colors.reset}`);
    await client.query('DELETE FROM feedback_votes');
    await client.query('DELETE FROM feedback_submissions');
    await client.query('DELETE FROM admin_logs');
    await client.query('DELETE FROM banned_users');
    await client.query('DELETE FROM players');
    await client.query('DELETE FROM money');
    await client.query('DELETE FROM expenses');
    await client.query('DELETE FROM inventory');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM accounts');
    await client.query('DELETE FROM users');
    console.log(`   ${colors.green}✓${colors.reset} Existing data cleared\n`);

    // ========================================================================
    // SEED USERS
    // ========================================================================
    console.log(`${colors.cyan}👥 Creating users...${colors.reset}`);

    const users: User[] = [
      { id: randomUUID(), name: 'Admin User', email: 'admin@42school.com', role: 'admin' },
      { id: randomUUID(), name: 'Service Account', email: 'service@system.local', role: 'service' },
      { id: randomUUID(), name: 'John Doe', email: 'jdoe@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Jane Smith', email: 'jsmith@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Michael Johnson', email: 'mjohnson@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Emily Davis', email: 'edavis@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'David Wilson', email: 'dwilson@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Sarah Miller', email: 'smiller@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'James Brown', email: 'jbrown@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Lisa Anderson', email: 'landerson@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Robert Taylor', email: 'rtaylor@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Maria Garcia', email: 'mgarcia@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Thomas Martinez', email: 'tmartinez@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Jennifer Lee', email: 'jlee@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Christopher White', email: 'cwhite@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Amanda Harris', email: 'aharris@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Daniel Clark', email: 'dclark@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Jessica Lewis', email: 'jlewis@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Matthew Robinson', email: 'mrobinson@student.42.fr', role: 'user' },
      { id: randomUUID(), name: 'Ashley Walker', email: 'awalker@student.42.fr', role: 'user' },
    ];

    for (const user of users) {
      await client.query(
        'INSERT INTO users (id, name, email, role, "emailVerified") VALUES ($1, $2, $3, $4, NOW())',
        [user.id, user.name, user.email, user.role]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${users.length} users`);
    console.log(`   ${colors.yellow}→${colors.reset} Admin: admin@42school.com (role: admin)`);
    console.log(`   ${colors.yellow}→${colors.reset} Service: service@system.local (role: service)\n`);

    // ========================================================================
    // SEED PLAYERS (Football Registrations)
    // ========================================================================
    console.log(`${colors.cyan}⚽ Creating player registrations...${colors.reset}`);

    const playerIntraLogins = [
      'jdoe', 'jsmith', 'mjohnson', 'edavis', 'dwilson',
      'smiller', 'jbrown', 'landerson', 'rtaylor', 'mgarcia',
      'tmartinez', 'jlee', 'cwhite', 'aharris', 'dclark',
      'jlewis', 'mrobinson', 'awalker', 'user19', 'user20', 'user21'
    ];

    for (let i = 0; i < 21; i++) {
      const user = users[i + 2]; // Skip admin and service account
      const intra = playerIntraLogins[i];
      const verified = i < 15; // First 15 are verified

      await client.query(
        'INSERT INTO players (name, intra, verified, created_at, user_id) VALUES ($1, $2, $3, NOW() - interval \'$4 hours\', $5)',
        [
          user?.name || `Player ${i + 1}`,
          intra,
          verified,
          Math.floor(Math.random() * 48), // Random creation time in last 48 hours
          user?.id || null
        ]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created 21 player registrations (15 verified, 6 unverified)\n`);

    // ========================================================================
    // SEED MONEY (Payment Tracking)
    // ========================================================================
    console.log(`${colors.cyan}💰 Creating payment records...${colors.reset}`);

    const today = new Date();
    for (let i = 0; i < 21; i++) {
      const user = users[i + 2];
      const intra = playerIntraLogins[i];
      const paid = i < 12; // First 12 have paid

      await client.query(
        'INSERT INTO money (date, name, intra, amount, paid) VALUES ($1, $2, $3, $4, $5)',
        [today, user?.name || `Player ${i + 1}`, intra, 10, paid]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created 21 payment records (12 paid, 9 unpaid)\n`);

    // ========================================================================
    // SEED EXPENSES
    // ========================================================================
    console.log(`${colors.cyan}📊 Creating expense records...${colors.reset}`);

    const expenses = [
      { name: 'Football Balls', amount: 150, invoice_id: 'INV-2024-001' },
      { name: 'Team Jerseys', amount: 450, invoice_id: 'INV-2024-002' },
      { name: 'Field Rental - January', amount: 200, invoice_id: 'INV-2024-003' },
      { name: 'Water Bottles', amount: 50, invoice_id: 'INV-2024-004' },
      { name: 'First Aid Kit', amount: 35, invoice_id: 'INV-2024-005' },
    ];

    for (const expense of expenses) {
      await client.query(
        'INSERT INTO expenses (name, amount, date, invoice_id) VALUES ($1, $2, $3, $4)',
        [expense.name, expense.amount, today, expense.invoice_id]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${expenses.length} expense records\n`);

    // ========================================================================
    // SEED INVENTORY
    // ========================================================================
    console.log(`${colors.cyan}📦 Creating inventory items...${colors.reset}`);

    const inventoryItems = [
      { name: 'Footballs', amount: 10 },
      { name: 'Training Cones', amount: 25 },
      { name: 'Jerseys (Blue)', amount: 15 },
      { name: 'Jerseys (Red)', amount: 15 },
      { name: 'Goal Nets', amount: 2 },
      { name: 'Water Bottles', amount: 30 },
    ];

    for (const item of inventoryItems) {
      await client.query(
        'INSERT INTO inventory (name, amount) VALUES ($1, $2)',
        [item.name, item.amount]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${inventoryItems.length} inventory items\n`);

    // ========================================================================
    // SEED BANNED USERS
    // ========================================================================
    console.log(`${colors.cyan}🚫 Creating banned user records...${colors.reset}`);

    const bannedUsers = [
      {
        id: 'banned1',
        name: 'Troublemaker One',
        reason: 'Repeated unsportsmanlike conduct',
        banned_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        id: 'banned2',
        name: 'Troublemaker Two',
        reason: 'Failed to pay registration fees for 3 consecutive sessions',
        banned_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    ];

    for (const banned of bannedUsers) {
      await client.query(
        'INSERT INTO banned_users (id, name, reason, banned_at, banned_until) VALUES ($1, $2, $3, NOW(), $4)',
        [banned.id, banned.name, banned.reason, banned.banned_until]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${bannedUsers.length} banned user records\n`);

    // ========================================================================
    // SEED ADMIN LOGS
    // ========================================================================
    console.log(`${colors.cyan}📋 Creating admin logs...${colors.reset}`);

    const adminUser = users[0]; // Admin user
    const adminLogs = [
      {
        admin_user: 'admin@42school.com',
        action: 'USER_BANNED',
        target_user: 'banned1',
        target_name: 'Troublemaker One',
        details: 'Banned for 7 days - Repeated unsportsmanlike conduct',
        performed_by_user_id: adminUser.id,
      },
      {
        admin_user: 'admin@42school.com',
        action: 'USER_BANNED',
        target_user: 'banned2',
        target_name: 'Troublemaker Two',
        details: 'Banned for 30 days - Failed to pay registration fees',
        performed_by_user_id: adminUser.id,
      },
      {
        admin_user: 'admin@42school.com',
        action: 'USER_VERIFIED',
        target_user: 'jdoe',
        target_name: 'John Doe',
        details: 'Verified user registration',
        performed_by_user_id: adminUser.id,
      },
      {
        admin_user: 'admin@42school.com',
        action: 'USER_DELETED',
        target_user: 'olduser1',
        target_name: 'Old User',
        details: 'Deleted inactive user account',
        performed_by_user_id: adminUser.id,
      },
    ];

    for (const log of adminLogs) {
      await client.query(
        `INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, timestamp, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, NOW() - interval '${Math.floor(Math.random() * 24)} hours', $6)`,
        [log.admin_user, log.action, log.target_user, log.target_name, log.details, log.performed_by_user_id]
      );
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${adminLogs.length} admin log entries\n`);

    // ========================================================================
    // SEED FEEDBACK SUBMISSIONS
    // ========================================================================
    console.log(`${colors.cyan}💬 Creating feedback submissions...${colors.reset}`);

    const feedbackSubmissions = [
      {
        type: 'feature',
        title: 'Add team captain voting system',
        description: 'It would be great to have a voting system where players can elect team captains before each match.',
        status: 'approved',
        is_approved: true,
        user_id: users[2].id, // John Doe
      },
      {
        type: 'feature',
        title: 'Mobile app for quick registration',
        description: 'A mobile app would make it easier to register on the go instead of using the website.',
        status: 'in_progress',
        is_approved: true,
        user_id: users[3].id, // Jane Smith
      },
      {
        type: 'bug',
        title: 'Payment status not updating',
        description: 'Sometimes when I mark my payment as complete, it doesn\'t update immediately and requires a page refresh.',
        status: 'approved',
        is_approved: true,
        user_id: users[4].id, // Michael Johnson
      },
      {
        type: 'feedback',
        title: 'Great experience overall!',
        description: 'The registration system is very smooth and easy to use. Keep up the good work!',
        status: 'completed',
        is_approved: true,
        user_id: users[5].id, // Emily Davis
      },
      {
        type: 'feature',
        title: 'Add match statistics tracking',
        description: 'Track goals, assists, and other stats for each player throughout the season.',
        status: 'pending',
        is_approved: false,
        user_id: users[6].id, // David Wilson
      },
      {
        type: 'bug',
        title: 'Dark mode toggle not working',
        description: 'The dark mode toggle in settings doesn\'t persist after page refresh.',
        status: 'approved',
        is_approved: true,
        user_id: users[7].id, // Sarah Miller
      },
    ];

    const feedbackIds: number[] = [];
    for (const feedback of feedbackSubmissions) {
      const result = await client.query(
        `INSERT INTO feedback_submissions (type, title, description, status, is_approved, user_id, approved_by_user_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - interval '${Math.floor(Math.random() * 72)} hours')
         RETURNING id`,
        [
          feedback.type,
          feedback.title,
          feedback.description,
          feedback.status,
          feedback.is_approved,
          feedback.user_id,
          feedback.is_approved ? adminUser.id : null,
        ]
      );
      feedbackIds.push(result.rows[0].id);
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${feedbackSubmissions.length} feedback submissions\n`);

    // ========================================================================
    // SEED FEEDBACK VOTES
    // ========================================================================
    console.log(`${colors.cyan}👍 Creating feedback votes...${colors.reset}`);

    let totalVotes = 0;

    // Add votes for approved feedback (first 4 submissions)
    for (let i = 0; i < 4; i++) {
      const feedbackId = feedbackIds[i];
      const numVoters = Math.floor(Math.random() * 8) + 3; // 3-10 voters per feedback

      for (let j = 0; j < numVoters && j + 2 < users.length; j++) {
        const voteType = Math.random() > 0.3 ? 'upvote' : 'downvote'; // 70% upvotes, 30% downvotes

        try {
          await client.query(
            'INSERT INTO feedback_votes (feedback_id, user_id, vote_type) VALUES ($1, $2, $3)',
            [feedbackId, users[j + 2].id, voteType]
          );
          totalVotes++;
        } catch (error) {
          // Skip if user already voted (shouldn't happen, but just in case)
        }
      }
    }

    console.log(`   ${colors.green}✓${colors.reset} Created ${totalVotes} feedback votes\n`);

    // ========================================================================
    // COMMIT TRANSACTION
    // ========================================================================
    await client.query('COMMIT');

    console.log('━'.repeat(60));
    console.log(`${colors.bright}${colors.green}✅ Database seeding completed successfully!${colors.reset}\n`);

    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  👥 Users: ${users.length} (1 admin, 1 service, ${users.length - 2} regular)`);
    console.log(`  ⚽ Players: 21 registrations`);
    console.log(`  💰 Payments: 21 records`);
    console.log(`  📊 Expenses: ${expenses.length} items`);
    console.log(`  📦 Inventory: ${inventoryItems.length} items`);
    console.log(`  🚫 Banned Users: ${bannedUsers.length}`);
    console.log(`  📋 Admin Logs: ${adminLogs.length} entries`);
    console.log(`  💬 Feedback: ${feedbackSubmissions.length} submissions`);
    console.log(`  👍 Votes: ${totalVotes} on feedback\n`);

    console.log(`${colors.yellow}Quick Start:${colors.reset}`);
    console.log(`  • Login as admin: admin@42school.com`);
    console.log(`  • View players at: http://localhost:3000`);
    console.log(`  • Admin panel at: http://localhost:3000/admin`);
    console.log(`  • Feedback at: http://localhost:3000/feedback\n`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`\n${colors.bright}❌ Error seeding database:${colors.reset}`, error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding script
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
