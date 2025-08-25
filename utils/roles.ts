import pool from "./db";

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// Cache for admin emails to avoid frequent DB queries
let adminEmailsCache: string[] | null = null;
let lastCacheUpdate: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchAdminEmails(): Promise<string[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (adminEmailsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return adminEmailsCache;
  }

  const client = await pool.connect();
  try {
    const res = await client.query('SELECT admin_email FROM admin_list');
    adminEmailsCache = res.rows.map(row => row.admin_email.toLowerCase());
    lastCacheUpdate = now;
    return adminEmailsCache;
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return adminEmailsCache || [];
  } finally {
    client.release();
  }
}

export async function getUserRole(email: string): Promise<UserRole> {
  try {
    const adminEmails = await fetchAdminEmails();
    return adminEmails.includes(email.toLowerCase()) ? UserRole.ADMIN : UserRole.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return UserRole.USER;
  }
}

export async function isAdmin(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return role === UserRole.ADMIN;
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.ADMIN]: 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}