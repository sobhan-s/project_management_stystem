export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  is_email_verified: number;
  email_verified_at: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface EmailVerificationToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  is_used: number;
  created_at: string;
}

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  is_used: number;
  created_at: string;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  is_archived: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joined_at: string;
}

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface TokenPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest {
  userId: number;
  email: string;
}
