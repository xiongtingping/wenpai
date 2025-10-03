/**
 * 🎯 统一认证类型系统
 *
 * 设计原则:
 * 1. 单一真实来源 (SSOT) - 所有认证类型定义在此
 * 2. 类型安全 - 严格的TypeScript类型检查
 * 3. 向后兼容 - 使用类型别名支持旧代码
 * 4. 文档完善 - 每个类型都有清晰的说明
 */

// ============================================================================
// 🔐 核心用户类型
// ============================================================================

/**
 * 标准用户信息 - 主要用户数据结构
 */
export interface UserInfo {
  /** 用户唯一标识符 (必需) */
  id: string;

  /** 基本信息 */
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;

  /** 认证信息 */
  loginTime?: string;
  loginMethod?: 'password' | 'sms' | 'email' | 'social';

  /** 权限信息 */
  roles: string[];
  permissions: string[];

  /** 订阅信息 */
  subscription?: {
    tier: 'free' | 'trial' | 'pro' | 'premium';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
    features: string[];
  };

  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 认证状态枚举
 */
export enum AuthStatus {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  EXPIRED = 'expired',
  ERROR = 'error'
}

// ============================================================================
// 🎫 Token 类型
// ============================================================================

/**
 * Token信息
 */
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt: number;
  source: string;
  userId?: string;
}

// ============================================================================
// 🔑 认证操作类型
// ============================================================================

/**
 * 登录请求
 */
export interface LoginRequest {
  method: 'password' | 'sms' | 'email' | 'social';
  identifier: string;
  credential: string;
  rememberMe?: boolean;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  token?: TokenInfo;
  error?: {
    code: string;
    type: string;
    details?: any;
  };
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  verificationCode?: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  error?: {
    code: string;
    type: string;
  };
}

// ============================================================================
// 📧 验证码类型
// ============================================================================

/**
 * 验证码场景
 */
export type VerificationScene =
  | 'login'
  | 'register'
  | 'reset_password'
  | 'change_email'
  | 'change_phone';

/**
 * 验证码发送请求
 */
export interface SendCodeRequest {
  target: string; // 手机号或邮箱
  type: 'sms' | 'email';
  scene: VerificationScene;
}

/**
 * 验证码发送响应
 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresAt?: number;
}

// ============================================================================
// 🛡️ 权限类型
// ============================================================================

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  missingPermissions?: string[];
  suggestedAction?: 'login' | 'upgrade' | 'request';
}

// ============================================================================
// 📝 认证上下文类型
// ============================================================================

/**
 * 认证上下文值 - 提供给组件使用的完整接口
 */
export interface AuthContextValue {
  // 状态
  user: UserInfo | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  loading: boolean;
  error: string | null;

  // 会话状态
  sessionWarning: boolean;
  sessionRemainingTime: number;

  // 核心方法
  login(request: LoginRequest): Promise<LoginResponse>;
  register(request: RegisterRequest): Promise<RegisterResponse>;
  logout(): Promise<void>;
  checkAuth(): Promise<void>;
  refreshToken(): Promise<void>;
  updateUser(updates: Partial<UserInfo>): Promise<void>;

  // 验证码方法
  sendVerificationCode(request: SendCodeRequest): Promise<SendCodeResponse>;

  // 权限方法
  hasPermission(permission: string | string[]): boolean;
  hasRole(role: string | string[]): boolean;
  checkPermission(permission: string | string[]): PermissionCheckResult;

  // 会话管理
  extendSession(): void;
  dismissSessionWarning(): void;
}

// ============================================================================
// 🔄 向后兼容的类型别名
// ============================================================================

/**
 * @deprecated 使用 UserInfo 替代
 */
export type SessionUserInfo = UserInfo;

/**
 * @deprecated 使用 UserInfo 替代
 */
export type StandardUserInfo = UserInfo;

/**
 * @deprecated 使用 UserInfo 替代
 */
export type AuthUser = UserInfo;

/**
 * @deprecated 使用 LoginResponse 替代
 */
export type AuthResponse = LoginResponse;

/**
 * @deprecated 使用 AuthContextValue 替代
 */
export type UnifiedAuthContextType = AuthContextValue;

// ============================================================================
// 📤 统一导出
// ============================================================================

export type {
  // 主要类型已在上面定义并导出
};
