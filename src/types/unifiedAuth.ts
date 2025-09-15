/**
 * 🏷️ 统一认证类型定义
 * 统一所有认证相关的TypeScript类型，避免重复定义和类型不一致问题
 * 
 * 功能特性：
 * - 用户信息标准化
 * - 认证状态类型
 * - Token和会话类型
 * - 错误处理类型
 * - 权限和角色类型
 */

// ============================================================================
// 基础用户信息类型
// ============================================================================

/**
 * 标准化用户信息接口（主要接口，其他接口应继承或兼容此接口）
 */
export interface StandardUserInfo {
  /** 用户唯一标识符 */
  id: string;
  /** 用户名 */
  username?: string;
  /** 邮箱地址 */
  email?: string;
  /** 手机号码 */
  phone?: string;
  /** 显示昵称 */
  nickname?: string;
  /** 头像URL */
  avatar?: string;
  /** 真实姓名 */
  realName?: string;
  /** 性别 */
  gender?: 'male' | 'female' | 'unknown';
  /** 生日 */
  birthday?: string;
  /** 地区/地址 */
  address?: string;
  /** 个人简介 */
  bio?: string;
  /** 用户状态 */
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  /** 邮箱验证状态 */
  emailVerified?: boolean;
  /** 手机验证状态 */
  phoneVerified?: boolean;
  /** 账户创建时间 */
  createdAt?: string;
  /** 最后更新时间 */
  updatedAt?: string;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 登录IP */
  lastLoginIp?: string;
  /** 扩展字段 */
  metadata?: Record<string, any>;
}

/**
 * 会话用户信息（包含登录相关信息）
 */
export interface SessionUserInfo extends StandardUserInfo {
  /** 当前登录时间 */
  loginTime: string;
  /** 登录方式 */
  loginMethod?: 'password' | 'sms' | 'email' | 'social';
  /** 登录设备信息 */
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  /** 用户角色 */
  roles: string[];
  /** 用户权限 */
  permissions: string[];
  /** 订阅信息 */
  subscription?: {
    tier: 'trial' | 'pro' | 'premium';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
    features: string[];
  };
  /** VIP状态（兼容旧版本） */
  isVip?: boolean;
  vipLevel?: 'trial' | 'pro' | 'premium';
}

/**
 * 用户配置信息
 */
export interface UserPreferences {
  /** 语言设置 */
  language: string;
  /** 主题设置 */
  theme: 'light' | 'dark' | 'auto';
  /** 时区 */
  timezone?: string;
  /** 通知设置 */
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  /** 隐私设置 */
  privacy: {
    profilePublic: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  /** 其他设置 */
  settings?: Record<string, any>;
}

// ============================================================================
// 认证状态和Token类型
// ============================================================================

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

/**
 * Token信息接口
 */
export interface TokenInfo {
  /** 访问Token */
  accessToken: string;
  /** 刷新Token */
  refreshToken?: string;
  /** Token类型 */
  tokenType?: string;
  /** 过期时间（时间戳） */
  expiresAt: number;
  /** 颁发时间 */
  issuedAt?: number;
  /** 作用域 */
  scope?: string[];
  /** Token来源 */
  source: string;
  /** 相关用户ID */
  userId?: string;
}

/**
 * 会话信息
 */
export interface SessionInfo {
  /** 会话ID */
  sessionId: string;
  /** 用户信息 */
  user: SessionUserInfo;
  /** Token信息 */
  token: TokenInfo;
  /** 会话状态 */
  status: AuthStatus;
  /** 会话开始时间 */
  startTime: number;
  /** 最后活动时间 */
  lastActivityTime: number;
  /** 会话过期时间 */
  expiresAt: number;
  /** 是否记住登录 */
  rememberMe: boolean;
  /** 设备信息 */
  device?: {
    type: 'web' | 'mobile' | 'desktop';
    os: string;
    browser: string;
    userAgent: string;
  };
}

// ============================================================================
// 认证操作类型
// ============================================================================

/**
 * 登录方法类型
 */
export type LoginMethod = 'password' | 'sms' | 'email' | 'social' | 'token';

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 登录方法 */
  method: LoginMethod;
  /** 登录标识符（用户名/邮箱/手机号） */
  identifier: string;
  /** 密码或验证码 */
  credential: string;
  /** 是否记住登录 */
  rememberMe?: boolean;
  /** 验证码场景（仅验证码登录） */
  codeScene?: 'login' | 'register' | 'reset';
  /** 额外参数 */
  metadata?: Record<string, any>;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 用户信息 */
  user?: SessionUserInfo;
  /** Token信息 */
  token?: TokenInfo;
  /** 会话信息 */
  session?: SessionInfo;
  /** 错误信息 */
  error?: {
    code: string;
    type: string;
    details?: any;
  };
  /** 需要额外验证 */
  requiresAdditionalAuth?: boolean;
  /** 重定向URL */
  redirectUrl?: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 密码 */
  password?: string;
  /** 确认密码 */
  confirmPassword?: string;
  /** 验证码 */
  verificationCode?: string;
  /** 验证码场景 */
  codeScene?: 'register';
  /** 同意条款 */
  agreeToTerms: boolean;
  /** 额外信息 */
  profile?: Partial<StandardUserInfo>;
  /** 邀请码 */
  inviteCode?: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 用户信息 */
  user?: SessionUserInfo;
  /** 是否需要邮箱验证 */
  requiresEmailVerification?: boolean;
  /** 是否需要手机验证 */
  requiresPhoneVerification?: boolean;
  /** 错误信息 */
  error?: {
    code: string;
    type: string;
    details?: any;
  };
}

