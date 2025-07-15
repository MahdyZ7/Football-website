
# Database Migration Scripts

This directory contains scripts for managing your Football League database migrations and backups.

## Quick Start

```bash
# Initial database setup
npm run db:setup

# Create a backup
npm run db:backup

# Check database status
npm run db:status
```

## Available Commands

### Setup
- `npm run db:setup` - Complete database setup (creates tables, indexes)
- `npm run db:migrate` - Run migrations only

### Backup & Restore
- `npm run db:backup` - Create full database backup
- `npm run db:list-backups` - List available backup files
- `npm run db:restore <file>` - Restore from specific backup file

### Monitoring
- `npm run db:status` - Show table status and row counts

## Manual Usage

You can also run the migration script directly:

```bash
# Show all available commands
node scripts/database-migration.js

# Create backup
node scripts/database-migration.js backup

# Restore from backup
node scripts/database-migration.js restore ./database-backups/backup-2024-01-01.json

# Run migrations
node scripts/database-migration.js migrate
```

## Backup Files

Backups are stored in `./database-backups/` directory as JSON files with the format:
- `backup-YYYY-MM-DDTHH-MM-SS-sssZ.json`

Each backup contains:
- Complete table structure
- All data from each table
- Metadata (timestamp, row counts)

## Tables Managed

The migration system handles these tables:
- `players` - User registrations
- `money` - Payment records
- `expenses` - Expense tracking
- `inventory` - Inventory management
- `banned_users` - User bans
- `admin_logs` - Admin action logs

## Safety Features

- All restore operations use database transactions
- Automatic rollback on errors
- Backup verification before restore
- Non-destructive migrations (CREATE IF NOT EXISTS)

## Environment Requirements

- `DATABASE_URL` - PostgreSQL connection string
- Node.js runtime
- PostgreSQL database with appropriate permissions
