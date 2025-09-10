/**
 * 🎯 简单的认证Provider - 自定义登录表单版本
 * 零技术债务实现，支持自定义登录表单
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// 完整的用户类型 - 兼容所有现有代码
export interface SimpleUser {
  id: string;
  nickname?: string;
  email?: string;
  avatar?: string;

  // 权限相关
  permissions?: string[];
  roles?: string[];
  isVip?: boolean;
  isProUser?: boolean;
  tier?: string;
  vipLevel?: number;
  plan?: string;

  // 用户信息
  username?: string;
  phone?: string;
  createdAt?: string;
  registrationDate?: string;

  // 订阅相关
  subscription?: {
    tier: string;
    [key: string]: any;
  };

  // 管理员权限
  isAdmin?: boolean;

  // 索引签名 - 支持动态属性访问
  [key: string]: any;
}

// 完整的认证上下文 - 兼容所有现有代码
interface SimpleAuthContextType {
  user: SimpleUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (redirectPath?: string) => void;
  logout: () => void;
  setUser: (user: SimpleUser | null) => void;
  
  // 兼容性方法 - 确保现有代码正常工作
  getCurrentUser: () => SimpleUser | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  getAuthToken: () => string | null;
  refreshUser: () => Promise<void>;
  updateUserInfo: (userInfo: Partial<SimpleUser>) => void;
}

// 创建上下文
export const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

// Provider组件
export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化 - 从localStorage或其他存储中恢复用户状态
  useEffect(() => {
    try {
      console.log('🎯 初始化简单认证系统...');
      
      // 尝试从localStorage恢复用户状态
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('✅ 从本地存储恢复用户:', parsedUser);
        } catch (error) {
          console.warn('⚠️ 解析本地存储的用户数据失败:', error);
          localStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
      console.log('✅ 简单认证系统初始化完成');
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      setLoading(false);
    }
  }, []);

  // 登录方法 - 在自定义表单中调用
  const login = useCallback((redirectPath?: string) => {
    console.log('🔍 触发登录流程...');
    // 这里可以触发自定义登录弹窗或跳转到登录页面
    // 实际的登录逻辑应该在自定义登录表单中实现
    
    // 示例：触发自定义登录事件
    window.dispatchEvent(new CustomEvent('auth:showLogin', { 
      detail: { redirectPath } 
    }));
  }, []);

  // 退出登录
  const logout = useCallback(() => {
    console.log('🔍 用户退出登录');
    setUser(null);
    localStorage.removeItem('auth_user');
    
    // 触发退出登录事件
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, []);

  // 更新用户信息
  const updateUserInfo = useCallback((userInfo: Partial<SimpleUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userInfo };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      console.log('✅ 用户信息已更新:', updatedUser);
    }
  }, [user]);

  // 设置用户 - 供外部登录表单调用
  const setUserExternal = useCallback((newUser: SimpleUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      console.log('✅ 用户登录成功:', newUser);
    } else {
      localStorage.removeItem('auth_user');
      console.log('✅ 用户已退出');
    }
  }, []);

  // 兼容性方法
  const getCurrentUser = useCallback(() => user, [user]);
  
  const hasPermission = useCallback((permission: string) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);
  
  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role) || false;
  }, [user]);
  
  const getAuthToken = useCallback(() => {
    // 这里应该返回实际的认证token
    // 可以从localStorage、sessionStorage或其他地方获取
    return localStorage.getItem('auth_token') || null;
  }, []);
  
  const refreshUser = useCallback(async () => {
    // 刷新用户信息的逻辑
    console.log('🔄 刷新用户信息...');
    // 这里可以调用API获取最新的用户信息
  }, []);

  const contextValue: SimpleAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    setUser: setUserExternal,
    getCurrentUser,
    hasPermission,
    hasRole,
    getAuthToken,
    refreshUser,
    updateUserInfo,
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

// Hook for using auth context
export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

// 兼容性Hook - 确保现有代码正常工作
export function useAuth() {
  return useSimpleAuth();
}

export default SimpleAuthProvider;