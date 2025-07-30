/**
 * 全网雷达API服务 - 完整封装版本
 * 提供全网热点话题相关API请求、缓存、错误处理、重试机制等完整功能
 *
 * 功能特性：
 * - 多平台热点数据聚合
 * - 智能缓存机制
 * - 自动重试与降级
 * - 数据预处理与格式化
 * - 错误监控与日志
 * - 性能优化
 */
import request from './request';

// ==================== 类型定义 ====================

export interface DailyHotItem {
  title: string;
  hot: string;
  url: string;
  mobil_url?: string;
  index?: number;
  desc?: string;
  pic?: string;
  platform?: string;
  content?: string;
  relatedTopics?: string[];
  rank?: number;
  preferenceScore?: number;
  matchedKeywords?: string[];
  isHighPriority?: boolean;
  // 新增字段
  timestamp?: number;
  category?: string;
  tags?: string[];
  source?: string;
  heat_score?: number;
  trend?: 'up' | 'down' | 'stable';
  change_rate?: number;
}

export interface DailyHotResponse {
  code: number;
  message?: string;
  data: Record<string, DailyHotItem[]>;
  updateTime?: string;
  // 新增字段
  cacheTime?: number;
  totalCount?: number;
  platformStats?: Record<string, PlatformStats>;
  metadata?: ResponseMetadata;
}

export interface PlatformStats {
  total: number;
  avgHeat: number;
  topHeat: number;
  updateTime: string;
  status: 'active' | 'error' | 'timeout';
  errorCount: number;
}

export interface ResponseMetadata {
  requestId: string;
  processingTime: number;
  cacheHit: boolean;
  dataSource: string;
  version: string;
}

export interface CacheConfig {
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
  enablePersist: boolean; // 是否持久化到localStorage
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  enableFallback: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  cache: CacheConfig;
  retry: RetryConfig;
  enableLogging: boolean;
  enableMetrics: boolean;
}

// ==================== 配置管理 ====================

class HotTopicsConfig {
  private static instance: HotTopicsConfig;
  private config: ApiConfig;

  private constructor() {
    this.config = {
      baseUrl: '/api/hot',
      timeout: 10000,
      cache: {
        ttl: 5 * 60 * 1000, // 5分钟
        maxSize: 100,
        enablePersist: true
      },
      retry: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        enableFallback: true
      },
      enableLogging: process.env.NODE_ENV === 'development',
      enableMetrics: true
    };
  }

  static getInstance(): HotTopicsConfig {
    if (!HotTopicsConfig.instance) {
      HotTopicsConfig.instance = new HotTopicsConfig();
    }
    return HotTopicsConfig.instance;
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// ==================== 缓存管理 ====================

class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.loadFromStorage();
  }

  set(key: string, data: any, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, item);

    if (this.config.enablePersist) {
      this.saveToStorage();
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
    if (this.config.enablePersist) {
      localStorage.removeItem('hotTopicsCache');
    }
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private loadFromStorage(): void {
    if (!this.config.enablePersist) return;

    try {
      const stored = localStorage.getItem('hotTopicsCache');
      if (stored) {
        const data = JSON.parse(stored);
        for (const [key, item] of Object.entries(data)) {
          this.cache.set(key, item as any);
        }
      }
    } catch (error) {
      console.warn('加载缓存失败:', error);
    }
  }

  private saveToStorage(): void {
    if (!this.config.enablePersist) return;

    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem('hotTopicsCache', JSON.stringify(data));
    } catch (error) {
      console.warn('保存缓存失败:', error);
    }
  }
}

// ==================== 日志管理 ====================

class Logger {
  private static instance: Logger;
  private enableLogging: boolean;

  private constructor(enableLogging: boolean = false) {
    this.enableLogging = enableLogging;
  }

