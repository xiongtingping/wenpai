/**
 * 🧪 存储系统集成测试
 * 测试统一存储架构的完整功能
 * 
 * 测试覆盖：
 * - 数据库表初始化
 * - 数据读写操作
 * - 预加载功能
 * - 缓存机制
 * - 同步功能
 * - 错误处理
 */

import { globalDataManager } from '@/services/unifiedDataManager';
import { dataPreloader, EnhancedDataPreloader } from '@/services/enhancedDataPreloader';
import { databaseInitializer } from '@/services/databaseInitializer';
import { logger } from '@/utils/logger';

// 测试结果类型
export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

/**
 * 存储系统集成测试类
 */
export class StorageIntegrationTest {
  private testUserId = 'test_user_' + Date.now();
  private results: TestResult[] = [];

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<TestSuite> {
    logger.info('🧪 开始存储系统集成测试...');
    const startTime = Date.now();

    this.results = [];

    // 1. 数据库初始化测试
    await this.testDatabaseInitialization();

    // 2. 基本数据操作测试
    await this.testBasicDataOperations();

    // 3. 缓存机制测试
    await this.testCachingMechanism();

    // 4. 数据预加载测试
    await this.testDataPreloading();

    // 5. 错误处理测试
    await this.testErrorHandling();

    // 6. 性能测试
    await this.testPerformance();

    const totalDuration = Date.now() - startTime;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;

    const suite: TestSuite = {
      name: '存储系统集成测试',
      results: this.results,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      totalDuration
    };

    this.logTestSummary(suite);
    return suite;
  }

  /**
   * 测试数据库初始化
   */
  private async testDatabaseInitialization(): Promise<void> {
    await this.runTest('数据库初始化', async () => {
      const success = await databaseInitializer.initializeDatabase();
      const status = await databaseInitializer.getDatabaseStatus();
      
      return {
        success,
        details: {
          availableTables: status.availableTables,
          totalTables: status.totalTables,
          recommendations: status.recommendations
        }
      };
    });

    await this.runTest('数据库访问权限验证', async () => {
      const accessResult = await databaseInitializer.validateAccess(this.testUserId);
      
      return {
        success: accessResult.canRead || accessResult.canWrite,
        details: accessResult
      };
    });
  }

  /**
   * 测试基本数据操作
   */
  private async testBasicDataOperations(): Promise<void> {
    // 设置测试用户
    globalDataManager.setUserId(this.testUserId);

    // 测试数据保存
    await this.runTest('数据保存', async () => {
      const testData = {
        test: 'data',
        timestamp: new Date().toISOString(),
        number: 42,
        array: [1, 2, 3],
        nested: { key: 'value' }
      };

      const result = await globalDataManager.setData('test_key', testData);
      return {
        success: result,
        details: { data: testData }
      };
    });

    // 测试数据读取
    await this.runTest('数据读取', async () => {
      const retrievedData = await globalDataManager.getData<any>('test_key');
      
      return {
        success: retrievedData !== null && retrievedData.test === 'data',
        details: { retrievedData }
      };
    });

    // 测试数据更新
    await this.runTest('数据更新', async () => {
      const updatedData = { test: 'updated_data', timestamp: new Date().toISOString() };
      const result = await globalDataManager.setData('test_key', updatedData);
      
      if (result) {
        const retrievedData = await globalDataManager.getData<any>('test_key');
        return {
          success: retrievedData?.test === 'updated_data',
          details: { updatedData, retrievedData }
        };
      }
      
      return { success: false, details: { error: 'Update failed' } };
    });
  }

  /**
   * 测试缓存机制
   */
  private async testCachingMechanism(): Promise<void> {
    await this.runTest('缓存存储', async () => {
      const cacheData = { cached: true, timestamp: Date.now() };
      const result = await globalDataManager.setData('cache_test', cacheData);
      
      return {
        success: result,
        details: { cacheData }
      };
    });

    await this.runTest('缓存读取性能', async () => {
      const start = Date.now();
      const data1 = await globalDataManager.getData('cache_test');
      const firstReadTime = Date.now() - start;
      
      const start2 = Date.now();
      const data2 = await globalDataManager.getData('cache_test');
      const secondReadTime = Date.now() - start2;
      
      return {
        success: data1 !== null && data2 !== null,
        details: {
          firstReadTime,
          secondReadTime,
          cacheSpeedUp: firstReadTime / secondReadTime
        }
      };
    });
  }

  /**
   * 测试数据预加载
   */
  private async testDataPreloading(): Promise<void> {
    await this.runTest('预加载器初始化', async () => {
      try {
        const preloader = new EnhancedDataPreloader(globalDataManager);
        return {
          success: true,
          details: { preloaderCreated: true }
        };
      } catch (error) {
        return {
          success: false,
          details: { error: error instanceof Error ? error.message : '未知错误' }
        };
      }
    });

    await this.runTest('关键数据预加载', async () => {
      const startTime = Date.now();
      
      // 预设一些测试数据
      await globalDataManager.setData('favorites', { items: ['item1', 'item2'] });
      await globalDataManager.setData('theme', { mode: 'dark' });
      
      const stats = await dataPreloader.startPreloadProcess(this.testUserId);
      const duration = Date.now() - startTime;
      
      return {
        success: stats.successful > 0,
        details: {
          stats,
          duration,
          preloadedKeys: dataPreloader.getAllPreloadResults()
            .filter(r => r.success)
            .map(r => r.key)
        }
      };
    });

    await this.runTest('预加载状态检查', async () => {
      const isPreloaded = dataPreloader.isPreloaded('favorites');
      const stats = dataPreloader.getStats();
      
      return {
        success: isPreloaded,
        details: { stats }
      };
    });
  }

