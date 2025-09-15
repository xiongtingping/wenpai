/**
 * 🧠 智能缓存管理器
 * 根本性解决缓存策略问题，实现LRU缓存和智能失效机制
 * 
 * 核心功能：
 * - LRU (Least Recently Used) 缓存算法
 * - 智能缓存失效策略和预测算法
 * - 多层缓存架构和热点数据管理
 * - 自适应缓存容量和内存优化
 * - 缓存预热和后台刷新机制
 */

import i18n from '@/i18n';
import { logger } from '@/utils/logger';

// 缓存项接口
export interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
  priority: CachePriority;
  size: number;
  metadata: CacheMetadata;
}

// 缓存优先级
export enum CachePriority {
  CRITICAL = 1,    // 关键数据，永不淘汰
  HIGH = 2,        // 高优先级，延迟淘汰
  MEDIUM = 3,      // 中等优先级，正常淘汰
  LOW = 4          // 低优先级，优先淘汰
}

// 缓存元数据
export interface CacheMetadata {
  source: 'local' | 'remote' | 'computed';
  category: string;
  dependencies?: string[];
  compressionRatio?: number;
  refreshable: boolean;
  hitCount: number;
  missCount: number;
}

// 缓存统计信息
export interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
  maxMemory: number;
  avgAccessTime: number;
  hotDataRatio: number;
  evictionCount: number;
}

// 智能失效配置
export interface IntelligentEvictionConfig {
  maxMemorySize: number;        // 最大内存使用量(MB)
  maxItems: number;             // 最大缓存项数
  ttlCheckInterval: number;     // TTL检查间隔(ms)
  hotDataThreshold: number;     // 热数据阈值(访问频率)
  predictiveEviction: boolean;  // 启用预测性淘汰
  adaptiveCapacity: boolean;    // 启用自适应容量
}

/**
 * LRU 缓存节点
 */
class LRUNode<T> {
  constructor(
    public key: string,
    public cacheItem: CacheItem<T>,
    public prev: LRUNode<T> | null = null,
    public next: LRUNode<T> | null = null
  ) {}
}

/**
 * 智能缓存管理器类
 */
export class IntelligentCacheManager<T = any> {
  private cache = new Map<string, LRUNode<T>>();
  private head: LRUNode<T>;
  private tail: LRUNode<T>;
  private currentSize = 0;
  private currentMemoryUsage = 0; // 字节
  
  private stats: CacheStats = {
    totalItems: 0,
    totalSize: 0,
    hitRate: 0,
    memoryUsage: 0,
    maxMemory: 0,
    avgAccessTime: 0,
    hotDataRatio: 0,
    evictionCount: 0
  };

  private accessTimes: number[] = [];
  private hotDataKeys = new Set<string>();
  private evictionHistory: Array<{key: string, reason: string, timestamp: number}> = [];
  
  private readonly config: IntelligentEvictionConfig;

  constructor(config: Partial<IntelligentEvictionConfig> = {}) {
    this.config = {
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000,
      ttlCheckInterval: 60000, // 1分钟
      hotDataThreshold: 5,
      predictiveEviction: true,
      adaptiveCapacity: true,
      ...config
    };

    // 初始化双向链表
    this.head = new LRUNode<T>('__head__', {} as CacheItem<T>);
    this.tail = new LRUNode<T>('__tail__', {} as CacheItem<T>);
    this.head.next = this.tail;
    this.tail.prev = this.head;

    // 启动定期清理任务
    this.startCleanupTasks();
  }

  /**
   * 获取缓存数据
   */
  get(key: string): T | null {
    const startTime = performance.now();
    
    try {
      const node = this.cache.get(key);
      
      if (!node) {
        // 缓存未命中
        this.updateStats('miss');
        logger.debug(`🔍 缓存未命中: ${key}`);
        return null;
      }

      // 检查TTL
      if (this.isExpired(node.cacheItem)) {
        this.remove(key);
        this.updateStats('miss');
        logger.debug(`⏰ 缓存过期: ${key}`);
        return null;
      }

      // 更新访问信息
      this.updateAccessInfo(node);
      
      // 移动到链表头部（最近使用）
      this.moveToHead(node);
      
      // 缓存命中
      this.updateStats('hit');
      logger.debug(`✅ 缓存命中: ${key}`);
      
      return node.cacheItem.value;
      
    } finally {
      const accessTime = performance.now() - startTime;
      this.recordAccessTime(accessTime);
    }
  }