// ============================================================================
// 验证码类型
// ============================================================================

/**
 * 验证码场景
 */
export type VerificationCodeScene = 
  | 'login' 
  | 'register' 
  | 'reset_password' 
  | 'change_email' 
  | 'change_phone' 
  | 'bind_email' 
  | 'bind_phone' 
  | 'delete_account';

/**
 * 验证码类型
 */
export type VerificationCodeType = 'sms' | 'email';

/**
 * 验证码发送请求
 */
export interface SendCodeRequest {
  /** 发送目标（手机号或邮箱） */
  target: string;
  /** 验证码类型 */
  type: VerificationCodeType;
  /** 使用场景 */
  scene: VerificationCodeScene;
  /** 额外参数 */
  metadata?: Record<string, any>;
}

/**
 * 验证码发送响应
 */
export interface SendCodeResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 验证码Token（用于后续验证） */
  codeToken?: string;
  /** 过期时间 */
  expiresAt?: number;
  /** 剩余重试次数 */
  remainingAttempts?: number;
  /** 下次可发送时间 */
  nextSendTime?: number;
  /** 错误信息 */
  error?: {
    code: string;
    type: string;
    details?: any;
  };
}

/**
 * 验证码验证请求
 */
export interface VerifyCodeRequest {
  /** 目标（手机号或邮箱） */
  target: string;
  /** 验证码 */
  code: string;
  /** 验证码Token */
  codeToken?: string;
  /** 验证场景 */
  scene: VerificationCodeScene;
}

/**
 * 验证码验证响应
 */
export interface VerifyCodeResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 验证Token（用于后续操作） */
  verifyToken?: string;
  /** 剩余尝试次数 */
  remainingAttempts?: number;
  /** 错误信息 */
  error?: {
    code: string;
    type: string;
    details?: any;
  };
}

// ============================================================================
// 权限和角色类型
// ============================================================================

/**
 * 用户角色
 */
export interface UserRole {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色显示名 */
  displayName: string;
  /** 角色描述 */
  description?: string;
  /** 角色级别 */
  level: number;
  /** 是否系统角色 */
  isSystem: boolean;
  /** 权限列表 */
  permissions: string[];
}

/**
 * 权限定义
 */
export interface Permission {
  /** 权限ID */
  id: string;
  /** 权限名称 */
  name: string;
  /** 权限显示名 */
  displayName: string;
  /** 权限描述 */
  description?: string;
  /** 权限分类 */
  category: string;
  /** 资源类型 */
  resource?: string;
  /** 操作类型 */
  action?: string;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 缺少的权限 */
  missingPermissions?: string[];
  /** 建议操作 */
  suggestedAction?: 'login' | 'upgrade' | 'request' | 'contact';
  /** 升级目标 */
  upgradeTarget?: 'pro' | 'premium';
  /** 权限来源 */
  source?: 'role' | 'direct' | 'subscription';
}

// ============================================================================
// 错误处理类型
// ============================================================================

/**
 * 认证错误类型（重新导出以保持一致性）
 */
