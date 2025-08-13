/**
 * ✅ FIXED: 2025-08-02 Authing 网络优化工具
 * 🐛 问题原因：Authing 网络连接问题
 * 🔧 修复方案：提供 Authing 专用的网络优化
 * 📌 已封装：Authing 网络修复逻辑已验证稳定，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

/**
 * 应用 Authing 网络优化
 */
export function applyAuthingNetworkOptimizations(): void {
  console.log('🔧 应用 Authing 网络优化...');

  // 1. 优化 Authing 相关的网络请求
  if (typeof window !== 'undefined') {
    // 为 Authing 域名添加特殊处理
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // 如果是 Authing 相关请求，应用特殊优化
      if (url.includes('authing.cn')) {
        const optimizedInit: RequestInit = {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include', // Authing 需要 credentials
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...init?.headers,
          },
          ...init,
        };
        
        console.log('🔧 Authing 网络请求优化:', {
          url,
          mode: optimizedInit.mode,
          credentials: optimizedInit.credentials,
        });
        
        return originalFetch(input, optimizedInit);
      }
      
      return originalFetch(input, init);
    };
  }

  console.log('✅ Authing 网络优化已应用');
}

/**
 * 启动 Authing 网络监控
 */
export function startAuthingNetworkMonitoring(): void {
  console.log('🔍 Authing 网络监控已禁用（避免不必要的网络请求）');

  // 注释掉自动网络检查，避免CORS错误和不必要的网络请求
  // setInterval(async () => {
  //   try {
  //     const response = await fetch('https://rzcswqd4sq0f.authing.cn/api/v2/applications/68823897631e1ef8ff3720b2/public-config', {
  //       method: 'HEAD',
  //       mode: 'cors',
  //       cache: 'no-cache',
  //     });
  //
  //     if (!response.ok) {
  //       console.warn('⚠️ Authing 网络连接问题:', response.status);
  //     }
  //   } catch (error) {
  //     console.warn('⚠️ Authing 网络连接失败:', error);
  //   }
  // }, 30000); // 每30秒检查一次

  console.log('✅ Authing 网络监控配置完成');
}

/**
 * 测试 Authing 连接
 * @returns 连接状态
 */
export async function testAuthingConnection(): Promise<{
  isConnected: boolean;
  status: number;
  message: string;
  suggestions: string[];
}> {
  const suggestions: string[] = [];
  
  try {
    const response = await fetch('https://rzcswqd4sq0f.authing.cn/api/v2/applications/68823897631e1ef8ff3720b2/public-config', {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (response.ok) {
      return {
        isConnected: true,
        status: response.status,
        message: 'Authing 连接正常',
        suggestions: []
      };
    } else {
      suggestions.push('Authing 服务响应异常');
      suggestions.push('请检查网络连接');
      return {
        isConnected: false,
        status: response.status,
        message: `Authing 服务异常: ${response.status}`,
        suggestions
      };
    }
  } catch (error) {
    suggestions.push('网络连接失败');
    suggestions.push('请检查代理设置');
    suggestions.push('尝试禁用浏览器代理');
    
    return {
      isConnected: false,
      status: 0,
      message: `Authing 连接失败: ${error}`,
      suggestions
    };
  }
} 