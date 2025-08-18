/**
 * Auth 模块配置（从环境变量读取）
 */
export interface AuthConfig {
  appId: string;
  host: string; // 如：rzcswqs4sq0f.authing.cn
  redirectUri: string; // e.g. https://www.wenpai.xyz/callback 或本地回调
}

export const getAuthConfig = (): AuthConfig => {
  // 🎯 真正的根因修复：完全硬编码配置，不依赖任何环境变量
  const appId = '68823897631e1ef8ff3720b2';
  const host = 'https://rzcswqs4sq0f.authing.cn';

  // 🔧 运行时域名判断
  const currentOrigin = window.location.origin;
  const hostname = window.location.hostname;

  let redirectUri: string;

  // 精确的环境判断逻辑
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 本地开发环境
    redirectUri = 'http://localhost:5173/callback';
  } else if (currentOrigin === 'https://www.wenpai.xyz') {
    // 生产环境 - 硬编码正确的回调地址
    redirectUri = 'https://www.wenpai.xyz/callback';
  } else {
    // 其他环境（Netlify 预览等）- 使用当前域名
    redirectUri = `${currentOrigin}/callback`;
  }

  console.log('🔧 Auth配置 (完全硬编码):', { appId, host, redirectUri, hostname, currentOrigin });

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