  static getInstance(enableLogging?: boolean): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(enableLogging);
    }
    return Logger.instance;
  }

  info(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[HotTopics] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.enableLogging) {
      console.warn(`[HotTopics] ${message}`, data || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.enableLogging) {
      console.error(`[HotTopics] ${message}`, error || '');
    }
  }

  debug(message: string, data?: any): void {
    if (this.enableLogging && process.env.NODE_ENV === 'development') {
      console.debug(`[HotTopics] ${message}`, data || '');
    }
  }
}

// ==================== 性能监控 ====================

class MetricsCollector {
  private metrics = new Map<string, any[]>();
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  startTimer(operation: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, { duration, timestamp: Date.now() });
    };
  }

  recordMetric(name: string, data: any): void {
    if (!this.enabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(data);

    // 保持最近100条记录
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(name?: string): any {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Object.fromEntries(this.metrics.entries());
  }

  getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }
}

// ==================== 核心API类 ====================

class HotTopicsAPI {
  private static instance: HotTopicsAPI;
  private config: ApiConfig;
  private cache: CacheManager;
  private logger: Logger;
  private metrics: MetricsCollector;

  private constructor() {
    this.config = HotTopicsConfig.getInstance().getConfig();
    this.cache = new CacheManager(this.config.cache);
    this.logger = Logger.getInstance(this.config.enableLogging);
    this.metrics = new MetricsCollector(this.config.enableMetrics);
  }

  static getInstance(): HotTopicsAPI {
    if (!HotTopicsAPI.instance) {
      HotTopicsAPI.instance = new HotTopicsAPI();
    }
    return HotTopicsAPI.instance;
  }

  /**
   * 获取指定平台热榜数据（带缓存和重试）
   */
  async getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
    const endTimer = this.metrics.startTimer(`platform_${platform}`);
    const cacheKey = `platform_${platform}`;

    try {
      // 检查缓存
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug(`缓存命中: ${platform}`);
        endTimer();
        return cached;
      }

      // 特殊平台过滤
      if (platform === 'weatheralarm' || platform === 'earthquake') {
        return [];
      }

      const data = await this.fetchWithRetry(`/${platform}`, platform);

      // 数据预处理
      const processedData = this.processRawData(data, platform);

      // 缓存结果
      this.cache.set(cacheKey, processedData);

      this.logger.info(`成功获取${platform}数据`, { count: processedData.length });
      endTimer();