export { AuthErrorType, ErrorSeverity } from '@/utils/authErrorHandler';
export type { AuthError, RecoveryAction } from '@/utils/authErrorHandler';

// ============================================================================
// 配置类型
// ============================================================================

/**
 * 认证配置
 */
export interface AuthConfig {
  /** 应用ID */
  appId: string;
  /** 认证域名 */
  domain: string;
  /** 认证主机 */
  host: string;
  /** 回调URL */
  redirectUri: string;
  /** 环境 */
  environment: 'development' | 'production' | 'test';
  /** 功能开关 */
  features: {
    /** 是否启用记住登录 */
    rememberMe: boolean;
    /** 是否启用社交登录 */
    socialLogin: boolean;
    /** 是否启用手机登录 */
    phoneLogin: boolean;
    /** 是否启用邮箱登录 */
    emailLogin: boolean;
    /** 是否启用密码登录 */
    passwordLogin: boolean;
    /** 是否启用httpOnly cookie */
    httpOnlyCookies: boolean;
    /** 是否启用CSRF保护 */
    csrfProtection: boolean;
    /** 是否启用Token加密 */
    tokenEncryption: boolean;
  };
  /** 超时设置（毫秒） */
  timeouts: {
    /** 登录超时 */
    login: number;
    /** Token刷新超时 */
    tokenRefresh: number;
    /** 验证码发送超时 */
    sendCode: number;
  };
  /** 重试设置 */
  retry: {
    /** 最大重试次数 */
    maxAttempts: number;
    /** 重试延迟（毫秒） */
    delay: number;
    /** 最大延迟（毫秒） */
    maxDelay: number;
  };
}

// ============================================================================
// 认证上下文类型
// ============================================================================

/**
 * 认证上下文接口
 */
export interface AuthContextValue {
  // 状态
  /** 当前用户 */
  user: SessionUserInfo | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 认证状态 */
  authStatus: AuthStatus;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 会话信息 */
  session: SessionInfo | null;

  // 会话相关
  /** 会话警告 */
  sessionWarning: boolean;
  /** 会话剩余时间 */
  sessionRemainingTime: number;

  // 方法
  /** 登录 */
  login(request: LoginRequest): Promise<LoginResponse>;
  /** 注册 */
  register(request: RegisterRequest): Promise<RegisterResponse>;
  /** 登出 */
  logout(): Promise<void>;
  /** 检查认证状态 */
  checkAuth(): Promise<void>;
  /** 刷新Token */
  refreshToken(): Promise<boolean>;
  /** 更新用户信息 */
  updateUser(updates: Partial<StandardUserInfo>): Promise<void>;

  // 验证码相关
  /** 发送验证码 */
  sendVerificationCode(request: SendCodeRequest): Promise<SendCodeResponse>;
  /** 验证验证码 */
  verifyCode(request: VerifyCodeRequest): Promise<VerifyCodeResponse>;

  // 权限相关
  /** 检查权限 */
  hasPermission(permission: string | string[]): boolean;
  /** 检查角色 */
  hasRole(role: string | string[]): boolean;
  /** 检查权限详细结果 */
  checkPermission(permission: string | string[]): PermissionCheckResult;

  // 会话管理
  /** 延长会话 */
  extendSession(): void;
  /** 忽略会话警告 */
  dismissSessionWarning(): void;

  // 便捷方法
  /** 密码登录 */
  loginWithPassword(identifier: string, password: string, rememberMe?: boolean): Promise<LoginResponse>;
  /** 验证码登录 */
  loginWithCode(identifier: string, code: string, type: VerificationCodeType): Promise<LoginResponse>;
  /** 重置密码 */
  resetPassword(identifier: string, code: string, newPassword: string): Promise<boolean>;
}

// ============================================================================
// 兼容性类型别名（保持向后兼容）
// ============================================================================

/** @deprecated 使用 StandardUserInfo */
export type UserInfo = StandardUserInfo;

/** @deprecated 使用 SessionUserInfo */
export type AuthUser = SessionUserInfo;

/** @deprecated 使用 TokenInfo */
export type AuthTokenInfo = TokenInfo;

/** @deprecated 使用 LoginResponse */
export type AuthResponse = LoginResponse;

/** @deprecated 使用 AuthContextValue */
export type UnifiedAuthContextType = AuthContextValue;

// ============================================================================
// 导出所有类型
// ============================================================================

export * from './auth'; // 兼容现有的auth类型（如果存在）