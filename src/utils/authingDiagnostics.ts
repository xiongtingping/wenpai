/**
 * ✅ Authing 诊断工具
 * 
 * 用于深度诊断 Authing 配置和认证问题
 * 提供详细的诊断报告和修复建议
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * 诊断结果级别
 */
export type DiagnosticLevel = 'success' | 'warning' | 'error' | 'info';

/**
 * 诊断项
 */
export interface DiagnosticItem {
  /** 诊断项ID */
  id: string;
  /** 诊断项名称 */
  name: string;
  /** 诊断结果 */
  result: DiagnosticLevel;
  /** 诊断消息 */
  message: string;
  /** 详细信息 */
  details?: string;
  /** 修复建议 */
  suggestion?: string;
  /** 相关配置 */
  config?: any;
}

/**
 * 诊断报告
 */
export interface DiagnosticReport {
  /** 总体状态 */
  overall: DiagnosticLevel;
  /** 诊断时间 */
  timestamp: string;
  /** 诊断项列表 */
  items: DiagnosticItem[];
  /** 总结 */
  summary: string;
  /** 修复建议 */
  recommendations: string[];
}

/**
 * 环境变量诊断
 */
export function diagnoseEnvironmentVariables(): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  
  // 检查 Authing App ID
  const appId = import.meta.env.VITE_AUTHING_APP_ID;
  items.push({
    id: 'env_app_id',
    name: 'Authing App ID',
    result: appId ? 'success' : 'error',
    message: appId ? 'App ID 已配置' : 'App ID 未配置',
    details: appId ? `当前值: ${appId}` : '请在 .env 文件中设置 VITE_AUTHING_APP_ID',
    suggestion: appId ? undefined : '在 .env 文件中添加: VITE_AUTHING_APP_ID=your_app_id',
    config: { appId }
  });

  // 检查 Authing Host
  const host = import.meta.env.VITE_AUTHING_HOST;
  items.push({
    id: 'env_host',
    name: 'Authing Host',
    result: host ? 'success' : 'error',
    message: host ? 'Host 已配置' : 'Host 未配置',
    details: host ? `当前值: ${host}` : '请在 .env 文件中设置 VITE_AUTHING_HOST',
    suggestion: host ? undefined : '在 .env 文件中添加: VITE_AUTHING_HOST=your_host.authing.cn',
    config: { host }
  });

  // 检查回调地址配置
  const redirectUriDev = import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV;
  const redirectUriProd = import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD;
  const hasRedirectConfig = redirectUriDev || redirectUriProd;
  
  items.push({
    id: 'env_redirect_uri',
    name: '回调地址配置',
    result: hasRedirectConfig ? 'success' : 'warning',
    message: hasRedirectConfig ? '回调地址已配置' : '回调地址未配置',
    details: hasRedirectConfig 
      ? `开发环境: ${redirectUriDev || '未配置'}, 生产环境: ${redirectUriProd || '未配置'}`
      : '建议配置开发和生产环境的回调地址',
    suggestion: hasRedirectConfig ? undefined : '在 .env 文件中添加回调地址配置',
    config: { redirectUriDev, redirectUriProd }
  });

  // 检查环境模式
  const mode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;
  items.push({
    id: 'env_mode',
    name: '环境模式',
    result: 'info',
    message: `当前环境: ${mode}`,
    details: `开发模式: ${isDev ? '是' : '否'}, 生产模式: ${!isDev ? '是' : '否'}`,
    config: { mode, isDev }
  });

  return items;
}

/**
 * 配置诊断
 */
