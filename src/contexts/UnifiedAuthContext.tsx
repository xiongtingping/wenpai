/**
 * ✅ FIXED: 2025-07-25 统一认证上下文已完全修复并封装
 *
 * 🐛 历史问题清单：
 * - "appId is required" 错误：Guard构造函数参数格式错误
 * - "Authing is not defined" 错误：SDK导入路径错误
 * - 登录成功后弹窗不关闭：缺少事件处理逻辑
 * - 图标显示异常：缺少CSS样式文件
 * - aria-hidden焦点冲突：accessibility配置缺失
 *
 * 🔧 修复方案总结：
 * - 采用正确的Guard构造函数对象参数格式
 * - 使用官方SDK导入路径和方法
 * - 实现事件驱动的认证流程和自动弹窗关闭
 * - 添加完整的accessibility配置
 * - 建立用户信息标准化处理机制
 *
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 
 * 🚫 冻结原因：认证系统已验证稳定，任何修改都可能导致登录功能崩溃
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Guard组件已移除，仅使用自定义表单和@authing/web SDK
import { useUnifiedStore } from '@/stores/unified-state-store';
import { SecureUserStateService } from '@/services/secureUserStateService';
import { TokenService } from '@/utils/tokenManager';
import { AuthingTokenService } from '@/utils/authTokenHandler';
import { TokenSecurityManager, SecureTokenInfo } from '@/utils/secureTokenStorage';
import { SessionService } from '@/utils/sessionManager';
import type { StandardUserInfo } from '@/types/unifiedAuth';
// 🎯 引入用户状态同步协调器 - 解决竞态条件
import { userStateSyncCoordinator } from '@/services/userStateSyncCoordinator';
import { autoMigrateHistory } from '@/utils/historyMigration';
import { autoMigrateFavorites } from '@/utils/favoritesMigration';
// 🔒 服务访问器 - 避免静态循环依赖
type AuthServiceType = typeof import('@/services/authService')['authService'];
type VerificationCodeServiceType = typeof import('@/services/verificationCodeService')['verificationCodeService'];

let authServiceInstance: AuthServiceType | null = null;
let verificationCodeServiceInstance: VerificationCodeServiceType | null = null;

async function getAuthService(): Promise<AuthServiceType> {
  if (!authServiceInstance) {
    const module = await import('@/services/authService');
    authServiceInstance = module.authService;
  }
  return authServiceInstance;
}

async function getVerificationCodeService(): Promise<VerificationCodeServiceType> {
  if (!verificationCodeServiceInstance) {
    const module = await import('@/services/verificationCodeService');
    verificationCodeServiceInstance = module.verificationCodeService;
  }
  return verificationCodeServiceInstance;
}

// 🔒 安全修复：导入安全用户状态管理服务

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 统一认证上下文类型
 */
interface UnifiedAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // 会话状态
  sessionWarning: boolean;
  sessionRemainingTime: number;
  
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string, scene?: 'login' | 'register' | 'reset') => Promise<void>;
  registerUser: (userInfo: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  
  // 会话管理
  extendSession: () => void;
  dismissSessionWarning: () => void;
  
  // Guard相关方法已移除
  // 自定义模态框状态
  customAuthModalOpen: boolean;
  setCustomAuthModalOpen: (open: boolean) => void;
  customAuthModalTab: 'login' | 'register';
  setCustomAuthModalTab: (tab: 'login' | 'register') => void;
}

// ❌ 移除 @authing/web 客户端使用，统一改用 Guard 弹窗流程
// 保留占位以避免误用
// 

// （已切换为专用路由嵌入式登录，不再需要运行时创建 overlay 容器）

/**
 * 创建认证上下文
 */
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

/**
 * 统一认证提供者组件
 */
