import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
});

export default pool;