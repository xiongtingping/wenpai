/**
 * 🔧 [AUTHING_GUARD_FIXER_v2025.08.15]
 * Authing Guard 修复器 - 解决正则表达式错误和初始化问题
 * 
 * 问题描述：
 * @authing/guard v5.3.9 存在正则表达式语法错误：
 * "Invalid regular expression: /[object Object][\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|))(?!px)[a-z%]+$/i: Unmatched ')'"
 * 
 * 解决方案：
 * 1. 动态导入Guard，避免初始化时的错误
 * 2. 提供错误处理和重试机制
 * 3. 实现降级方案
 */

import { getAuthingConfig } from '@/config/authing';

// Guard实例缓存
let guardInstance: any = null;
let guardClass: any = null;
let initializationPromise: Promise<any> | null = null;

/**
 * 安全的Guard类动态导入
 */
async function loadGuardClass(): Promise<any> {
  if (guardClass) {
    return guardClass;
  }

  try {
    console.log('🔧 开始动态导入 Authing Guard...');
    
    // 使用动态导入避免初始化时的正则表达式错误
    const guardModule = await import('@authing/guard');
    guardClass = guardModule.Guard;
    
    console.log('✅ Authing Guard 类导入成功');
    return guardClass;
    
  } catch (error) {
    console.error('❌ Authing Guard 导入失败:', error);
    
    // 如果是正则表达式错误，尝试重新导入
    if (error.message && error.message.includes('Invalid regular expression')) {
      console.log('🔄 检测到正则表达式错误，尝试重新导入...');
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const retryModule = await import('@authing/guard');
        guardClass = retryModule.Guard;
        console.log('✅ Authing Guard 重试导入成功');
        return guardClass;
      } catch (retryError) {
        console.error('❌ Authing Guard 重试导入也失败:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}

/**
 * 创建安全的Guard实例
 */
export async function createSafeGuardInstance(): Promise<any> {
  if (guardInstance) {
    console.log('🔄 返回已存在的Guard实例');
    return guardInstance;
  }

  // 如果正在初始化，等待完成
  if (initializationPromise) {
    console.log('⏳ 等待Guard初始化完成...');
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🚀 开始创建安全的Guard实例...');
      
      // 1. 动态加载Guard类
      const GuardClass = await loadGuardClass();
      
      // 2. 获取配置
      const config = getAuthingConfig();
      console.log('🔧 使用配置创建Guard实例:', {
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri
      });
      
      // 3. 创建实例，使用最简化的配置避免错误
      guardInstance = new GuardClass({
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri,
        mode: 'modal',
        lang: 'zh-CN',
        // 禁用可能导致问题的功能
        autoRegister: false,
        autoFocus: false,
        escCloseable: true,
        clickCloseable: true,
        maskCloseable: true
      });
      
      console.log('✅ Guard实例创建成功');
      
      // 4. 验证实例
      if (!guardInstance || typeof guardInstance.on !== 'function') {
        throw new Error('Guard实例创建失败: 实例无效或缺少必要方法');
      }
      
      console.log('✅ Guard实例验证通过');
      return guardInstance;
      
    } catch (error) {
      console.error('❌ 创建Guard实例失败:', error);
      guardInstance = null;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * 获取Guard实例（如果已创建）
 */
export function getGuardInstance(): any {
  return guardInstance;
}

/**
 * 重置Guard实例（用于错误恢复）
 */
export function resetGuardInstance(): void {
  console.log('🔄 重置Guard实例...');
  guardInstance = null;
  guardClass = null;
  initializationPromise = null;
}

/**
 * 检查Guard是否可用
 */
export function isGuardAvailable(): boolean {
  return guardInstance !== null && typeof guardInstance.show === 'function';
}

/**
 * 安全显示Guard登录界面
 */
export async function safeShowGuard(): Promise<void> {
  try {
    if (!guardInstance) {
      console.log('🔧 Guard实例不存在，尝试创建...');
      await createSafeGuardInstance();
    }
    
    if (guardInstance && typeof guardInstance.show === 'function') {
      console.log('🔐 显示Guard登录界面...');
      guardInstance.show();
      console.log('✅ Guard登录界面已显示');
    } else {
      throw new Error('Guard实例无效或缺少show方法');
    }
    
  } catch (error) {
    console.error('❌ 显示Guard失败:', error);
    
    // 提供降级方案
    console.log('🔄 尝试降级方案...');
    await fallbackLogin();
  }
}

/**
 * 降级登录方案 - 直接跳转到Authing页面
 */
async function fallbackLogin(): Promise<void> {
  try {
    console.log('🔄 使用降级登录方案...');
    
    const config = getAuthingConfig();
    const authUrl = `${config.host}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
    
    console.log('🔗 跳转到Authing登录页面:', authUrl);
    window.location.href = authUrl;
    
  } catch (error) {
    console.error('❌ 降级登录也失败:', error);
    alert('登录服务暂时不可用，请稍后重试。');
  }
}

/**
 * 全局错误处理 - 捕获Authing相关错误
 */
export function setupAuthingErrorHandler(): void {
  // 捕获正则表达式错误
  const originalError = window.addEventListener;
  
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('Invalid regular expression') &&
        event.error.message.includes('@authing')) {
      console.warn('🛠️ 捕获Authing正则表达式错误，已处理');
      event.preventDefault();
      
      // 重置Guard实例，下次使用时重新创建
      resetGuardInstance();
      return false;
    }
  });
  
  // 捕获Promise rejection错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message &&
        event.reason.message.includes('Invalid regular expression') &&
        event.reason.message.includes('@authing')) {
      console.warn('🛠️ 捕获Authing Promise错误，已处理');
      event.preventDefault();
      
      // 重置Guard实例
      resetGuardInstance();
      return false;
    }
  });
  
  console.log('🛡️ Authing错误处理器已设置');
}

// 自动设置错误处理器
setupAuthingErrorHandler();

export default {
  createSafeGuardInstance,
  getGuardInstance,
  resetGuardInstance,
  isGuardAvailable,
  safeShowGuard,
  setupAuthingErrorHandler
};
