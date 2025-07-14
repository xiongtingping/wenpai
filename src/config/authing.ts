/**
 * Authing 配置文件
 * 包含 Authing 应用的配置信息
 */

/**
 * Authing 应用配置接口
 */
export interface AuthingConfig {
  /** Authing 应用 ID */
  appId: string;
  /** Authing 域名 */
  host: string;
  /** 重定向 URI */
  redirectUri: string;
  /** 认证模式 */
  mode: 'modal' | 'normal';
  /** 默认场景 */
  defaultScene: 'login' | 'register';
}

/**
 * 开发环境配置
 */
const devConfig: AuthingConfig = {
  appId: import.meta.env.VITE_AUTHING_APP_ID || '6867fdc88034eb95ae86167d',
  host: import.meta.env.VITE_AUTHING_HOST || 'https://qutkgzkfaezk-demo.authing.cn',
  redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || `${window.location.origin}/callback`,
  mode: 'normal',
  defaultScene: 'login',
};

/**
 * 生产环境配置
 */
const prodConfig: AuthingConfig = {
  appId: import.meta.env.VITE_AUTHING_APP_ID || '6867fdc88034eb95ae86167d',
  host: import.meta.env.VITE_AUTHING_HOST || 'https://qutkgzkfaezk-demo.authing.cn',
  redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || `${window.location.origin}/callback`,
  mode: 'normal',
  defaultScene: 'login',
};

/**
 * 根据环境获取配置
 * @returns Authing 配置对象
 */
export const getAuthingConfig = (): AuthingConfig => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? devConfig : prodConfig;
};

/**
 * 获取 Authing 应用 ID
 * @returns 应用 ID
 */
export const getAuthingAppId = (): string => {
  return getAuthingConfig().appId;
};

/**
 * 获取 Authing 配置对象（用于 Guard 组件）
 * @returns Guard 配置对象
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  return {
    appId: config.appId,
    host: config.host,
    redirectUri: config.redirectUri,
    mode: config.mode,
    defaultScene: config.defaultScene,
  };
}; 