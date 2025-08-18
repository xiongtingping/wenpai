/**
 * Authing注册助手
 * 处理注册端点检测和降级逻辑
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
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 3000
    });
    
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
      description: '专用注册端点'
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
    
    // 变体6: 标准登录端点（降级方案）
    {
      url: `${host}/${appId}/login`,
      params: new URLSearchParams(baseParams),
      description: '标准登录端点(降级)'
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
      '专用注册端点',
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
  const { appId, host, redirectUri, state, codeChallenge, nonce } = config;
  
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    response_mode: 'query',
    screen_hint: 'signup'
    // 移除 prompt: 'signup' - Authing不支持此值
  });

  console.log('🔧 注册URL参数检查:', {
    appId,
    redirectUri,
    state: JSON.parse(state),
    hasCodeChallenge: !!codeChallenge
  });

  // 优先使用专用注册端点
  return `${host}/${appId}/register?${params.toString()}`;
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
