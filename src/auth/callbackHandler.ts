/**
 * 🔐 OAuth回调处理器
 * 处理认证回调，完成登录流程
 */

import { authService } from './authService';
import { tokenManager } from './tokenManager';
import { logger } from '@/utils/logger';

export interface CallbackResult {
  success: boolean;
  user?: any;
  error?: string;
  redirectTo?: string;
}

/**
 * 处理OAuth回调
 */
export const handleAuthCallback = async (): Promise<CallbackResult> => {
  try {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    // 检查是否有错误
    if (error) {
      logger.error('❌ OAuth回调错误:', { error, errorDescription });
      return {
        success: false,
        error: errorDescription || error
      };
    }

    // 检查是否有授权码
    if (!code) {
      logger.error('❌ 缺少授权码');
      return {
        success: false,
        error: '缺少授权码'
      };
    }

    logger.info('🔐 处理OAuth回调', { hasCode: !!code, state });

    // 使用授权码登录
    const user = await authService.loginWithCode(code, state || undefined);

    // 清除URL参数
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    logger.info('✅ OAuth回调处理成功', { userId: user.id });

    return {
      success: true,
      user,
      redirectTo: state || '/'
    };
  } catch (error) {
    logger.error('❌ OAuth回调处理失败:', error);
    
    // 清除可能的错误状态
    tokenManager.clearAll();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '回调处理失败'
    };
  }
};

/**
 * 检查当前页面是否为OAuth回调页面
 */
export const isCallbackPage = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') || urlParams.has('error');
};

/**
 * 自动处理OAuth回调（如果当前页面是回调页面）
 */
export const autoHandleCallback = async (): Promise<CallbackResult | null> => {
  if (isCallbackPage()) {
    return await handleAuthCallback();
  }
  return null;
};
