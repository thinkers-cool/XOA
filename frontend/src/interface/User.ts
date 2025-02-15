export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  hashed_password: string;
  avatar_url: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserRole {
    id: number;
    user_id: number;
    role_id: number;
    reports_to_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name: string;
  password?: string;
  avatar_url?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
  avatar_url?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: Date;
  updated_at?: Date;
}