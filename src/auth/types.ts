/**
 * 🔐 认证系统统一类型定义
 * 所有认证相关的类型定义集中管理
 */

// ===== 基础用户信息类型 =====
export interface BaseUserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  photo?: string;
  loginTime?: string;
  lastLoginTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== 订阅类型定义（兼容subscriptionUtils） =====
export interface UserSubscription {
  tier: 'trial' | 'pro' | 'premium';
  plan?: 'free' | 'pro' | 'premium'; // 向后兼容
  expiresAt?: string;
  isActive: boolean;
  features?: string[];
}

// ===== 扩展用户信息类型 =====
export interface ExtendedUserInfo extends BaseUserInfo {
  roles?: string[];
  permissions?: string[];
  subscription?: UserSubscription;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh-CN' | 'en-US';
    notifications?: boolean;
  };
  stats?: {
    totalUsage?: number;
    monthlyUsage?: number;
    remainingQuota?: number;
  };
  [key: string]: any;
}

// ===== 认证用户类型（主要使用） =====
export interface AuthUser extends ExtendedUserInfo {
  token?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

// ===== 认证配置类型 =====
export interface AuthConfig {
  appId: string;
  host: string;
  redirectUri: string;
  scope?: string;
  responseType?: string;
  responseMode?: string;
  lang?: 'zh-CN' | 'en-US';
}

// ===== 认证状态类型 =====
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// ===== 认证方法类型 =====
export interface AuthMethods {
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  resetAuthState?: () => void; // 调试用

  // 扩展认证方法（向后兼容）
  checkAuth?: () => Promise<boolean>;
  handleAuthingLogin?: (user: AuthUser) => Promise<void>;
  loginWithPassword?: (email: string, password: string) => Promise<void>;
  loginWithEmailCode?: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode?: (phone: string, code: string) => Promise<void>;
  sendVerificationCode?: (target: string, type: 'email' | 'phone') => Promise<void>;
  registerUser?: (params: RegisterParams) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  guard?: any; // Guard实例
}

// ===== 认证上下文类型 =====
export interface AuthContextType extends AuthState, AuthMethods {
  // 权限检查方法
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasFeature: (feature: string) => boolean;
  
  // 订阅相关
  isPro: boolean;
  isPremium: boolean;
  canUseFeature: (feature: string) => boolean;
}

// ===== 认证事件类型 =====
export interface AuthEvents {
  onLogin?: (user: AuthUser) => void;
  onLogout?: () => void;
  onError?: (error: string) => void;
  onTokenRefresh?: (token: string) => void;
  onUserUpdate?: (user: AuthUser) => void;
}

// ===== 登录参数类型 =====
export interface LoginParams {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  code?: string; // 验证码
  redirectTo?: string;
}

// ===== 注册参数类型 =====
export interface RegisterParams {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  nickname?: string;
  code?: string; // 验证码
  redirectTo?: string;
}

// ===== Token信息类型 =====
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  tokenType: string;
  scope?: string;
}

// ===== 认证错误类型 =====
export interface AuthError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// ===== 权限相关类型 =====
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// ===== 订阅计划类型 =====
export interface SubscriptionPlan {
  id: string;
  name: string;
  level: 'free' | 'pro' | 'premium';
  features: string[];
  limits: {
    monthlyQuota?: number;
    dailyQuota?: number;
    concurrentRequests?: number;
  };
  price?: {
    monthly?: number;
    yearly?: number;
  };
}

// ===== 认证提供者配置类型 =====
export interface AuthProviderConfig {
  config: AuthConfig;
  events?: AuthEvents;
  enableDebug?: boolean;
  enableAutoRefresh?: boolean;
  refreshThreshold?: number; // token刷新阈值（分钟）
  storageKey?: string;
  storageType?: 'localStorage' | 'sessionStorage';
}

// ===== 认证服务接口类型 =====
export interface AuthService {
  initialize: (config: AuthConfig) => Promise<void>;
  login: (params: LoginParams) => Promise<AuthUser>;
  register: (params: RegisterParams) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<TokenInfo>;
  getCurrentUser: () => Promise<AuthUser | null>;
  updateUser: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  checkTokenValidity: (token: string) => Promise<boolean>;
}

// ===== 存储管理类型 =====
export interface StorageManager {
  setUser: (user: AuthUser) => void;
  getUser: () => AuthUser | null;
  setToken: (token: string) => void;
  getToken: () => string | null;
  setRefreshToken: (token: string) => void;
  getRefreshToken: () => string | null;
  clear: () => void;
  clearTokens: () => void;
}

// ===== 类型守卫函数 =====
export const isAuthUser = (obj: any): obj is AuthUser => {
  return obj && typeof obj === 'object' && typeof obj.id === 'string';
};

export const isValidToken = (token: string | null): token is string => {
  return typeof token === 'string' && token.length > 0;
};

export const hasValidSubscription = (user: AuthUser | null): boolean => {
  if (!user?.subscription) return false;
  const { plan, expiresAt } = user.subscription;
  if (plan === 'free') return true;
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
};

// ===== 常量定义 =====
export const AUTH_STORAGE_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  CONFIG: 'auth_config',
  LAST_LOGIN: 'auth_last_login'
} as const;

export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token_refresh',
  USER_UPDATE: 'auth:user_update',
  ERROR: 'auth:error'
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium'
} as const;

export const PERMISSIONS = {
  // 基础权限
  AUTH_REQUIRED: 'auth:required',
  
  // 功能权限
  FEATURE_AI_ADAPTER: 'feature:ai_adapter',
  FEATURE_BRAND_LIBRARY: 'feature:brand_library',
  FEATURE_CREATIVE_STUDIO: 'feature:creative_studio',
  FEATURE_HOT_TOPICS: 'feature:hot_topics',
  
  // 高级功能权限
  FEATURE_UNLIMITED_USAGE: 'feature:unlimited_usage',
  FEATURE_ADVANCED_AI: 'feature:advanced_ai',
  FEATURE_PRIORITY_SUPPORT: 'feature:priority_support',
  
  // 主题权限
  THEME_BASIC: 'theme:basic',
  THEME_ADVANCED: 'theme:advanced',
  THEME_PREMIUM: 'theme:premium'
} as const;
