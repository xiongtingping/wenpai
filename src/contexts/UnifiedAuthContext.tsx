/**
 * ✅ 项目全局统一使用 UnifiedAuthContext 作为登录认证上下文。
 *
 * ❌ 禁止使用 useAuthing（SDK裸调用会造成状态不一致）
 * ❌ 禁止使用旧版 AuthContext（已废弃）
 *
 * 所有组件请通过以下方式获取用户信息与登录状态：
 *   import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
 *
 * 如需扩展登录逻辑，请统一在 UnifiedAuthContext.tsx 文件中维护。
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  isProUser?: boolean;
  plan?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * 认证上下文接口
 */
export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  login: (redirectTo?: string) => void;
  logout: () => void;
  checkAuth: () => void;
  hasPermission?: (permission: string) => boolean;
  hasRole?: (role: string) => boolean;
  updateUser?: (updates: Partial<UserInfo>) => Promise<void>;
  updateUserData?: (updates: Partial<UserInfo>) => Promise<void>;
  getUserData?: () => UserInfo | null;
  bindTempUserId?: () => Promise<void>;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 创建Authing实例
 */
const createAuthingInstance = () => {
  const config = getAuthingConfig();
  return new AuthenticationClient({
    appId: config.appId,
    appHost: config.host,
  });
};

/**
 * 认证提供者组件
 * @param props 组件属性
 * @returns React组件
 */
export const UnifiedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // 创建Authing实例
      const authing = createAuthingInstance();
      
      // 检查URL中是否有授权码
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code) {
        // 处理授权码回调
        try {
          const tokenSet = await authing.getAccessTokenByCode(code, {
            redirectUri: getAuthingConfig().redirectUri
          });
          
          if (tokenSet && tokenSet.access_token) {
            // 获取用户信息
            const userInfo = await authing.getUserInfo(tokenSet.access_token);
            
            if (userInfo) {
              console.log("登录成功，用户信息：", userInfo);
              
              // 转换用户信息格式
              const user: UserInfo = {
                id: userInfo.id || userInfo.userId || `user_${Date.now()}`,
                username: userInfo.username || userInfo.nickname || '用户',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                nickname: userInfo.nickname || userInfo.username || '用户',
                avatar: userInfo.avatar || '',
                loginTime: new Date().toISOString()
              };
              
              setUser(user);
              
              // 保存到本地存储
              localStorage.setItem('authing_user', JSON.stringify(user));
              localStorage.setItem('authing_token', tokenSet.access_token);
              
              // 清除URL中的参数
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // 如果有跳转目标，进行跳转
              const redirectTo = localStorage.getItem('login_redirect_to');
              if (redirectTo) {
                localStorage.removeItem('login_redirect_to');
                navigate(redirectTo, { replace: true });
              }
            }
          }
        } catch (callbackError) {
          console.error('处理授权回调失败:', callbackError);
        }
      } else {
        // 检查本地存储的用户信息
        const savedUser = localStorage.getItem('authing_user');
        const savedToken = localStorage.getItem('authing_token');
        
        if (savedUser && savedToken) {
          try {
            // 验证token是否有效
            const userInfo = await authing.getUserInfo(savedToken);
            if (userInfo) {
              setUser(JSON.parse(savedUser));
            } else {
              // token无效，清除本地数据
              localStorage.removeItem('authing_user');
              localStorage.removeItem('authing_token');
            }
          } catch (tokenError) {
            console.error('验证token失败:', tokenError);
            localStorage.removeItem('authing_user');
            localStorage.removeItem('authing_token');
          }
        }
      }
      
    } catch (error) {
      console.error('检查认证状态失败:', error);
      // 清除可能存在的无效数据
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_token');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 登录方法 - 使用Authing SDK
   * @param redirectTo 登录后跳转的目标页面
   */
  const login = (redirectTo?: string) => {
    try {
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      // 获取配置
      const config = getAuthingConfig();
      
      // 构建授权URL
      const authUrl = `https://${config.host}/oidc/auth?` + new URLSearchParams({
        client_id: config.appId,
        redirect_uri: config.redirectUri,
        scope: 'openid profile email phone',
        response_type: 'code',
        state: redirectTo || '/',
      }).toString();
      
      console.log('🔗 跳转到Authing登录页面:', authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('登录失败:', error);
      // 备用方案：直接跳转到Authing登录页面
      const config = getAuthingConfig();
      const fallbackUrl = `https://${config.host}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
      console.log('🔄 使用备用登录URL:', fallbackUrl);
      window.location.href = fallbackUrl;
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      // 获取配置
      const config = getAuthingConfig();
      
      // 清除本地存储
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_token');
      localStorage.removeItem('authing_code');
      localStorage.removeItem('authing_state');
      localStorage.removeItem('login_redirect_to');
      
      // 重置状态
      setUser(null);
      
      // 跳转到Authing登出页面
      const logoutUrl = `https://${config.host}/oidc/session/end?` + new URLSearchParams({
        client_id: config.appId,
        post_logout_redirect_uri: window.location.origin,
      }).toString();
      
      console.log('🔗 跳转到Authing登出页面:', logoutUrl);
      window.location.href = logoutUrl;
      
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出失败，也清除本地数据
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_token');
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的Hook
 * @returns 认证上下文
 */
export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

/**
 * 认证保护组件
 */
interface UnifiedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // 重定向到登录页面
    window.location.href = redirectTo;
    return null;
  }

  return <>{children}</>;
};

/**
 * 权限保护组件
 */
interface UnifiedPermissionGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export const UnifiedPermissionGuard: React.FC<UnifiedPermissionGuardProps> = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  fallback = <div>权限不足</div> 
}) => {
  const { hasPermission, hasRole, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查权限中...</p>
        </div>
      </div>
    );
  }

  // 检查权限
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission));

  // 检查角色
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role));

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 