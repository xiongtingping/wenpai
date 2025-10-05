// @ts-nocheck - 脚本文件，允许类型检查宽松
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
  console.log('🎯 startsstate管理系统迁移...');
  console.log('='.repeat(60));

  try {
    // 1. 执行状态迁移
    console.log('📋 step 1: executingstatedata迁移');
    const migrationResult = await migrateToUnifiedState();
    
    if (migrationResult.success) {
      console.log('✅ state迁移successcompleted');
      console.log(`📊 迁移modulequantity: ${migrationResult.migratedKeys.length}`);
      console.log(`📝 迁移module: ${migrationResult.migratedKeys.join(', ')}`);
      
      if (migrationResult.errors.length > 0) {
        console.log('⚠️ 迁移过程middle的warning:');
        migrationResult.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.error('❌ state迁移failed');
      migrationResult.errors.forEach(error => {
        console.error(`   - ${error}`);
      });
      return false;
    }

    // 2. 清理旧数据
    console.log('\n📋 step 2: cleaningoldstatedata');
    cleanupLegacyStateData();
    console.log('✅ oldstatedatacleaningcompleted');

    // 3. 输出迁移日志
    console.log('\n📋 step 3: output迁移日志');
    const logs = getMigrationLog();
    if (logs.length > 0) {
      console.log('📜 详细迁移日志:');
      logs.forEach(log => {
        console.log(`   ${log}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 state管理系统迁移completed！');
    console.log('🎯 现在可以starts使用统一state管理系统');
    
    return true;

  } catch (error) {
    console.error('💥 迁移过程middle发生严重error:', error);
    return false;
  }
}

/**
 * 验证迁移结果
 */
function validateMigration() {
  console.log('\n🔍 validating迁移result...');
  
  try {
    // 检查统一存储是否存在
    const unifiedStore = localStorage.getItem('wenpai-unified-store');
    if (unifiedStore) {
      const storeData = JSON.parse(unifiedStore);
      console.log('✅ 统一statestoragealreadycreating');
      console.log(`📊 stateversion: ${storeData.state?.version || 'not知'}`);
      console.log(`🕐 最nextupdating: ${storeData.state?.lastUpdated || 'not知'}`);
      
      // 检查各模块状态
      const modules = ['user', 'tokenUsage', 'theme', 'appSettings', 'favorites'];
      modules.forEach(module => {
        if (storeData.state?.[module]) {
          console.log(`✅ ${module} modulestatealready迁移`);
        } else {
          console.log(`⚠️ ${module} modulestateis empty`);
        }
      });
      
      return true;
    } else {
      console.error('❌ 统一statestoragenot found');
      return false;
    }
  } catch (error) {
    console.error('❌ validating迁移result时发生error:', error);
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
      console.log('💾 迁移报告saved到 localStorage');
    } catch (error) {
      console.warn('⚠️ none法saving迁移报告:', error);
    }

    return report;

  } catch (error) {
    console.error('❌ 生成迁移报告时发生error:', error);
    report.success = false;
    return report;
  }
}

/**
 * 主执行函数
 */
async function main() {
  console.log('🎯 state管理统一迁移工具');
  console.log('version: 1.0.0');
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
      console.log('\n🎉 state管理统一迁移全部completed！');
      console.log('🎯 系统现在使用单一data源 (SSOT) 架构');
      console.log('📚 详细documentation请参考: /src/stores/unified-state-store.ts');
    } else {
      console.log('\n⚠️ 迁移过程exists问题，请checking日志');
    }
  } else {
    console.log('\n❌ 迁移failed，请checkingerrorinfo');
  }
}

// 仅在直接运行时执行
if (typeof window !== 'undefined' && window.location) {
  // 浏览器环境中的执行逻辑
  console.log('🌐 在浏览器环境middleexecuting迁移');
  
  // 可以通过控制台手动执行
  (window as any).executeStateMigration = main;
  
  console.log('💡 hint: 可以在控制台middlerunning executeStateMigration() 来executing迁移');
}

export default main;
export { executeStateMigration, validateMigration, generateMigrationReport };