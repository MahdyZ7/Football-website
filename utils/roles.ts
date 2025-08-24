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

async function fetchAdminEmails() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT admin_email FROM admin_list');
    const ADMIN_EMAILS = res.rows.map(row => row.admin_email.toLowerCase());
    return ADMIN_EMAILS;
  } catch (error) {
    console.error('Error fetching admin emails:', error);
  } finally {
    client.release();
  }
}
export const ADMIN_EMAILS = await fetchAdminEmails();

export function getUserRole(email: string): UserRole {
  if (!ADMIN_EMAILS) return UserRole.USER;
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? UserRole.ADMIN : UserRole.USER;
}

export function isAdmin(email: string): boolean {
  return getUserRole(email) === UserRole.ADMIN;
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.ADMIN]: 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}