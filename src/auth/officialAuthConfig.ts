/**
 * 🎯 基于@authing/guard官方SDK的认证配置
 * 使用Guard组件，提供完整的UI和认证流程
 */

import { Guard } from '@authing/guard';

/**
 * 官方SDK配置 - 基于环境变量
 * 🔧 修复: 移除硬编码，使用环境变量配置
 * OAuth2要求发起认证和交换token时使用完全相同的redirect_uri
 */
export const getOfficialAuthConfig = () => {
  // 🔧 修复：Guard需要不带协议的域名
  const domain = import.meta.env.VITE_AUTHING_DOMAIN || 'rzcswqs4sq0f.authing.cn';
  const appId = import.meta.env.VITE_AUTHING_APP_ID || '68a68a29d0c3341ae7a3df23';

  // 🎯 修复：开发环境使用生产回调URL，避免白名单问题
  const getRedirectUri = () => {
    // 🔧 开发环境强制使用生产环境回调URL，因为Authing控制台已配置
    return import.meta.env.VITE_AUTHING_REDIRECT_URI || 'https://www.wenpai.xyz/callback';
  };

  return {
    domain,
    appId,
    redirectUri: getRedirectUri(),
  };
};

/**
 * 验证配置有效性
 */
function validateConfig(config: any): void {
  const errors: string[] = [];

  if (!config.appId || config.appId.length < 10) {
    errors.push('App ID 无效或缺失');
  }

  if (!config.domain || !config.domain.includes('authing.cn')) {
    errors.push('域名配置无效');
  }

  if (!config.redirectUri || !config.redirectUri.startsWith('http')) {
    errors.push('回调URL配置无效');
  }

  if (errors.length > 0) {
    throw new Error(`Authing配置验证失败: ${errors.join(', ')}`);
  }
}

/**
 * 创建官方Guard实例，增强配置验证和错误处理
 */
export function createOfficialAuthSDK(): Guard {
  const config = getOfficialAuthConfig();

  // 🔧 配置验证
  try {
    validateConfig(config);
  } catch (error) {
    console.error('❌ Authing配置验证失败:', error);
    throw error;
  }

  console.log('🎯 创建官方Authing Guard实例...', {
    domain: config.domain,
    appId: config.appId,
    redirectUriLength: config.redirectUri.length
  });

  try {
    // 🔧 强制清除可能的缓存问题
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('authing')) {
            caches.delete(name);
            console.log('🧹 清除Authing相关缓存:', name);
          }
        });
      });
    }

    console.log('🎯 创建Guard实例，配置:', {
      appId: config.appId,
      domain: config.domain,
      redirectUri: config.redirectUri
    });

    // 🔧 根因修复：使用正确的Guard配置
    console.log('🎯 使用正确的Guard配置，避免技术债务');

    // 🔧 根因修复：使用正确的host配置格式
    const guard = new Guard({
      appId: config.appId,
      host: `https://${config.domain}`, // ✅ 提供完整的URL格式
      redirectUri: config.redirectUri,
      mode: 'modal'
    });

    console.log('✅ Guard实例创建成功');
    return guard;
  } catch (error) {
    console.error('❌ Guard实例创建失败:', error);
    throw new Error('认证组件初始化失败，请检查网络连接或联系技术支持');
  }
}

/**
 * 导出配置供其他地方使用
 */
export { getOfficialAuthConfig as authConfig };