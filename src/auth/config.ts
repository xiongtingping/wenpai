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

  // 🎯 最终修复：强制所有非开发环境都使用生产回调地址
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 本地开发环境
    redirectUri = 'http://localhost:5173/callback';
  } else {
    // 所有其他环境（包括生产和预览）都使用生产回调地址
    // 这样确保无论从哪个域名访问都能正常登录
    redirectUri = 'https://www.wenpai.xyz/callback';
  }

  console.log('🔧 Auth配置 (完全硬编码):', { appId, host, redirectUri, hostname, currentOrigin });

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