      return processedData;

    } catch (error) {
      this.logger.error(`获取${platform}数据失败`, error);
      endTimer();

      // 尝试返回过期缓存
      if (this.config.retry.enableFallback) {
        const staleCache = this.getStaleCache(cacheKey);
        if (staleCache) {
          this.logger.warn(`使用过期缓存: ${platform}`);
          return staleCache;
        }
      }

      throw new Error(`获取${platform}平台数据失败`);
    }
  }

  /**
   * 获取全网热点聚合数据
   */
  async getDailyHotAll(): Promise<DailyHotResponse> {
    const endTimer = this.metrics.startTimer('all_platforms');
    const cacheKey = 'all_platforms';

    try {
      // 检查缓存
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('全平台数据缓存命中');
        endTimer();
        return cached;
      }

      const platforms = this.getSupportedPlatforms();
      const aggregatedData: Record<string, DailyHotItem[]> = {};
      const platformStats: Record<string, PlatformStats> = {};

      // 并发获取所有平台数据
      const platformPromises = platforms.map(async (platform) => {
        const startTime = Date.now();
        try {
          const platformData = await this.getDailyHotByPlatform(platform);
          const processingTime = Date.now() - startTime;

          return {
            platform,
            data: platformData,
            stats: {
              total: platformData.length,
              avgHeat: this.calculateAverageHeat(platformData),
              topHeat: this.getTopHeat(platformData),
              updateTime: new Date().toISOString(),
              status: 'active' as const,
              errorCount: 0
            },
            processingTime
          };
        } catch (error) {
          this.logger.warn(`获取${platform}数据失败`, error);
          return {
            platform,
            data: [],
            stats: {
              total: 0,
              avgHeat: 0,
              topHeat: 0,
              updateTime: new Date().toISOString(),
              status: 'error' as const,
              errorCount: 1
            },
            processingTime: Date.now() - startTime
          };
        }
      });

      const results = await Promise.allSettled(platformPromises);
      let totalProcessingTime = 0;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { platform, data, stats, processingTime } = result.value;
          if (data.length > 0) {
            aggregatedData[platform] = data;
          }
          platformStats[platform] = stats;
          totalProcessingTime += processingTime;
        }
      });

      if (Object.keys(aggregatedData).length === 0) {
        throw new Error('所有平台数据获取失败');
      }

      const response: DailyHotResponse = {
        code: 200,
        message: '获取成功',
        data: aggregatedData,
        updateTime: new Date().toISOString(),
        cacheTime: Date.now(),
        totalCount: Object.values(aggregatedData).reduce((sum, items) => sum + items.length, 0),
        platformStats,
        metadata: {
          requestId: this.generateRequestId(),
          processingTime: totalProcessingTime,
          cacheHit: false,
          dataSource: 'api',
          version: '2.0.0'
        }
      };

      // 缓存结果
      this.cache.set(cacheKey, response);

      this.logger.info(`成功聚合${Object.keys(aggregatedData).length}个平台的数据`, {
        totalCount: response.totalCount,
        processingTime: totalProcessingTime
      });

      endTimer();
      return response;

    } catch (error) {
      this.logger.error('聚合热点数据失败', error);
      endTimer();

      // 尝试返回过期缓存
      if (this.config.retry.enableFallback) {
        const staleCache = this.getStaleCache(cacheKey);
        if (staleCache) {
          this.logger.warn('使用过期的全平台缓存数据');
          return staleCache;
        }
      }

      throw new Error('获取热点数据失败，请稍后重试');
    }
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): string[] {
    return [
      'weibo',
      'zhihu',
      'douyin',
      'bilibili',
      'baidu',
      '36kr',
      'ithome'
    ];
  }

  /**
   * 获取平台显示名称
   */
  getPlatformDisplayName(platform: string): string {
    const platformNames: Record<string, string> = {
      'weibo': '微博',
      'zhihu': '知乎',
      'douyin': '抖音',
      'bilibili': 'B站',
      'baidu': '百度',
      '36kr': '36氪',
      'ithome': 'IT之家'
    };
    return platformNames[platform] || platform;
  }

  /**
   * 获取平台图标类名
   */
  getPlatformIconClass(platform: string): string {
    return `icon-${platform}`;
  }

  /**
   * 聚合所有平台数据并按综合热度排序
   */
  aggregateAndSortTopics(allData: Record<string, DailyHotItem[]>): DailyHotItem[] {
    const allTopics: DailyHotItem[] = [];

    for (const [platform, items] of Object.entries(allData)) {
      allTopics.push(...items.slice(0, 3));
    }

    return allTopics.sort((a, b) => {
      const hotA = parseInt(a.hot) || 0;
      const hotB = parseInt(b.hot) || 0;
      return hotB - hotA;
    });
  }

  /**
   * 获取热点话题列表
   */
  async fetchHotTopics(platform?: string): Promise<DailyHotItem[]> {
    try {
      if (platform) {
        return await this.getDailyHotByPlatform(platform);
      } else {
        const allData = await this.getDailyHotAll();
        return this.aggregateAndSortTopics(allData.data);
      }
    } catch (error) {
      this.logger.error('获取热点话题失败', error);
      return [];
    }
  }

  /**
   * 获取话题详情
   */
  async fetchTopicDetail(topicId: string): Promise<DailyHotItem | null> {
    try {
      // 这里可以根据需要实现具体的话题详情获取逻辑
      this.logger.debug('获取话题详情', { topicId });
      return null;
    } catch (error) {
      this.logger.error('获取话题详情失败', error);
      return null;
    }
  }

  /**
   * 获取摩鱼日历数据
   */
  async fetchMoyuCalendar() {
    const endTimer = this.metrics.startTimer('moyu_calendar');
    try {
      const res = await request.get('https://api.vvhan.com/api/moyu');
      endTimer();
      return res.data;
    } catch (error) {
      this.logger.error('获取摩鱼日历失败', error);
      endTimer();
      throw error;
    }
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 带重试的网络请求
   */
  private async fetchWithRetry(url: string, platform: string): Promise<any> {
    const { maxRetries, retryDelay, backoffMultiplier } = this.config.retry;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`尝试获取${platform}数据 (第${attempt + 1}次)`, { url });

        const data = await request.get(`${this.config.baseUrl}${url}`);

        if (!data) {
          throw new Error('API返回空数据');
        }

        return data;

      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`第${attempt + 1}次请求失败`, { platform, error: lastError.message });

        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * 数据预处理
   */
  private processRawData(data: any, platform: string): DailyHotItem[] {
    let items: any[] = [];

    if (data.code === 200 && Array.isArray(data.data)) {
      items = data.data;
    } else if (Array.isArray(data)) {
      items = data;
    }

    return items.map((item: any, index: number) => ({
      ...item,
      platform,
      content: `"${item.title}"在${platform}上引发关注。`,
      relatedTopics: [],
      rank: index + 1,
      desc: item.desc || item.title,
      timestamp: Date.now(),
      category: this.inferCategory(item.title),
      tags: this.extractTags(item.title),
      source: 'api',
      heat_score: this.normalizeHeatScore(item.hot),
      trend: 'stable' as const,
      change_rate: 0
    }));
  }

  /**
   * 推断话题分类
   */
  private inferCategory(title: string): string {
    const categories = {
      '科技': ['AI', '人工智能', '科技', '技术', '互联网', '数码', '手机', '电脑'],
      '娱乐': ['明星', '电影', '电视剧', '综艺', '音乐', '娱乐'],
      '体育': ['足球', '篮球', '体育', '运动', '比赛', '奥运'],
      '财经': ['股票', '经济', '金融', '投资', '创业', '公司'],
      '社会': ['社会', '新闻', '事件', '政策', '民生'],
      '游戏': ['游戏', '电竞', '手游', '网游']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => title.includes(keyword))) {
        return category;
      }
    }

    return '其他';
  }

  /**
   * 提取标签
   */
  private extractTags(title: string): string[] {
    const tags: string[] = [];

    // 简单的标签提取逻辑
    if (title.includes('热搜')) tags.push('热搜');
    if (title.includes('爆料')) tags.push('爆料');
    if (title.includes('官宣')) tags.push('官宣');
    if (title.includes('首次')) tags.push('首次');
    if (title.includes('突发')) tags.push('突发');

    return tags;
  }

  /**
   * 标准化热度分数
   */
  private normalizeHeatScore(hot: string): number {
    const num = parseInt(hot) || 0;
    // 简单的对数标准化
    return Math.log10(num + 1);
  }

  /**
   * 计算平均热度
   */
  private calculateAverageHeat(items: DailyHotItem[]): number {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + (parseInt(item.hot) || 0), 0);
    return Math.round(total / items.length);
  }

  /**
   * 获取最高热度
   */
  private getTopHeat(items: DailyHotItem[]): number {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => parseInt(item.hot) || 0));
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取过期缓存
   */
  private getStaleCache(key: string): any | null {
    // 直接从Map中获取，忽略TTL检查
    const item = (this.cache as any).cache.get(key);
    return item ? item.data : null;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== 公共方法 ====================

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('缓存已清除');
  }

  /**
   * 获取性能指标
   */
  getMetrics(): any {
    return this.metrics.getMetrics();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): any {
    return {
      size: (this.cache as any).cache.size,
      maxSize: this.config.cache.maxSize,
      ttl: this.config.cache.ttl
    };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<ApiConfig>): void {
    HotTopicsConfig.getInstance().updateConfig(updates);
    this.config = HotTopicsConfig.getInstance().getConfig();
    this.logger.info('配置已更新', updates);
  }
}

