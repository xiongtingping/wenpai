/**
 * Auth 模块配置（从环境变量读取）
 */
export interface AuthConfig {
  appId: string;
  host: string; // 如：rzcswqs4sq0f.authing.cn
  redirectUri: string; // e.g. https://www.wenpai.xyz/callback 或本地回调
}

export const getAuthConfig = (): AuthConfig => {
  // 🎯 根因修复：完全移除环境变量依赖，使用运行时判断
  const appId = import.meta.env.VITE_AUTHING_APP_ID || '';

  // 优先使用DOMAIN，如果没有则使用HOST，保持完整URL格式
  let host = import.meta.env.VITE_AUTHING_DOMAIN || import.meta.env.VITE_AUTHING_HOST || '';
  // 确保host包含协议
  if (host && !host.startsWith('http')) {
    host = `https://${host}`;
  }

  // 🔧 调试：检查实际的域名值
  const currentOrigin = window.location.origin;
  const hostname = window.location.hostname;

  // 🚨 关键调试：输出实际值
  console.log('🔍 域名调试:', {
    currentOrigin,
    hostname,
    href: window.location.href,
    originMatch: currentOrigin === 'https://www.wenpai.xyz',
    hostnameMatch: hostname === 'www.wenpai.xyz'
  });

  let redirectUri: string;

  // 精确的环境判断逻辑
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 本地开发环境
    redirectUri = 'http://localhost:5173/callback';
    console.log('🔧 使用开发环境回调');
  } else if (currentOrigin === 'https://www.wenpai.xyz') {
    // 生产环境 - 硬编码正确的回调地址
    redirectUri = 'https://www.wenpai.xyz/callback';
    console.log('🎯 使用生产环境回调');
  } else {
    // 其他环境（Netlify 预览等）- 使用当前域名
    redirectUri = `${currentOrigin}/callback`;
    console.log('🔧 使用当前域名回调:', redirectUri);
  }

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

