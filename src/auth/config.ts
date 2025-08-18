/**
 * Auth 模块配置（读取环境变量，兼容不同环境）
 */
export interface AuthConfig {
  appId: string;
  host: string; // 带协议，如：https://rzcswqs4sq0f.authing.cn
  redirectUri: string; // e.g. https://www.wenpai.xyz/callback 或本地回调
}

export const getAuthConfig = (): AuthConfig => {
  const appId = (import.meta as any).env.VITE_AUTHING_APP_ID as string;
  const domain = (import.meta as any).env.VITE_AUTHING_DOMAIN as string | undefined;
  const hostFromEnv = (import.meta as any).env.VITE_AUTHING_HOST as string | undefined; // 可选：直接提供完整 host

  // 规范化 host（必须含 https:// 前缀）
  const host = hostFromEnv
    ? hostFromEnv.replace(/\/$/, '')
    : domain
      ? `https://${domain.replace(/\/$/, '')}`
      : '';

  // 选择 redirectUri：根据当前域名映射到已在白名单中的精确地址
  const h = window.location.hostname;
  let redirectUri = '';
  if (h === 'localhost' || h === '127.0.0.1') {
    redirectUri = 'http://localhost:5173/callback';
  } else if (h === 'www.wenpai.xyz') {
    redirectUri = 'https://www.wenpai.xyz/callback';
  } else if (h === 'preview.wenpai.xyz') {
    redirectUri = 'https://preview.wenpai.xyz/callback';
  } else if (h.endsWith('netlify.app')) {
    // 预览/分支环境统一回调到根 Netlify 域，避免子域不在白名单
    redirectUri = 'https://wenpai.netlify.app/callback';
  } else {
    // 兜底：使用生产域
    redirectUri = 'https://www.wenpai.xyz/callback';
  }

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

