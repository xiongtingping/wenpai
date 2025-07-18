/**
 * Authing 配置文件
 * 直接从环境变量读取配置
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
 * 根据环境获取配置
 * @returns Authing 配置对象
 */
export const getAuthingConfig = (): AuthingConfig => {
  const appId = import.meta.env.VITE_AUTHING_APP_ID || '';
  // 确保host格式正确，移除协议前缀
  const host = (import.meta.env.VITE_AUTHING_HOST || '').replace(/^https?:\/\//, '');
  
  // 根据环境设置回调地址
  let redirectUri = '';
  if (import.meta.env.DEV) {
    // 动态获取当前端口号
    const currentPort = window.location.port || '5173';
    redirectUri = `http://localhost:${currentPort}/callback`;
  } else {
    redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
  }
  
  console.log('🔧 Authing配置:', {
    appId,
    host,
    redirectUri,
    env: import.meta.env.MODE,
    currentPort: window.location.port
  });
  
  return {
    appId,
    host,
    redirectUri,
    mode: 'modal',
    defaultScene: 'login',
  };
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
    // 弹窗模式额外配置
    autoRegister: false, // 禁用自动注册
    skipComplateFileds: false, // 不跳过必填字段
    skipComplateFiledsPlace: 'modal', // 在弹窗中完成字段
    closeable: true, // 允许关闭弹窗
    clickCloseableMask: true, // 点击遮罩关闭
    // 登录配置
    loginMethodList: ['password', 'phone-code', 'email-code'], // 支持的登录方式
    // 注册配置
    registerMethodList: ['phone', 'email'], // 支持的注册方式
    // 界面配置
    logo: 'https://cdn.authing.co/authing-console/logo.png', // 默认 logo
    title: '文派', // 应用标题
    // 国际化
    lang: 'zh-CN', // 中文
  };
}; 