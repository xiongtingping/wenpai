/**
 * 服务初始化器
 * 🔧 P1-1: 解决循环依赖 - 统一管理服务间依赖关系
 * 
 * 功能：
 * 1. 初始化服务依赖注入
 * 2. 避免循环依赖问题
 * 3. 提供服务生命周期管理
 * 4. 支持懒加载和按需初始化
 */

import { ServiceContainer } from './unifiedPermissionService';
import { registerSupabaseServiceFactory } from '@/lib/unifiedDataPersistenceManager';
// 动态导入避免TDZ错误
// import { setRequestClient } from '@/utils/requestClientRegistry';
import { createDataService } from './supabaseDataService';
import request from '@/api/request';

// 延迟注册 Supabase 服务工厂，避免TDZ错误
function initializeSupabaseServiceFactory() {
  registerSupabaseServiceFactory((userId, tableName) => createDataService(userId, tableName));
  console.log('✅ Supabaseservicefactoryalreadyregister');
}

// 动态设置请求客户端，避免TDZ错误
async function initializeRequestClient() {
  try {
    const { setRequestClient } = await import('@/utils/requestClientRegistry');
    setRequestClient(request);
    console.log('✅ requestclientalreadyregister');
  } catch (error) {
    console.error('❌ requestclientregisterfailed:', error);
  }
}

// 延迟初始化请求客户端，避免模块加载时的循环依赖
// initializeRequestClient(); // 移动到ServiceInitializer.initialize()中

/**
 * 服务初始化状态
 */
interface ServiceInitializationState {
  initialized: boolean;
  services: Set<string>;
  errors: Array<{ service: string; error: string }>;
}

class ServiceInitializer {
  private static state: ServiceInitializationState = {
    initialized: false,
    services: new Set(),
    errors: []
  };

  /**
   * 初始化所有服务依赖
   */
  static async initialize(): Promise<void> {
    if (this.state.initialized) {
      console.log('📦 servicealreadyinitialization，skippingduplicateinitialization');
      return;
    }

    // console.log('🚀 startsinitializationservice依赖...');

    try {
      // 0. 首先初始化请求客户端 - 避免TDZ
      try {
        await initializeRequestClient();
      } catch (error) {
        console.warn('⚠️ requestclientinitializationfailed:', error);
        this.state.errors.push({ service: 'RequestClient', error: String(error) });
      }

      // 1. 然后初始化Supabase服务工厂 - 避免TDZ
      try {
        initializeSupabaseServiceFactory();
      } catch (error) {
        console.warn('⚠️ Supabaseservicefactoryinitializationfailed:', error);
        this.state.errors.push({ service: 'SupabaseServiceFactory', error: String(error) });
      }

      // 2. 注册所有服务到DI容器 - 优雅降级 + 超时保护
      try {
        console.log('🔧 开始注册 DI 容器服务...');
        const { registerAllServices } = await import('@/config/serviceRegistry');

        // 添加超时保护
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Service registration timeout after 5s')), 5000)
        );

        await Promise.race([
          registerAllServices(),
          timeoutPromise
        ]);

        console.log('✅ DI容器服务注册完成');
      } catch (error) {
        console.warn('⚠️ DI容器注册失败，跳过:', error);
        this.state.errors.push({ service: 'DIContainer', error: String(error) });
      }

      // 3. 初始化ServerPermissionService - 优雅降级
      try {
        await this.initializeServerPermissionService();
      } catch (error) {
        console.warn('⚠️ permissionService initialization failed，skipping:', error);
        this.state.errors.push({ service: 'ServerPermissionService', error: String(error) });
      }

      this.state.initialized = true;
      // console.log('✅ Service dependencies initialized (部分failedalreadyskipping)');
      
    } catch (error) {
      console.warn('⚠️ service依赖initialization部分failed，应用仍可normal使用:', error);
      this.state.initialized = true; // 标记为已初始化，避免重复尝试
      this.state.errors.push({ service: 'ServiceInitializer', error: String(error) });
    }
  }

  /**
   * 初始化ServerPermissionService
   */
  private static async initializeServerPermissionService(): Promise<void> {
    try {
      // console.log('📡 initializationServerPermissionService...');
      
      // 动态导入避免循环依赖
      const { ServerPermissionService } = await import('./serverPermissionService');
      
      // 注入到容器
      ServiceContainer.setServerPermissionService(ServerPermissionService);
      
      this.state.services.add('ServerPermissionService');
      // console.log('✅ ServerPermissionServiceinitializationcompleted');
      
    } catch (error) {
      const errorMsg = `ServerPermissionService初始化失败: ${error instanceof Error ? error.message : String(error)}`;
      console.error('❌', errorMsg);
      
      this.state.errors.push({
        service: 'ServerPermissionService',
        error: errorMsg
      });
      
      throw new Error(errorMsg);
    }
  }

  /**
   * 检查服务初始化状态
   */
  static getInitializationState(): ServiceInitializationState {
    return { ...this.state };
  }

  /**
   * 重置初始化状态（用于测试）
   */
  static reset(): void {
    this.state = {
      initialized: false,
      services: new Set(),
      errors: []
    };
    
    // 清除注入的服务
    ServiceContainer.setServerPermissionService(null);
    
    console.log('🔄 serviceinitializationstatealreadyresetting');
  }

  /**
   * 检查特定服务是否已初始化
   */
  static isServiceInitialized(serviceName: string): boolean {
    return this.state.services.has(serviceName);
  }

  /**
   * 获取初始化错误
   */
  static getErrors(): Array<{ service: string; error: string }> {
    return [...this.state.errors];
  }

  /**
   * 延迟初始化特定服务
   */
  static async lazyInitializeService(serviceName: string): Promise<void> {
    if (this.isServiceInitialized(serviceName)) {
      return;
    }

    switch (serviceName) {
      case 'ServerPermissionService':
        await this.initializeServerPermissionService();
        break;
      default:
        console.warn(`⚠️ not知的service: ${serviceName}`);
    }
  }
}

/**
 * 自动初始化（在模块加载时）
 * 在开发环境中自动初始化，生产环境需要手动调用
 */
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // 延迟初始化，避免阻塞应用启动
  setTimeout(() => {
    ServiceInitializer.initialize().catch(error => {
      console.warn('⚠️ 自动Service initialization failed:', error);
    });
  }, 1000);
}

export default ServiceInitializer;
