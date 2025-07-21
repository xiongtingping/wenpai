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
 * - 问题4: 应用类型不匹配导致400错误
 * - 解决方案: 统一使用新应用配置，动态获取端口和域名，支持标准web应用
 */

/**
 * Authing 应用配置接口
 */
export interface AuthingConfig {
  /** Authing 应用 ID */
  appId: string;
  /** Authing 用户池 ID */
  userPoolId: string;
  /** Authing 域名 */
  host: string;
  /** 重定向 URI */
  redirectUri: string;
  /** 认证范围 */
  scope: string;
  /** 响应类型 */
  responseType: string;
  /** 认证模式 */
  mode: 'modal' | 'normal';
  /** 默认场景 */
  defaultScene: 'login' | 'register';
  /** 应用类型 */
  appType: 'oidc' | 'web';
}

/**
 * 获取 Authing 配置对象
 * 仅支持标准开发端口 5173，回调地址锁定为 http://localhost:5173/callback
 * 生产环境为 https://www.wenpai.xyz/callback
 * ⚠️ 本逻辑已锁定，禁止随意更改。如需变更请单独封装新模块。
 */
export const getAuthingConfig = (): AuthingConfig => {
  const globalEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : {};
  const appId = globalEnv.VITE_AUTHING_APP_ID || import.meta.env.VITE_AUTHING_APP_ID || '687e0aafee2b84f86685b644';
  const userPoolId = globalEnv.VITE_AUTHING_USER_POOL_ID || import.meta.env.VITE_AUTHING_USER_POOL_ID || '687e0aafee2b84f86685b644';
  let host = globalEnv.VITE_AUTHING_HOST || import.meta.env.VITE_AUTHING_HOST || 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644';
  host = host.replace(/^https?:\/\//, '');
  let redirectUri = '';
  if (import.meta.env.DEV) {
    redirectUri = globalEnv.VITE_AUTHING_REDIRECT_URI_DEV || import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
  } else {
    // 支持 Netlify 预览环境
    const netlifyPreview = typeof window !== 'undefined' && window.location && window.location.hostname.endsWith('netlify.app');
    if (netlifyPreview) {
      redirectUri = 'https://wenpai.netlify.app/callback';
    } else {
      redirectUri = globalEnv.VITE_AUTHING_REDIRECT_URI_PROD || import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
    }
  }
  const appType = globalEnv.VITE_AUTHING_APP_TYPE || import.meta.env.VITE_AUTHING_APP_TYPE || 'oidc';
  return {
    appId,
    userPoolId,
    host,
    redirectUri,
    scope: 'openid profile email phone',
    responseType: 'code',
    mode: 'modal',
    defaultScene: 'login',
    appType: appType as 'oidc' | 'web',
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
 * 按照官方文档配置，支持标准web应用和OIDC应用
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
 * - 问题4: 应用类型不匹配导致400错误
 * - 解决方案: 简化配置，禁用自动功能，使用直接重定向模式，支持标准web应用
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  
  // 基础配置
  const baseConfig = {
    appId: config.appId,
    host: config.host,
    mode: 'modal' as const,
    defaultScene: 'login' as const,
    // 弹窗模式配置
    skipComplateFileds: false,
    skipComplateFiledsPlace: 'modal',
    closeable: true,
    clickCloseableMask: true,
    // 登录方式配置
    loginMethodList: ['password', 'phone-code', 'email-code'] as const,
    // 注册方式配置
    registerMethodList: ['phone', 'email'] as const,
    // 界面配置
    logo: 'https://www.wenpai.xyz/logo.png',
    title: '文派AI',
    // 事件处理
    onLogin: (user: any) => {
      console.log('🔐 Guard登录成功:', user);
    },
    onRegister: (user: any) => {
      console.log('🔐 Guard注册成功:', user);
    },
    onError: (error: any) => {
      console.error('❌ Guard错误:', error);
    },
    onClose: () => {
      console.log('🔐 Guard弹窗关闭');
    }
  };
  
  // 根据应用类型添加特定配置
  if (config.appType === 'web') {
    // 标准web应用配置
    console.log('🔧 使用标准web应用配置');
    return {
      ...baseConfig,
      // 标准web应用不需要redirectUri
      // 使用默认的认证流程
    };
  } else {
    // OIDC应用配置
    console.log('🔧 使用OIDC应用配置');
    return {
      ...baseConfig,
      redirectUri: config.redirectUri,
    };
  }
}; 