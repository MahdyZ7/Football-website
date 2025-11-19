
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs').promises;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// load environment variables from .env file
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
});

class DatabaseMigration {
  constructor() {
    this.backupDir = './database-backups';
  }

  async ensureBackupDir() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async exportTable(tableName) {
    const client = await pool.connect();
    try {
      // Get table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `;
      const structure = await client.query(structureQuery, [tableName]);
      
      // Get table data
      const data = await client.query(`SELECT * FROM ${tableName}`);
      
      return {
        structure: structure.rows,
        data: data.rows,
        rowCount: data.rowCount
      };
    } finally {
      client.release();
    }
  }

  async exportAllTables() {
    const client = await pool.connect();
    try {
      // Get all user tables
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;
      const tables = await client.query(tablesQuery);
      
      const exportData = {
        timestamp: new Date().toISOString(),
        tables: {}
      };

      console.log('📊 Exporting tables...');
      
      for (const table of tables.rows) {
        const tableName = table.tablename;
        console.log(`  → Exporting ${tableName}...`);
        
        try {
          exportData.tables[tableName] = await this.exportTable(tableName);
          console.log(`    ✅ ${exportData.tables[tableName].rowCount} rows exported`);
        } catch (error) {
          console.log(`    ❌ Failed to export ${tableName}: ${error.message}`);
          exportData.tables[tableName] = { error: error.message };
        }
      }

      return exportData;
    } finally {
      client.release();
    }
  }

  async backupDatabase() {
    await this.ensureBackupDir();
    
    console.log('🔄 Starting database backup...');
    const exportData = await this.exportAllTables();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(this.backupDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Database backup completed: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    
    return filepath;
  }

  async restoreFromBackup(backupFile) {
    console.log(`🔄 Restoring from backup: ${backupFile}`);
    
    const backupData = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const [tableName, tableData] of Object.entries(backupData.tables)) {
        if (tableData.error) {
          console.log(`⚠️  Skipping ${tableName} (had export error)`);
          continue;
        }

        console.log(`  → Restoring ${tableName}...`);
        
        // Clear existing data
        await client.query(`DELETE FROM ${tableName}`);
        
        if (tableData.data && tableData.data.length > 0) {
          // Get column names
          const columns = Object.keys(tableData.data[0]);
          const columnsList = columns.join(', ');
          
          // Insert data
          for (const row of tableData.data) {
            const values = columns.map(col => row[col]);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            await client.query(
              `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`,
              values
            );
          }
          
          console.log(`    ✅ ${tableData.data.length} rows restored`);
        } else {
          console.log(`    ℹ️  No data to restore`);
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Database restore completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Restore failed:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🚀 Running database migrations...');
    const client = await pool.connect();
    
    try {
      // Create tables if they don't exist
      await this.createPlayersTable(client);
      await this.createMoneyTable(client);
      await this.createExpensesTable(client);
      await this.createInventoryTable(client);
      await this.createBannedUsersTable(client);
      await this.createAdminLogsTable(client);
      
      console.log('✅ All migrations completed successfully');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async createPlayersTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        name VARCHAR(255),
        intra VARCHAR(255) PRIMARY KEY,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('  ✅ Players table ready');
  }

  async createMoneyTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS money (
        date DATE,
        name VARCHAR(255),
        intra VARCHAR(255),
        amount INTEGER,
        paid BOOLEAN
      )
    `);
    console.log('  ✅ Money table ready');
  }

  async createExpensesTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        name VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        date DATE NOT NULL,
        invoice_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (name, date)
      )
    `);
    console.log('  ✅ Expenses table ready');
  }

  async createInventoryTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        name VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL
      )
    `);
    console.log('  ✅ Inventory table ready');
  }

  async createBannedUsersTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS banned_users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        reason TEXT NOT NULL,
        banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        banned_until TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_banned_users_banned_until ON banned_users(banned_until)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_banned_users_banned_at ON banned_users(banned_at)
    `);
    
    console.log('  ✅ Banned users table ready');
  }

  async createAdminLogsTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_user VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_user VARCHAR(100),
        target_name VARCHAR(200),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON admin_logs(admin_user)
    `);
    
    console.log('  ✅ Admin logs table ready');
  }

  async listBackups() {
    await this.ensureBackupDir();
    
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .sort()
        .reverse();
      
      console.log('📦 Available backups:');
      if (backups.length === 0) {
        console.log('  No backups found');
      } else {
        backups.forEach((backup, index) => {
          console.log(`  ${index + 1}. ${backup}`);
        });
      }
      
      return backups;
    } catch (error) {
      console.error('Error listing backups:', error.message);
      return [];
    }
  }

  async getTableStatus() {
    const client = await pool.connect();
    try {
      const tablesQuery = `
        SELECT 
          schemaname,
          tablename,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count,
          (SELECT reltuples::BIGINT FROM pg_class WHERE relname = tablename) as estimated_rows
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;
      
      const result = await client.query(tablesQuery);
      
      console.log('📊 Database Status:');
      console.log('┌─────────────────┬─────────┬──────────────┐');
      console.log('│ Table           │ Columns │ Est. Rows    │');
      console.log('├─────────────────┼─────────┼──────────────┤');
      
      for (const row of result.rows) {
        console.log(`│ ${row.tablename.padEnd(15)} │ ${String(row.column_count).padStart(7)} │ ${String(row.estimated_rows || 0).padStart(12)} │`);
      }
      
      console.log('└─────────────────┴─────────┴──────────────┘');
      
      return result.rows;
    } finally {
      client.release();
    }
  }
}

// CLI Interface
async function main() {
  const migration = new DatabaseMigration();
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      await migration.backupDatabase();
      break;
      
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.log('❌ Please specify backup file path');
        console.log('Usage: node scripts/database-migration.js restore <backup-file>');
        process.exit(1);
      }
      await migration.restoreFromBackup(backupFile);
      break;
      
    case 'migrate':
      await migration.runMigrations();
      break;
      
    case 'status':
      await migration.getTableStatus();
      break;
      
    case 'list-backups':
      await migration.listBackups();
      break;
      
    default:
      console.log('🔧 Database Migration Tool');
      console.log('');
      console.log('Available commands:');
      console.log('  backup        - Create a full database backup');
      console.log('  restore <file>- Restore from backup file');
      console.log('  migrate       - Run database migrations (create tables)');
      console.log('  status        - Show database status');
      console.log('  list-backups  - List available backup files');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/database-migration.js backup');
      console.log('  node scripts/database-migration.js migrate');
      console.log('  node scripts/database-migration.js restore ./database-backups/backup-2024-01-01.json');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseMigration;
