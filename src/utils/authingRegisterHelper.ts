// import i18n from '@/i18n'; // 改为动态导入避免TDZ
/**
 * Authing注册助手
 * 处理注册端点检测和多端点尝试策略
 */

import { logger } from '@/utils/logger';

export interface RegisterConfig {
  appId: string;
  host: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  nonce: string;
}

/**
 * 检测注册端点是否可用
 */
async function checkRegisterEndpoint(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    // 200, 302, 或者404都可能是有效的（404可能是因为缺少参数）
    return response.status < 500;
  } catch (e) {
    return false;
  }
}

/**
 * 生成注册URL的多种变体
 */
function generateRegisterUrlVariants(config: RegisterConfig): string[] {
  const { appId, host, redirectUri, state, codeChallenge, nonce } = config;
  
  const baseParams = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    response_mode: 'query'
  });

  const variants = [
    // 变体1: 专用注册端点
    {
      url: `${host}/${appId}/register`,
      params: new URLSearchParams(baseParams),
      description: 'u64cdu4f5cu5931u8d25'
    },
    
    // 变体2: 注册端点（signup）
    {
      url: `${host}/${appId}/signup`,
      params: new URLSearchParams(baseParams),
      description: '注册端点(signup)'
    },
    
    // 变体3: 登录端点 + screen_hint=signup
    {
      url: `${host}/${appId}/login`,
      params: (() => {
        const p = new URLSearchParams(baseParams);
        p.set('screen_hint', 'signup');
        return p;
      })(),
      description: '登录端点+注册提示'
    },
    
    // 变体4: 登录端点 + goto=register (Authing特有参数)
    {
      url: `${host}/${appId}/login`,
      params: (() => {
        const p = new URLSearchParams(baseParams);
        p.set('goto', '/register');
        return p;
      })(),
      description: '登录端点+注册跳转(goto)'
    },
    
    // 变体5: 标准OIDC端点 + screen_hint
    {
      url: `${host}/oidc/auth`,
      params: (() => {
        const p = new URLSearchParams(baseParams);
        p.set('screen_hint', 'signup');
        return p;
      })(),
      description: '标准OIDC端点+注册提示'
    },
    
    // 变体6: 标准登录端点（备选方案）
    {
      url: `${host}/${appId}/login`,
      params: new URLSearchParams(baseParams),
      description: '标准登录端点(备选)'
    }
  ];

  return variants.map(v => ({
    url: `${v.url}?${v.params.toString()}`,
    description: v.description
  })).map(v => v.url);
}

/**
 * 智能选择最佳注册URL
 */
export async function getBestRegisterUrl(config: RegisterConfig): Promise<{
  url: string;
  method: string;
  tested: boolean;
}> {
  logger.debug('🔍 开始检测最佳注册端点...');
  
  const variants = generateRegisterUrlVariants(config);
  
  // 快速检测模式：只检测前3个变体以避免延迟
  const quickTestVariants = variants.slice(0, 3);
  
  for (let i = 0; i < quickTestVariants.length; i++) {
    const url = quickTestVariants[i];
    const description = [
      'u64cdu4f5cu5931u8d25',
      '注册端点(signup)', 
      '登录端点+注册提示'
    ][i];
    
    logger.debug(`🧪 测试端点 ${i + 1}: ${description}`);
    
    const isAvailable = await checkRegisterEndpoint(url);
    
    if (isAvailable) {
      logger.debug(`✅ 找到可用端点: ${description}`);
      return {
        url,
        method: description,
        tested: true
      };
    }
  }
  
  // 如果所有测试都失败，使用第一个变体作为默认
  logger.warn('⚠️ 所有端点测试都失败，使用默认注册端点');
  return {
    url: variants[0],
    method: '默认注册端点(未测试)',
    tested: false
  };
}

/**
 * 简化版本：直接返回最可能的注册URL（无网络检测）
 */
