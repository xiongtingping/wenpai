/**
 * 网络异常降级处理服务
 * @description 提供网络请求失败时的降级策略，确保应用在网络异常情况下的可用性
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logger } from '@/utils/logger';

/**
 * 网络状态
 */
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  UNSTABLE = 'unstable'
}

/**
 * 降级策略类型
 */
export enum FallbackStrategy {
  /** 使用缓存数据 */
  CACHE = 'cache',
  /** 使用默认数据 */
  DEFAULT = 'default',
  /** 重试请求 */
  RETRY = 'retry',
  /** 静默失败 */
  SILENT = 'silent',
  /** 显示错误 */
  ERROR = 'error',
  /** 离线模式 */
  OFFLINE_MODE = 'offline_mode'
}

/**
 * 请求配置
 */
export interface RequestConfig {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求数据 */
  data?: any;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 是否允许降级 */
  allowFallback?: boolean;
  /** 降级策略 */
  fallbackStrategy?: FallbackStrategy;
  /** 缓存键 */
  cacheKey?: string;
  /** 默认数据 */
  defaultData?: any;
}

/**
 * 响应结果
 */
export interface NetworkResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 是否来自缓存 */
  fromCache?: boolean;
  /** 是否为默认数据 */
  isDefault?: boolean;
  /** 响应状态码 */
  status?: number;
  /** 响应时间（毫秒） */
  responseTime?: number;
  /** 网络状态 */
  networkStatus?: NetworkStatus;
}

/**
 * 网络监控统计
 */
export interface NetworkStats {
  /** 总请求数 */
  totalRequests: number;
  /** 成功请求数 */
  successfulRequests: number;
  /** 失败请求数 */
  failedRequests: number;
  /** 缓存命中数 */
  cacheHits: number;
  /** 降级处理数 */
  fallbackCount: number;
  /** 平均响应时间 */
  avgResponseTime: number;
  /** 当前网络状态 */
  currentNetworkStatus: NetworkStatus;
  /** 最后检测时间 */
  lastCheckTime: number;
}

/**
 * 网络异常降级处理器
 */
