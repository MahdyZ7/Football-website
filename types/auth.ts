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