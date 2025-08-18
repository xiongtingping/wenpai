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

  // 🔧 强制修复：根据环境选择回调地址
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
  const hostName = window.location.hostname;

  let redirectUri: string;

  // 🎯 关键修复：强制检查生产域名
  console.log('🔍 域名检查:', { hostName, isDev, origin: window.location.origin });

  if (isDev) {
    // 开发环境
    redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
    console.log('🔧 使用开发环境回调:', redirectUri);
  } else if (hostName === 'www.wenpai.xyz' || window.location.origin === 'https://www.wenpai.xyz') {
    // 生产环境 - 强制使用生产域名（双重检查）
    redirectUri = 'https://www.wenpai.xyz/callback';
    console.log('🎯 强制使用生产环境回调:', redirectUri);
  } else {
    // Netlify 预览或其他环境 - 使用当前域名
    redirectUri = `${window.location.origin}/callback`;
    console.log('🔧 使用当前域名回调:', redirectUri);
  }

  console.log('🔧 Auth配置:', { appId, host, redirectUri, isDev });

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