export function diagnoseConfiguration(): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  
  try {
    // 测试基础配置获取
    const config = getAuthingConfig();
    items.push({
      id: 'config_basic',
      name: '基础配置获取',
      result: 'success',
      message: '基础配置获取成功',
      details: `App ID: ${config.appId}, Host: ${config.host}, 回调地址: ${config.redirectUri}`,
      config
    });

    // 测试 Guard 配置获取
    const guardConfig = getGuardConfig();
    items.push({
      id: 'config_guard',
      name: 'Guard 配置获取',
      result: 'success',
      message: 'Guard 配置获取成功',
      details: `模式: ${guardConfig.mode}, 默认场景: ${guardConfig.defaultScene}, 语言: ${guardConfig.lang}`,
      config: guardConfig
    });

    // 验证配置完整性
    const configValidation = [];
    if (!config.appId) configValidation.push('App ID 为空');
    if (!config.host) configValidation.push('Host 为空');
    if (!config.redirectUri) configValidation.push('回调地址为空');
    
    items.push({
      id: 'config_validation',
      name: '配置完整性验证',
      result: configValidation.length === 0 ? 'success' : 'error',
      message: configValidation.length === 0 ? '配置完整' : '配置不完整',
      details: configValidation.length === 0 ? '所有必要配置项都已设置' : `缺少: ${configValidation.join(', ')}`,
      suggestion: configValidation.length > 0 ? '请检查并完善 Authing 配置' : undefined
    });

  } catch (error) {
    items.push({
      id: 'config_error',
      name: '配置获取错误',
      result: 'error',
      message: '配置获取失败',
      details: error instanceof Error ? error.message : '未知错误',
      suggestion: '检查 Authing 配置文件是否正确'
    });
  }

  return items;
}

/**
 * 网络连接诊断
 */
export async function diagnoseNetworkConnection(): Promise<DiagnosticItem[]> {
  const items: DiagnosticItem[] = [];
  
  try {
    const config = getAuthingConfig();
    const testUrl = `https://${config.host}`;
    
    // 测试网络连接
    const startTime = Date.now();
    const response = await fetch(testUrl, { 
      method: 'HEAD',
      mode: 'no-cors' // 避免 CORS 问题
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    items.push({
      id: 'network_connectivity',
      name: '网络连接测试',
      result: 'success',
      message: '网络连接正常',
      details: `响应时间: ${responseTime}ms, 测试地址: ${testUrl}`,
      config: { testUrl, responseTime }
    });

  } catch (error) {
    items.push({
      id: 'network_error',
      name: '网络连接测试',
      result: 'error',
      message: '网络连接失败',
      details: error instanceof Error ? error.message : '未知错误',
      suggestion: '检查网络连接和防火墙设置'
    });
  }

  return items;
}

/**
 * 本地存储诊断
 */
export function diagnoseLocalStorage(): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  
  // 检查用户信息存储
  const authingUser = localStorage.getItem('authing_user');
  const authingToken = localStorage.getItem('authing_token');
  const loginRedirectTo = localStorage.getItem('login_redirect_to');
  
  items.push({
    id: 'storage_user',
    name: '用户信息存储',
    result: authingUser ? 'success' : 'info',
    message: authingUser ? '用户信息已存储' : '用户信息未存储',
    details: authingUser ? '用户信息存在于本地存储中' : '用户未登录或信息已清除',
    config: { hasUser: !!authingUser }
  });

  items.push({
    id: 'storage_token',
    name: '访问令牌存储',
    result: authingToken ? 'success' : 'info',
    message: authingToken ? '访问令牌已存储' : '访问令牌未存储',
    details: authingToken ? '访问令牌存在于本地存储中' : '用户未登录或令牌已过期',
    config: { hasToken: !!authingToken }
  });

  items.push({
    id: 'storage_redirect',
    name: '重定向地址存储',
    result: loginRedirectTo ? 'info' : 'info',
    message: loginRedirectTo ? '重定向地址已存储' : '重定向地址未存储',
    details: loginRedirectTo ? `存储的重定向地址: ${loginRedirectTo}` : '未设置重定向地址',
    config: { redirectTo: loginRedirectTo }
  });

  return items;
}

/**
 * 浏览器环境诊断
 */
export function diagnoseBrowserEnvironment(): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  
  // 检查浏览器支持
  const hasLocalStorage = typeof localStorage !== 'undefined';
  const hasSessionStorage = typeof sessionStorage !== 'undefined';
  const hasFetch = typeof fetch !== 'undefined';
  const hasPromise = typeof Promise !== 'undefined';
  
  items.push({
    id: 'browser_storage',
    name: '浏览器存储支持',
    result: hasLocalStorage && hasSessionStorage ? 'success' : 'error',
    message: hasLocalStorage && hasSessionStorage ? '存储 API 支持正常' : '存储 API 不支持',
    details: `localStorage: ${hasLocalStorage ? '支持' : '不支持'}, sessionStorage: ${hasSessionStorage ? '支持' : '不支持'}`,
    suggestion: hasLocalStorage && hasSessionStorage ? undefined : '请使用现代浏览器'
  });

  items.push({
    id: 'browser_fetch',
    name: 'Fetch API 支持',
    result: hasFetch ? 'success' : 'error',
    message: hasFetch ? 'Fetch API 支持正常' : 'Fetch API 不支持',
    details: hasFetch ? '支持网络请求' : '不支持网络请求',
    suggestion: hasFetch ? undefined : '请使用支持 Fetch API 的浏览器'
  });

  items.push({
    id: 'browser_promise',
    name: 'Promise 支持',
    result: hasPromise ? 'success' : 'error',
    message: hasPromise ? 'Promise 支持正常' : 'Promise 不支持',
    details: hasPromise ? '支持异步操作' : '不支持异步操作',
    suggestion: hasPromise ? undefined : '请使用支持 Promise 的浏览器'
  });

  // 检查当前页面信息
  const currentUrl = window.location.href;
  const isCallbackPage = currentUrl.includes('/callback');
  
  items.push({
    id: 'browser_location',
    name: '当前页面信息',
    result: 'info',
    message: isCallbackPage ? '当前在回调页面' : '当前不在回调页面',
    details: `URL: ${currentUrl}, 是回调页面: ${isCallbackPage ? '是' : '否'}`,
    config: { currentUrl, isCallbackPage }
  });

  return items;
}

