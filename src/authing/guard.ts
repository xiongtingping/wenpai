/**
 * 🚨注意：Guard 初始化参数必须为单个对象格式！
 * 错误方式：new Guard(appId, { ... })
 * 正确方式：new Guard({ appId, host, ... })
 *
 * 如需修改 SDK 或构造参数，必须先查阅 Authing 文档！
 * 
 * ✅ FIXED: 2025-07-26 统一封装Guard初始化逻辑
 * 📌 集中管理，避免散落在多个组件中
 * 🔒 LOCKED: 禁止在其他地方直接 new Guard()
 */

import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';

let guardInstance: Guard | null = null;

/**
 * 创建Guard实例（单例模式）
 * 🔒 这是唯一允许创建Guard实例的地方
 */
export function createGuardInstance(): Guard {
  if (guardInstance) {
    console.log('🔄 返回已存在的Guard实例');
    return guardInstance;
  }

  const config = getAuthingConfig();
  
  // 🛑 参数校验 - 必要参数检查
  if (!config?.appId || !config?.host) {
    const error = "🚨 Guard 初始化失败：缺少必要参数 appId 或 host";
    console.error(error, { config });
    throw new Error(error);
  }
  
  if (!config?.redirectUri) {
    const error = "🚨 Guard 初始化失败：缺少必要参数 redirectUri";
    console.error(error, { config });
    throw new Error(error);
  }

  console.log('🔧 Guard配置验证通过:', {
    appId: config.appId,
    host: config.host,
    redirectUri: config.redirectUri,
    hasUserPoolId: !!config.userPoolId
  });

  try {
    // ✅ 正确的Guard初始化格式（统一配置对象）
    guardInstance = new Guard({
      appId: config.appId,
      host: config.host,
      redirectUri: config.redirectUri,
      userPoolId: config.userPoolId,
      mode: 'modal',
      // UI配置
      autoFocus: false,
      escCloseable: true,
      clickCloseable: true,
      maskCloseable: true
    });

    // 🧪 实例验证
    if (!guardInstance || typeof guardInstance.on !== 'function') {
      throw new Error('Guard实例创建失败: 实例无效或缺少必要方法');
    }

    console.log('✅ Guard实例创建成功');
    console.log('✅ Guard实例验证通过，具备必要方法');
    
    return guardInstance;
    
  } catch (err) {
    console.error("🚨 Guard 实例创建失败", err);
    guardInstance = null; // 重置实例
    throw err;
  }
}

/**
 * 获取当前Guard实例
 * 如果不存在则创建新实例
 */
export function getGuardInstance(): Guard {
  if (!guardInstance) {
    return createGuardInstance();
  }
  return guardInstance;
}

/**
 * 重置Guard实例（用于测试或重新初始化）
 * ⚠️ 谨慎使用，通常不需要调用
 */
export function resetGuardInstance(): void {
  if (guardInstance) {
    console.log('🔄 重置Guard实例');
    guardInstance = null;
  }
}

/**
 * 检查Guard实例健康状态
 * 返回详细的健康检查报告
 */
export function checkGuardHealth(): {
  isHealthy: boolean;
  hasInstance: boolean;
  hasMethods: boolean;
  errors: string[];
} {
  const result = {
    isHealthy: false,
    hasInstance: false,
    hasMethods: false,
    errors: [] as string[]
  };

  // 检查实例存在性
  if (!guardInstance) {
    result.errors.push('Guard实例不存在');
    return result;
  }
  result.hasInstance = true;

  // 检查必要方法
  const requiredMethods = ['on', 'show', 'hide', 'start'];
  const missingMethods = requiredMethods.filter(method => 
    typeof (guardInstance as any)[method] !== 'function'
  );
  
  if (missingMethods.length > 0) {
    result.errors.push(`Guard实例缺少方法: ${missingMethods.join(', ')}`);
    return result;
  }
  result.hasMethods = true;

  // 所有检查通过
  result.isHealthy = true;
  return result;
}
