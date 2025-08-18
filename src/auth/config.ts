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
  const hostName = window.location.hostname;

  let redirectUri: string;

  if (isDev) {
    // 开发环境
    redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
  } else if (hostName === 'www.wenpai.xyz') {
    // 生产环境 - 强制使用生产域名
    redirectUri = 'https://www.wenpai.xyz/callback';
  } else {
    // Netlify 预览或其他环境 - 使用当前域名
    redirectUri = `${window.location.origin}/callback`;
  }

  console.log('🔧 Auth配置:', { appId, host, redirectUri, isDev });

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

