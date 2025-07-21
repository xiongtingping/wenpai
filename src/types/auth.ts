/**
 * 用户认证相关类型定义
 */

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  loginTime: string;
  roles: string[];
  permissions: string[];
  subscription?: {
    tier: string;
  };
  plan?: string;
  isVip?: boolean;
  isProUser?: boolean;
  photo?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

export interface AuthingUser {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  picture?: string;
  preferred_username?: string;
  name?: string;
  phone_number?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AuthCallbackData {
  user: AuthingUser;
  token: TokenData;
  state?: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  code?: string;
}

export interface RegisterData {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  nickname?: string;
}

export interface VerificationCodeRequest {
  email: string;
  scene: 'login' | 'register' | 'reset';
}

export interface PasswordResetData {
  email: string;
  code: string;
  newPassword: string;
} 