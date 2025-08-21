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

    // 使用 Netlify Function 完成授权码交换（支持：PKCE 或 服务端 client_secret）
    const storedVerifier = localStorage.getItem('pkce_code_verifier') || undefined;
    const resp = await fetch('/.netlify/functions/authing-token-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: storedVerifier })
    });

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      logger.error('❌ 授权码交换失败:', errJson);
      return { success: false, error: errJson.error || '授权码交换失败' };
    }

    const data = await resp.json();
    const accessToken = data?.tokens?.access_token || '';
    const refreshToken = data?.tokens?.refresh_token || undefined;
    const userInfo = data?.userInfo || {};

    // 标准化用户信息并持久化
    const user = authService.normalizeAuthUser(userInfo || {});
    user.token = accessToken;

    tokenManager.setUser(user);
    tokenManager.setTokenInfo({
      accessToken,
      refreshToken,
      expiresAt: data?.tokens?.expires_in ? new Date(Date.now() + (data.tokens.expires_in * 1000)).toISOString() : new Date(Date.now() + 24*60*60*1000).toISOString(),
      tokenType: data?.tokens?.token_type || 'Bearer',
      scope: data?.tokens?.scope || ''
    });

    // 清理 URL 参数
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    logger.info('✅ OAuth回调处理成功', { hasUser: !!user });

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
