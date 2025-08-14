/**
 * ✅ FIXED: 2025-07-25 更新 Authing 配置文件 - 同步最新后台配置
 * 📌 基于Authing控制台最新配置更新
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

export interface AuthingConfig {
  appId: string;
  host: string; // 完整URL，用于兼容性
  appHost: string; // 纯域名，用于@authing/web
  redirectUri: string;
  userPoolId?: string;
  domain: string;
}

/**
 * 从环境变量获取Authing配置
 * 优先级：环境变量 > 默认值
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  // 尝试从import.meta.env获取（Vite环境）
  if (typeof window !== 'undefined' && (import.meta as any)?.env?.[key]) {
    return (import.meta as any).env[key];
  }

  // 尝试从window.__ENV__获取（Vite注入）
  if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
    return (window as any).__ENV__[key];
  }

  // 返回默认值
  return defaultValue;
}

// ✅ FIXED: 2025-07-25 直接硬编码配置确保正确传递
// 📌 App ID: 68823897631e1ef8ff3720b2 (用户确认)
// 🔒 临时硬编码解决环境变量注入问题
const APP_ID = '68823897631e1ef8ff3720b2';
const DOMAIN = 'rzcswqd4sq0f.authing.cn';
const HOST = 'https://rzcswqd4sq0f.authing.cn';
// 🔧 修复：appHost应该是域名，不包含https://
const APP_HOST = 'rzcswqd4sq0f.authing.cn';

let cachedConfig: any = null;
export function getAuthingConfig() {
  if (cachedConfig) return cachedConfig;

  // 动态获取回调URI - 优先使用环境变量配置
  let redirectUri;
  if (typeof window !== 'undefined') {
    // 检查是否为生产环境
    const isProduction = window.location.hostname.includes('netlify.app') ||
                        window.location.hostname === 'wenpai.netlify.app';

    if (isProduction) {
      // 生产环境使用固定的配置URL
      redirectUri = getEnvVar('VITE_AUTHING_REDIRECT_URI_PROD', 'https://wenpai.netlify.app/callback');
    } else {
      // 开发环境使用开发配置
      redirectUri = getEnvVar('VITE_AUTHING_REDIRECT_URI_DEV', 'http://localhost:5173/callback');
    }
  } else {
    // 服务端渲染时使用开发配置
    redirectUri = getEnvVar('VITE_AUTHING_REDIRECT_URI_DEV', 'http://localhost:5173/callback');
  }

  cachedConfig = {
    appId: APP_ID,
    host: HOST, // 保持完整URL用于兼容性
    appHost: APP_HOST, // 新增：纯域名用于@authing/web
    domain: DOMAIN,
    redirectUri: redirectUri,
    userPoolId: getEnvVar('VITE_AUTHING_USER_POOL_ID', ''),
  };

  // 调试信息 - 强制输出以验证配置
  console.log('🔧 Authing配置 (硬编码):', {
    appId: cachedConfig.appId,
    domain: cachedConfig.domain,
    host: cachedConfig.host,
    redirectUri: cachedConfig.redirectUri
  });

  return cachedConfig;
}

/**
 * 获取 Guard 配置
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  return {
    appId: config.appId,
    domain: config.domain,
    redirectUri: config.redirectUri,
    mode: 'modal' as const
  };
};

/**
 * 获取 Authing Web SDK 配置
 */
export const getAuthingWebConfig = () => {
  const config = getAuthingConfig();

  return {
    domain: config.domain,
    appId: config.appId,
    redirectUri: config.redirectUri,
    scope: 'openid profile email phone',
    responseType: 'code' as const,
    state: `state_${Date.now()}`,
    prompt: 'login' as const
  };
};