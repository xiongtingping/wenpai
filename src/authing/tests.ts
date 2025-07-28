/**
 * 🧪 Authing关键路径测试
 * 用于验证登录功能的关键环节
 */

import { getGuardInstance, checkGuardHealth } from './guard';
import { getAuthingConfig } from '@/config/authing';

/**
 * 测试结果接口
 */
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

/**
 * 运行所有关键路径测试
 */
export async function runAuthingTests(): Promise<{
  allPassed: boolean;
  results: TestResult[];
  summary: string;
}> {
  const results: TestResult[] = [];
  
  console.log('🧪 开始Authing关键路径测试...');

  // 测试1: Guard实例加载
  try {
    const guardInstance = getGuardInstance();
    results.push({
      name: '1. Guard实例加载',
      passed: !!guardInstance,
      details: { hasInstance: !!guardInstance }
    });
  } catch (error) {
    results.push({
      name: '1. Guard实例加载',
      passed: false,
      error: (error as Error).message
    });
  }

  // 测试2: Guard健康检查
  try {
    const health = checkGuardHealth();
    results.push({
      name: '2. Guard健康检查',
      passed: health.isHealthy,
      details: health
    });
  } catch (error) {
    results.push({
      name: '2. Guard健康检查',
      passed: false,
      error: (error as Error).message
    });
  }

  // 测试3: 配置验证
  try {
    const config = getAuthingConfig();
    const hasRequiredFields = !!(config.appId && config.host && config.redirectUri);
    results.push({
      name: '3. 配置验证',
      passed: hasRequiredFields,
      details: {
        hasAppId: !!config.appId,
        hasHost: !!config.host,
        hasRedirectUri: !!config.redirectUri,
        redirectUri: config.redirectUri
      }
    });
  } catch (error) {
    results.push({
      name: '3. 配置验证',
      passed: false,
      error: (error as Error).message
    });
  }

  // 测试4: 回调URI环境匹配
  try {
    const config = getAuthingConfig();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    const expectedRedirectUri = `${currentOrigin}/callback`;
    const uriMatches = config.redirectUri === expectedRedirectUri;
    
    results.push({
      name: '4. 回调URI环境匹配',
      passed: uriMatches,
      details: {
        currentOrigin,
        expectedRedirectUri,
        actualRedirectUri: config.redirectUri,
        matches: uriMatches
      }
    });
  } catch (error) {
    results.push({
      name: '4. 回调URI环境匹配',
      passed: false,
      error: (error as Error).message
    });
  }

  // 测试5: Guard方法可用性
  try {
    const guardInstance = getGuardInstance();
    const requiredMethods = ['on', 'show', 'hide', 'start'];
    const availableMethods = requiredMethods.filter(method => 
      typeof (guardInstance as any)[method] === 'function'
    );
    const allMethodsAvailable = availableMethods.length === requiredMethods.length;
    
    results.push({
      name: '5. Guard方法可用性',
      passed: allMethodsAvailable,
      details: {
        requiredMethods,
        availableMethods,
        missingMethods: requiredMethods.filter(m => !availableMethods.includes(m))
      }
    });
  } catch (error) {
    results.push({
      name: '5. Guard方法可用性',
      passed: false,
      error: (error as Error).message
    });
  }

  // 计算总结
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;
  
  const summary = `${passedCount}/${totalCount} 测试通过 ${allPassed ? '✅' : '❌'}`;
  
  console.log('🧪 Authing测试完成:', summary);
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`    错误: ${result.error}`);
    }
  });

  return {
    allPassed,
    results,
    summary
  };
}

/**
 * 模拟登录按钮点击测试
 */
export function testLoginButtonClick(): TestResult {
  try {
    const guardInstance = getGuardInstance();
    
    // 检查show方法是否存在
    if (typeof guardInstance.show !== 'function') {
      return {
        name: '登录按钮点击测试',
        passed: false,
        error: 'Guard实例缺少show方法'
      };
    }

    // 模拟点击（不实际显示弹窗）
    console.log('🧪 模拟登录按钮点击测试通过');
    
    return {
      name: '登录按钮点击测试',
      passed: true,
      details: { hasShowMethod: true }
    };
  } catch (error) {
    return {
      name: '登录按钮点击测试',
      passed: false,
      error: (error as Error).message
    };
  }
}

/**
 * 检查localStorage/cookie支持
 */
export function testStorageSupport(): TestResult {
  try {
    // 测试localStorage
    const testKey = 'authing_test_' + Date.now();
    localStorage.setItem(testKey, 'test');
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const localStorageWorks = retrieved === 'test';
    
    return {
      name: '存储支持测试',
      passed: localStorageWorks,
      details: {
        localStorage: localStorageWorks,
        cookieEnabled: navigator.cookieEnabled
      }
    };
  } catch (error) {
    return {
      name: '存储支持测试',
      passed: false,
      error: (error as Error).message
    };
  }
}
