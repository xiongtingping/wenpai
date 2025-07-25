/**
 * ✅ FIXED: 2025-07-25 开发环境API拦截器
 * 
 * 🐛 问题原因：
 * - 本地开发环境fetch请求到/.netlify/functions/api会404
 * - 需要在请求发出前拦截并返回模拟响应
 * - 避免控制台出现大量404错误
 * 
 * 🔧 修复方案：
 * - 拦截所有API请求
 * - 开发环境返回模拟响应
 * - 生产环境正常发送请求
 * 
 * 📌 已封装：此拦截器已验证可用，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

import { handleMockAPIRequest, isDevelopmentEnvironment } from './devMockService';
import { getAPIEndpoints } from '@/config/apiConfig';

/**
 * 原始fetch函数备份
 * 🔒 LOCKED: AI 禁止修改此变量
 */
const originalFetch = window.fetch;

/**
 * 检查URL是否为API端点
 * 🔒 LOCKED: AI 禁止修改此函数
 */
function isAPIEndpoint(url: string): boolean {
  const apiEndpoints = getAPIEndpoints();
  
  // 检查是否为Netlify Functions端点
  if (url.includes('/.netlify/functions/')) {
    return true;
  }
  
  // 检查是否为配置的API端点
  return Object.values(apiEndpoints).some(endpoint => 
    url.includes(endpoint) || url.endsWith(endpoint)
  );
}

/**
 * 解析请求体获取API参数
 * 🔒 LOCKED: AI 禁止修改此函数
 */
async function parseRequestBody(request: RequestInit): Promise<any> {
  if (!request.body) {
    return {};
  }
  
  try {
    if (typeof request.body === 'string') {
      return JSON.parse(request.body);
    }
    
    if (request.body instanceof FormData) {
      const data: any = {};
      request.body.forEach((value, key) => {
        data[key] = value;
      });
      return data;
    }
    
    return {};
  } catch (error) {
    console.warn('解析请求体失败:', error);
    return {};
  }
}

/**
 * 创建模拟Response对象
 * 🔒 LOCKED: AI 禁止修改此函数
 */
function createMockResponse(data: any, status: number = 200): Response {
  const responseBody = JSON.stringify(data);
  
  return new Response(responseBody, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

/**
 * 自定义fetch函数
 * 🔒 LOCKED: AI 禁止修改此函数
 */
async function interceptedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  
  // 只在开发环境拦截API请求
  if (isDevelopmentEnvironment() && isAPIEndpoint(url)) {
    console.log('🔧 开发环境API拦截:', url);
    
    try {
      // 解析请求参数
      const requestData = await parseRequestBody(init || {});
      
      // 处理OPTIONS预检请求
      if (init?.method === 'OPTIONS') {
        return createMockResponse('', 204);
      }
      
      // 获取模拟响应
      const mockResponse = handleMockAPIRequest(requestData);
      
      console.log('🔧 返回模拟响应:', mockResponse);
      
      // 返回模拟Response
      return createMockResponse(mockResponse, mockResponse.success ? 200 : 400);
      
    } catch (error) {
      console.error('API拦截处理失败:', error);
      
      // 返回错误响应
      const errorResponse = {
        success: false,
        error: '开发环境API拦截器错误',
        message: error instanceof Error ? error.message : 'Unknown error',
        development: true,
        timestamp: new Date().toISOString()
      };
      
      return createMockResponse(errorResponse, 500);
    }
  }
  
  // 非API请求或生产环境，使用原始fetch
  return originalFetch(input, init);
}

/**
 * 安装API拦截器
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function installAPIInterceptor(): void {
  if (!isDevelopmentEnvironment()) {
    console.log('🔧 生产环境，跳过API拦截器安装');
    return;
  }
  
  // 检查是否已经安装
  if ((window.fetch as any).__intercepted) {
    console.log('🔧 API拦截器已安装，跳过');
    return;
  }
  
  // 替换全局fetch
  window.fetch = interceptedFetch;
  (window.fetch as any).__intercepted = true;
  
  console.log('🔧 开发环境API拦截器已安装');
  console.log('🔧 所有API请求将返回模拟响应');
}

/**
 * 卸载API拦截器
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function uninstallAPIInterceptor(): void {
  if ((window.fetch as any).__intercepted) {
    window.fetch = originalFetch;
    delete (window.fetch as any).__intercepted;
    console.log('🔧 API拦截器已卸载');
  }
}

/**
 * 检查拦截器状态
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function isInterceptorInstalled(): boolean {
  return !!(window.fetch as any).__intercepted;
}

/**
 * 获取拦截器状态信息
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function getInterceptorStatus(): {
  installed: boolean;
  environment: string;
  apiEndpoints: any;
} {
  return {
    installed: isInterceptorInstalled(),
    environment: isDevelopmentEnvironment() ? 'development' : 'production',
    apiEndpoints: getAPIEndpoints()
  };
}

// 自动安装拦截器（仅在开发环境）
if (isDevelopmentEnvironment()) {
  // 延迟安装，确保DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAPIInterceptor);
  } else {
    installAPIInterceptor();
  }
}

console.log('🔧 开发环境API拦截器模块已加载');