// ==================== 公共API导出 ====================

// 创建全局实例
const hotTopicsAPI = HotTopicsAPI.getInstance();

/**
 * 获取全网热点聚合数据
 * @returns Promise<DailyHotResponse>
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  return hotTopicsAPI.getDailyHotAll();
}

/**
 * 获取指定平台热榜数据
 * @param platform 平台名称
 * @returns Promise<DailyHotItem[]>
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  return hotTopicsAPI.getDailyHotByPlatform(platform);
}

/**
 * 获取支持的平台列表
 * @returns string[]
 */
export function getSupportedPlatforms(): string[] {
  return hotTopicsAPI.getSupportedPlatforms();
}

/**
 * 获取平台显示名称
 * @param platform 平台名称
 * @returns string
 */
export function getPlatformDisplayName(platform: string): string {
  return hotTopicsAPI.getPlatformDisplayName(platform);
}

/**
 * 获取平台图标类名
 * @param platform 平台名称
 * @returns string
 */
export function getPlatformIconClass(platform: string): string {
  return hotTopicsAPI.getPlatformIconClass(platform);
}

/**
 * 聚合所有平台数据并按综合热度排序
 * @param allData 所有平台数据
 * @returns DailyHotItem[]
 */
export function aggregateAndSortTopics(allData: Record<string, DailyHotItem[]>): DailyHotItem[] {
  return hotTopicsAPI.aggregateAndSortTopics(allData);
}

