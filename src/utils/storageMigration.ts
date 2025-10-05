/**
 * 🔄 存储迁移工具
 * 
 * 功能：将旧版auth-store数据迁移到unified-store
 * 
 * 迁移策略：
 * 1. 读取旧版数据（wenpai-auth-store-v2）
 * 2. 转换数据结构
 * 3. 写入新版store（wenpai-unified-store）
 * 4. 验证迁移结果
 * 5. 备份旧数据（可选回滚）
 */

import { AuthStatus } from '@/stores/unified-state-store';

// ============================================================================
// 🎯 类型定义
// ============================================================================

/**
 * 旧版auth-store数据结构
 */
interface LegacyAuthStoreData {
  state: {
    user: any;
    isAuthenticated: boolean;
    authStatus?: string;
    loading?: boolean;
    error?: string | null;
    sessionWarning?: boolean;
    sessionRemainingTime?: number;
    sessionExpiresAt?: number | null;
    lastUpdated?: string;
    version?: string;
  };
  version?: number;
}

/**
 * 迁移结果
 */
interface MigrationResult {
  success: boolean;
  message: string;
  migratedData?: any;
  errors?: string[];
}

// ============================================================================
// 🎯 迁移函数
// ============================================================================

/**
 * 执行存储迁移
 */
export async function migrateAuthStoreToUnified(): Promise<MigrationResult> {
  console.log('🔄 开始存储迁移：auth-store → unified-store');

  try {
    // 步骤1：读取旧版数据
    const legacyData = readLegacyAuthStore();
    
    if (!legacyData) {
      console.log('ℹ️ 未找到旧版auth-store数据，跳过迁移');
      return {
        success: true,
        message: '未找到旧版数据，无需迁移'
      };
    }

    console.log('📖 读取到旧版数据:', {
      hasUser: !!legacyData.state?.user,
      isAuthenticated: legacyData.state?.isAuthenticated,
      version: legacyData.version
    });

    // 步骤2：检查unified-store是否已有数据
    const existingUnifiedData = readUnifiedStore();
    
    if (existingUnifiedData && existingUnifiedData.user?.id) {
      console.log('ℹ️ unified-store已有用户数据，跳过迁移');
      return {
        success: true,
        message: 'unified-store已有数据，无需迁移'
      };
    }

    // 步骤3：转换数据结构
    const transformedData = transformAuthStoreData(legacyData);
    
    console.log('🔄 数据转换完成:', {
      hasUser: !!transformedData.user?.id,
      hasSession: !!transformedData.session
    });

    // 步骤4：备份旧数据
    backupLegacyData(legacyData);

    // 步骤5：写入unified-store
    writeToUnifiedStore(transformedData);

    // 步骤6：验证迁移结果
    const verified = verifyMigration(legacyData, transformedData);

    if (!verified.success) {
      console.error('❌ 迁移验证失败:', verified.errors);
      // 回滚
      rollbackMigration();
      return {
        success: false,
        message: '迁移验证失败，已回滚',
        errors: verified.errors
      };
    }

    console.log('✅ 存储迁移成功完成');
    
    return {
      success: true,
      message: '迁移成功',
      migratedData: transformedData
    };

  } catch (error) {
    console.error('❌ 存储迁移失败:', error);
    return {
      success: false,
      message: `迁移失败: ${error instanceof Error ? error.message : '未知错误'}`,
      errors: [error instanceof Error ? error.message : '未知错误']
    };
  }
}

// ============================================================================
// 🎯 辅助函数
// ============================================================================

/**
 * 读取旧版auth-store数据
 */
function readLegacyAuthStore(): LegacyAuthStoreData | null {
  try {
    const data = localStorage.getItem('wenpai-auth-store-v2');
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('读取旧版auth-store失败:', error);
    return null;
  }
}

/**
 * 读取unified-store数据
 */
function readUnifiedStore(): any {
  try {
    const data = localStorage.getItem('wenpai-unified-store');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.state || parsed;
  } catch (error) {
    console.error('读取unified-store失败:', error);
    return null;
  }
}

/**
 * 转换auth-store数据到unified-store格式
 */
