/**
 * 🔧 服务注册配置 - 统一管理所有服务的依赖注入
 * 
 * 替代单例模式，解决TDZ错误的根本性方案
 */

import { registerService } from '@/utils/DIContainer';

/**
 * 注册所有服务到DI容器
 */
export async function registerAllServices(): Promise<void> {
  // console.log('🔧 startsregister所hasservice到DIcontainer...');

  // 第1层：基础配置服务（无依赖）
  registerService({
    name: 'configManager',
    factory: async () => {
      const { configManager } = await import('@/config/configManager');
      return configManager;
    },
    lazy: false, // 立即加载
    dependencies: []
  });

  // 第2层：权限系统（依赖配置）
  registerService({
    name: 'rolePermissionMatrix',
    factory: async () => {
      const module = await import('@/config/rolePermissionMatrix');
      return module.rolePermissionMatrix;
    },
    dependencies: ['configManager'],
    lazy: false
  });

  registerService({
    name: 'unifiedPermissionConfig',
    factory: async () => {
      const module = await import('@/config/unifiedPermissionConfig');
      return module.unifiedPermissionConfig;
    },
    dependencies: ['configManager', 'rolePermissionMatrix'],
    lazy: false
  });

  // 第3层：核心服务（依赖权限系统）
  registerService({
    name: 'brandDatabaseService',
    factory: async () => {
      const { BrandDatabaseService } = await import('@/services/brandDatabaseService');
      // 不再使用getInstance，直接创建实例
      return new BrandDatabaseService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'brandPromptService',
    factory: async () => {
      const { BrandPromptService } = await import('@/services/brandPromptService');
      return new BrandPromptService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'brandProfileService',
    factory: async () => {
      const { BrandProfileService } = await import('@/services/brandProfileService');
      return new BrandProfileService();
    },
    dependencies: ['brandDatabaseService', 'brandPromptService']
  });

  registerService({
    name: 'paymentService',
    factory: async () => {
      const { PaymentService } = await import('@/services/paymentService');
      return new PaymentService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'md2wechatService',
    factory: async () => {
      const { MD2WeChatService } = await import('@/services/md2wechatService');
      return new MD2WeChatService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'hotTopicsService',
    factory: async () => {
      const { HotTopicsAPI } = await import('@/api/hotTopicsService');
      return new HotTopicsAPI();
    },
    dependencies: ['configManager']
  });

  // 第4层：AI服务（依赖核心服务）
  registerService({
    name: 'aiAnalysisService',
    factory: async () => {
      const { AIAnalysisService } = await import('@/services/aiAnalysisService');
      return new AIAnalysisService();
    },
    dependencies: ['configManager']
  });

  // 🔧 FIXED: 暂时注释掉不存在的服务
  // registerService({
  //   name: 'unifiedAIService',
  //   factory: async () => {
  //     const { UnifiedAIService } = await import('@/services/unifiedAIService');
  //     return new UnifiedAIService();
  //   },
  //   dependencies: ['configManager']
  // });

  // 第5层：数据服务
  registerService({
    name: 'userDataService',
    factory: async () => {
      const { UserDataService } = await import('@/services/userDataService');
      return new UserDataService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'favoritesService',
    factory: async () => {
      const { FavoritesService } = await import('@/services/favoritesService');
      return new FavoritesService();
    },
    dependencies: ['configManager']
  });

  registerService({
    name: 'orderStatusService',
    factory: async () => {
      const { OrderStatusService } = await import('@/services/orderStatusService');
      return new OrderStatusService();
    },
    dependencies: ['configManager']
  });

  // 第6层：工具服务
  // 🔧 FIXED: 暂时注释掉不存在的服务
  // registerService({
  //   name: 'storageQuotaManager',
  //   factory: async () => {
  //     const { StorageQuotaManager } = await import('@/utils/storageQuotaManager');
  //     return new StorageQuotaManager();
  //   },
  //   dependencies: ['configManager']
  // });

  registerService({
    name: 'zIndexManager',
    factory: async () => {
      const { zIndexManager } = await import('@/utils/zIndexManager');
      return zIndexManager;
    },
    dependencies: []
  });

  // console.log('✅ 所hasserviceregistercompleted');
}

/**
 * 获取服务的便捷函数（带类型安全）
 */
export async function getBrandDatabaseService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('brandDatabaseService');
}

export async function getBrandPromptService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('brandPromptService');
}

export async function getBrandProfileService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('brandProfileService');
}

export async function getPaymentService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('paymentService');
}

export async function getMD2WeChatService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('md2wechatService');
}

export async function getHotTopicsService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('hotTopicsService');
}

export async function getAIAnalysisService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('aiAnalysisService');
}

export async function getUnifiedAIService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('unifiedAIService');
}

export async function getUserDataService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('userDataService');
}

export async function getFavoritesService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('favoritesService');
}

export async function getOrderStatusService() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('orderStatusService');
}

export async function getStorageQuotaManager() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('storageQuotaManager');
}

export async function getZIndexManager() {
  const { getService } = await import('@/utils/DIContainer');
  return getService<any>('zIndexManager');
}
