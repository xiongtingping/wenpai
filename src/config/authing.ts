/**
 * ✅ FIXED: 2025-01-05 创建 Authing 配置文件
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

export interface AuthingConfig {
  appId: string;
  host: string;
  redirectUri: string;
  userPoolId?: string;
}

const APP_ID = import.meta.env.VITE_AUTHING_APP_ID;
const HOST = 'ai-wenpai.authing.cn';
const APP_HOST = `https://${HOST}/${APP_ID}`;
const REDIRECT_URI = `${window.location.origin}/callback`;

let cachedConfig: any = null;
export function getAuthingConfig() {
  if (cachedConfig) return cachedConfig;
  cachedConfig = {
    appId: APP_ID,
    host: HOST,
    appHost: APP_HOST,
    redirectUri: REDIRECT_URI,
    userPoolId: import.meta.env.VITE_AUTHING_USER_POOL_ID || '',
  };
  return cachedConfig;
}

/**
 * 获取 Guard 配置
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  return {
    appId: config.appId,
    domain: config.host.replace('https://', ''),
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
    domain: config.host.replace('https://', ''),
    appId: config.appId,
    redirectUri: config.redirectUri,
    scope: 'openid profile email phone',
    responseType: 'code' as const,
    state: `state_${Date.now()}`,
    prompt: 'login' as const
  };
}; 