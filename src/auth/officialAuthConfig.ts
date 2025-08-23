/**
 * 🎯 基于@authing/browser官方SDK的认证配置
 * 参考官方实现，解决redirect_uri不匹配等问题
 */

import { Authing } from '@authing/browser';

/**
 * 官方SDK配置
 * 使用官方推荐的多重回调URL格式
 */
export const officialAuthConfig = {
  domain: 'https://vq1zaovh.authing.cn', // 应用的认证地址
  appId: '68a68a29d0c3341ae7a3df23', // 应用 ID
  // 🎯 官方支持的多重回调URL格式
  redirectUri: `https://www.wenpai.xyz/callback  
https://wenpai.xyz/callback  
https://wenpai.netlify.app/callback  
http://localhost:5177/callback  
http://localhost:5175/callback  
http://localhost:5173/callback  `, // 包含所有环境的回调地址
} as const;

/**
 * 创建官方SDK实例
 */
export function createOfficialAuthSDK(): Authing {
  console.log('🎯 创建官方Authing SDK实例...', {
    domain: officialAuthConfig.domain,
    appId: officialAuthConfig.appId,
    redirectUriCount: officialAuthConfig.redirectUri.split('\n').filter(uri => uri.trim()).length
  });
  
  return new Authing(officialAuthConfig);
}

/**
 * 导出配置供其他地方使用
 */
export { officialAuthConfig as authConfig };