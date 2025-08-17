/**
 * Auth 模块配置（从环境变量读取）
 */
export interface AuthConfig {
  appId: string;
  host: string; // 如：rzcswqs4sq0f.authing.cn
  redirectUri: string; // e.g. https://www.wenpai.xyz/callback 或本地回调
}

export const getAuthConfig = (): AuthConfig => {
  const appId = import.meta.env.VITE_AUTHING_APP_ID || '';

  // 优先使用DOMAIN，如果没有则使用HOST，保持完整URL格式
  let host = import.meta.env.VITE_AUTHING_DOMAIN || import.meta.env.VITE_AUTHING_HOST || '';
  // 确保host包含协议
  if (host && !host.startsWith('http')) {
    host = `https://${host}`;
  }

  // 根据环境选择回调地址
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
  let redirectUri = isDev
    ? (import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback')
    : (import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || `${window.location.origin}/callback`);

  // 重要：在 Netlify 预览/临时域名下，强制使用当前域名作为回调，避免 redirect_uri 与预览域名不匹配
  const hostName = window.location.hostname;
  if (!isDev && (hostName.endsWith('netlify.app') || hostName.includes('--'))) {
    redirectUri = `${window.location.origin}/callback`;
  }

  console.log('🔧 Auth配置:', { appId, host, redirectUri, isDev });

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