export function getRegisterUrlFast(config: RegisterConfig): string {
  const { appId: originalAppId, host: originalHost, redirectUri, state, codeChallenge, nonce } = config;

  // ✅ SECURITY FIX: 2025-08-30 使用环境变量，移除硬编码
  const safeAppId = originalAppId || import.meta.env.VITE_AUTHING_APP_ID || (globalThis as any).__ENV__?.VITE_AUTHING_APP_ID;
  const cleanHost = originalHost || import.meta.env.VITE_AUTHING_HOST || (globalThis as any).__ENV__?.VITE_AUTHING_HOST;

  console.log('🔧 配置修复检查:', {
    originalAppId,
    safeAppId,
    originalHost,
    cleanHost,
    wasAppIdFixed: originalAppId !== safeAppId,
    wasHostFixed: originalHost !== cleanHost
  });

  const params = new URLSearchParams({
    client_id: safeAppId,  // 使用安全的App ID
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    response_mode: 'query',
    // 🔧 注册专用参数
    register: 'true',          // 标记为注册请求
    mode: 'register',          // 模式参数
    action: 'register',        // 动作参数
    ui_locales: 'zh-CN'        // 设置语言
  });

  console.log('🔧 注册URL参数检查:', {
    safeAppId,
    cleanHost,
    redirectUri,
    state: state,
    stateDecoded: (() => {
      try {
        return JSON.parse(decodeURIComponent(state));
      } catch (e) {
        return 'Invalid JSON';
      }
    })(),
    hasCodeChallenge: !!codeChallenge,
    forceAuth: true
  });

  // 🔧 使用Authing的注册端点
  // 尝试多种可能的注册URL格式
  const registerEndpoints = [
    `${cleanHost}/${safeAppId}/register`,           // 标准注册端点
    `${cleanHost}/${safeAppId}/signup`,             // 备选注册端点
    `${cleanHost}/${safeAppId}/login?mode=register`, // 登录页面注册模式
    `${cleanHost}/oidc/auth?${params.toString()}&prompt=login&screen_hint=signup`, // OIDC注册
  ];

  console.log('🔧 尝试注册端点:', registerEndpoints);

  // 🔧 使用SSO端点，适配SSO应用类型
  const oidcParams = new URLSearchParams(params);
  oidcParams.set('prompt', 'login');  // Authing支持的prompt值
  oidcParams.set('screen_hint', 'signup');  // 使用screen_hint指示注册

  const oidcUrl = `${cleanHost}/${safeAppId}/oidc/auth?${oidcParams.toString()}`;
  console.log('🔧 尝试OIDC注册URL:', oidcUrl);

  // 备选：标准注册端点
  const standardUrl = `${cleanHost}/${safeAppId}/register?${params.toString()}`;
  console.log('🔧 备选注册URL:', standardUrl);

  // 优先使用OIDC端点
  const finalUrl = oidcUrl;

  // 🔧 URL已通过文件清理脚本修复，直接使用
  const safeFinalUrl = finalUrl;

  return safeFinalUrl;
}

/**
 * 检查当前登录是否为真实登录
 */
export function isRealLogin(): boolean {
  // 检查是否有真实的用户ID（Authing格式）
  const userStr = localStorage.getItem('authing_user');
  if (!userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    // Authing用户ID通常是24位十六进制字符串
    return !!(user.id && user.id.length >= 20 && user.id.match(/^[a-f0-9]+$/i));
  } catch (e) {
    return false;
  }
}

/**
 * 获取当前登录状态信息
 */
export function getLoginStatus(): {
  isLoggedIn: boolean;
  isReal: boolean;
  userId?: string;
  userInfo?: any;
} {
  const userStr = localStorage.getItem('authing_user');
  const token = localStorage.getItem('auth_token');
  
  if (!userStr || !token) {
    return { isLoggedIn: false, isReal: false };
  }
  
  try {
    const user = JSON.parse(userStr);
    const isReal = isRealLogin();
    
    return {
      isLoggedIn: true,
      isReal,
      userId: user.id,
      userInfo: user
    };
  } catch (e) {
    return { isLoggedIn: false, isReal: false };
  }
}
