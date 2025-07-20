/**
 * Authing 配置文件
 * 按照官方文档配置Guard组件
 * 参考: https://docs.authing.cn/v2/reference/guard/v2/react.html
 * 
 * ✅ FIXED: 根据Authing控制台实际配置更新，已于2025年修复
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 * 
 * 修复历史：
 * - 问题1: 使用旧App ID导致"用户池不存在"错误
 * - 问题2: 域名配置错误导致JSON解析失败
 * - 问题3: 回调地址配置错误导致重定向失败
 * - 解决方案: 统一使用新应用配置，动态获取端口和域名
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
 * 动态获取当前端口号
 * @returns 当前端口号
 */
const getCurrentPort = (): string => {
  // 优先使用 window.location.port
  if (typeof window !== 'undefined' && window.location.port) {
    return window.location.port;
  }
  
  // 如果 window.location.port 为空，尝试从 URL 解析
  if (typeof window !== 'undefined' && window.location.href) {
    const url = new URL(window.location.href);
    if (url.port) {
      return url.port;
    }
  }
  
  // 默认端口
  return '5173';
};

/**
 * 检查是否使用 Netlify dev 服务
 * @returns 是否使用 Netlify dev
 */
const isUsingNetlifyDev = (): boolean => {
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // Netlify dev 通常使用 8888 端口
    return port === '8888';
  }
  return false;
};

/**
 * 根据环境获取配置
 * @returns Authing 配置对象
 * 
 * ✅ FIXED: 该函数曾因Authing配置错误导致JSON解析错误和HTML错误，已于2024年修复
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 * 
 * 修复历史：
 * - 问题1: 使用旧App ID导致"用户池不存在"错误
 * - 问题2: 域名配置错误导致JSON解析失败
 * - 问题3: 回调地址配置错误导致重定向失败
 * - 解决方案: 统一使用新应用配置，动态获取端口和域名
 */
export const getAuthingConfig = (): AuthingConfig => {
  // 优先使用全局环境变量，回退到 import.meta.env
  const globalEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : {};
  
  // 使用Authing控制台中的实际App ID
  const appId = globalEnv.VITE_AUTHING_APP_ID || import.meta.env.VITE_AUTHING_APP_ID || '687bc631c105de597b993202';
  
  // 获取 Authing 域名配置 - 使用Authing控制台中的实际域名
  let host = globalEnv.VITE_AUTHING_HOST || import.meta.env.VITE_AUTHING_HOST || '';
  
  // 如果环境变量中没有域名，使用Authing控制台中的实际域名
  if (!host) {
    host = 'wenpaiai.authing.cn';
    console.log('🔧 使用Authing控制台中的实际域名: wenpaiai.authing.cn');
  } else {
    console.log('🔧 使用环境变量中的 Authing 域名:', host);
  }
  
  // 确保host格式正确，移除协议前缀
  host = host.replace(/^https?:\/\//, '');
  
  // 根据环境设置回调地址
  let redirectUri = '';
  if (import.meta.env.DEV) {
    // 检查是否使用 Netlify dev 服务
    if (isUsingNetlifyDev()) {
      // 使用 Netlify dev 端口
      redirectUri = 'http://localhost:8888/callback';
      console.log('🔧 使用 Netlify dev 回调地址:', redirectUri);
    } else {
      // 使用 Vite 开发服务器端口
      const currentPort = getCurrentPort();
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      redirectUri = `http://${currentHost}:${currentPort}/callback`;
      console.log('🔧 使用 Vite 开发服务器回调地址:', redirectUri);
      
      // 检查端口是否匹配当前运行端口
      if (typeof window !== 'undefined' && window.location.port && window.location.port !== currentPort) {
        console.log('⚠️ 端口不匹配，使用当前运行端口:', window.location.port);
        redirectUri = `http://${currentHost}:${window.location.port}/callback`;
      }
    }
    
    console.log('🔧 开发环境回调地址:', {
      redirectUri,
      isNetlifyDev: isUsingNetlifyDev(),
      currentPort: getCurrentPort(),
      currentHost: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      fullUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
      env: import.meta.env.MODE
    });
  } else {
    redirectUri = globalEnv.VITE_AUTHING_REDIRECT_URI_PROD || import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
  }
  
  console.log('🔧 Authing配置:', {
    appId,
    host,
    redirectUri,
    env: import.meta.env.MODE,
    isNetlifyDev: isUsingNetlifyDev(),
    currentPort: getCurrentPort(),
    currentHost: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    fullUrl: typeof window !== 'undefined' ? window.location.href : 'unknown'
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
 * 获取 Guard 配置对象（用于 Guard 组件）
 * 按照官方文档配置
 * @returns Guard 配置对象
 * 
 * ✅ FIXED: 该函数曾因Guard配置错误导致初始化失败和JSON解析错误，已于2024年修复
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 * 
 * 修复历史：
 * - 问题1: 复杂配置导致Guard初始化失败
 * - 问题2: 自动获取公共配置导致JSON解析错误
 * - 问题3: 事件监听器导致内存泄漏
 * - 解决方案: 简化配置，禁用自动功能，使用直接重定向模式
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  
  // 使用完整的Guard配置，支持弹窗模式
  const guardConfig = {
    appId: config.appId,
    host: config.host,
    redirectUri: config.redirectUri,
    mode: 'modal' as const,
    defaultScene: 'login' as const,
    // 弹窗模式配置
    autoRegister: false,
    skipComplateFileds: false,
    skipComplateFiledsPlace: 'modal',
    closeable: true,
    clickCloseableMask: true,
    // 登录方式配置
    loginMethodList: ['password', 'phone-code', 'email-code'] as const,
    // 注册方式配置
    registerMethodList: ['phone', 'email'] as const,
    // 界面配置
    logo: 'https://cdn.authing.co/authing-console/logo.png',
    title: '文派',
    lang: 'zh-CN' as const,
    // 调试配置
    debug: import.meta.env.DEV,
    // 禁用自动功能，避免网络请求问题
    disableGuard: true,
    autoCheckLoginStatus: false,
  };
  
  console.log('🔧 Guard 配置:', guardConfig);
  
  return guardConfig;
}; 