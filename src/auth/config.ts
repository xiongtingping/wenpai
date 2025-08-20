/**
 * 🔐 统一认证配置管理
 * 读取环境变量，兼容不同环境，支持调试日志控制
 */
import { AuthConfig, AuthProviderConfig } from './types';

// 环境检测
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 获取基础认证配置
 */
export const getAuthConfig = (): AuthConfig => {
  const clientId = (import.meta as any).env.VITE_AUTHING_CLIENT_ID as string | undefined;
  const appId = (import.meta as any).env.VITE_AUTHING_APP_ID as string | undefined;

  // 🔧 App ID已通过文件清理脚本修复，直接使用环境变量
  const effectiveAppId = appId || '68823897631e1ef8ff3720b2';

  // 🔒 生产环境关闭调试日志
  if (isDevelopment) {
    console.log('🔧 Auth配置检查:', {
      envClientId: clientId,
      envAppId: appId,
      effectiveAppId: effectiveAppId,
      source: 'environment-variable'
    });
  }

  const domain = (import.meta as any).env.VITE_AUTHING_DOMAIN as string | undefined;
  const hostFromEnv = (import.meta as any).env.VITE_AUTHING_HOST as string | undefined; // 可选：直接提供完整 host

  // 规范化 host（必须含 https:// 前缀）
  const rawHost = hostFromEnv
    ? hostFromEnv.replace(/\/$/, '')
    : domain
      ? `https://${domain.replace(/\/$/, '')}`
      : 'https://rzcswqs4sq0f.authing.cn'; // 默认值

  // 🔧 Host已通过文件清理脚本修复，直接使用环境变量
  const host = rawHost || 'https://rzcswqs4sq0f.authing.cn';

  // 选择 redirectUri：使用动态Origin避免域名解析问题
  const h = window.location.hostname;
  const p = window.location.port;

  let redirectUri: string;

  if (h === 'localhost' || h === '127.0.0.1') {
    // 开发环境：优先使用环境变量，否则使用动态端口
    redirectUri = (import.meta as any).env.VITE_AUTHING_REDIRECT_URI_DEV ||
                  `http://localhost:${p || '5173'}/callback`;
  } else {
    // 生产环境：使用动态Origin解决DNS重定向问题
    // 如果www.wenpai.xyz解析到wenpai.netlify.app，使用实际的Origin
    const dynamicRedirectUri = `${window.location.origin}/callback`;
    redirectUri = (import.meta as any).env.VITE_AUTHING_REDIRECT_URI_PROD ||
                  dynamicRedirectUri;

    // 调试日志：显示Origin vs 配置的差异
    if (isDevelopment) {
      console.log('🔍 RedirectUri分析:', {
        windowOrigin: window.location.origin,
        envConfigured: (import.meta as any).env.VITE_AUTHING_REDIRECT_URI_PROD,
        finalRedirectUri: redirectUri,
        hostnameResolution: h
      });
    }
  }

  const config: AuthConfig = {
    appId: effectiveAppId,
    host,
    redirectUri,
    scope: 'openid profile email phone',
    responseType: 'code',
    responseMode: 'query',
    lang: 'zh-CN'
  };

  // 🔒 生产环境关闭调试日志
  if (isDevelopment) {
    console.log('✅ 最终Auth配置:', config);
  }

  return config;
};

/**
 * 获取完整的认证提供者配置
 */
export const getAuthProviderConfig = (): AuthProviderConfig => {
  const baseConfig = getAuthConfig();

  return {
    config: baseConfig,
    enableDebug: isDevelopment, // 🔒 生产环境关闭调试
    enableAutoRefresh: true,
    refreshThreshold: 5, // 5分钟内过期时自动刷新
    storageKey: 'auth_storage',
    storageType: 'localStorage'
  };
};

/**
 * 检查认证配置是否有效
 */
export const isAuthConfigValid = (config: AuthConfig): boolean => {
  const isValid = !!(config.appId && config.host && config.redirectUri);

  if (!isValid && isDevelopment) {
    console.error('❌ 认证配置无效:', {
      hasAppId: !!config.appId,
      hasHost: !!config.host,
      hasRedirectUri: !!config.redirectUri
    });
  }

  return isValid;
};



