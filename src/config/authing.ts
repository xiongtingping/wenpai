/**
 * 🔧 [UNIFIED_AUTH_CONFIG_v2025.08.15]
 * 统一认证配置管理 - 系统性架构优化
 *
 * 这是整个应用的统一认证配置中心，提供：
 * 1. 环境变量的统一管理
 * 2. Authing SDK的配置标准化
 * 3. 开发/生产环境的配置隔离
 * 4. 配置验证和错误处理
 *
 * 🔒 LOCKED: 核心配置已验证，请勿随意修改
 */

export interface AuthingConfig {
  appId: string;
  host: string;
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

/**
 * 强力净化回调 URL：
 * - 仅允许一个协议头
 * - 若检测到多个 http(s):// 或 callbackhttp 拼接，则回退到 origin/callback
 */
function sanitizeRedirectUri(raw: string, origin: string): string {
  try {
    if (!raw) return `${origin}/callback`;
    const decoded = decodeURIComponent(raw);
    const protocolCount = (decoded.match(/https?:\/\//g)?.length || 0);
    const hasBadConcat = /callbackhttps?:\/\//i.test(decoded) || decoded.includes('/callbackhttp');
    if (protocolCount > 1 || hasBadConcat) return `${origin}/callback`;
    return decoded;
  } catch {
    return `${origin}/callback`;
  }
}


// ✅ FIXED: 2025-07-25 直接硬编码配置确保正确传递
// 📌 App ID: 68823897631e1ef8ff3720b2 (用户确认)
// 🔒 临时硬编码解决环境变量注入问题
const APP_ID = '68823897631e1ef8ff3720b2';
const DOMAIN = 'rzcswqs4sq0f.authing.cn';
// HOST 保持为纯域名（带协议），以兼容 Guard 初始化；构造 OIDC 端点时再拼接 /{appId}
const HOST = `https://${DOMAIN}`;

let cachedConfig: any = null;
export function getAuthingConfig() {
  if (cachedConfig) return cachedConfig;

  // 动态获取回调URI（生产环境统一使用主域，避免 Netlify 预览域不在白名单）
  let redirectUri = 'http://localhost:5173/callback';
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const isProdHost = hostname === 'www.wenpai.xyz' || hostname === 'wenpai.xyz';
    const envOverride = (window as any).__ENV__?.VITE_AUTHING_REDIRECT_URI || (import.meta as any)?.env?.VITE_AUTHING_REDIRECT_URI;
    const cleaned = sanitizeRedirectUri(envOverride || '', origin);

    if (isProdHost) {
      // 生产环境：严格按照当前访问域名生成回调，支持 apex 与 www 双域
      redirectUri = `${origin}/callback`;
    } else if (envOverride && cleaned === envOverride) {
      // 非生产环境才允许使用外部覆盖
      redirectUri = envOverride;
    } else if (/\.netlify\.app$/i.test(origin) && origin.includes('--')) {
      // Netlify Deploy Preview → 仍保持原有逻辑
      redirectUri = 'https://wenpai.netlify.app/callback';
    } else {
      redirectUri = `${origin}/callback`;
    }
  }

  cachedConfig = {
    appId: APP_ID,
    host: HOST,
    domain: DOMAIN,
    redirectUri: redirectUri,
    userPoolId: '688237f7f9e118de849dc274', // 🔧 同步最新用户池 ID
  };

  // 调试信息 - 强制输出以验证配置（按照成功备份格式）
  console.log('🔧 Authing配置 (硬编码):', cachedConfig);

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
    prompt: 'login' as const,
    userPoolId: (window as any).__ENV__?.VITE_AUTHING_USER_POOL_ID || (import.meta as any)?.env?.VITE_AUTHING_USER_POOL_ID || '688237f7f9e118de849dc274'
  };
};