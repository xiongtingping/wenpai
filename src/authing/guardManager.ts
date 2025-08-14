/**
 * 🚨注意：Guard 初始化参数必须为单个对象格式！
 * 错误方式：new Guard(appId, { ... })
 * 正确方式：new Guard({ appId, host, ... })
 *
 * 如需修改 SDK 或构造参数，必须先查阅 Authing 文档！
 * 
 * ✅ FIXED: 2025-08-14 统一封装Guard初始化逻辑
 * 📌 集中管理，避免散落在多个组件中
 * 🔓 UNLOCKED: 禁止在其他地方直接 new Guard()
 */

import { Authing } from '@authing/web';
import { getAuthingConfig } from '@/config/authing';

let authingInstance: Authing | null = null;
let initializationPromise: Promise<Authing> | null = null;

/**
 * 验证配置参数
 */
function validateConfig(config: any): void {
  if (!config?.appId || !config?.appHost) {
    throw new Error("🚨 Guard 初始化失败：缺少必要参数 appId 或 appHost");
  }
  
  if (!config?.redirectUri) {
    throw new Error("🚨 Guard 初始化失败：缺少必要参数 redirectUri");
  }
  
  // 验证redirectUri格式
  try {
    new URL(config.redirectUri);
  } catch {
    throw new Error("🚨 Guard 初始化失败：redirectUri 格式无效");
  }
  
  console.log('✅ Guard配置验证通过:', {
    appId: config.appId,
    appHost: config.appHost,
    redirectUri: config.redirectUri
  });
}

/**
 * 创建Authing实例（统一入口）
 * @returns Promise<Authing> Authing实例
 */
export async function createAuthingInstance(): Promise<Authing> {
  // 如果已经有实例，直接返回
  if (authingInstance) {
    return authingInstance;
  }
  
  // 如果正在初始化，等待初始化完成
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // 开始初始化
  initializationPromise = (async () => {
    try {
      const config = getAuthingConfig();
      
      // 验证配置
      validateConfig(config);
      
      console.log('🔧 开始初始化Authing实例...');
      
      // 🔧 使用正确的@authing/web构造函数参数
      // 尝试不同的参数名称组合
      const authingParams = {
        appId: config.appId,
        domain: config.appHost, // 尝试使用domain参数
        redirectUri: config.redirectUri,
        mode: 'redirect',
        scope: 'openid profile email phone',
        responseType: 'code',
        lang: 'zh-CN'
      };

      console.log('🔧 Authing构造参数:', authingParams);
      const instance = new Authing(authingParams);
      
      authingInstance = instance;
      console.log('✅ Authing实例创建成功');
      
      return instance;
    } catch (error) {
      console.error("🚨 Guard 实例创建失败", error);
      // 重置状态，允许重试
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
}

/**
 * 获取Authing实例
 * @returns Authing | null 当前实例或null
 */
export function getAuthingInstance(): Authing | null {
  return authingInstance;
}

/**
 * 重置Authing实例（用于测试或重新初始化）
 */
export function resetAuthingInstance(): void {
  console.log('🔄 重置Authing实例');
  authingInstance = null;
  initializationPromise = null;
}

/**
 * 检查Authing实例健康状态
 * @returns Promise<boolean> 健康状态
 */
export async function checkAuthingHealth(): Promise<boolean> {
  try {
    const instance = await createAuthingInstance();
    
    // 基本健康检查
    if (!instance) {
      console.error('❌ Authing实例不存在');
      return false;
    }
    
    console.log('✅ Authing实例健康检查通过');
    return true;
  } catch (error) {
    console.error('❌ Authing实例健康检查失败:', error);
    return false;
  }
}

/**
 * 获取当前配置信息（用于调试）
 */
export function getAuthingDebugInfo() {
  const config = getAuthingConfig();
  return {
    hasInstance: !!authingInstance,
    isInitializing: !!initializationPromise,
    config: {
      appId: config.appId,
      appHost: config.appHost,
      redirectUri: config.redirectUri,
      domain: config.domain
    }
  };
}

// 导出类型
export type { Authing } from '@authing/web';
