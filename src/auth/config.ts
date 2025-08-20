/**
 * Auth 模块配置（读取环境变量，兼容不同环境）
 */
export interface AuthConfig {
  appId: string;
  host: string; // 带协议，如：https://rzcswqs4sq0f.authing.cn
  redirectUri: string; // e.g. https://www.wenpai.xyz/callback 或本地回调
}

export const getAuthConfig = (): AuthConfig => {
  const clientId = (import.meta as any).env.VITE_AUTHING_CLIENT_ID as string | undefined;
  const appId = (import.meta as any).env.VITE_AUTHING_APP_ID as string | undefined;

  // 🔧 App ID已通过文件清理脚本修复，直接使用环境变量
  const effectiveAppId = appId || '68823897631e1ef8ff3720b2';

  console.log('🔧 Auth配置检查:', {
    envClientId: clientId,
    envAppId: appId,
    effectiveAppId: effectiveAppId,
    source: 'environment-variable'
  });

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

  // 选择 redirectUri：非本地环境一律使用生产回调，避免多域导致的校验分歧
  const h = window.location.hostname;
  const redirectUri = (h === 'localhost' || h === '127.0.0.1')
    ? 'http://localhost:5173/callback'
    : 'https://www.wenpai.xyz/callback';

  const config = { appId: effectiveAppId, host, redirectUri };

  console.log('✅ 最终Auth配置:', config);

  return config;
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

