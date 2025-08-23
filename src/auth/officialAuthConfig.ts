/**
 * 🎯 基于@authing/browser官方SDK的认证配置
 * 参考官方实现，解决redirect_uri不匹配等问题
 */

import { Authing } from '@authing/browser';

/**
 * 官方SDK配置
 * 🔧 修复: 使用单一redirect_uri，遵循OAuth2标准
 * OAuth2要求发起认证和交换token时使用完全相同的redirect_uri
 */
export const officialAuthConfig = {
  domain: 'https://vq1zaovh.authing.cn', // 应用的认证地址
  appId: '68a68a29d0c3341ae7a3df23', // 应用 ID
  // 🎯 修复: 使用单一回调URL，遵循OAuth2标准
  redirectUri: 'https://www.wenpai.xyz/callback', // 生产环境主回调地址
} as const;

/**
 * 创建官方SDK实例
 */
export function createOfficialAuthSDK(): Authing {
  console.log('🎯 创建官方Authing SDK实例...', {
    domain: officialAuthConfig.domain,
    appId: officialAuthConfig.appId,
    redirectUriLength: officialAuthConfig.redirectUri.length
  });
  
  return new Authing(officialAuthConfig);
}

/**
 * 导出配置供其他地方使用
 */
export { officialAuthConfig as authConfig };