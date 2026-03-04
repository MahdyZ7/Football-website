import pool from '../utils/db';
import { SiteConfig, DEFAULT_CONFIG, migrateConfig } from './defaults';

let cachedConfig: SiteConfig | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function getSiteConfig(): Promise<SiteConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  try {
    const result = await pool.query('SELECT config FROM site_config WHERE id = 1');
    if (result.rows.length > 0) {
      const merged: SiteConfig = migrateConfig(result.rows[0].config);
      cachedConfig = merged;
      cacheExpiry = now + CACHE_TTL;
      return merged;
    }
  } catch (error) {
    console.error('Failed to load site config from DB, using defaults:', error);
  }

  return DEFAULT_CONFIG;
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
  cacheExpiry = 0;
}