/**
 * 获取热点话题列表
 * @param platform 可选的平台名称
 * @returns Promise<DailyHotItem[]>
 */
export async function fetchHotTopics(platform?: string): Promise<DailyHotItem[]> {
  return hotTopicsAPI.fetchHotTopics(platform);
}

/**
 * 获取话题详情
 * @param topicId 话题ID
 * @returns Promise<DailyHotItem | null>
 */
export async function fetchTopicDetail(topicId: string): Promise<DailyHotItem | null> {
  return hotTopicsAPI.fetchTopicDetail(topicId);
}

/**
 * 获取摩鱼日历数据
 * @returns Promise<any>
 */
export async function fetchMoyuCalendar(): Promise<any> {
  return hotTopicsAPI.fetchMoyuCalendar();
}

// ==================== 高级API ====================

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  hotTopicsAPI.clearCache();
}

/**
 * 获取性能指标
 * @returns any
 */
export function getMetrics(): any {
  return hotTopicsAPI.getMetrics();
}

/**
 * 获取缓存统计信息
 * @returns any
 */
export function getCacheStats(): any {
  return hotTopicsAPI.getCacheStats();
}

/**
 * 更新API配置
 * @param updates 配置更新
 */
export function updateConfig(updates: Partial<ApiConfig>): void {
  hotTopicsAPI.updateConfig(updates);
}

/**
 * 获取API实例（用于高级用法）
 * @returns HotTopicsAPI
 */
export function getAPIInstance(): HotTopicsAPI {
  return hotTopicsAPI;
}

// ==================== 类型导出 ====================
// 注意：这些类型已经在文件开头导出，这里不需要重复导出

// ==================== 默认导出 ====================

export default {
  // 基础API
  getDailyHotAll,
  getDailyHotByPlatform,
  getSupportedPlatforms,
  getPlatformDisplayName,
  getPlatformIconClass,
  aggregateAndSortTopics,
  fetchHotTopics,
  fetchTopicDetail,
  fetchMoyuCalendar,

  // 高级API
  clearCache,
  getMetrics,
  getCacheStats,
  updateConfig,
  getAPIInstance,

  // 工具类
  HotTopicsAPI,
  HotTopicsConfig,
  CacheManager: CacheManager,
  Logger,
  MetricsCollector
};
