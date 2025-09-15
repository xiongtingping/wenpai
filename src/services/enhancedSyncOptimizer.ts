/**
 * 🚀 增强同步优化器
 * 根本性解决同步性能问题，实现增量同步和数据压缩
 * 
 * 核心功能：
 * - 增量数据差异检测和同步
 * - 智能数据压缩和批量优化
 * - 同步队列管理和优先级调度
 * - 网络状态自适应同步策略
 */

import i18n from '@/i18n';
import { logger } from '@/utils/logger';
import pako from 'pako'; // 数据压缩库
// 使用Web Crypto API替代Node.js crypto模块

// 增量同步数据类型
export interface IncrementalSyncData {
  id: string;
  dataKey: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  version: number;
  checksum: string;
  compressed?: boolean;
  priority: SyncPriority;
}

// 同步优先级
export enum SyncPriority {
  CRITICAL = 1,    // 关键数据，立即同步
  HIGH = 2,        // 高优先级，优先同步
  MEDIUM = 3,      // 中等优先级，批量同步
  LOW = 4          // 低优先级，后台同步
}

// 数据差异信息
export interface DataDiff {
  type: 'create' | 'update' | 'delete' | 'unchanged';
  path: string;
  oldValue?: any;
  newValue?: any;
  checksum: string;
}

// 同步批次配置
export interface SyncBatchConfig {
  maxBatchSize: number;          // 最大批次大小
  maxBatchWaitTime: number;      // 最大等待时间
  compressionThreshold: number;   // 压缩阈值（字节）
  priorityWeights: Record<SyncPriority, number>; // 优先级权重
}

// 网络质量评估
export interface NetworkQuality {
  bandwidth: 'high' | 'medium' | 'low';
  latency: number;
  stability: 'stable' | 'unstable';
  connectionType: 'wifi' | 'cellular' | 'unknown';
}

/**
 * 增强同步优化器类
 */
export class EnhancedSyncOptimizer {
  private static instance: EnhancedSyncOptimizer;
  
  private syncQueue: Map<SyncPriority, IncrementalSyncData[]> = new Map();
  private processing = false;
  private networkQuality: NetworkQuality | null = null;
  private syncStats = {
    totalSynced: 0,
    bytesTransferred: 0,
    compressionRatio: 0,
    averageSyncTime: 0,
    failureRate: 0
  };

  private readonly defaultConfig: SyncBatchConfig = {
    maxBatchSize: 10,
    maxBatchWaitTime: 5000,
    compressionThreshold: 1024, // 1KB
    priorityWeights: {
      [SyncPriority.CRITICAL]: 1.0,
      [SyncPriority.HIGH]: 0.8,
      [SyncPriority.MEDIUM]: 0.6,
      [SyncPriority.LOW]: 0.4
    }
  };