export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 会话管理状态
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0);
  
  // 自定义模态框状态
  const [customAuthModalOpen, setCustomAuthModalOpen] = useState(false);
  const [customAuthModalTab, setCustomAuthModalTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  // 将Token管理器初始化移到组件的后面，在所有函数定义之后
  const unifiedStore = useUnifiedStore();
  
  // Guard Hook已移除 - 使用自定义认证流程

  useEffect(() => {
    void getAuthService();
    void getVerificationCodeService();
  }, []);

  // 🔒 安全修复：使用安全用户状态管理检查认证状态
  // ✅ P0-3修复：使用userStateSyncCoordinator原子化同步,避免竞态条件
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 安全检查用户登录状态...');
      setLoading(true);

      // 🔒 从安全存储获取用户状态
      const secureUser = await SecureUserStateService.getUserState();
      if (secureUser) {
        console.log('✅ 从安全存储恢复用户状态:', { userId: secureUser.id });

        // ✅ 关键修复: 使用同步协调器原子化更新三层状态
        const syncResult = await userStateSyncCoordinator.syncOnLogin(
          secureUser,
          (user) => setUser(user)  // 传入Context的setter
        );

        if (!syncResult.success) {
          console.error('❌ 用户状态同步失败:', syncResult.error);
          throw new Error(`状态同步失败: ${syncResult.error}`);
        }

        console.log('✅ 用户状态已原子化同步到所有层:', {
          syncedLayers: syncResult.syncedLayers,
          failedLayers: syncResult.failedLayers
        });

        // 🎯 CRITICAL FIX: 同步真实的订阅状态
        try {
          const { syncUserSubscription } = await import('@/services/subscriptionSyncService');
          const { useUnifiedStore } = await import('@/stores/unified-state-store');
          await syncUserSubscription(secureUser.id, (updates) => {
            // 更新Context中的用户状态
            setUser(prev => prev ? { ...prev, ...updates } : null);
            // 同时更新Store中的用户状态
            useUnifiedStore.getState().setUser(updates);
          });
        } catch (syncError) {
          console.error('⚠️ 订阅状态同步失败，使用默认值:', syncError);
        }

        // 🔄 自动迁移历史记录数据
        try {
          const wasGuest = !user; // 如果之前没有用户,说明是访客
          const migrationResult = await autoMigrateHistory(secureUser.id, wasGuest);
          if (migrationResult.success && migrationResult.migratedCount > 0) {
            console.log('✅ 数据迁移成功:', {
              migratedCount: migrationResult.migratedCount,
              skippedCount: migrationResult.skippedCount
            });
          }
          // 迁移收藏数据
          const favoritesMigrationResult = await autoMigrateFavorites(secureUser.id, wasGuest);
          if (favoritesMigrationResult.success && favoritesMigrationResult.migratedCount > 0) {
            console.log('✅ 收藏数据迁移成功:', {
              migratedCount: favoritesMigrationResult.migratedCount,
              skippedCount: favoritesMigrationResult.skippedCount
            });
          }
        } catch (migrationError) {
          console.warn('⚠️ 数据迁移失败:', migrationError);
          // 不影响登录流程
        }

        setLoading(false);
        return;
      }

      console.log('👤 未找到有效的用户状态,设置为未登录状态');

      // ✅ 登出也使用同步协调器
      const clearResult = await userStateSyncCoordinator.syncOnLogout(
        (user) => setUser(user)
      );

      if (!clearResult.success) {
        console.warn('⚠️ 用户状态清除部分失败:', clearResult.error);
      }

    } catch (error) {
      console.error('安全认证检查失败:', error);

      // 出现错误时清除可能损坏的状态
      SecureUserStateService.clearUserState();

      // 清除所有可能损坏的localStorage数据
      try {
        localStorage.removeItem('authing_user');
        localStorage.removeItem('_authing_user');
        localStorage.removeItem('_authing_token');
        localStorage.removeItem('login_redirect_to');
        localStorage.removeItem('wenpai-remember-login');
        localStorage.removeItem('wenpai-login-timestamp');
        console.log('🧹 已清理所有可能损坏的认证数据');
      } catch (cleanupError) {
        console.error('清理localStorage失败:', cleanupError);
      }

      // 使用同步协调器清除状态
      await userStateSyncCoordinator.syncOnLogout((user) => setUser(user));

    } finally {
      setLoading(false);
    }
  }, []);

  // Guard初始化useEffect已移除 - 使用自定义认证流程


  /**
   * 处理Guard登录成功事件
   */
  const handleAuthingLogin = async (userInfo: any) => {
    try {
      console.log('🔐 processingGuardloginsuccess:', userInfo);

      // 🚨 关键：用户ID必须来自Authing真实API，不能本地生成
      const userInfoAny = userInfo as any;
      const userId = userInfo.id || userInfoAny.userId || userInfoAny.sub;
      if (!userId) {
        console.error('❌ AuthingloginAPInot返回validuserID:', userInfo);
        throw new Error('认证系统错误：未获取到有效用户ID');
      }

      // 转换为统一用户信息格式
      const formattedUser: UserInfo = {
        id: userId,
        username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
        email: userInfo.email || userInfoAny.emailAddress || '',
        phone: userInfo.phone || userInfoAny.phoneNumber || '',
        nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
        avatar: userInfoAny.avatar || userInfo.photo || userInfoAny.picture || '',
        loginTime: new Date().toISOString(),
        roles: Array.isArray(userInfo.roles) ? userInfo.roles : ['user'],
        permissions: Array.isArray(userInfoAny.permissions) ? userInfoAny.permissions : ['basic'],
        ...userInfo
      };

      // 🔐 保存Token到安全存储器（使用新的安全机制）
      if (userInfo.access_token || userInfo.token) {
        try {
          const secureTokenInfo: SecureTokenInfo = {
            accessToken: userInfo.access_token || userInfo.token,
            refreshToken: userInfo.refresh_token,
            expiresAt: userInfo.expires_at ? new Date(userInfo.expires_at).getTime() : Date.now() + (24 * 60 * 60 * 1000),
            userId: formattedUser.id,
            source: 'authing',
            metadata: {
              loginTime: formattedUser.loginTime,
              username: formattedUser.username,
              email: formattedUser.email,
              phone: formattedUser.phone
            }
          };
          
          const success = await TokenSecurityManager.storeAuthToken(secureTokenInfo);
          console.log(success ? '🔐 Token已安全存储' : '⚠️ Token存储失败，使用备用方案');
          
          // 备用方案：如果安全存储失败，使用原有方式
          if (!success) {
            const tokenInfo = AuthingTokenService.createTokenFromLogin(userInfo);
            await TokenService.setToken('authing', tokenInfo);
            console.log('🎫 Tokenalreadystorage到备用position');
          }
        } catch (tokenError) {
          console.warn('⚠️ Tokenstoragefailed:', tokenError);
          // 继续登录流程，但记录警告
        }
      }

      // 🎯 使用同步协调器原子化更新用户状态 - 解决竞态条件 (C3修复)
      const syncResult = await userStateSyncCoordinator.syncOnLogin(
        formattedUser,
        (user) => setUser(user) // 传入Context的setter
      );

      if (!syncResult.success) {
        console.error('❌ 用户状态同步失败:', syncResult.error);
        throw new Error(`状态同步失败: ${syncResult.error}`);
      }

      console.log('✅ 用户状态已原子化同步到所有层:', {
        syncedLayers: syncResult.syncedLayers,
        failedLayers: syncResult.failedLayers
      });

      // 🎯 CRITICAL FIX: 登录成功后同步真实的订阅状态
      try {
        const { syncUserSubscription } = await import('@/services/subscriptionSyncService');
        const { useUnifiedStore } = await import('@/stores/unified-state-store');
        await syncUserSubscription(formattedUser.id, (updates) => {
          // 更新Context中的用户状态
          setUser(prev => prev ? { ...prev, ...updates } : null);
          // 同时更新Store中的用户状态
          useUnifiedStore.getState().setUser(updates);
        });
      } catch (syncError) {
        console.error('⚠️ 订阅状态同步失败，使用默认值:', syncError);
      }

      // Guard模态框已移除 - 无需隐藏

      // 处理登录成功后的跳转
      const redirectTarget = localStorage.getItem('login_redirect_to') || '/';
      localStorage.removeItem('login_redirect_to');
      
      console.log('🎯 loginsuccess，跳转到:', redirectTarget);
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 500);

      console.log('✅ Guardloginstream程completed:', formattedUser);

    } catch (error) {
      console.error('❌ processingGuardloginfailed:', error);
      setError(t('common.errors.登录处理失败'));
    }
  };

  /**
   * 🎯 使用自定义登录表单（Guard模态框问题的替代方案）
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 跳转到customloginpage...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 saving跳转目标:', redirectTo);
      }

      // 跳转到自定义登录页面
      navigate('/custom-login');
      console.log('✅ already跳转到customloginpage');

    } catch (error) {
      console.error('❌ login跳转failed:', error);
      setError('登录跳转失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Guard相关登录模态框函数已移除 - 使用自定义登录页面

  /**
   * 注册方法 - 使用自定义注册表单
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 跳转到customregisterpage...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      // 跳转到自定义登录页面（注册标签）
      navigate('/custom-login?tab=register');
      console.log('✅ already跳转到customregisterpage');

    } catch (error) {
      console.error('❌ register跳转failed:', error);
      setError(t('common.errors.注册跳转失败'));
    }
  };

  /**
   * 登出方法 - 使用官方Guard API
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 starts登出stream程...');

      // 🎫 清除Token和执行Authing登出
      try {
        const token = await TokenService.getToken('authing', false);
        if (token) {
          await AuthingTokenService.logout(token);
        }
        await TokenService.removeToken('authing');
        console.log('🎫 Token cleared from secure storage');
      } catch (tokenError) {
        console.warn('⚠️ Failed to clear token:', tokenError);
        // 继续登出流程
      }

      // 🎯 使用同步协调器原子化清除用户状态 - 解决竞态条件 (C3修复)
      console.log('🚀 executing原子化登出流程');

      const syncResult = await userStateSyncCoordinator.syncOnLogout(
        (user) => setUser(user) // 传入Context的setter
      );

      if (!syncResult.success) {
        console.warn('⚠️ 用户状态清除部分失败:', syncResult.error);
        // 登出场景允许部分失败,继续流程
      }

      console.log('✅ 用户状态已原子化清除:', {
        syncedLayers: syncResult.syncedLayers,
        failedLayers: syncResult.failedLayers
      });

      // 清除其他认证相关项
      localStorage.removeItem('login_redirect_to');
      
      // 🔐 注意：不自动清除记住密码数据，保持用户选择
      // 用户如果选择了"记住密码"，登出后应该保留这个设置
      // 只有在用户主动取消"记住密码"时才清除
      console.log('ℹ️ 记住passworddataalready保留，如需clearing请在loginpagecanceling勾选');

      // 跳转到首页
      navigate('/');

      console.log('✅ user登出success');

    } catch (error) {
      console.error('❌ 登出failed:', error);
      setError(t('common.errors.登出失败'));
    }
  }, [navigate, unifiedStore]);

  // 其他方法的简化实现
  const refreshToken = async () => {
    try {
      console.log('🔄 Manual token refresh requested');
      
      const result = await TokenService.refreshToken('authing');
      if (result.success) {
        console.log('✅ Token refreshed successfully');
      } else {
        console.warn('⚠️ Token refresh failed:', result.error);
        if (result.shouldLogout) {
          await logout();
        }
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      setError('Token刷新失败');
    }
  };

  const updateUser = async (updates: Partial<UserInfo>) => {
    if (!user) {
      throw new Error(t('common.errors.用户未登录'));
    }

    try {
      const authService = await getAuthService();
      // 🔍 DEBUG: 显示传入的更新数据
      console.log('🔍 updateUser 被调用，parameter:', updates);
      console.log('🔍 parameterkey名:', Object.keys(updates));
      
      // 区分基本信息和敏感信息
      const basicFields = ['nickname', 'avatar'];
      const sensitiveFields = ['email', 'phone'];
      
      const basicUpdates = Object.keys(updates)
        .filter(key => basicFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key as keyof UserInfo];
          return obj;
        }, {} as Record<string, any>);
        
      const sensitiveUpdates = Object.keys(updates)
        .filter(key => sensitiveFields.includes(key))
        .filter(key => {
          // 🔧 只有当值真正发生变化时才算敏感更新
          const newValue = (updates[key as keyof UserInfo] || '').trim();
          const currentValue = (user?.[key as keyof UserInfo] || '').trim();
          
          // 空值不算变化，必须有实际内容且与当前值不同
          const hasChanged = newValue !== '' && newValue !== currentValue;
          
          console.log(`🔍 敏感field ${key}: current="${currentValue}" -> newvalue="${newValue}" (${hasChanged ? 'already变化' : 'not变化'})`);
          
          return hasChanged;
        })
        .reduce((obj, key) => {
          obj[key] = updates[key as keyof StandardUserInfo];
          return obj;
        }, {} as Record<string, any>);

      // 🔍 DEBUG: 显示过滤结果
      console.log('🔍 basicUpdates:', basicUpdates);
      console.log('🔍 sensitiveUpdates:', sensitiveUpdates);
      console.log('🔍 sensitiveUpdates keys count:', Object.keys(sensitiveUpdates).length);

      // 处理敏感信息更新（需要Authing API验证）
      if (Object.keys(sensitiveUpdates).length > 0) {
        console.log('🔄 updating敏感info到Authingserver...');
        const result = await authService.updateProfile(sensitiveUpdates);
        
        if (!result.success) {
          throw new Error(result.message || t('common.errors.敏感信息更新失败'));
        }
      }

      // 处理基本信息更新（同时更新Authing服务器和本地状态）
      if (Object.keys(basicUpdates).length > 0) {
        console.log('🔄 updating基本info到Authingserver...');
        
        // 🔧 FIX: 2025-08-30 修复个人资料更新问题
        // 基本信息也需要同步到Authing服务器，避免重新登录时数据丢失
        try {
          const authResult = await authService.updateProfile(basicUpdates);
          if (!authResult.success) {
            console.warn('⚠️ Authingserverupdatingfailed，仅updatinglocal:', authResult.message);
          } else {
            console.log('✅ Authingserverupdatingsuccess:', authResult);
          }
        } catch (error) {
          console.warn('⚠️ Authingserverupdatingabnormal，仅updatinglocal:', error);
        }
        
        // 🎯 使用同步协调器原子化更新用户状态 - 解决竞态条件 (C3修复)
        const syncResult = await userStateSyncCoordinator.syncOnUpdate(
          basicUpdates,
          (user) => setUser(user) // 传入Context的setter
        );

        if (!syncResult.success) {
          console.error('❌ 用户信息更新同步失败:', syncResult.error);
          throw new Error(`状态同步失败: ${syncResult.error}`);
        }

        console.log('✅ 基本info已原子化更新到所有层:', {
          syncedLayers: syncResult.syncedLayers,
          updates: basicUpdates
        });
      }

      // 如果只有基本信息更新，直接成功
      if (Object.keys(sensitiveUpdates).length === 0) {
        console.log('✅ user基本infoupdatingcompleted');
        return;
      }

      console.log('✅ userinfoupdating并syncsuccess');
      
    } catch (error) {
      console.error('❌ userinfoupdatingfailed:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.errors.更新用户信息失败');
      throw new Error(errorMessage);
    }
  };

  /**
   * 密码登录 - 连接真实Authing API
   */
  const loginWithPassword = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const authService = await getAuthService();
      const result = await authService.loginByPassword(username, password);
      
      if (result.success && result.user) {
        // 登录成功，设置用户信息
        handleAuthingLogin(result.user as any);
        return;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errors.登录失败');
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailCode = async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const verificationCodeService = await getVerificationCodeService();
      const result = await verificationCodeService.loginByEmailCode(email, code);
      
      if (result.success && result.user) {
        handleAuthingLogin(result.user);
        return;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errors.登录失败');
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhoneCode = async (phone: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const verificationCodeService = await getVerificationCodeService();
      const result = await verificationCodeService.loginByPhoneCode(phone, code);
      
      if (result.success && result.user) {
        handleAuthingLogin(result.user);
        return;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errors.登录失败');
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string, scene: 'login' | 'register' | 'reset' = 'login') => {
    try {
      const verificationCodeService = await getVerificationCodeService();
      const result = await verificationCodeService.sendEmailCode(email, scene.toUpperCase());
      if (!result.success) {
        throw new Error(result.message);
      }
      // 根据接口定义，返回void
    } catch (error) {
      console.error('sendingvalidating码failed:', error);
      throw error;
    }
  };

  const registerUser = async (userInfo: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const verificationCodeService = await getVerificationCodeService();
      // 根据注册类型选择不同的注册方法
      let result;
      if (userInfo.phone && userInfo.code) {
        result = await verificationCodeService.registerByPhoneCode(
          userInfo.phone, 
          userInfo.code, 
          userInfo.password
        );
      } else if (userInfo.email && userInfo.code) {
        result = await verificationCodeService.registerByEmailCode(
          userInfo.email, 
          userInfo.code, 
          userInfo.password
        );
      } else {
        throw new Error(t('common.errors.注册信息不完整'));
      }
      
      if (result.success && result.user) {
        // 注册成功，设置用户信息
        handleAuthingLogin(result.user);
        // 根据接口定义，返回void
        return;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errors.注册失败');
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (_email: string, _code: string, _newPassword: string) => {
    await login();
  };

  const hasPermission = (permission: string): boolean => {
    // 🔒 安全修复：移除开发环境权限绕过，确保权限检查在所有环境中都生效
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    // 🔒 安全修复：移除开发环境权限绕过，确保角色检查在所有环境中都生效
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // 会话管理功能
  const extendSession = useCallback(() => {
    SessionService.extend();
    setSessionWarning(false);
    console.log('🔄 user手动延长session');
  }, []);

  const dismissSessionWarning = useCallback(() => {
    setSessionWarning(false);
  }, []);

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 🎫 Token管理系统初始化
  useEffect(() => {
    const initTokenManagement = async () => {
      try {
        console.log('🎫 initializationToken管理系统...');
        
        // 注册Authing Token刷新处理器
        TokenService.registerRefreshHandler('authing', AuthingTokenService.createRefreshHandler());
        
        // 设置Token事件回调
        TokenService.setCallbacks({
          onTokenRefreshed: (newToken) => {
            console.log('🔄 Tokenalreadyrefreshing:', newToken.source);
          },
          onTokenExpired: (expiredToken) => {
            console.warn('⏰ Tokenexpired:', expiredToken.source);
          },
          onTokenError: (error, token) => {
            console.error('❌ Tokenerror:', error, token?.source);
          },
          onLogoutRequired: (reason) => {
            console.warn('🚪 需要relogin:', reason);
            logout();
          }
        });
        
        console.log('✅ Token管理系统initializationcompleted');
        
      } catch (error) {
        console.error('💥 Token管理initializationfailed:', error);
      }
    };
    
    // 避免在初始渲染时立即执行，延迟执行防止循环
    setTimeout(() => {
      initTokenManagement();
    }, 1000);
  }, [logout]); // 使用稳定的logout引用

  // 🕐 会话管理系统初始化
  useEffect(() => {
    if (!user) return; // 只在已登录时启动会话管理

    console.log('🕐 startingsession管理...');
    
    // 启动用户会话
    SessionService.start(user.id);
    
    // 设置会话事件回调
    SessionService.setCallbacks({
      onSessionWarning: (remainingTime) => {
        console.warn('⚠️ session即将expired，剩余时间:', Math.floor(remainingTime / 1000 / 60), '分钟');
        setSessionWarning(true);
        setSessionRemainingTime(remainingTime);
      },
      onSessionExpired: () => {
        console.warn('💥 sessionexpired，自动登出');
        setSessionWarning(false);
        logout();
      },
      onSessionExtended: (newExpiryTime) => {
        console.log('✅ sessionalready延长至:', new Date(newExpiryTime).toISOString());
        setSessionWarning(false);
      },
      onActivityDetected: () => {
        // 静默处理用户活动，不输出日志避免控制台污染
      },
    });

    return () => {
      // 用户登出时清理会话
      SessionService.end();
    };
  }, [user, logout]);

  const contextValue: UnifiedAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    
    // 会话状态
    sessionWarning,
    sessionRemainingTime,
    
    login,
    register,
    logout,
    checkAuth,
    handleAuthingLogin,
    refreshToken,
    updateUser,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    hasPermission,
    hasRole,
    
    // 会话管理
    extendSession,
    dismissSessionWarning,
    
    // Guard相关方法已移除
    customAuthModalOpen,
    setCustomAuthModalOpen,
    customAuthModalTab,
    setCustomAuthModalTab
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证 Hook
 */
export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext;
