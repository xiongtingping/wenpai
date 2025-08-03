/**
 * ✅ FIXED: 2025-08-02 浏览器网络修复模块
 * 🐛 问题原因：浏览器环境中的AI API调用遇到网络连接问题
 * 🔧 修复方案：提供浏览器特定的网络优化和重试机制
 * 📌 已封装：浏览器网络修复逻辑已验证稳定，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

/**
 * 浏览器网络问题类型
 */
export type BrowserNetworkIssue = 
  | 'cors_error' 
  | 'network_timeout' 
  | 'proxy_connection_failed' 
  | 'ssl_error' 
  | 'rate_limit' 
  | 'unknown';

/**
 * 网络诊断结果
 */
export interface BrowserNetworkDiagnostic {
  issueType: BrowserNetworkIssue;
  errorMessage: string;
  suggestions: string[];
  canAutoFix: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 浏览器网络修复配置
 */
export interface BrowserNetworkFixConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
  enableCorsFix: boolean;
  enableRetryFix: boolean;
  enableTimeoutFix: boolean;
}

/**
 * 默认修复配置
 */
const DEFAULT_FIX_CONFIG: BrowserNetworkFixConfig = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 10000,
  timeout: 30000,
  enableCorsFix: true,
  enableRetryFix: true,
  enableTimeoutFix: true,
};

/**
 * 诊断浏览器网络问题
 * @param error 错误对象
 * @returns 诊断结果
 */
export function diagnoseBrowserNetworkIssue(error: any): BrowserNetworkDiagnostic {
  const errorMessage = error?.message || error?.toString() || '';
  const suggestions: string[] = [];
  let issueType: BrowserNetworkIssue = 'unknown';
  let canAutoFix = false;
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  console.log('🔍 诊断浏览器网络问题:', errorMessage);

  if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
    issueType = 'cors_error';
    severity = 'high';
    suggestions.push('检测到跨域请求被阻止');
    suggestions.push('建议检查浏览器安全设置');
    suggestions.push('尝试禁用浏览器扩展');
    suggestions.push('使用无痕模式测试');
    canAutoFix = true;
  } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
    issueType = 'network_timeout';
    severity = 'medium';
    suggestions.push('网络请求超时');
    suggestions.push('检查网络连接状态');
    suggestions.push('尝试增加超时时间');
    suggestions.push('检查防火墙设置');
    canAutoFix = true;
  } else if (errorMessage.includes('ERR_PROXY_CONNECTION_FAILED') || errorMessage.includes('proxy')) {
    issueType = 'proxy_connection_failed';
    severity = 'critical';
    suggestions.push('检测到代理连接失败');
    suggestions.push('建议禁用浏览器代理设置');
    suggestions.push('尝试使用无代理模式');
    suggestions.push('检查系统网络设置');
    suggestions.push('尝试清除浏览器缓存和Cookie');
    suggestions.push('重启浏览器或使用无痕模式');
    canAutoFix = true;
  } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate') || errorMessage.includes('TLS')) {
    issueType = 'ssl_error';
    severity = 'medium';
    suggestions.push('SSL证书验证失败');
    suggestions.push('检查系统时间是否正确');
    suggestions.push('尝试清除浏览器缓存');
    suggestions.push('检查安全软件设置');
    canAutoFix = false;
  } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    issueType = 'rate_limit';
    severity = 'medium';
    suggestions.push('API调用频率超限');
    suggestions.push('建议等待一段时间后重试');
    suggestions.push('检查API密钥使用情况');
    suggestions.push('考虑升级API计划');
    canAutoFix = true;
  } else if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_CONNECTION_CLOSED')) {
    issueType = 'network_timeout';
    severity = 'high';
    suggestions.push('网络连接失败或中断');
    suggestions.push('检查网络连接状态');
    suggestions.push('尝试刷新页面');
    suggestions.push('检查DNS设置');
    canAutoFix = true;
  }

  return {
    issueType,
    errorMessage,
    suggestions,
    canAutoFix,
    severity,
  };
}

/**
 * 应用浏览器网络修复
 * @param config 修复配置
 */
