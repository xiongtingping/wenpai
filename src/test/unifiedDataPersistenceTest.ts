/**
 * 🧪 统一数据持久化系统测试
 * 验证数据持久化系统的完整性和功能
 */

import { unifiedDataPersistenceManager } from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';

// 测试数据
const testData = {
  testString: 'Hello World',
  testNumber: 42,
  testArray: [1, 2, 3],
  testObject: { key: 'value', nested: { data: true } }
};

/**
 * 测试统一数据持久化系统
 */
export async function testUnifiedDataPersistence() {
  logger.info('🧪 开始测试统一数据持久化系统...');
  
  try {
    // 设置测试用户ID
    unifiedDataPersistenceManager.setUserId('test-user-123');
    
    // 测试1: 保存数据
    logger.info('📝 测试1: 保存数据');
    const saveResult = await unifiedDataPersistenceManager.saveData('test_data', testData);
    
    if (saveResult.success) {
      logger.info('✅ 数据保存成功', { source: saveResult.source });
    } else {
      logger.error('❌ 数据保存失败', saveResult.error);
      return false;
    }
    
    // 测试2: 加载数据
    logger.info('📖 测试2: 加载数据');
    const loadResult = await unifiedDataPersistenceManager.loadData('test_data');
    
    if (loadResult.success && loadResult.data) {
      logger.info('✅ 数据加载成功', { source: loadResult.source });
      
      // 验证数据完整性
      const loadedData = loadResult.data;
      if (JSON.stringify(loadedData) === JSON.stringify(testData)) {
        logger.info('✅ 数据完整性验证通过');
      } else {
        logger.error('❌ 数据完整性验证失败');
        return false;
      }
    } else {
      logger.error('❌ 数据加载失败', loadResult.error);
      return false;
    }
    
    // 测试3: 用户切换
    logger.info('🔄 测试3: 用户切换');
    unifiedDataPersistenceManager.setUserId('test-user-456');
    
    const newUserLoadResult = await unifiedDataPersistenceManager.loadData('test_data');
    if (!newUserLoadResult.success || !newUserLoadResult.data) {
      logger.info('✅ 用户数据隔离验证通过');
    } else {
      logger.error('❌ 用户数据隔离验证失败');
      return false;
    }
    
    // 测试4: 清理测试数据
    logger.info('🧹 测试4: 清理测试数据');
    unifiedDataPersistenceManager.setUserId('test-user-123');
    const deleteResult = await unifiedDataPersistenceManager.deleteData('test_data');
    
    if (deleteResult.success) {
      logger.info('✅ 数据删除成功');
    } else {
      logger.error('❌ 数据删除失败', deleteResult.error);
    }
    
    logger.info('🎉 统一数据持久化系统测试完成');
    return true;
    
  } catch (error) {
    logger.error('❌ 测试过程中发生异常:', error);
    return false;
  }
}

/**
 * 测试数据迁移功能
 */
export async function testDataMigration() {
  logger.info('🧪 开始测试数据迁移功能...');
  
  try {
    // 模拟旧数据
    const legacyKey = 'legacy_test_data';
    const legacyData = { oldFormat: true, data: 'legacy content' };
    
    // 保存到localStorage模拟旧数据
    localStorage.setItem(legacyKey, JSON.stringify(legacyData));
    
    // 执行迁移
    const migrationResult = await unifiedDataPersistenceManager.migrateLegacyData('test-user-789');
    
    logger.info('✅ 数据迁移测试完成', { migratedCount: migrationResult });
    return true;
    
  } catch (error) {
    logger.error('❌ 数据迁移测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
  logger.info('🚀 开始运行统一数据持久化系统完整测试...');
  
  const results = {
    persistence: await testUnifiedDataPersistence(),
    migration: await testDataMigration()
  };
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    logger.info('🎉 所有测试通过！统一数据持久化系统工作正常');
  } else {
    logger.error('❌ 部分测试失败', results);
  }
  
  return results;
}