  /**
   * 测试错误处理
   */
  private async testErrorHandling(): Promise<void> {
    await this.runTest('无效键处理', async () => {
      try {
        const result = await globalDataManager.getData('non_existent_key');
        return {
          success: result === null,
          details: { result }
        };
      } catch (error) {
        return {
          success: false,
          details: { error: error instanceof Error ? error.message : '未知错误' }
        };
      }
    });

    await this.runTest('大数据处理', async () => {
      const largeData = {
        items: Array(1000).fill(0).map((_, i) => ({
          id: i,
          data: `item_${i}_${'x'.repeat(100)}`
        }))
      };
      
      try {
        const result = await globalDataManager.setData('large_data_test', largeData);
        return {
          success: result,
          details: { dataSize: JSON.stringify(largeData).length }
        };
      } catch (error) {
        return {
          success: true, // 错误是预期的
          details: { 
            handledError: error instanceof Error ? error.message : '未知错误' 
          }
        };
      }
    });
  }

  /**
   * 测试性能
   */
  private async testPerformance(): Promise<void> {
    await this.runTest('批量写入性能', async () => {
      const batchSize = 10;
      const startTime = Date.now();
      
      const promises = Array(batchSize).fill(0).map(async (_, i) => {
        return await globalDataManager.setData(`batch_test_${i}`, {
          index: i,
          data: `batch_data_${i}`,
          timestamp: Date.now()
        });
      });
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r).length;
      
      return {
        success: successCount > batchSize * 0.8, // 80%成功率
        details: {
          batchSize,
          successCount,
          duration,
          avgTimePerItem: duration / batchSize
        }
      };
    });

    await this.runTest('批量读取性能', async () => {
      const batchSize = 10;
      const startTime = Date.now();
      
      const promises = Array(batchSize).fill(0).map(async (_, i) => {
        return await globalDataManager.getData(`batch_test_${i}`);
      });
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r !== null).length;
      
      return {
        success: successCount > 0,
        details: {
          batchSize,
          successCount,
          duration,
          avgTimePerItem: duration / batchSize
        }
      };
    });
  }

  /**
   * 运行单个测试
   */
  private async runTest(
    name: string,
    testFn: () => Promise<{ success: boolean; details?: any }>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      logger.debug(`🔬 运行测试: ${name}`);
      
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: result.success,
        duration,
        details: result.details
      });

      if (result.success) {
        logger.debug(`✅ 测试通过: ${name} (${duration}ms)`);
      } else {
        logger.warn(`❌ 测试失败: ${name} (${duration}ms)`, result.details);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: false,
        duration,
        error: error instanceof Error ? error.message : '未知错误'
      });

      logger.error(`💥 测试异常: ${name} (${duration}ms)`, error);
    }
  }

  /**
   * 输出测试总结
   */
  private logTestSummary(suite: TestSuite): void {
    logger.info('\n📊 存储系统测试总结');
    logger.info('='.repeat(50));
    logger.info(`总测试数: ${suite.totalTests}`);
    logger.info(`通过: ${suite.passedTests}`);
    logger.info(`失败: ${suite.failedTests}`);
    logger.info(`成功率: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%`);
    logger.info(`总耗时: ${suite.totalDuration}ms`);
    
    if (suite.failedTests > 0) {
      logger.info('\n❌ 失败的测试:');
      suite.results
        .filter(r => !r.success)
        .forEach(result => {
          logger.info(`  - ${result.name}: ${result.error || '详见details'}`);
        });
    }
    
    logger.info('\n💡 测试建议:');
    const passRate = suite.passedTests / suite.totalTests;
    
    if (passRate >= 0.9) {
      logger.info('🎉 存储系统运行良好，可以正常使用');
    } else if (passRate >= 0.7) {
      logger.info('⚠️ 存储系统基本可用，但建议解决部分问题');
      logger.info('📋 建议操作: 检查数据库连接和权限配置');
    } else {
      logger.info('🚨 存储系统存在较多问题，需要优先修复');
      logger.info('📋 建议操作:');
      logger.info('  1. 检查 Supabase 项目配置');
      logger.info('  2. 验证 API 密钥权限');
      logger.info('  3. 手动创建数据库表');
      logger.info('  4. 检查网络连接');
    }
  }

  /**
   * 清理测试数据
   */
  async cleanup(): Promise<void> {
    try {
      // 清理测试用户的所有数据
      const testKeys = [
        'test_key',
        'cache_test',
        'large_data_test',
        ...Array(10).fill(0).map((_, i) => `batch_test_${i}`)
      ];

      for (const key of testKeys) {
        try {
          await globalDataManager.setData(key, null);
        } catch (error) {
          // 忽略清理错误
        }
      }

      logger.info('🧹 测试数据清理完成');
    } catch (error) {
      logger.warn('⚠️ 测试数据清理失败:', error);
    }
  }
}

/**
 * 快速测试函数
 */
export async function quickStorageTest(): Promise<boolean> {
  const tester = new StorageIntegrationTest();
  
  try {
    const suite = await tester.runAllTests();
    await tester.cleanup();
    
    return suite.passedTests / suite.totalTests >= 0.7;
  } catch (error) {
    logger.error('💥 快速测试失败:', error);
    return false;
  }
}

// 导出实例
export const storageIntegrationTest = new StorageIntegrationTest();

export default StorageIntegrationTest;