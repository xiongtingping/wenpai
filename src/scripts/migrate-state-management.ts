/**
 * 🚀 状态管理迁移执行脚本
 * 自动化执行状态迁移和清理工作
 * 遵循 CLAUDE.md 架构治理规范
 */

import { migrateToUnifiedState, cleanupLegacyStateData, getMigrationLog } from '@/utils/stateMigrationTool';

/**
 * 主迁移函数
 */
async function executeStateMigration() {
  console.log('🎯 开始状态管理系统迁移...');
  console.log('='.repeat(60));

  try {
    // 1. 执行状态迁移
    console.log('📋 步骤 1: 执行状态数据迁移');
    const migrationResult = await migrateToUnifiedState();
    
    if (migrationResult.success) {
      console.log('✅ 状态迁移成功完成');
      console.log(`📊 迁移模块数量: ${migrationResult.migratedKeys.length}`);
      console.log(`📝 迁移模块: ${migrationResult.migratedKeys.join(', ')}`);
      
      if (migrationResult.errors.length > 0) {
        console.log('⚠️ 迁移过程中的警告:');
        migrationResult.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.error('❌ 状态迁移失败');
      migrationResult.errors.forEach(error => {
        console.error(`   - ${error}`);
      });
      return false;
    }

    // 2. 清理旧数据
    console.log('\n📋 步骤 2: 清理旧状态数据');
    cleanupLegacyStateData();
    console.log('✅ 旧状态数据清理完成');

    // 3. 输出迁移日志
    console.log('\n📋 步骤 3: 输出迁移日志');
    const logs = getMigrationLog();
    if (logs.length > 0) {
      console.log('📜 详细迁移日志:');
      logs.forEach(log => {
        console.log(`   ${log}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 状态管理系统迁移完成！');
    console.log('🎯 现在可以开始使用统一状态管理系统');
    
    return true;

  } catch (error) {
    console.error('💥 迁移过程中发生严重错误:', error);
    return false;
  }
}

/**
 * 验证迁移结果
 */
function validateMigration() {
  console.log('\n🔍 验证迁移结果...');
  
  try {
    // 检查统一存储是否存在
    const unifiedStore = localStorage.getItem('wenpai-unified-store');
    if (unifiedStore) {
      const storeData = JSON.parse(unifiedStore);
      console.log('✅ 统一状态存储已创建');
      console.log(`📊 状态版本: ${storeData.state?.version || '未知'}`);
      console.log(`🕐 最后更新: ${storeData.state?.lastUpdated || '未知'}`);
      
      // 检查各模块状态
      const modules = ['user', 'tokenUsage', 'theme', 'appSettings', 'favorites'];
      modules.forEach(module => {
        if (storeData.state?.[module]) {
          console.log(`✅ ${module} 模块状态已迁移`);
        } else {
          console.log(`⚠️ ${module} 模块状态为空`);
        }
      });
      
      return true;
    } else {
      console.error('❌ 统一状态存储未找到');
      return false;
    }
  } catch (error) {
    console.error('❌ 验证迁移结果时发生错误:', error);
    return false;
  }
}

/**
 * 生成迁移报告
 */
function generateMigrationReport() {
  console.log('\n📊 生成迁移报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    success: true,
    summary: {
      totalModules: 0,
      migratedModules: 0,
      errors: 0,
      warnings: 0,
    },
    details: {
      beforeMigration: {
        storageKeys: [],
        totalSize: 0,
      },
      afterMigration: {
        unifiedStoreExists: false,
        unifiedStoreSize: 0,
      },
    },
    recommendations: [],
  };

  try {
    // 检查迁移前的存储状态
    const oldKeys = [
      'wenpai-token-usage-store',
      'usage-storage', 
      'wenpai-auth-store',
      'auth-storage',
      'theme-storage',
      'favorites-storage',
      'content-sync-storage'
    ];

    oldKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        report.details.beforeMigration.storageKeys.push(key);
        report.details.beforeMigration.totalSize += data.length;
      }
    });

    // 检查迁移后的统一存储
    const unifiedStore = localStorage.getItem('wenpai-unified-store');
    if (unifiedStore) {
      report.details.afterMigration.unifiedStoreExists = true;
      report.details.afterMigration.unifiedStoreSize = unifiedStore.length;
    }

    // 生成建议
    if (report.details.beforeMigration.storageKeys.length > 0) {
      report.recommendations.push('建议手动清理残留的旧存储数据');
    }

    if (!report.details.afterMigration.unifiedStoreExists) {
      report.recommendations.push('统一状态存储未创建，需要检查迁移过程');
      report.success = false;
    } else {
      report.recommendations.push('迁移成功，可以安全删除旧的状态管理代码');
    }

    console.log('📋 迁移报告:');
    console.log(JSON.stringify(report, null, 2));

    // 保存报告到文件（如果需要）
    try {
      localStorage.setItem('wenpai-migration-report', JSON.stringify(report));
      console.log('💾 迁移报告已保存到 localStorage');
    } catch (error) {
      console.warn('⚠️ 无法保存迁移报告:', error);
    }

    return report;

  } catch (error) {
    console.error('❌ 生成迁移报告时发生错误:', error);
    report.success = false;
    return report;
  }
}

/**
 * 主执行函数
 */
async function main() {
  console.log('🎯 状态管理统一迁移工具');
  console.log('版本: 1.0.0');
  console.log('遵循: CLAUDE.md 架构治理规范');
  console.log('时间:', new Date().toISOString());
  console.log('='.repeat(60));

  // 执行迁移
  const migrationSuccess = await executeStateMigration();

  if (migrationSuccess) {
    // 验证迁移结果
    const validationSuccess = validateMigration();

    // 生成迁移报告
    const report = generateMigrationReport();

    if (validationSuccess && report.success) {
      console.log('\n🎉 状态管理统一迁移全部完成！');
      console.log('🎯 系统现在使用单一数据源 (SSOT) 架构');
      console.log('📚 详细文档请参考: /src/stores/unified-state-store.ts');
    } else {
      console.log('\n⚠️ 迁移过程存在问题，请检查日志');
    }
  } else {
    console.log('\n❌ 迁移失败，请检查错误信息');
  }
}

// 仅在直接运行时执行
if (typeof window !== 'undefined' && window.location) {
  // 浏览器环境中的执行逻辑
  console.log('🌐 在浏览器环境中执行迁移');
  
  // 可以通过控制台手动执行
  (window as any).executeStateMigration = main;
  
  console.log('💡 提示: 可以在控制台中运行 executeStateMigration() 来执行迁移');
}

export default main;
export { executeStateMigration, validateMigration, generateMigrationReport };