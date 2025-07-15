
#!/bin/bash

echo "🚀 Football League Database Setup"
echo "=================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set your PostgreSQL connection string in the .env file"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Create backup directory
mkdir -p database-backups
echo "📁 Created backup directory"

# Run migrations
echo "🔄 Running database migrations..."
node scripts/database-migration.js migrate

echo ""
echo "🔄 Checking database status..."
node scripts/database-migration.js status

echo ""
echo "✅ Database setup completed!"
echo ""
echo "Available commands:"
echo "  npm run db:backup    - Create database backup"
echo "  npm run db:migrate   - Run migrations"
echo "  npm run db:status    - Check database status"
echo "  npm run db:restore   - Restore from backup (requires file path)"