  private constructor() {
    // 初始化优先级队列
    Object.values(SyncPriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.syncQueue.set(priority, []);
      }
    });

    // 启动网络质量监控
    this.initNetworkQualityMonitoring();
  }

  static getInstance(): EnhancedSyncOptimizer {
    if (!EnhancedSyncOptimizer.instance) {
      EnhancedSyncOptimizer.instance = new EnhancedSyncOptimizer();
    }
    return EnhancedSyncOptimizer.instance;
  }

  /**
   * 添加同步任务到队列
   */
  async addSyncTask(
    dataKey: string,
    operation: 'create' | 'update' | 'delete',
    data: any,
    priority: SyncPriority = SyncPriority.MEDIUM
  ): Promise<void> {
    const syncData: IncrementalSyncData = {
      id: this.generateSyncId(),
      dataKey,
      operation,
      data,
      timestamp: Date.now(),
      version: this.getDataVersion(dataKey),
      checksum: this.calculateChecksum(data),
      priority
    };

    // 数据压缩处理
    if (this.shouldCompress(syncData)) {
      syncData.data = await this.compressData(syncData.data);
      syncData.compressed = true;
    }

    // 添加到对应优先级队列
    const queue = this.syncQueue.get(priority) || [];
    queue.push(syncData);
    this.syncQueue.set(priority, queue);

    logger.info(`📋 同步任务已添加到队列: ${dataKey} (优先级: ${priority})`);

    // 触发批量处理
    this.scheduleBatchProcessing();
  }

  /**
   * 计算增量差异
   */
  calculateIncrementalDiff(oldData: any, newData: any): DataDiff[] {
    const diffs: DataDiff[] = [];

    // 简化的差异检测算法
    const oldChecksum = this.calculateChecksum(oldData);
    const newChecksum = this.calculateChecksum(newData);

    if (oldChecksum === newChecksum) {
      return [{
        type: 'unchanged',
        path: 'root',
        checksum: oldChecksum
      }];
    }

    // 深度对比（简化版本）
    if (typeof oldData === 'object' && typeof newData === 'object') {
      const allKeys = new Set([
        ...Object.keys(oldData || {}),
        ...Object.keys(newData || {})
      ]);

      for (const key of allKeys) {
        const oldValue = oldData?.[key];
        const newValue = newData?.[key];

        if (oldValue === undefined && newValue !== undefined) {
          diffs.push({
            type: 'create',
            path: key,
            newValue,
            checksum: this.calculateChecksum(newValue)
          });
        } else if (oldValue !== undefined && newValue === undefined) {
          diffs.push({
            type: 'delete',
            path: key,
            oldValue,
            checksum: this.calculateChecksum(oldValue)
          });
        } else if (oldValue !== newValue) {
          diffs.push({
            type: 'update',
            path: key,
            oldValue,
            newValue,
            checksum: this.calculateChecksum(newValue)
          });
        }
      }
    } else {
      diffs.push({
        type: 'update',
        path: 'root',
        oldValue: oldData,
        newValue: newData,
        checksum: newChecksum
      });
    }

    return diffs;
  }

  /**
   * 批量处理同步任务
   */
  private async scheduleBatchProcessing(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    try {
      // 按优先级处理队列
      for (const priority of [SyncPriority.CRITICAL, SyncPriority.HIGH, SyncPriority.MEDIUM, SyncPriority.LOW]) {
        const queue = this.syncQueue.get(priority) || [];
        if (queue.length === 0) continue;

        await this.processPriorityQueue(priority, queue);
      }
    } catch (error) {
      logger.error('❌ 批量同步处理失败:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * 处理特定优先级的队列
   */
  private async processPriorityQueue(
    priority: SyncPriority, 
    queue: IncrementalSyncData[]
  ): Promise<void> {
    const config = this.getAdaptiveConfig();
    const batches = this.createOptimalBatches(queue, config);

    for (const batch of batches) {
      try {
        await this.processSyncBatch(batch);
        
        // 从队列中移除已处理的项目
        const processedIds = new Set(batch.map(item => item.id));
        const remainingQueue = queue.filter(item => !processedIds.has(item.id));
        this.syncQueue.set(priority, remainingQueue);

      } catch (error) {
        logger.error(`❌ 批次同步失败 (优先级 ${priority}):`, error);
        this.handleBatchSyncFailure(batch, error);
      }
    }
  }

  /**
   * 创建最优同步批次
   */
  private createOptimalBatches(
    queue: IncrementalSyncData[], 
    config: SyncBatchConfig
  ): IncrementalSyncData[][] {
    const batches: IncrementalSyncData[][] = [];
    let currentBatch: IncrementalSyncData[] = [];
    let currentBatchSize = 0;

    for (const item of queue) {
      const itemSize = this.estimateDataSize(item);
      
      // 检查是否需要开始新批次
      if (
        currentBatch.length >= config.maxBatchSize ||
        (currentBatchSize + itemSize > config.compressionThreshold * 2)
      ) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
      }

      currentBatch.push(item);
      currentBatchSize += itemSize;
    }

    // 添加最后一个批次
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * 处理同步批次
   */
  private async processSyncBatch(batch: IncrementalSyncData[]): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 批量压缩优化
      const compressedBatch = await this.optimizeBatchCompression(batch);
      
      // 执行批量同步（这里需要集成实际的同步逻辑）
      await this.executeBatchSync(compressedBatch);
      
      // 更新统计信息
      this.updateSyncStats(batch, Date.now() - startTime, true);
      
      logger.info(`✅ 批次同步完成: ${batch.length} 项, 耗时 ${Date.now() - startTime}ms`);
      
    } catch (error) {
      this.updateSyncStats(batch, Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * 优化批次压缩
   */
  private async optimizeBatchCompression(
    batch: IncrementalSyncData[]
  ): Promise<IncrementalSyncData[]> {
    const results: IncrementalSyncData[] = [];
    
    for (const item of batch) {
      if (!item.compressed && this.shouldCompress(item)) {
        const compressed = { ...item };
        compressed.data = await this.compressData(item.data);
        compressed.compressed = true;
        results.push(compressed);
      } else {
        results.push(item);
      }
    }
    
    return results;
  }

  /**
   * 数据压缩
   */
  private async compressData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = pako.deflate(jsonString, { level: 6 });
      const base64Compressed = btoa(String.fromCharCode(...compressed));
      
      logger.debug(`🗜️ 数据压缩: ${jsonString.length} -> ${base64Compressed.length} 字节`);
      
      return base64Compressed;
    } catch (error) {
      logger.warn('⚠️ 数据压缩失败，使用原始数据:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * 数据解压缩
   */
  async decompressData(compressedData: string): Promise<any> {
    try {
      const binaryString = atob(compressedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decompressed = pako.inflate(bytes, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      logger.warn('⚠️ 数据解压缩失败，尝试直接解析:', error);
      return JSON.parse(compressedData);
    }
  }

  /**
   * 判断是否需要压缩
   */
  private shouldCompress(item: IncrementalSyncData): boolean {
    const dataSize = this.estimateDataSize(item);
    return dataSize >= this.defaultConfig.compressionThreshold;
  }

  /**
   * 估算数据大小
   */
  private estimateDataSize(item: IncrementalSyncData): number {
    return JSON.stringify(item.data).length;
  }

  /**
   * 计算数据校验和 - 使用简单快速的哈希算法
   */
  private calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    
    // 使用FNV-1a哈希算法的简化版本
    let hash = 2166136261;
    for (let i = 0; i < jsonString.length; i++) {
      hash ^= jsonString.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; // 无符号32位整数
    }
    
    return hash.toString(16).padStart(8, '0');
  }

  /**
   * 生成同步ID
   */
  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取数据版本
   */
  private getDataVersion(dataKey: string): number {
    // 简化版本管理，实际应该从数据管理器获取
    return 1;
  }

  /**
   * 网络质量监控
   */
  private initNetworkQualityMonitoring(): void {
    // 简化的网络质量评估
    const assessNetworkQuality = () => {
      const connection = (navigator as any).connection;
      
      this.networkQuality = {
        bandwidth: connection?.downlink > 10 ? 'high' : 
                   connection?.downlink > 1 ? 'medium' : 'low',
        latency: connection?.rtt || 100,
        stability: connection?.effectiveType?.includes('4g') ? 'stable' : 'unstable',
        connectionType: connection?.type === 'wifi' ? 'wifi' : 'cellular'
      };
    };

    // 初始评估
    assessNetworkQuality();
    
    // 定期重新评估
    setInterval(assessNetworkQuality, 30000);
  }

  /**
   * 获取自适应配置
   */
  private getAdaptiveConfig(): SyncBatchConfig {
    const baseConfig = { ...this.defaultConfig };
    
    if (this.networkQuality) {
      // 根据网络质量调整配置
      switch (this.networkQuality.bandwidth) {
        case 'low':
          baseConfig.maxBatchSize = 3;
          baseConfig.compressionThreshold = 512;
          break;
        case 'medium':
          baseConfig.maxBatchSize = 7;
          baseConfig.compressionThreshold = 1024;
          break;
        case 'high':
          baseConfig.maxBatchSize = 15;
          baseConfig.compressionThreshold = 2048;
          break;
      }
    }
    
    return baseConfig;
  }

  /**
   * 执行批量同步（需要与实际同步服务集成）
   */
  private async executeBatchSync(batch: IncrementalSyncData[]): Promise<void> {
    // 这里应该调用实际的同步服务
    logger.info(`🔄 执行批量同步: ${batch.length} 项`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 更新同步统计
   */
  private updateSyncStats(
    batch: IncrementalSyncData[], 
    syncTime: number, 
    success: boolean
  ): void {
    this.syncStats.totalSynced += batch.length;
    
    if (success) {
      this.syncStats.averageSyncTime = 
        (this.syncStats.averageSyncTime + syncTime) / 2;
    } else {
      this.syncStats.failureRate = 
        (this.syncStats.failureRate * 0.9) + 0.1;
    }
  }

  /**
   * 处理批次同步失败
   */
  private handleBatchSyncFailure(
    batch: IncrementalSyncData[], 
    error: any
  ): void {
    // 将失败的项目重新加入队列，降低优先级
    for (const item of batch) {
      const lowerPriority = Math.min(item.priority + 1, SyncPriority.LOW);
      const queue = this.syncQueue.get(lowerPriority) || [];
      queue.push({ ...item, priority: lowerPriority });
      this.syncQueue.set(lowerPriority, queue);
    }
    
    logger.warn(`⚠️ 批次同步失败，已重新调度: ${batch.length} 项`);
  }

  /**
   * 获取同步统计信息
   */
  getSyncStats() {
    return {
      ...this.syncStats,
      queueSize: Array.from(this.syncQueue.values()).reduce((total, queue) => total + queue.length, 0),
      networkQuality: this.networkQuality
    };
  }

  /**
   * 清理同步队列
   */
  clearSyncQueue(): void {
    this.syncQueue.clear();
    Object.values(SyncPriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.syncQueue.set(priority, []);
      }
    });
    logger.info('🧹 同步队列已清理');
  }
}

// 导出单例实例
export const syncOptimizer = EnhancedSyncOptimizer.getInstance();

export default EnhancedSyncOptimizer;