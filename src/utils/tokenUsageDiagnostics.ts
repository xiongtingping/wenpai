/**
 * Token使用量诊断工具
 * @description 用于排查Token使用量显示异常问题的诊断工具
 */

import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import { useUnifiedStore } from '@/stores/unified-state-store';
import { logger } from '@/utils/logger';

export interface DiagnosticResult {
  timestamp: string;
  checks: {
    databaseRecords: {
      success: boolean;
      recordCount: number;
      totalTokens: number;
      sampleRecords: any[];
      error?: string;
    };
    storeState: {
      success: boolean;
      currentStats: any;
      usageHistory: number;
      error?: string;
    };
    localStorage: {
      success: boolean;
      data: any;
      error?: string;
    };
    eventListeners: {
      success: boolean;
      count: number;
      error?: string;
    };
  };
  recommendations: string[];
}

/**
 * 执行完整的Token使用量诊断
 */
export async function diagnoseTokenUsage(userId: string): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    checks: {
      databaseRecords: {
        success: false,
        recordCount: 0,
        totalTokens: 0,
        sampleRecords: []
      },
      storeState: {
        success: false,
        currentStats: null,
        usageHistory: 0
      },
      localStorage: {
        success: false,
        data: null
      },
      eventListeners: {
        success: false,
        count: 0
      }
    },
    recommendations: []
  };

  // 1. 检查Supabase数据库记录
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from(TABLE_NAMES.USER_USAGE_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      result.checks.databaseRecords.error = error.message;
      result.recommendations.push('❌ 数据库查询失败，检查Supabase连接和RLS策略');
    } else {
      result.checks.databaseRecords.success = true;
      result.checks.databaseRecords.recordCount = data?.length || 0;
      result.checks.databaseRecords.sampleRecords = data || [];

      // 计算总Token数
      result.checks.databaseRecords.totalTokens = (data || []).reduce((sum: number, record: any) => {
        const tokens = record.total_tokens || record.totalTokens || 0;
        return sum + tokens;
      }, 0);

      if (data && data.length > 0) {
        result.recommendations.push(`✅ 数据库中有 ${data.length} 条记录，总计 ${result.checks.databaseRecords.totalTokens} tokens`);
      } else {
        result.recommendations.push('⚠️ 数据库中无记录，可能是写入失败或用户ID不匹配');
      }
    }
  } catch (error) {
    result.checks.databaseRecords.error = error instanceof Error ? error.message : '未知错误';
    result.recommendations.push('❌ 数据库检查异常');
  }

  // 2. 检查unified-state-store状态
  try {
    const store = useUnifiedStore.getState();
    result.checks.storeState.success = true;
    result.checks.storeState.currentStats = store.tokenUsage.currentStats;
    result.checks.storeState.usageHistory = store.tokenUsage.usageHistory.length;

    if (!store.tokenUsage.currentStats) {
      result.recommendations.push('❌ Store中tokenUsage.currentStats为null，未初始化');
    } else if (store.tokenUsage.currentStats.monthlyUsed === 0) {
      result.recommendations.push('⚠️ Store中monthlyUsed为0，可能未更新或查询失败');
    } else {
      result.recommendations.push(`✅ Store状态正常，monthlyUsed: ${store.tokenUsage.currentStats.monthlyUsed}`);
    }
  } catch (error) {
    result.checks.storeState.error = error instanceof Error ? error.message : '未知错误';
    result.recommendations.push('❌ Store状态检查异常');
  }

  // 3. 检查localStorage持久化数据
  try {
    const storedData = localStorage.getItem('wenpai-unified-store');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      result.checks.localStorage.success = true;
      result.checks.localStorage.data = {
        tokenUsage: parsed.state?.tokenUsage,
        lastUpdated: parsed.state?.lastUpdated
      };

      if (!parsed.state?.tokenUsage?.currentStats) {
        result.recommendations.push('⚠️ localStorage中无tokenUsage数据');
      }
    } else {
      result.recommendations.push('⚠️ localStorage中无unified-store数据');
    }
  } catch (error) {
    result.checks.localStorage.error = error instanceof Error ? error.message : '未知错误';
    result.recommendations.push('❌ localStorage检查异常');
  }

  // 4. 检查事件监听器（仅在浏览器环境）
  if (typeof window !== 'undefined') {
    try {
      // 注意：无法直接获取事件监听器数量，这里只是标记检查点
      result.checks.eventListeners.success = true;
      result.recommendations.push('ℹ️ 检查浏览器控制台是否有"已注册Token使用量更新事件监听器"日志');
    } catch (error) {
      result.checks.eventListeners.error = error instanceof Error ? error.message : '未知错误';
    }
  }

  return result;
}

/**
 * 打印诊断报告到控制台
 */
export function printDiagnosticReport(result: DiagnosticResult): void {
  console.group('🔍 Token使用量诊断报告');
  console.log('时间:', result.timestamp);
  
  console.group('📊 数据库检查');
  console.log('状态:', result.checks.databaseRecords.success ? '✅ 成功' : '❌ 失败');
  console.log('记录数:', result.checks.databaseRecords.recordCount);
  console.log('总Token数:', result.checks.databaseRecords.totalTokens);
  console.log('样本记录:', result.checks.databaseRecords.sampleRecords);
  if (result.checks.databaseRecords.error) {
    console.error('错误:', result.checks.databaseRecords.error);
  }
  console.groupEnd();

  console.group('🏪 Store状态检查');
  console.log('状态:', result.checks.storeState.success ? '✅ 成功' : '❌ 失败');
  console.log('currentStats:', result.checks.storeState.currentStats);
  console.log('usageHistory长度:', result.checks.storeState.usageHistory);
  if (result.checks.storeState.error) {
    console.error('错误:', result.checks.storeState.error);
  }
  console.groupEnd();

  console.group('💾 localStorage检查');
  console.log('状态:', result.checks.localStorage.success ? '✅ 成功' : '❌ 失败');
  console.log('数据:', result.checks.localStorage.data);
  if (result.checks.localStorage.error) {
    console.error('错误:', result.checks.localStorage.error);
  }
  console.groupEnd();

  console.group('📡 事件监听器检查');
  console.log('状态:', result.checks.eventListeners.success ? '✅ 成功' : '❌ 失败');
  if (result.checks.eventListeners.error) {
    console.error('错误:', result.checks.eventListeners.error);
  }
  console.groupEnd();

  console.group('💡 建议');
  result.recommendations.forEach(rec => console.log(rec));
  console.groupEnd();

  console.groupEnd();
}

/**
 * 在浏览器控制台暴露诊断工具
 */
if (typeof window !== 'undefined') {
  (window as any).diagnoseTokenUsage = async (userId: string) => {
    const result = await diagnoseTokenUsage(userId);
    printDiagnosticReport(result);
    return result;
  };
  
  console.log('💡 Token诊断工具已加载，使用方法: window.diagnoseTokenUsage("用户ID")');
}