export function applyBrowserNetworkFix(config: Partial<BrowserNetworkFixConfig> = {}): void {
  const finalConfig = { ...DEFAULT_FIX_CONFIG, ...config };
  
  console.log('🔧 应用浏览器网络修复...', finalConfig);

  if (typeof window === 'undefined') {
    console.warn('⚠️ 非浏览器环境，跳过浏览器网络修复');
    return;
  }

  // 1. 优化fetch配置
  if (finalConfig.enableCorsFix) {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // 对所有API请求应用优化配置
      const optimizedInit: RequestInit = {
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit', // 避免CORS问题
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
        ...init,
      };
      
      console.log('🔧 浏览器网络请求优化:', {
        url,
        mode: optimizedInit.mode,
        credentials: optimizedInit.credentials,
      });
      
      return originalFetch(input, optimizedInit);
    };
  }

  // 2. 添加重试机制
  if (finalConfig.enableRetryFix) {
    (window as any).retryFetch = async (
      input: RequestInfo | URL, 
      init?: RequestInit, 
      maxRetries: number = finalConfig.maxRetries
    ) => {
      const originalFetch = window.fetch;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`🔄 浏览器网络请求重试 ${i + 1}/${maxRetries}`);
          return await originalFetch(input, init);
        } catch (error) {
          if (i === maxRetries - 1) {
            console.error('❌ 浏览器网络请求最终失败:', error);
            throw error;
          }
          
          const delay = Math.min(
            finalConfig.baseDelay * Math.pow(2, i), 
            finalConfig.maxDelay
          );
          
          console.log(`⏳ 等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
  }

  // 3. 优化超时设置
  if (finalConfig.enableTimeoutFix) {
    (window as any).fetchWithTimeout = async (
      input: RequestInfo | URL, 
      init?: RequestInit, 
      timeout: number = finalConfig.timeout
    ) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await window.fetch(input, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as any).name === 'AbortError') {
          throw new Error(`请求超时 (${timeout}ms)`);
        }
        throw error;
      }
    };
  }

  console.log('✅ 浏览器网络修复应用完成');
}

/**
 * 检查浏览器网络状态
 */
export async function checkBrowserNetworkStatus(): Promise<{
  isOnline: boolean;
  hasProxyIssues: boolean;
  recommendations: string[];
}> {
  const recommendations: string[] = [];
  let hasProxyIssues = false;

  try {
    // 检查基本网络连接
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      // timeout: 5000, // 移除不支持的属性
    });

    if (!response.ok) {
      recommendations.push('基本网络连接异常');
    }
  } catch (error) {
    const diagnostic = diagnoseBrowserNetworkIssue(error);
    hasProxyIssues = diagnostic.issueType === 'proxy_connection_failed';
    recommendations.push(...diagnostic.suggestions);
  }

  return {
    isOnline: navigator.onLine,
    hasProxyIssues,
    recommendations,
  };
}

/**
 * 创建浏览器网络重试机制
 */
export function createBrowserNetworkRetryMechanism(
  maxRetries: number = 5, 
  baseDelay: number = 1000
) {
  return async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= maxRetries) {
        console.error('❌ 浏览器网络重试次数已达上限:', error);
        throw error;
      }

      const diagnostic = diagnoseBrowserNetworkIssue(error);
      console.log(`🔄 浏览器网络重试 ${retryCount + 1}/${maxRetries}:`, diagnostic.issueType);

      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`⏳ 等待 ${delay}ms 后重试...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryWithBackoff(operation, retryCount + 1);
    }
  };
}

/**
 * 获取浏览器网络状态报告
 */
export async function getBrowserNetworkStatusReport(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  details: {
    isOnline: boolean;
    hasProxyIssues: boolean;
    recommendations: string[];
  };
}> {
  const networkStatus = await checkBrowserNetworkStatus();
  
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  
  if (!networkStatus.isOnline) {
    status = 'error';
  } else if (networkStatus.hasProxyIssues || networkStatus.recommendations.length > 0) {
    status = 'warning';
  }

  return {
    status,
    details: networkStatus,
  };
}

/**
 * 启动浏览器网络监控
 */
export function startBrowserNetworkMonitoring(): void {
  if (typeof window === 'undefined') {
    console.warn('⚠️ 非浏览器环境，跳过网络监控');
    return;
  }

  console.log('🔍 启动浏览器网络监控...');

  // 监听在线状态变化
  window.addEventListener('online', () => {
    console.log('✅ 浏览器网络已连接');
  });

  window.addEventListener('offline', () => {
    console.log('❌ 浏览器网络已断开');
  });

  // 监听网络质量变化
  if ('connection' in navigator) {
    (navigator as any).connection?.addEventListener('change', () => {
      console.log('📊 浏览器网络质量变化:', {
                  effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
          rtt: (navigator as any).connection?.rtt,
      });
    });
  }
}

// 自动应用修复（如果可用）
if (typeof window !== 'undefined') {
  // 延迟应用，确保在页面加载完成后执行
  setTimeout(() => {
    applyBrowserNetworkFix();
    startBrowserNetworkMonitoring();
  }, 1000);
} 