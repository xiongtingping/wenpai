/**
 * Authing配置运行时修复工具
 * 用于修复生产环境中可能存在的错误配置
 */

// 正确和错误的App ID
const CORRECT_APP_ID = '68823897631e1ef8ff3720b2';
const WRONG_APP_ID = '688237f8f58e454393add99e';
const CORRECT_HOST = 'https://rzcswqs4sq0f.authing.cn';

/**
 * 运行时修复环境变量
 */
export function fixAuthingEnvironment() {
  console.log('🔧 开始运行时修复Authing配置...');
  
  // 检查当前环境变量
  const currentEnv = {
    VITE_AUTHING_APP_ID: (import.meta as any).env.VITE_AUTHING_APP_ID,
    VITE_AUTHING_CLIENT_ID: (import.meta as any).env.VITE_AUTHING_CLIENT_ID,
    VITE_AUTHING_HOST: (import.meta as any).env.VITE_AUTHING_HOST,
    VITE_AUTHING_DOMAIN: (import.meta as any).env.VITE_AUTHING_DOMAIN,
  };
  
  console.log('🔍 当前环境变量:', currentEnv);
  
  // 强制修复环境变量
  const fixes = [];
  
  if (currentEnv.VITE_AUTHING_APP_ID === WRONG_APP_ID) {
    (import.meta as any).env.VITE_AUTHING_APP_ID = CORRECT_APP_ID;
    fixes.push('修复VITE_AUTHING_APP_ID');
  }
  
  if (currentEnv.VITE_AUTHING_CLIENT_ID === WRONG_APP_ID) {
    (import.meta as any).env.VITE_AUTHING_CLIENT_ID = CORRECT_APP_ID;
    fixes.push('修复VITE_AUTHING_CLIENT_ID');
  }
  
  if (currentEnv.VITE_AUTHING_HOST && currentEnv.VITE_AUTHING_HOST.includes(WRONG_APP_ID)) {
    (import.meta as any).env.VITE_AUTHING_HOST = CORRECT_HOST;
    fixes.push('修复VITE_AUTHING_HOST');
  }
  
  if (fixes.length > 0) {
    console.log('🔧 应用的修复:', fixes);
    console.log('✅ 修复后的环境变量:', {
      VITE_AUTHING_APP_ID: (import.meta as any).env.VITE_AUTHING_APP_ID,
      VITE_AUTHING_CLIENT_ID: (import.meta as any).env.VITE_AUTHING_CLIENT_ID,
      VITE_AUTHING_HOST: (import.meta as any).env.VITE_AUTHING_HOST,
      VITE_AUTHING_DOMAIN: (import.meta as any).env.VITE_AUTHING_DOMAIN,
    });
  } else {
    console.log('✅ 环境变量无需修复');
  }
}

/**
 * 修复URL中的错误App ID
 */
export function fixUrlAppId(url: string): string {
  if (!url) return url;
  
  // 检查URL是否包含错误的App ID
  if (url.includes(WRONG_APP_ID)) {
    console.log('🔧 修复URL中的错误App ID:', url);
    const fixedUrl = url.replace(new RegExp(WRONG_APP_ID, 'g'), CORRECT_APP_ID);
    console.log('✅ 修复后的URL:', fixedUrl);
    return fixedUrl;
  }
  
  return url;
}

/**
 * 修复host配置
 */
export function fixHostConfig(host: string): string {
  if (!host) return CORRECT_HOST;
  
  let fixedHost = host;
  
  // 移除任何App ID路径
  fixedHost = fixedHost.replace(new RegExp(`/${WRONG_APP_ID}.*$`), '');
  fixedHost = fixedHost.replace(new RegExp(`/${CORRECT_APP_ID}.*$`), '');
  fixedHost = fixedHost.replace(/\/.*$/, '');
  
  // 确保使用正确的域名
  if (!fixedHost.includes('rzcswqs4sq0f.authing.cn')) {
    fixedHost = CORRECT_HOST;
  }
  
  if (fixedHost !== host) {
    console.log('🔧 修复host配置:', { original: host, fixed: fixedHost });
  }
  
  return fixedHost;
}

/**
 * 修复App ID配置
 */
export function fixAppIdConfig(appId: string): string {
  if (appId === WRONG_APP_ID) {
    console.log('🔧 修复错误的App ID:', appId, '->', CORRECT_APP_ID);
    return CORRECT_APP_ID;
  }
  
  return appId || CORRECT_APP_ID;
}

/**
 * 全局修复函数 - 在应用启动时调用
 */
export function applyGlobalAuthingFixes() {
  console.log('🚀 应用全局Authing配置修复...');
  
  // 修复环境变量
  fixAuthingEnvironment();
  
  // 注意：由于浏览器安全限制，无法拦截location.href
  // 修复将在配置层面和URL生成层面进行
  console.log('ℹ️ 配置修复已应用，URL生成将使用正确的配置');
  
  // 拦截fetch请求，修复可能的错误URL
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string') {
      const fixedInput = fixUrlAppId(input);
      if (fixedInput !== input) {
        console.log('🔧 修复fetch URL:', { original: input, fixed: fixedInput });
        return originalFetch(fixedInput, init);
      }
    }
    return originalFetch(input, init);
  };
  
  console.log('✅ 全局Authing配置修复完成');
}

/**
 * 检查当前配置是否正确
 */
export function validateAuthingConfig(): {
  isValid: boolean;
  issues: string[];
  config: any;
} {
  const issues: string[] = [];
  
  const config = {
    appId: (import.meta as any).env.VITE_AUTHING_APP_ID,
    clientId: (import.meta as any).env.VITE_AUTHING_CLIENT_ID,
    host: (import.meta as any).env.VITE_AUTHING_HOST,
    domain: (import.meta as any).env.VITE_AUTHING_DOMAIN,
  };
  
  if (config.appId === WRONG_APP_ID) {
    issues.push('VITE_AUTHING_APP_ID使用了错误的值');
  }
  
  if (config.clientId === WRONG_APP_ID) {
    issues.push('VITE_AUTHING_CLIENT_ID使用了错误的值');
  }
  
  if (config.host && config.host.includes(WRONG_APP_ID)) {
    issues.push('VITE_AUTHING_HOST包含错误的App ID');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    config
  };
}
