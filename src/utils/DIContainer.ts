/**
 * 🔧 依赖注入容器 - 替代单例模式的根本性解决方案
 * 
 * 解决问题：
 * 1. 消除TDZ错误和getInstance问题
 * 2. 提供可测试的服务管理
 * 3. 控制服务初始化顺序
 * 4. 防止循环依赖
 */

export interface ServiceFactory<T = any> {
  (): T | Promise<T>;
}

export interface ServiceDefinition<T = any> {
  name: string;
  factory: ServiceFactory<T>;
  dependencies?: string[];
  singleton?: boolean;
  lazy?: boolean;
}

export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();
  private loading = new Map<string, Promise<any>>();
  private initializationOrder: string[] = [];

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * 注册服务
   */
  register<T>(definition: ServiceDefinition<T>): void {
    if (this.services.has(definition.name)) {
      console.warn(`⚠️ service ${definition.name} alreadyexists，将被覆盖`);
    }
    
    this.services.set(definition.name, {
      singleton: true,
      lazy: true,
      ...definition
    });
    
    // 只在debug模式下输出服务注册日志
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`📝 registerservice: ${definition.name}`);
    }
  }

  /**
   * 获取服务实例
   */
  async get<T>(name: string): Promise<T> {
    // 如果是单例且已实例化，直接返回
    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`❌ service ${name} notregister`);
    }

    if (definition.singleton && this.instances.has(name)) {
      return this.instances.get(name);
    }

    // 如果正在加载，等待加载完成
    if (this.loading.has(name)) {
      return this.loading.get(name);
    }

    // 开始加载服务
    const loadingPromise = this.loadService(name);
    this.loading.set(name, loadingPromise);

    try {
      const instance = await loadingPromise;
      this.loading.delete(name);
      
      if (definition.singleton) {
        this.instances.set(name, instance);
      }
      
      return instance;
    } catch (error) {
      this.loading.delete(name);
      throw error;
    }
  }

  /**
   * 同步获取服务（仅用于已初始化的服务）
   */
  getSync<T>(name: string): T {
    const instance = this.instances.get(name);
    if (!instance) {
      throw new Error(`❌ 服务 ${name} 未初始化或不存在`);
    }
    return instance;
  }

  /**
   * 加载服务及其依赖
   */
  private async loadService(name: string): Promise<any> {
    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`❌ service ${name} notregister`);
    }

    // 只在debug模式下输出服务加载日志
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`🔄 loadingservice: ${name}`);
    }

    // 先加载依赖
    if (definition.dependencies) {
      for (const dep of definition.dependencies) {
        await this.get(dep);
      }
    }

    // 创建服务实例
    try {
      const instance = await definition.factory();
      this.initializationOrder.push(name);
      // 只在debug模式下输出服务加载完成日志
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`✅ serviceloadingcompleted: ${name}`);
      }
      return instance;
    } catch (error) {
      console.error(`❌ serviceloadingfailed: ${name}`, error);
      throw error;
    }
  }

  /**
   * 预加载所有非懒加载服务
   */
  async preloadEagerServices(): Promise<void> {
    console.log('🚀 starts预loading非懒loadingservice...');
    const startTime = performance.now();

    const eagerServices = Array.from(this.services.entries())
      .filter(([_, def]) => !def.lazy)
      .map(([name]) => name);

    const loadOrder = this.calculateLoadOrder(eagerServices);
    
    for (const serviceName of loadOrder) {
      await this.get(serviceName);
    }

    const endTime = performance.now();
    console.log(`✅ 预loadingcompleted，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.log('📋 loading顺序:', this.initializationOrder);
  }

  /**
   * 计算加载顺序（拓扑排序）
   */
  private calculateLoadOrder(serviceNames: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`❌ 检测到循环依赖: ${name}`);
      }

      visiting.add(name);
      const definition = this.services.get(name);
      
      if (definition?.dependencies) {
        for (const dep of definition.dependencies) {
          if (serviceNames.includes(dep)) {
            visit(dep);
          }
        }
      }

      visiting.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const name of serviceNames) {
      visit(name);
    }

    return result;
  }

  /**
   * 检查服务是否已注册
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * 检查服务是否已实例化
   */
  isInstantiated(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    registered: number;
    instantiated: number;
    loading: number;
    order: string[];
  } {
    return {
      registered: this.services.size,
      instantiated: this.instances.size,
      loading: this.loading.size,
      order: this.initializationOrder
    };
  }

  /**
   * 清理所有服务（主要用于测试）
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
    this.loading.clear();
    this.initializationOrder = [];
  }

  /**
   * 销毁服务实例
   */
  destroy(name: string): void {
    this.instances.delete(name);
    this.loading.delete(name);
    console.log(`🗑️ 销毁service: ${name}`);
  }
}

// 导出全局容器实例
export const container = DIContainer.getInstance();

// 导出便捷函数
export const registerService = <T>(definition: ServiceDefinition<T>) => 
  container.register(definition);

export const getService = <T>(name: string): Promise<T> => 
  container.get<T>(name);

export const getServiceSync = <T>(name: string): T => 
  container.getSync<T>(name);

export const preloadServices = () => 
  container.preloadEagerServices();
