/**
 * 🔧 服务预加载器 - 根本性修复TDZ和getInstance错误
 * 
 * 解决问题：
 * 1. 控制单例服务的初始化顺序
 * 2. 防止压缩后变量名导致的访问错误
 * 3. 提供安全的服务访问机制
 */

interface ServiceModule {
  name: string;
  loader: () => Promise<any>;
  dependency?: string[];
  critical?: boolean;
}

class ServicePreloader {
  private static instance: ServicePreloader;
  private loadedServices = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();
  private initializationOrder: string[] = [];

  private constructor() {}

  static getInstance(): ServicePreloader {
    if (!ServicePreloader.instance) {
      ServicePreloader.instance = new ServicePreloader();
    }
    return ServicePreloader.instance;
  }

  /**
   * 定义服务加载配置 - 按依赖关系排序
   */
  private getServiceDefinitions(): ServiceModule[] {
    return [
      // 第1层：基础配置（无依赖）
      {
        name: 'configManager',
        loader: () => import('../config/configManager'),
        critical: true
      },
      
      // 第2层：权限系统（依赖配置）
      {
        name: 'rolePermissionMatrix',
        loader: () => import('../config/rolePermissionMatrix'),
        dependency: ['configManager'],
        critical: true
      },
      {
        name: 'unifiedPermissionConfig',
        loader: () => import('../config/unifiedPermissionConfig'),
        dependency: ['configManager', 'rolePermissionMatrix'],
        critical: true
      },

      // 第3层：核心服务（依赖权限系统）
      {
        name: 'hotTopicsService',
        loader: () => import('../api/hotTopicsService'),
        dependency: ['configManager'],
        critical: true
      },
      {
        name: 'paymentService',
        loader: () => import('../services/paymentService'),
        dependency: ['configManager', 'unifiedPermissionConfig'],
        critical: true
      },
      {
        name: 'userDataService',
        loader: () => import('../services/userDataService'),
        dependency: ['configManager'],
        critical: true
      },

      // 第4层：业务服务
      {
        name: 'favoritesService',
        loader: () => import('../services/favoritesService'),
        dependency: ['userDataService'],
        critical: false
      },
      {
        name: 'brandCorpusService',
        loader: () => import('../services/brandCorpusService'),
        dependency: ['configManager'],
        critical: false
      },

      // 第5层：辅助服务
      {
        name: 'dataSync',
        loader: () => import('../lib/dataSync'),
        dependency: ['userDataService'],
        critical: false
      },
      {
        name: 'storageQuotaManager',
        loader: () => import('../lib/storageQuotaManager'),
        dependency: ['configManager'],
        critical: false
      }
    ];
  }

  /**
   * 按依赖顺序预加载所有服务
   */
  async preloadAllServices(): Promise<void> {
    console.log('🚀 开始预加载服务，防止TDZ和getInstance错误...');
    const startTime = performance.now();

    const services = this.getServiceDefinitions();
    const loadOrder = this.calculateLoadOrder(services);
    
    try {
      // 按计算出的顺序逐个加载
      for (const serviceName of loadOrder) {
        const service = services.find(s => s.name === serviceName);
        if (service) {
          await this.loadService(service);
        }
      }

      const endTime = performance.now();
      console.log(`✅ 服务预加载完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📋 加载顺序:', this.initializationOrder);

    } catch (error) {
      console.error('❌ 服务预加载失败:', error);
      throw error;
    }
  }

  /**
   * 计算服务加载顺序（拓扑排序）
   */
  private calculateLoadOrder(services: ServiceModule[]): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string) => {
      if (temp.has(serviceName)) {
        throw new Error(`检测到循环依赖: ${serviceName}`);
      }
      if (visited.has(serviceName)) {
        return;
      }

      temp.add(serviceName);
      const service = services.find(s => s.name === serviceName);
      
      if (service?.dependency) {
        for (const dep of service.dependency) {
          visit(dep);
        }
      }

      temp.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    // 优先加载关键服务
    const criticalServices = services.filter(s => s.critical).map(s => s.name);
    const nonCriticalServices = services.filter(s => !s.critical).map(s => s.name);

    [...criticalServices, ...nonCriticalServices].forEach(visit);
    return order;
  }

  /**
   * 安全加载单个服务
   */
  private async loadService(service: ServiceModule): Promise<any> {
    if (this.loadedServices.has(service.name)) {
      return this.loadedServices.get(service.name);
    }

    if (this.loadingPromises.has(service.name)) {
      return this.loadingPromises.get(service.name);
    }

    const loadPromise = this.doLoadService(service);
    this.loadingPromises.set(service.name, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedServices.set(service.name, module);
      this.initializationOrder.push(service.name);
      console.log(`✅ 已加载服务: ${service.name}`);
      return module;
    } catch (error) {
      console.error(`❌ 加载服务失败: ${service.name}`, error);
      this.loadingPromises.delete(service.name);
      throw error;
    }
  }

  /**
   * 执行服务加载
   */
  private async doLoadService(service: ServiceModule): Promise<any> {
    try {
      const module = await service.loader();
      
      // 如果模块有getInstance方法，尝试初始化
      if (module.default && typeof module.default.getInstance === 'function') {
        try {
          const instance = module.default.getInstance();
          console.log(`🔧 已初始化单例: ${service.name}`);
          return { ...module, instance };
        } catch (error) {
          console.warn(`⚠️ 单例初始化失败: ${service.name}`, error);
          return module;
        }
      }

      return module;
    } catch (error) {
      console.error(`💥 模块加载错误: ${service.name}`, error);
      throw error;
    }
  }

  /**
   * 获取已加载的服务
   */
  getService(name: string): any {
    return this.loadedServices.get(name);
  }

  /**
   * 获取加载统计
   */
  getStats(): { loaded: number; total: number; order: string[] } {
    const total = this.getServiceDefinitions().length;
    return {
      loaded: this.loadedServices.size,
      total,
      order: this.initializationOrder
    };
  }

  /**
   * 检查是否所有关键服务都已加载
   */
  areCriticalServicesLoaded(): boolean {
    const criticalServices = this.getServiceDefinitions()
      .filter(s => s.critical)
      .map(s => s.name);
    
    return criticalServices.every(name => this.loadedServices.has(name));
  }
}

// 导出单例实例
export const servicePreloader = ServicePreloader.getInstance();

// 导出便捷函数
export const preloadAllServices = () => servicePreloader.preloadAllServices();
export const getService = (name: string) => servicePreloader.getService(name);
export const getServicesStats = () => servicePreloader.getStats();