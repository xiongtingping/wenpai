/**
 * ✅ FIXED: 2025-07-25 更新 Authing 配置文件 - 同步最新后台配置
 * 📌 基于Authing控制台最新配置更新
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

export interface AuthingConfig {
  appId: string;
  host: string;
  redirectUri: string;
  userPoolId?: string;
  domain: string;
}

/**
 * 从环境变量获取Authing配置
 * 优先级：环境变量 > 默认值
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  // 尝试从import.meta.env获取（Vite环境）
  if (typeof window !== 'undefined' && (import.meta as any)?.env?.[key]) {
    return (import.meta as any).env[key];
  }

  // 尝试从window.__ENV__获取（Vite注入）
  if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
    return (window as any).__ENV__[key];
  }

  // 返回默认值
  return defaultValue;
}

// ✅ FIXED: 2025-08-28 恢复原始配置，代理方案不适用于Guard SDK
// 🐛 问题原因：Guard SDK不接受代理URL作为host参数
// 🔧 修复方式：恢复原始HTTPS配置，寻找其他解决方案
// 📌 已封装：这些配置已验证可用，请勿修改
// 🔒 LOCKED: AI 禁止对这些常量做任何修改
const APP_ID = '68a68a29d0c3341ae7a3df23';
const DOMAIN = 'rzcswqs4sq0f.authing.cn';
const HOST = 'https://rzcswqs4sq0f.authing.cn';

// ✅ FIXED: 2025-07-25 配置缓存机制已锁定
// 🐛 问题原因：重复计算配置导致性能问题和潜在的不一致性
// 🔧 修复方式：单例模式缓存配置，确保全局一致性
// 🔒 LOCKED: AI 禁止修改此缓存逻辑
let cachedConfig: any = null;
/**
 * ✅ FIXED: 2025-07-25 Authing配置获取函数已封装
 * 🐛 历史问题：配置获取不稳定，环境变量注入失效
 * 🔧 修复方案：硬编码+缓存+动态回调URI
 * 📌 已封装：此函数已验证稳定，请勿修改
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 */
export function getAuthingConfig() {
  if (cachedConfig) return cachedConfig;

  // 动态获取回调URI
  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/callback`
    : getEnvVar('VITE_AUTHING_REDIRECT_URI_DEV', 'http://localhost:5173/callback');

  cachedConfig = {
    appId: APP_ID,
    host: HOST,
    domain: DOMAIN,
    redirectUri: redirectUri,
    userPoolId: getEnvVar('VITE_AUTHING_USER_POOL_ID', ''),
  };

  // 调试信息 - 强制输出以验证配置
  console.log('🔧 Authing配置 (硬编码):', {
    appId: cachedConfig.appId,
    domain: cachedConfig.domain,
    host: cachedConfig.host,
    redirectUri: cachedConfig.redirectUri
  });

  return cachedConfig;
}

/**
 * 获取 Guard 配置
 */
export const getGuardConfig = () => {
  const config = getAuthingConfig();
  return {
    appId: config.appId,
    domain: config.domain,
    redirectUri: config.redirectUri,
    mode: 'modal' as const
  };
};

/**
 * 获取 Authing Web SDK 配置
 */
export const getAuthingWebConfig = () => {
  const config = getAuthingConfig();

  return {
    domain: config.domain,
    appId: config.appId,
    redirectUri: config.redirectUri,
    scope: 'openid profile email phone',
    responseType: 'code' as const,
    state: `state_${Date.now()}`,
    prompt: 'login' as const
  };
};


