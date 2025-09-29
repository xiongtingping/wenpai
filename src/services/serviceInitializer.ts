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
import { createDataService } from './supabaseDataService';

// 注册 Supabase 服务工厂，避免 utils ↔ services 循环依赖
registerSupabaseServiceFactory((userId, tableName) => createDataService(userId, tableName));

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
      console.log('📦 服务已初始化，跳过重复初始化');
      return;
    }

    // console.log('🚀 开始初始化服务依赖...');

    try {
      // 1. 注册所有服务到DI容器 - 优雅降级
      try {
        const { registerAllServices } = await import('@/config/serviceRegistry');
        await registerAllServices();
        // console.log('✅ DI容器服务注册完成');
      } catch (error) {
        console.warn('⚠️ DI容器注册失败，跳过:', error);
        this.state.errors.push({ service: 'DIContainer', error: String(error) });
      }

      // 2. 初始化ServerPermissionService - 优雅降级
      try {
        await this.initializeServerPermissionService();
      } catch (error) {
        console.warn('⚠️ 权限服务初始化失败，跳过:', error);
        this.state.errors.push({ service: 'ServerPermissionService', error: String(error) });
      }

      this.state.initialized = true;
      // console.log('✅ 服务依赖初始化完成 (部分失败已跳过)');
      
    } catch (error) {
      console.warn('⚠️ 服务依赖初始化部分失败，应用仍可正常使用:', error);
      this.state.initialized = true; // 标记为已初始化，避免重复尝试
      this.state.errors.push({ service: 'ServiceInitializer', error: String(error) });
    }
  }

  /**
   * 初始化ServerPermissionService
   */
  private static async initializeServerPermissionService(): Promise<void> {
    try {
      // console.log('📡 初始化ServerPermissionService...');
      
      // 动态导入避免循环依赖
      const { ServerPermissionService } = await import('./serverPermissionService');
      
      // 注入到容器
      ServiceContainer.setServerPermissionService(ServerPermissionService);
      
      this.state.services.add('ServerPermissionService');
      // console.log('✅ ServerPermissionService初始化完成');
      
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
    
    console.log('🔄 服务初始化状态已重置');
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
        console.warn(`⚠️ 未知的服务: ${serviceName}`);
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
      console.warn('⚠️ 自动服务初始化失败:', error);
    });
  }, 1000);
}

export default ServiceInitializer;
