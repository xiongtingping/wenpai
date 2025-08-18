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

  // 🔧 临时修复：强制使用正确的App ID，避免配置不一致问题
  const correctAppId = '68823897631e1ef8ff3720b2';
  const effectiveAppId = correctAppId; // 强制使用正确的App ID

  console.log('🔧 Auth配置检查:', {
    envClientId: clientId,
    envAppId: appId,
    forcedAppId: effectiveAppId,
    source: 'forced-correct-app-id'
  });

  const domain = (import.meta as any).env.VITE_AUTHING_DOMAIN as string | undefined;
  const hostFromEnv = (import.meta as any).env.VITE_AUTHING_HOST as string | undefined; // 可选：直接提供完整 host

  // 规范化 host（必须含 https:// 前缀）
  const host = hostFromEnv
    ? hostFromEnv.replace(/\/$/, '')
    : domain
      ? `https://${domain.replace(/\/$/, '')}`
      : 'https://rzcswqs4sq0f.authing.cn'; // 默认值

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

