/**
 * 🔐 OAuth回调处理器
 * 处理认证回调，完成登录流程
 */

import { authService } from './authService';
import { tokenManager } from './tokenManager';
import { logger } from '@/utils/logger';
import { cleanCallbackUrl, extractCallbackParams, fixCurrentCallbackUrl } from '@/utils/callbackUrlFixer';

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
    // 🔧 首先修复URL格式问题
    const wasFixed = fixCurrentCallbackUrl();
    if (wasFixed) {
      logger.info('🔧 已修复回调URL格式');
    }

    // 🔧 使用增强的参数提取器
    const { code, state, error } = extractCallbackParams(window.location.href);
    const errorDescription = new URLSearchParams(window.location.search).get('error_description');

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

    // 兼容 Authing 门户拼接多个回调的误配置场景：仅保留第一个有效回调地址
    try {
      const loc = window.location;
      // 当路径类似 "/callback https://wenpai.xyz/callback ..." 时，pathname 仍是 /callback，但 search 可能包含多余片段
      // 我们严格从当前 URL 的 querystring 解析 code/state，不信任拼接在 path 后的额外字符串
      const qs = new URLSearchParams(loc.search);
      const rawCode = qs.get('code');
      const rawState = qs.get('state');
      if (!rawCode && loc.href.includes('code=')) {
        // 兜底：从整段 href 中切 parse，取首个 code
        const m = loc.href.match(/[?&]code=([^&\s]+)/);
        if (m && !qs.get('code')) {
          qs.set('code', decodeURIComponent(m[1]));
        }
      }
      if (!rawState && loc.href.includes('state=')) {
        const m2 = loc.href.match(/[?&]state=([^&\s]+)/);
        if (m2 && !qs.get('state')) {
          qs.set('state', decodeURIComponent(m2[1]));
        }
      }
    } catch (_e) { /* ignore */ }
    const resp = await fetch('/.netlify/functions/authing-token-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: storedVerifier })
    });

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      logger.error('❌ 授权码交换失败:', {
        status: resp.status,
        statusText: resp.statusText,
        error: errJson
      });
      
      // 提供更详细的用户友好错误信息
      let userMessage = '授权码交换失败';
      if (resp.status === 400) {
        if (errJson.diagnostic?.possible_causes) {
          userMessage = `认证失败 (${resp.status}): ${errJson.diagnostic.possible_causes[0]}`;
        } else if (errJson.detail?.error_description) {
          userMessage = `认证失败: ${errJson.detail.error_description}`;
        } else if (errJson.detail?.error) {
          userMessage = `认证失败: ${errJson.detail.error}`;
        }
      }
      
      return { 
        success: false, 
        error: userMessage
      };
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