function transformAuthStoreData(legacyData: LegacyAuthStoreData): any {
  const legacyState = legacyData.state;

  // 转换AuthStatus
  let authStatus = AuthStatus.UNAUTHENTICATED;
  if (legacyState.authStatus) {
    switch (legacyState.authStatus) {
      case 'authenticated':
        authStatus = AuthStatus.AUTHENTICATED;
        break;
      case 'authenticating':
        authStatus = AuthStatus.AUTHENTICATING;
        break;
      case 'error':
        authStatus = AuthStatus.ERROR;
        break;
      default:
        authStatus = AuthStatus.UNAUTHENTICATED;
    }
  } else if (legacyState.isAuthenticated) {
    authStatus = AuthStatus.AUTHENTICATED;
  }

  return {
    user: legacyState.user ? {
      ...legacyState.user,
      authStatus,
      isAuthenticated: legacyState.isAuthenticated || false,
    } : null,
    session: {
      sessionWarning: legacyState.sessionWarning || false,
      sessionRemainingTime: legacyState.sessionRemainingTime || 0,
      sessionExpiresAt: legacyState.sessionExpiresAt || null,
    },
    loading: {
      auth: legacyState.loading || false,
    },
    error: {
      auth: legacyState.error || null,
    },
    lastUpdated: legacyState.lastUpdated || new Date().toISOString(),
    version: '2.0.0',
  };
}

/**
 * 备份旧数据
 */
function backupLegacyData(legacyData: LegacyAuthStoreData): void {
  try {
    const backupKey = `wenpai-auth-store-v2-backup-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(legacyData));
    console.log('💾 旧数据已备份:', backupKey);
  } catch (error) {
    console.error('备份旧数据失败:', error);
  }
}

/**
 * 写入unified-store
 */
function writeToUnifiedStore(data: any): void {
  try {
    const existingData = readUnifiedStore();
    
    // 合并数据，保留unified-store中的其他section
    const mergedData = {
      state: {
        ...existingData,
        user: data.user,
        session: data.session,
        loading: {
          ...(existingData?.loading || {}),
          ...data.loading,
        },
        error: {
          ...(existingData?.error || {}),
          ...data.error,
        },
        lastUpdated: data.lastUpdated,
        version: data.version,
      },
      version: 2,
    };

    localStorage.setItem('wenpai-unified-store', JSON.stringify(mergedData));
    console.log('✅ 数据已写入unified-store');
  } catch (error) {
    console.error('写入unified-store失败:', error);
    throw error;
  }
}

/**
 * 验证迁移结果
 */
function verifyMigration(
  legacyData: LegacyAuthStoreData,
  transformedData: any
): { success: boolean; errors?: string[] } {
  const errors: string[] = [];

  // 验证用户数据
  if (legacyData.state.user && !transformedData.user) {
    errors.push('用户数据丢失');
  }

  if (legacyData.state.user?.id !== transformedData.user?.id) {
    errors.push('用户ID不匹配');
  }

  // 验证会话数据
  if (legacyData.state.sessionWarning !== transformedData.session.sessionWarning) {
    errors.push('会话警告状态不匹配');
  }

  // 读取写入后的数据进行验证
  const writtenData = readUnifiedStore();
  if (!writtenData) {
    errors.push('无法读取写入的数据');
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * 回滚迁移
 */
function rollbackMigration(): void {
  try {
    console.log('🔄 开始回滚迁移...');
    
    // 查找最新的备份
    const backupKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('wenpai-auth-store-v2-backup-')
    );
    
    if (backupKeys.length === 0) {
      console.warn('⚠️ 未找到备份数据');
      return;
    }

    // 按时间戳排序，获取最新备份
    const latestBackupKey = backupKeys.sort().reverse()[0];
    const backupData = localStorage.getItem(latestBackupKey);
    
    if (backupData) {
      localStorage.setItem('wenpai-auth-store-v2', backupData);
      console.log('✅ 已从备份恢复:', latestBackupKey);
    }
  } catch (error) {
    console.error('❌ 回滚失败:', error);
  }
}

/**
 * 清理旧数据（迁移成功后可选调用）
 */
export function cleanupLegacyAuthStore(): void {
  try {
    localStorage.removeItem('wenpai-auth-store-v2');
    console.log('🗑️ 已清理旧版auth-store数据');
  } catch (error) {
    console.error('清理旧数据失败:', error);
  }
}

