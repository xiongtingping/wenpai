/**
 * 统一认证Hook
 * 提供Authing和自建后台功能的统一接口
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import unifiedAuthService from '@/services/unifiedAuthService';
import { User } from '@/types/user';
import { securityUtils } from '@/lib/security';

/**
 * 统一认证Hook返回值
 */
interface UseUnifiedAuthReturn {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Authing功能
  login: (method: 'password' | 'code' | 'social', credentials: any) => Promise<void>;
  register: (method: 'email' | 'phone', userInfo: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (updates: Partial<User>) => Promise<void>;
  getUserRoles: () => Promise<string[]>;
  assignRole: (roleCode: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  sendEmailCode: (email: string, scene?: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_EMAIL') => Promise<void>;
  sendSmsCode: (phone: string, scene?: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_PHONE') => Promise<void>;

  // 自建后台功能
  generateInviteLink: () => Promise<string>;
  bindInviteRelation: (inviterId: string, inviteeId: string) => Promise<void>;
  processInviteReward: (inviterId: string, inviteeId: string) => Promise<void>;
  distributeMonthlyUsage: (userTier: string) => Promise<void>;
  getUserBalance: () => Promise<any>;
  updateUserBalance: (updates: any) => Promise<void>;
  getInviteRelations: () => Promise<any[]>;
  getUserUsage: () => Promise<any>;
  recordUserAction: (action: string, data: any) => Promise<void>;

  // 工具方法
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * 统一认证Hook
 * @returns 统一认证功能
 */
export function useUnifiedAuth(): UseUnifiedAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * 设置错误信息
   */
  const setErrorWithToast = useCallback((errorMessage: string, showToast: boolean = true) => {
    setError(errorMessage);
    if (showToast) {
      toast({
        title: "操作失败",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      securityUtils.secureLog('开始刷新用户信息');
      
      const currentUser = await unifiedAuthService.getCurrentUser();
      securityUtils.secureLog('getCurrentUser结果', { 
        hasUser: !!currentUser,
        userId: currentUser?.id,
        username: currentUser?.username
      });
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        securityUtils.secureLog('用户信息刷新成功', { 
          userId: currentUser.id,
          username: currentUser.username,
          isAuthenticated: true
        });
      } else {
        setUser(null);
        setIsAuthenticated(false);
        securityUtils.secureLog('用户未登录，状态已重置');
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      setUser(null);
      setIsAuthenticated(false);
      securityUtils.secureLog('刷新用户信息失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ==================== Authing功能 ====================

  /**
   * 登录
   */
  const login = useCallback(async (method: 'password' | 'code' | 'social', credentials: any) => {
    try {
      setLoading(true);
      clearError();
      
      const userInfo = await unifiedAuthService.login(method, credentials);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });
      
      securityUtils.secureLog('用户登录成功', { userId: userInfo.id, method });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('用户登录失败', { method, error: errorMessage }, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 注册
   */
  const register = useCallback(async (method: 'email' | 'phone', userInfo: any) => {
    try {
      setLoading(true);
      clearError();
      
      const newUser = await unifiedAuthService.register(method, userInfo);
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast({
        title: "注册成功",
        description: "欢迎加入文派！"
      });
      
      securityUtils.secureLog('用户注册成功', { userId: newUser.id, method });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('用户注册失败', { method, error: errorMessage }, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      await unifiedAuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "登出成功",
        description: "已安全退出"
      });
      
      securityUtils.secureLog('用户登出成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('用户登出失败', { error: errorMessage }, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 更新用户信息
   */
  const updateUserInfo = useCallback(async (updates: Partial<User>) => {
    try {
      clearError();
      
      const updatedUser = await unifiedAuthService.updateUserInfo(updates);
      setUser(updatedUser);
      
      toast({
        title: "更新成功",
        description: "用户信息已更新"
      });
      
      securityUtils.secureLog('用户信息更新成功', { userId: updatedUser.id, updates });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('用户信息更新失败', { updates, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 获取用户角色
   */
  const getUserRoles = useCallback(async (): Promise<string[]> => {
    try {
      clearError();
      const roles = await unifiedAuthService.getUserRoles();
      securityUtils.secureLog('获取用户角色成功', { userId: user?.id, roles });
      return roles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取角色失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('获取用户角色失败', { error: errorMessage }, 'error');
      return [];
    }
  }, [setErrorWithToast, clearError, user?.id]);

  /**
   * 发送邮箱验证码
   */
  const sendEmailCode = useCallback(async (email: string, scene: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_EMAIL' = 'LOGIN') => {
    try {
      clearError();
      
      await unifiedAuthService.sendEmailCode(email, scene);
      
      toast({
        title: "验证码已发送",
        description: "请检查邮箱收件箱和垃圾邮件文件夹"
      });
      
      securityUtils.secureLog('邮箱验证码发送成功', { email, scene });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('邮箱验证码发送失败', { email, scene, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 发送短信验证码
   */
  const sendSmsCode = useCallback(async (phone: string, scene: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_PHONE' = 'LOGIN') => {
    try {
      clearError();
      
      await unifiedAuthService.sendSmsCode(phone, scene);
      
      toast({
        title: "验证码已发送",
        description: "请查看手机短信"
      });
      
      securityUtils.secureLog('短信验证码发送成功', { phone, scene });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('短信验证码发送失败', { phone, scene, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 分配角色
   */
  const assignRole = useCallback(async (roleCode: string) => {
    try {
      clearError();
      
      await unifiedAuthService.assignRole(roleCode);
      
      toast({
        title: "角色分配成功",
        description: `已分配角色: ${roleCode}`
      });
      
      securityUtils.secureLog('角色分配成功', { userId: user?.id, roleCode });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '角色分配失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('角色分配失败', { roleCode, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast, user?.id]);

  /**
   * 刷新Token
   */
  const refreshToken = useCallback(async () => {
    try {
      clearError();
      await unifiedAuthService.refreshToken();
      securityUtils.secureLog('Token刷新成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token刷新失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('Token刷新失败', { error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError]);

  // ==================== 自建后台功能 ====================

  /**
   * 生成邀请链接
   */
  const generateInviteLink = useCallback(async (): Promise<string> => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      const inviteLink = await unifiedAuthService.generateInviteLink(user.id);
      securityUtils.secureLog('生成邀请链接成功', { userId: user.id, inviteLink });
      return inviteLink;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成邀请链接失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('生成邀请链接失败', { userId: user.id, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError]);

  /**
   * 绑定邀请关系
   */
  const bindInviteRelation = useCallback(async (inviterId: string, inviteeId: string) => {
    try {
      clearError();
      
      await unifiedAuthService.bindInviteRelation(inviterId, inviteeId);
      
      toast({
        title: "邀请关系绑定成功",
        description: "邀请关系已建立"
      });
      
      securityUtils.secureLog('邀请关系绑定成功', { inviterId, inviteeId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '绑定邀请关系失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('绑定邀请关系失败', { inviterId, inviteeId, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 处理邀请奖励
   */
  const processInviteReward = useCallback(async (inviterId: string, inviteeId: string) => {
    try {
      clearError();
      
      await unifiedAuthService.processInviteReward(inviterId, inviteeId);
      
      toast({
        title: "邀请奖励发放成功",
        description: "双方各获得20次使用机会"
      });
      
      securityUtils.secureLog('邀请奖励处理成功', { inviterId, inviteeId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '处理邀请奖励失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('处理邀请奖励失败', { inviterId, inviteeId, error: errorMessage }, 'error');
      throw error;
    }
  }, [setErrorWithToast, clearError, toast]);

  /**
   * 每月使用次数发放
   */
  const distributeMonthlyUsage = useCallback(async (userTier: string) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      
      await unifiedAuthService.distributeMonthlyUsage(user.id, userTier);
      
      toast({
        title: "使用次数发放成功",
        description: "本月使用次数已发放"
      });
      
      securityUtils.secureLog('每月使用次数发放成功', { userId: user.id, userTier });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发放使用次数失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('每月使用次数发放失败', { userId: user.id, userTier, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError, toast]);

  /**
   * 获取用户余额
   */
  const getUserBalance = useCallback(async () => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      const balance = await unifiedAuthService.getUserBalance(user.id);
      securityUtils.secureLog('获取用户余额成功', { userId: user.id, balance });
      return balance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取用户余额失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('获取用户余额失败', { userId: user.id, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError]);

  /**
   * 更新用户余额
   */
  const updateUserBalance = useCallback(async (updates: any) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      
      await unifiedAuthService.updateUserBalance(user.id, updates);
      
      toast({
        title: "余额更新成功",
        description: "用户余额已更新"
      });
      
      securityUtils.secureLog('用户余额更新成功', { userId: user.id, updates });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新用户余额失败';
      setErrorWithToast(errorMessage);
      securityUtils.secureLog('更新用户余额失败', { userId: user.id, updates, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError, toast]);

  /**
   * 获取邀请关系
   */
  const getInviteRelations = useCallback(async () => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      const relations = await unifiedAuthService.getInviteRelations(user.id);
      securityUtils.secureLog('获取邀请关系成功', { userId: user.id, relations });
      return relations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取邀请关系失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('获取邀请关系失败', { userId: user.id, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError]);

  /**
   * 获取用户使用情况
   */
  const getUserUsage = useCallback(async () => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      const usage = await unifiedAuthService.getUserUsage(user.id);
      securityUtils.secureLog('获取用户使用情况成功', { userId: user.id, usage });
      return usage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取用户使用情况失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('获取用户使用情况失败', { userId: user.id, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError]);

  /**
   * 记录用户行为
   */
  const recordUserAction = useCallback(async (action: string, data: any) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      clearError();
      await unifiedAuthService.recordUserAction(user.id, action, data);
      securityUtils.secureLog('用户行为记录成功', { userId: user.id, action, data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '记录用户行为失败';
      setErrorWithToast(errorMessage, false);
      securityUtils.secureLog('记录用户行为失败', { userId: user.id, action, data, error: errorMessage }, 'error');
      throw error;
    }
  }, [user, setErrorWithToast, clearError]);

  return {
    // 用户状态
    user,
    isAuthenticated,
    loading,
    error,

    // Authing功能
    login,
    register,
    logout,
    updateUserInfo,
    getUserRoles,
    assignRole,
    refreshToken,
    sendEmailCode,
    sendSmsCode,

    // 自建后台功能
    generateInviteLink,
    bindInviteRelation,
    processInviteReward,
    distributeMonthlyUsage,
    getUserBalance,
    updateUserBalance,
    getInviteRelations,
    getUserUsage,
    recordUserAction,

    // 工具方法
    refreshUser,
    clearError,
  };
} 