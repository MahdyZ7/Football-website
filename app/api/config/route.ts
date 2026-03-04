import { NextResponse } from 'next/server';
import pool from '../../../lib/utils/db';
import { DEFAULT_CONFIG, migrateConfig } from '../../../lib/config/defaults';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT config, version, updated_at FROM site_config WHERE id = 1'
    );
    if (result.rows.length > 0) {
      const config = migrateConfig(result.rows[0].config);
      return NextResponse.json({
        config,
        version: result.rows[0].version,
        updatedAt: result.rows[0].updated_at,
      });
    }
    return NextResponse.json({
      config: DEFAULT_CONFIG,
      version: 0,
      updatedAt: null,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({
      config: DEFAULT_CONFIG,
      version: 0,
      updatedAt: null,
    });
  }
}