/**
 * 运行完整诊断
 */
export async function runFullDiagnostics(): Promise<DiagnosticReport> {
  console.log('🔍 开始运行 Authing 完整诊断...');
  
  const allItems: DiagnosticItem[] = [];
  
  // 1. 环境变量诊断
  console.log('📋 诊断环境变量...');
  const envItems = diagnoseEnvironmentVariables();
  allItems.push(...envItems);
  
  // 2. 配置诊断
  console.log('⚙️ 诊断配置...');
  const configItems = diagnoseConfiguration();
  allItems.push(...configItems);
  
  // 3. 网络连接诊断
  console.log('🌐 诊断网络连接...');
  const networkItems = await diagnoseNetworkConnection();
  allItems.push(...networkItems);
  
  // 4. 本地存储诊断
  console.log('💾 诊断本地存储...');
  const storageItems = diagnoseLocalStorage();
  allItems.push(...storageItems);
  
  // 5. 浏览器环境诊断
  console.log('🌍 诊断浏览器环境...');
  const browserItems = diagnoseBrowserEnvironment();
  allItems.push(...browserItems);
  
  // 计算总体状态
  const errorCount = allItems.filter(item => item.result === 'error').length;
  const warningCount = allItems.filter(item => item.result === 'warning').length;
  const successCount = allItems.filter(item => item.result === 'success').length;
  
  let overall: DiagnosticLevel = 'success';
  if (errorCount > 0) {
    overall = 'error';
  } else if (warningCount > 0) {
    overall = 'warning';
  }
  
  // 生成总结
  const summary = `诊断完成: ${successCount} 项正常, ${warningCount} 项警告, ${errorCount} 项错误`;
  
  // 生成修复建议
  const recommendations = allItems
    .filter(item => item.suggestion)
    .map(item => `${item.name}: ${item.suggestion}`)
    .filter(Boolean) as string[];
  
  const report: DiagnosticReport = {
    overall,
    timestamp: new Date().toISOString(),
    items: allItems,
    summary,
    recommendations
  };
  
  console.log('📊 诊断报告:', {
    overall: report.overall,
    totalItems: report.items.length,
    errorCount,
    warningCount,
    successCount,
    recommendations: report.recommendations.length
  });
  
  return report;
} 