export class NetworkFallbackHandler {
  private static instance: NetworkFallbackHandler;
  private networkStatus: NetworkStatus = NetworkStatus.ONLINE;
  private stats: NetworkStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    fallbackCount: 0,
    avgResponseTime: 0,
    currentNetworkStatus: NetworkStatus.ONLINE,
    lastCheckTime: Date.now()
  };

  private requestCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private responseTimeBuffer: number[] = [];
  private maxResponseTimeBuffer = 10;
  private slowThreshold = 5000; // 5秒认为是慢网络
  private retryQueue: Array<() => Promise<any>> = [];

  private constructor() {
    this.initializeNetworkMonitoring();
    this.startPeriodicCleanup();
  }

  static getInstance(): NetworkFallbackHandler {
    if (!NetworkFallbackHandler.instance) {
      NetworkFallbackHandler.instance = new NetworkFallbackHandler();
    }
    return NetworkFallbackHandler.instance;
  }

  /**
   * 执行网络请求（带降级处理）
   */
  async request<T = any>(config: RequestConfig): Promise<NetworkResponse<T>> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // 检查网络状态
      if (this.networkStatus === NetworkStatus.OFFLINE) {
        return await this.handleFallback<T>(config, new Error('u64cdu4f5cu5931u8d25'));
      }

      // 执行请求
      const response = await this.executeRequest<T>(config);
      
      // 记录成功
      this.stats.successfulRequests++;
      this.recordResponseTime(Date.now() - startTime);

      // 缓存成功的响应
      if (config.cacheKey && response.success) {
        this.cacheResponse(config.cacheKey, response.data);
      }

      return {
        ...response,
        responseTime: Date.now() - startTime,
        networkStatus: this.networkStatus
      };

    } catch (error) {
      this.stats.failedRequests++;
      logger.error('网络请求失败:', error, config);

      // 执行降级处理
      return await this.handleFallback<T>(config, error);
    }
  }

  /**
   * 批量请求（带降级处理）
   */
  async batchRequest<T = any>(configs: RequestConfig[]): Promise<NetworkResponse<T>[]> {
    const promises = configs.map(config => this.request<T>(config));
    return Promise.all(promises);
  }

  /**
   * 预加载关键数据
   */
  async preloadCriticalData(requests: RequestConfig[]): Promise<void> {
    if (this.networkStatus === NetworkStatus.OFFLINE) {
      logger.warn('网络离线，跳过预加载');
      return;
    }

    try {
      const promises = requests.map(async config => {
        try {
          const response = await this.request(config);
          if (config.cacheKey && response.success) {
            this.cacheResponse(config.cacheKey, response.data, 60 * 60 * 1000); // 1小时缓存
          }
        } catch (error) {
          logger.warn('预加载失败:', config.url, error);
        }
      });

      await Promise.all(promises);
      logger.info(`预加载完成，共 ${requests.length} 个请求`);
    } catch (error) {
      logger.error('预加载过程中出错:', error);
    }
  }

  /**
   * 获取网络状态
   */
  getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  /**
   * 获取统计信息
   */
  getStats(): NetworkStats {
    return { ...this.stats };
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const [key] of this.requestCache) {
        if (key.includes(pattern)) {
          this.requestCache.delete(key);
        }
      }
    } else {
      this.requestCache.clear();
    }
    logger.info(`缓存已清除${pattern ? ` (模式: ${pattern})` : ''}`);
  }

  /**
   * 强制重试失败的请求
   */
  async retryFailedRequests(): Promise<void> {
    if (this.retryQueue.length === 0) {
      return;
    }

    logger.info(`开始重试 ${this.retryQueue.length} 个失败的请求`);
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    const promises = queue.map(async retryFn => {
      try {
        await retryFn();
      } catch (error) {
        logger.warn('重试请求失败:', error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 执行实际的网络请求
   */
  private async executeRequest<T>(config: RequestConfig): Promise<NetworkResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      headers = {},
      timeout = 10000,
      retries = 3,
      retryDelay = 1000
    } = config;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        return {
          data: responseData,
          success: true,
          status: response.status
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('未知错误');
        
        if (attempt < retries) {
          logger.warn(`请求失败，${retryDelay}ms后重试 (${attempt + 1}/${retries}):`, error);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError || new Error('请求失败');
  }

  /**
   * 处理降级策略
   */
  private async handleFallback<T>(config: RequestConfig, error: any): Promise<NetworkResponse<T>> {
    this.stats.fallbackCount++;
    const strategy = config.fallbackStrategy || FallbackStrategy.CACHE;

    logger.info(`执行降级策略: ${strategy}`, { url: config.url, error: error.message });

    switch (strategy) {
      case FallbackStrategy.CACHE:
        return this.useCachedData<T>(config);

      case FallbackStrategy.DEFAULT:
        return this.useDefaultData<T>(config);

      case FallbackStrategy.RETRY:
        return this.scheduleRetry<T>(config);

      case FallbackStrategy.OFFLINE_MODE:
        return this.enterOfflineMode<T>(config);

      case FallbackStrategy.SILENT:
        return {
          data: null as T,
          success: false,
          error: error.message,
          networkStatus: this.networkStatus
        };

      case FallbackStrategy.ERROR:
      default:
        throw error;
    }
  }

  /**
   * 使用缓存数据
   */
  private useCachedData<T>(config: RequestConfig): NetworkResponse<T> {
    const cacheKey = config.cacheKey || config.url;
    const cached = this.requestCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.stats.cacheHits++;
      return {
        data: cached.data,
        success: true,
        fromCache: true,
        networkStatus: this.networkStatus
      };
    }

    // 缓存不存在或已过期，使用默认数据
    return this.useDefaultData<T>(config);
  }

  /**
   * 使用默认数据
   */
  private useDefaultData<T>(config: RequestConfig): NetworkResponse<T> {
    return {
      data: config.defaultData || null,
      success: !!config.defaultData,
      isDefault: true,
      error: config.defaultData ? undefined : 'u64cdu4f5cu5931u8d25',
      networkStatus: this.networkStatus
    };
  }

  /**
   * 调度重试
   */
  private async scheduleRetry<T>(config: RequestConfig): Promise<NetworkResponse<T>> {
    // 添加到重试队列
    const retryFn = () => this.request<T>(config);
    this.retryQueue.push(retryFn);

    // 立即尝试重试一次
    try {
      return await retryFn();
    } catch {
      // 重试失败，返回缓存或默认数据
      return this.useCachedData<T>(config);
    }
  }

  /**
   * 进入离线模式
   */
  private enterOfflineMode<T>(config: RequestConfig): NetworkResponse<T> {
    logger.info('进入离线模式');
    return this.useCachedData<T>(config);
  }

  /**
   * 缓存响应数据
   */
  private cacheResponse(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 记录响应时间
   */
  private recordResponseTime(time: number): void {
    this.responseTimeBuffer.push(time);
    
    if (this.responseTimeBuffer.length > this.maxResponseTimeBuffer) {
      this.responseTimeBuffer.shift();
    }

    // 计算平均响应时间
    const avgTime = this.responseTimeBuffer.reduce((sum, t) => sum + t, 0) / this.responseTimeBuffer.length;
    this.stats.avgResponseTime = avgTime;

    // 更新网络状态
    if (avgTime > this.slowThreshold) {
      this.networkStatus = NetworkStatus.SLOW;
    } else if (navigator.onLine) {
      this.networkStatus = NetworkStatus.ONLINE;
    }
  }

  /**
   * 初始化网络监控
   */
  private initializeNetworkMonitoring(): void {
    // 监听在线/离线状态
    window.addEventListener('online', () => {
      logger.info('网络已连接');
      this.networkStatus = NetworkStatus.ONLINE;
      this.stats.currentNetworkStatus = NetworkStatus.ONLINE;
      this.retryFailedRequests();
    });

    window.addEventListener('offline', () => {
      logger.warn('网络已断开');
      this.networkStatus = NetworkStatus.OFFLINE;
      this.stats.currentNetworkStatus = NetworkStatus.OFFLINE;
    });

    // 初始状态
    this.networkStatus = navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE;
    this.stats.currentNetworkStatus = this.networkStatus;

    // 定期检测网络质量
    this.startNetworkQualityCheck();
  }

  /**
   * 开始网络质量检测
   */
  private startNetworkQualityCheck(): void {
    setInterval(async () => {
      if (!navigator.onLine) {
        this.networkStatus = NetworkStatus.OFFLINE;
        return;
      }

      try {
        // 发送小型测试请求
        const startTime = Date.now();
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          if (responseTime > this.slowThreshold) {
            this.networkStatus = NetworkStatus.SLOW;
          } else {
            this.networkStatus = NetworkStatus.ONLINE;
          }
        } else {
          this.networkStatus = NetworkStatus.UNSTABLE;
        }
      } catch (error) {
        this.networkStatus = NetworkStatus.OFFLINE;
      }

      this.stats.currentNetworkStatus = this.networkStatus;
      this.stats.lastCheckTime = Date.now();
    }, 30000); // 每30秒检测一次
  }

  /**
   * 定期清理
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // 清理过期缓存
      for (const [key, cached] of this.requestCache) {
        if (now - cached.timestamp > cached.ttl) {
          this.requestCache.delete(key);
        }
      }

      // 清理旧的响应时间数据
      if (this.responseTimeBuffer.length > this.maxResponseTimeBuffer) {
        this.responseTimeBuffer = this.responseTimeBuffer.slice(-this.maxResponseTimeBuffer);
      }

    }, 60000); // 每分钟清理一次
  }
}

// 导出单例
export const networkFallbackHandler = NetworkFallbackHandler.getInstance();

export default NetworkFallbackHandler;