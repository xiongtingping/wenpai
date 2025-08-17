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
  const host = import.meta.env.VITE_AUTHING_DOMAIN || import.meta.env.VITE_AUTHING_HOST || '';
  const redirectUri =
    import.meta.env.VITE_AUTHING_REDIRECT_URI ||
    import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD ||
    import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV ||
    (typeof window !== 'undefined' ? `${window.location.origin}/callback` : '/callback');

  return { appId, host, redirectUri };
};

export const isAuthConfigValid = (cfg: AuthConfig): boolean => !!(cfg.appId && cfg.host && cfg.redirectUri);