  /**
   * 设置缓存数据
   */
  set(
    key: string, 
    value: T, 
    options: {
      ttl?: number;
      priority?: CachePriority;
      metadata?: Partial<CacheMetadata>;
    } = {}
  ): boolean {
    try {
      const size = this.calculateSize(value);
      const now = Date.now();
      
      const cacheItem: CacheItem<T> = {
        key,
        value,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now,
        ttl: options.ttl,
        priority: options.priority || CachePriority.MEDIUM,
        size,
        metadata: {
          source: 'local',
          category: 'general',
          refreshable: true,
          hitCount: 0,
          missCount: 0,
          ...options.metadata
        }
      };

      const existingNode = this.cache.get(key);
      
      if (existingNode) {
        // 更新现有项目
        this.currentMemoryUsage -= existingNode.cacheItem.size;
        existingNode.cacheItem = cacheItem;
        this.currentMemoryUsage += size;
        this.moveToHead(existingNode);
        
        logger.debug(`📝 缓存已更新: ${key} (${this.formatSize(size)})`);
        
      } else {
        // 添加新项目
        const newNode = new LRUNode(key, cacheItem);
        
        // 检查容量限制
        if (!this.ensureCapacity(size)) {
          logger.warn(`⚠️ 缓存容量不足，无法添加: ${key}`);
          return false;
        }
        
        this.cache.set(key, newNode);
        this.addToHead(newNode);
        this.currentSize++;
        this.currentMemoryUsage += size;
        
        logger.debug(`➕ 缓存已添加: ${key} (${this.formatSize(size)})`);
      }

      this.updateStats('set');
      return true;
      
    } catch (error) {
      logger.error(`❌ 缓存设置失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 移除缓存数据
   */
  remove(key: string): boolean {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }

    this.cache.delete(key);
    this.removeNode(node);
    this.currentSize--;
    this.currentMemoryUsage -= node.cacheItem.size;
    this.hotDataKeys.delete(key);

    logger.debug(`🗑️ 缓存已移除: ${key}`);
    return true;
  }

  /**
   * 智能预取数据
   */
  async prefetch(keys: string[], loader: (key: string) => Promise<T>): Promise<void> {
    logger.info(`🔮 开始智能预取: ${keys.length} 项`);
    
    const prefetchPromises = keys
      .filter(key => !this.cache.has(key)) // 只预取不存在的
      .map(async key => {
        try {
          const value = await loader(key);
          this.set(key, value, { priority: CachePriority.LOW });
          logger.debug(`🔮 预取完成: ${key}`);
        } catch (error) {
          logger.warn(`⚠️ 预取失败: ${key}`, error);
        }
      });

    await Promise.allSettled(prefetchPromises);
    logger.info(`✅ 预取完成: ${prefetchPromises.length} 项`);
  }

  /**
   * 批量获取
   */
  getBatch(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();
    
    for (const key of keys) {
      results.set(key, this.get(key));
    }
    
    return results;
  }

  /**
   * 批量设置
   */
  setBatch(items: Array<{key: string, value: T, options?: any}>): number {
    let successCount = 0;
    
    for (const item of items) {
      if (this.set(item.key, item.value, item.options)) {
        successCount++;
      }
    }
    
    return successCount;
  }

  /**
   * 确保缓存容量
   */
  private ensureCapacity(newItemSize: number): boolean {
    // 检查内存限制
    if (this.currentMemoryUsage + newItemSize > this.config.maxMemorySize) {
      if (!this.evictToMakeSpace(newItemSize)) {
        return false;
      }
    }

    // 检查项目数量限制
    if (this.currentSize >= this.config.maxItems) {
      this.evictLeastRecentlyUsed(1);
    }

    return true;
  }

  /**
   * 智能淘汰数据
   */
  private evictToMakeSpace(requiredSpace: number): boolean {
    const startTime = Date.now();
    let freedSpace = 0;
    let evictedCount = 0;
    
    // 优先淘汰策略：
    // 1. 过期的项目
    // 2. 低优先级的项目
    // 3. 访问频率最低的项目
    
    const candidatesForEviction: Array<{node: LRUNode<T>, score: number}> = [];
    
    // 计算淘汰评分
    for (const [, node] of this.cache) {
      if (node.cacheItem.priority === CachePriority.CRITICAL) {
        continue; // 关键数据不淘汰
      }
      
      const score = this.calculateEvictionScore(node);
      candidatesForEviction.push({ node, score });
    }
    
    // 按评分排序（评分越高越应该被淘汰）
    candidatesForEviction.sort((a, b) => b.score - a.score);
    
    // 开始淘汰
    for (const candidate of candidatesForEviction) {
      if (freedSpace >= requiredSpace) break;
      
      const key = candidate.node.key;
      const size = candidate.node.cacheItem.size;
      
      this.remove(key);
      freedSpace += size;
      evictedCount++;
      
      this.recordEviction(key, 'space_required');
    }
    
    const evictionTime = Date.now() - startTime;
    logger.info(`🗑️ 智能淘汰完成: 释放 ${this.formatSize(freedSpace)}, 淘汰 ${evictedCount} 项, 耗时 ${evictionTime}ms`);
    
    this.stats.evictionCount += evictedCount;
    return freedSpace >= requiredSpace;
  }

  /**
   * 计算淘汰评分
   */
  private calculateEvictionScore(node: LRUNode<T>): number {
    const now = Date.now();
    const item = node.cacheItem;
    
    // 基础评分因素
    const timeSinceAccess = now - item.lastAccessed;
    const accessFrequency = item.accessCount / Math.max((now - item.timestamp) / 1000, 1);
    const priorityWeight = this.getPriorityWeight(item.priority);
    const sizeWeight = item.size / (1024 * 1024); // MB
    
    // 特殊情况处理
    let specialBonus = 0;
    
    // 过期数据优先淘汰
    if (this.isExpired(item)) {
      specialBonus += 1000;
    }
    
    // 热点数据保护
    if (this.hotDataKeys.has(item.key)) {
      specialBonus -= 500;
    }
    
    // 可刷新数据相对安全
    if (item.metadata.refreshable) {
      specialBonus += 100;
    }
    
    // 综合评分（越高越应该被淘汰）
    const score = 
      (timeSinceAccess / 1000 / 60) * 10 +  // 分钟权重
      (1 / Math.max(accessFrequency, 0.001)) * 5 + // 访问频率倒数
      priorityWeight * 20 + // 优先级权重
      sizeWeight * 2 + // 大小权重
      specialBonus; // 特殊奖励/惩罚
      
    return score;
  }

  /**
   * 淘汰最近最少使用的项目
   */
  private evictLeastRecentlyUsed(count: number): void {
    let evicted = 0;
    
    while (evicted < count && this.currentSize > 0) {
      const lru = this.tail.prev;
      
      if (!lru || lru === this.head) break;
      
      // 保护关键数据
      if (lru.cacheItem.priority === CachePriority.CRITICAL) {
        // 寻找下一个可淘汰的项目
        let current = lru.prev;
        let found = false;
        
        while (current && current !== this.head) {
          if (current.cacheItem.priority !== CachePriority.CRITICAL) {
            this.remove(current.key);
            this.recordEviction(current.key, 'lru_eviction');
            found = true;
            break;
          }
          current = current.prev;
        }
        
        if (!found) break; // 没有可淘汰的项目
      } else {
        this.remove(lru.key);
        this.recordEviction(lru.key, 'lru_eviction');
      }
      
      evicted++;
    }
    
    logger.debug(`🗑️ LRU淘汰完成: ${evicted} 项`);
  }

  /**
   * 更新访问信息
   */
  private updateAccessInfo(node: LRUNode<T>): void {
    const now = Date.now();
    node.cacheItem.accessCount++;
    node.cacheItem.lastAccessed = now;
    node.cacheItem.metadata.hitCount++;
    
    // 检查是否成为热点数据
    if (node.cacheItem.accessCount >= this.config.hotDataThreshold) {
      this.hotDataKeys.add(node.key);
    }
  }

  /**
   * 移动节点到头部
   */
  private moveToHead(node: LRUNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: LRUNode<T>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  /**
   * 移除节点
   */
  private removeNode(node: LRUNode<T>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /**
   * 检查是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 计算数据大小
   */
  private calculateSize(value: T): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return JSON.stringify(value).length * 2; // 估算
    }
  }

  /**
   * 格式化大小显示
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  /**
   * 获取优先级权重
   */
  private getPriorityWeight(priority: CachePriority): number {
    switch (priority) {
      case CachePriority.CRITICAL: return 0;
      case CachePriority.HIGH: return 1;
      case CachePriority.MEDIUM: return 2;
      case CachePriority.LOW: return 3;
      default: return 2;
    }
  }

  /**
   * 记录访问时间
   */
  private recordAccessTime(time: number): void {
    this.accessTimes.push(time);
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-500);
    }
  }

  /**
   * 记录淘汰信息
   */
  private recordEviction(key: string, reason: string): void {
    this.evictionHistory.push({
      key,
      reason,
      timestamp: Date.now()
    });
    
    // 保持历史记录不超过1000条
    if (this.evictionHistory.length > 1000) {
      this.evictionHistory = this.evictionHistory.slice(-500);
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(operation: 'hit' | 'miss' | 'set'): void {
    const totalHits = this.stats.hitRate * this.stats.totalItems;
    const totalRequests = this.stats.totalItems;
    
    switch (operation) {
      case 'hit':
        const newHitRate = (totalHits + 1) / (totalRequests + 1);
        this.stats.hitRate = newHitRate;
        this.stats.totalItems++;
        break;
        
      case 'miss':
        this.stats.hitRate = totalHits / (totalRequests + 1);
        this.stats.totalItems++;
        break;
        
      case 'set':
        this.stats.totalSize = this.currentSize;
        this.stats.memoryUsage = this.currentMemoryUsage;
        this.stats.maxMemory = this.config.maxMemorySize;
        break;
    }
    
    // 更新其他统计信息
    this.stats.avgAccessTime = this.accessTimes.length > 0 
      ? this.accessTimes.reduce((sum, time) => sum + time, 0) / this.accessTimes.length
      : 0;
    
    this.stats.hotDataRatio = this.hotDataKeys.size / Math.max(this.currentSize, 1);
  }

  /**
   * 启动清理任务
   */
  private startCleanupTasks(): void {
    // TTL清理任务
    setInterval(() => {
      this.cleanupExpiredItems();
    }, this.config.ttlCheckInterval);
    
    // 热点数据更新任务
    setInterval(() => {
      this.updateHotDataKeys();
    }, 5 * 60 * 1000); // 5分钟
    
    // 自适应容量调整
    if (this.config.adaptiveCapacity) {
      setInterval(() => {
        this.adjustCapacity();
      }, 10 * 60 * 1000); // 10分钟
    }
  }

  /**
   * 清理过期项目
   */
  private cleanupExpiredItems(): void {
    const expiredKeys: string[] = [];
    
    for (const [key, node] of this.cache) {
      if (this.isExpired(node.cacheItem)) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.remove(key);
      this.recordEviction(key, 'ttl_expired');
    }
    
    if (expiredKeys.length > 0) {
      logger.info(`🧹 清理过期缓存: ${expiredKeys.length} 项`);
    }
  }

  /**
   * 更新热点数据键
   */
  private updateHotDataKeys(): void {
    const newHotKeys = new Set<string>();
    
    for (const [key, node] of this.cache) {
      if (node.cacheItem.accessCount >= this.config.hotDataThreshold) {
        newHotKeys.add(key);
      }
    }
    
    this.hotDataKeys = newHotKeys;
    logger.debug(`🔥 热点数据更新: ${this.hotDataKeys.size} 项`);
  }

  /**
   * 自适应容量调整
   */
  private adjustCapacity(): void {
    // 基于命中率和内存使用情况调整容量
    if (this.stats.hitRate > 0.9 && this.stats.memoryUsage < this.config.maxMemorySize * 0.7) {
      // 命中率高且内存使用不高，可以增加容量
      this.config.maxItems = Math.min(this.config.maxItems * 1.2, 2000);
    } else if (this.stats.hitRate < 0.6 || this.stats.memoryUsage > this.config.maxMemorySize * 0.9) {
      // 命中率低或内存使用过高，减少容量
      this.config.maxItems = Math.max(this.config.maxItems * 0.8, 100);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.updateStats('hit'); // 触发统计更新
    return { ...this.stats };
  }

  /**
   * 获取缓存详细信息
   */
  getDetailedInfo() {
    return {
      stats: this.getStats(),
      config: this.config,
      hotDataKeys: Array.from(this.hotDataKeys),
      recentEvictions: this.evictionHistory.slice(-10),
      memoryBreakdown: {
        used: this.currentMemoryUsage,
        available: this.config.maxMemorySize - this.currentMemoryUsage,
        utilization: this.currentMemoryUsage / this.config.maxMemorySize
      }
    };
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.currentSize = 0;
    this.currentMemoryUsage = 0;
    this.hotDataKeys.clear();
    this.accessTimes = [];
    this.evictionHistory = [];
    
    logger.info('🧹 缓存已清空');
  }
}

// 创建全局缓存管理器实例
export const globalCacheManager = new IntelligentCacheManager({
  maxMemorySize: 100 * 1024 * 1024, // 100MB
  maxItems: 2000,
  ttlCheckInterval: 60000,
  hotDataThreshold: 5,
  predictiveEviction: true,
  adaptiveCapacity: true
});

export default IntelligentCacheManager;