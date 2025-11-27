# Database Management Scripts

This directory contains all database management scripts for the Football League application.

## Quick Start

### Fresh Database Setup

```bash
# 1. Initialize the database schema
npm run db:init

# 2. Populate with development data
npm run db:seed:dev

# 3. Start the application
npm run dev
```

### Complete Database Reset

```bash
# Reset database and seed with fresh data
npm run db:reset
```

## Available Commands

### Core Database Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run db:init` | Initialize database schema | First-time setup or add missing tables |
| `npm run db:seed:dev` | Populate with development data | Get realistic dummy data for testing |
| `npm run db:reset` | Drop all tables and reinitialize | Start completely fresh |
| `npm run db:status` | Show database status | Check what tables exist |

### Migration Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run db:migrate` | Create basic tables | Legacy migration script |
| `npm run db:migrate:auth` | Add authentication tables | Upgrade from pre-auth version |
| `npm run db:migrate:feedback` | Add feedback system tables | Add feedback feature |
| `npm run db:migrate:uuid` | Convert user IDs to UUIDs | Improve security |

### Backup & Restore

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run db:backup` | Create database backup | Before major changes |
| `npm run db:restore <file>` | Restore from backup | Recover from mistakes |
| `npm run db:list-backups` | List available backups | Find backup files |

### Admin Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run admin:manage` | Manage admin roles | Add/remove admins |
| `npm run service:setup` | Create service account | Setup automated tasks |

## Script Files

### Initialization Scripts

#### `init-database.sql`
Comprehensive SQL script that creates all required tables:
- Authentication tables (users, accounts, sessions, verification_tokens)
- Football registration tables (players, money, expenses, inventory)
- Admin & moderation tables (banned_users, admin_logs)
- Feedback system tables (feedback_submissions, feedback_votes)
- All indexes, foreign keys, and triggers

**Features:**
- Uses `IF NOT EXISTS` - safe to run multiple times
- Includes all foreign key relationships
- Creates proper indexes for performance
- Sets up triggers for auto-updating timestamps
- Adds vote count synchronization triggers

#### `init-database.ts`
TypeScript wrapper that executes the SQL initialization script.

**Safety Features:**
- Checks if database already has tables
- Asks for confirmation before proceeding
- Uses transactions for safety
- Shows status after completion

### Development Data Scripts

#### `seed-dev-data.ts`
Populates the database with realistic dummy data for development.

**What It Creates:**
- 20 users (1 admin, 1 service account, 18 regular users)
- 21 player registrations (15 verified, 6 unverified)
- 21 payment records (12 paid, 9 unpaid)
- 5 expense records
- 6 inventory items
- 2 banned users with different ban durations
- 4 admin log entries
- 6 feedback submissions (4 approved, 2 pending)
- Realistic feedback votes

**Usage:**
```bash
npm run db:seed:dev
```

**Output:**
- Color-coded progress messages
- Summary of created data
- Quick start instructions with admin credentials

### Utility Scripts

#### `reset-database.ts`
Complete database reset script with safety confirmations.

**What It Does:**
1. Shows warning about data loss
2. Asks for double confirmation
3. Drops all tables in cascade mode
4. Reinitializes the schema
5. Optionally seeds development data

**Safety Features:**
- Requires typing "DELETE ALL DATA" to confirm
- Recommends creating backup first
- Uses secure spawn instead of exec

#### `database-migration.js`
Legacy migration and backup utility.

**Features:**
- Create table migrations
- Full database backup (JSON format)
- Restore from backup
- Table status reporting

## Development Workflow Examples

### Starting a New Development Environment

```bash
# Clone the repository
git clone <repo-url>
cd Football-website

# Install dependencies
npm ci

# Setup environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize and seed database
npm run db:init
npm run db:seed:dev

# Setup admin account
npm run admin:manage
# Choose option 2 to promote admin@42school.com to admin

# Start development
npm run dev
```

### Testing with Fresh Data

```bash
# Quickly reset to clean state
npm run db:reset
# Answer "yes" to both prompts and "yes" to seeding
```

### Before Making Breaking Changes

```bash
# Create a backup
npm run db:backup

# Check database status
npm run db:status

# Make your changes...

# If something goes wrong, restore
npm run db:restore ./database-backups/backup-<timestamp>.json
```

### Upgrading from Old Version

```bash
# Backup first!
npm run db:backup

# Run migrations in order
npm run db:migrate:auth
npm run db:migrate:feedback
npm run db:migrate:uuid

# Check status
npm run db:status
```

## Development Data Details

### Test Accounts

After running `npm run db:seed:dev`, you can use these accounts:

| Email | Role | Password |
|-------|------|----------|
| admin@42school.com | admin | (OAuth login) |
| jdoe@student.42.fr | user | (OAuth login) |
| jsmith@student.42.fr | user | (OAuth login) |

### Sample Data Overview

- **Players**: 21 registered players (capacity test)
- **Payments**: Mix of paid/unpaid to test payment tracking
- **Feedback**: Various types (feature/bug/feedback) in different statuses
- **Votes**: Realistic voting patterns on approved feedback
- **Admin Logs**: Sample moderation actions
- **Banned Users**: Active bans with different durations

## Database Schema Overview

### Authentication Tables
- `users` - Core user accounts with roles
- `accounts` - OAuth provider accounts
- `sessions` - Active user sessions
- `verification_tokens` - Email verification

### Football Tables
- `players` - Match registrations
- `money` - Payment tracking
- `expenses` - Club expenses
- `inventory` - Equipment inventory

### Moderation Tables
- `banned_users` - User ban system
- `admin_logs` - Admin action audit trail

### Feedback Tables
- `feedback_submissions` - User feedback with approval workflow
- `feedback_votes` - Voting on approved feedback

## Environment Variables

Required in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/football_db

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
FT_CLIENT_ID=your-42-client-id
FT_CLIENT_SECRET=your-42-secret

# Service Account (generated by npm run service:setup)
SERVICE_ACCOUNT_USER_ID=uuid
SERVICE_API_KEY=generated-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Troubleshooting

### "Table already exists" Error
- This is usually safe - the scripts use `IF NOT EXISTS`
- Run `npm run db:status` to check current state

### Migration Fails
1. Check `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Check user has proper permissions
4. Review error message for specific issue

### Need to Start Over
```bash
npm run db:reset
```

### Lost Admin Access
```bash
npm run admin:manage
# Use option 2 to promote any user to admin
```

## Best Practices

1. **Always backup before major changes**
   ```bash
   npm run db:backup
   ```

2. **Use development data for testing**
   - Don't test on production data
   - Reset frequently with `npm run db:reset`

3. **Check status after migrations**
   ```bash
   npm run db:status
   ```

4. **Keep backups organized**
   ```bash
   npm run db:list-backups
   ```

5. **Test migrations on fresh database first**
   ```bash
   npm run db:reset
   npm run db:migrate:auth
   npm run db:seed:dev
   ```

## Support

For issues or questions:
- Check CLAUDE.md for project-specific guidance
- Review DATABASE_SEPARATION.md for test/prod safety
- Open an issue on GitHub
