/**
 * Token使用量统计服务 - 修复版本
 * @description 统一管理所有AI调用的token使用量统计、限额检查、使用记录等功能
 * 🔧 修复了主键重复和ID生成问题
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { request } from '@/api/request';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';
import { createDataService, TABLE_NAMES, getSupabaseClient } from '@/services/supabaseDataService';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

// 当后端未提供实现(501)时，短期内禁用同步以避免噪声
let backendDisabledUntil = 0;

/**
 * 获取套餐Token限额 - 统一使用subscriptionPlans配置
 * 🔧 修复: 消除硬编码，确保与订阅计划配置一致
 */
function getTokenLimitForTier(tier: SubscriptionTier): number {
  try {
    const plan = getSubscriptionPlan(tier);
    return plan.limits.tokenLimit;
  } catch (error) {
    console.warn(`getting套餐${tier}的Tokenlimitfailed，使用defaultvalue`, error);
    // 仅在获取配置失败时使用fallback值
    const fallbackLimits: Partial<Record<SubscriptionTier, number>> = {
      trial: 100000,
      pro: 200000,
      premium: 500000
    };
    const fallback = fallbackLimits[tier];
    return typeof fallback === 'number' ? fallback : 100000;
  }
}

/**
 * Token使用记录接口
 */
export interface TokenUsageRecord {
  /** 记录ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 功能类型 */
  feature: string;
  /** 任务类型 */
  taskType?: string;
  /** 输入token数量 */
  inputTokens: number;
  /** 输出token数量 */
  outputTokens: number;
  /** 总token数量 */
  totalTokens: number;
  /** 使用的AI模型 */
  model: string;
  /** 创建时间 */
  created_at: string;
  /** 请求内容摘要 */
  contentSummary?: string;
  /** 响应状态 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * Token使用统计接口
 */
export interface TokenUsageStats {
  /** 用户ID */
  userId: string;
  /** 用户套餐类型 */
  userTier: SubscriptionTier;
  /** 月度token限额 */
  monthlyLimit: number;
  /** 本月已使用token数量 */
  monthlyUsed: number;
  /** 本月剩余token数量 */
  monthlyRemaining: number;
  /** 今日已使用token数量 */
  dailyUsed: number;
  /** 使用百分比 */
  usagePercentage: number;
  /** 是否需要升级 */
  needUpgrade: boolean;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * Token限额警告级别
 */
export type TokenWarningLevel = 'safe' | 'warning' | 'approaching' | 'exceeded';

/**
 * Token限额检查结果
 */
export interface TokenLimitCheckResult {
  /** 是否允许使用 */
  allowed: boolean;
  /** 拒绝原因 */
  reason?: string;
  /** 警告级别 */
  warningLevel: TokenWarningLevel;
  /** 当前使用统计 */
  stats: TokenUsageStats;
  /** 建议操作 */
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';
}

/**
 * 🔧 修复: 改进的ID生成函数，避免重复
 */
function generateUniqueTokenId(userId: string, feature: string): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 14);
  const userPart = userId.slice(-6).replace(/[^a-zA-Z0-9]/g, ''); // 清理特殊字符
  const featurePart = feature.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8); // 清理和截取功能名
  const microsecond = (performance.now() * 1000).toString().slice(-3); // 添加微秒精度

  return `token_${timestamp}_${userPart}_${featurePart}_${microsecond}_${randomPart}`;
}

/**
 * Token使用量统计服务类
 */
class TokenUsageService {
  // 🔧 FIX: 直接使用 token_usage_records 表，移除回退逻辑
  private async getUsageTableName(): Promise<string> {
    return TABLE_NAMES.USER_USAGE_LOGS; // 'token_usage_records'
  }

  private readonly API_ENDPOINT = '/.netlify/functions/api-token-usage';

  /**
   * 获取用户套餐的token限额
   */
  private getTokenLimitByTier(tier: SubscriptionTier): number {
    return getTokenLimitForTier(tier);
  }

  /**
   * 获取当前月份的键值
   */
  private getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * 获取当前日期的键值
   */
  private getCurrentDateKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * 🔧 修复: 安全的Token记录插入，避免重复键错误
   */
  private async safeInsertTokenRecord(record: TokenUsageRecord): Promise<boolean> {
    try {
      logger.info('🔍 开始安全插入Token记录:', {
        id: record.id,
        userId: record.userId,
        totalTokens: record.totalTokens
      });

      const client = await getSupabaseClient();
      const usageTable = await this.getUsageTableName();

      // 1. 检查记录是否已存在
      const { data: existingRecord, error: checkError } = await client
        .from(usageTable)
        .select('id')
        .eq('id', record.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.warn('⚠️  检查重复记录时发生错误:', checkError);
      }

      if (existingRecord) {
        logger.info('🔄 记录已存在，跳过插入:', record.id);
        return true; // 记录已存在，视为成功
      }

      // 2. 准备数据库记录（使用snake_case）
      const dbRecord = {
        id: record.id,
        user_id: record.userId,
        feature: record.feature,
        task_type: record.taskType || null,
        input_tokens: record.inputTokens || 0,
        output_tokens: record.outputTokens || 0,
        total_tokens: record.totalTokens || 0,
        model: record.model,
        content_summary: record.contentSummary || null,
        success: record.success !== false, // 默认为true
        error_message: record.error || null,
        created_at: record.created_at
      };

      logger.info('📊 准备插入的数据库记录:', {
        id: dbRecord.id,
        user_id: dbRecord.user_id,
        total_tokens: dbRecord.total_tokens,
        feature: dbRecord.feature,
        model: dbRecord.model
      });

      // 3. 尝试插入
      let { data, error } = await client
        .from(usageTable)
        .insert(dbRecord)
        .select()
        .single();

      if (error) {
        // 特殊处理主键重复错误
        if (error.code === '23505') {
          logger.warn('⚠️  检测到主键重复，记录可能已存在:', record.id);

          // 再次检查记录是否确实存在
          const { data: doubleCheck } = await client
            .from(TABLE_NAMES.USER_USAGE_LOGS)
            .select('id, total_tokens')
            .eq('id', record.id)
            .single();

          if (doubleCheck) {
            logger.debug('✅ 确认记录已存在，跳过重复插入:', doubleCheck.id);
            return true; // 记录确实已存在，视为成功
          }
        }

        logger.error('❌ 插入Token记录失败:', {
          error,
          code: error.code,
          message: error.message,
          recordId: record.id
        });

        return false;
      }

      logger.debug('✅ Token记录插入成功:', {
        recordId: record.id,
        dbRecordId: data?.id,
        totalTokens: data?.total_tokens
      });

      return true;

    } catch (error) {
      logger.error('❌ 安全插入Token记录异常:', error);

      // 对于重复键错误，静默处理
      if (error instanceof Error && error.message.includes('duplicate key')) {
        logger.warn('⚠️  检测到重复键值，记录可能已存在:', record.id);
        return true; // 视为成功，避免阻断流程
      }

      return false;
    }
  }

  /**
   * 记录token使用量 - 修复版本
   */
  async recordTokenUsage(record: Omit<TokenUsageRecord, 'id' | 'created_at'>): Promise<void> {
    // 🔧 修复: 使用改进的ID生成算法避免重复
    const uniqueId = generateUniqueTokenId(record.userId, record.feature);
    const created_at = new Date().toISOString();

    const fullRecord: TokenUsageRecord = {
      ...record,
      id: uniqueId,
      created_at
    };

    logger.info('💾 开始Token使用量记录:', {
      recordId: fullRecord.id,
      userId: record.userId,
      feature: record.feature,
      model: record.model,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      totalTokens: record.totalTokens,
      success: record.success
    });

    try {
      // 1. 优先保存到Supabase数据库（关键操作）
      logger.info('🔍 准备保存到Supabase...', { recordId: fullRecord.id });
      const databaseSuccess = await this.safeInsertTokenRecord(fullRecord);

      if (!databaseSuccess) {
        logger.error('❌ Supabase数据库保存失败!', { recordId: fullRecord.id });
        throw new Error('Supabasedatabasesavingfailed');
      }

      logger.info('✅ Supabase数据库保存成功!', {
        recordId: fullRecord.id,
        totalTokens: record.totalTokens
      });

      // 2. 尝试同步到后端（非关键操作）
      try {
        await this.syncTokenUsageToBackend(fullRecord);
        logger.debug('✅ 后端同步成功:', fullRecord.id);
      } catch (syncError) {
        // 后端同步失败不影响主流程
        logger.warn('⚠️  后端同步失败，但数据库记录已保存:', syncError);
      }

      logger.debug('✅ Token使用量记录成功:', {
        userId: record.userId,
        feature: record.feature,
        totalTokens: record.totalTokens,
        model: record.model,
        recordId: fullRecord.id
      });

      // 🔧 FIX: 触发Token使用量更新事件，通知UI层刷新显示
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('tokenUsageUpdated', {
          detail: {
            userId: record.userId,
            totalTokens: record.totalTokens,
            feature: record.feature,
            created_at: created_at
          }
        });
        window.dispatchEvent(event);
        console.log('📢 已触发Token使用量更新事件:', record.totalTokens);
      }

    } catch (error) {
      logger.error('❌ Token使用量记录失败(不阻断主流程):', error);
      // 不抛出异常，避免影响主业务流程
      return;
    }
  }

  /**
   * 同步token使用记录到后端
   */
  private async syncTokenUsageToBackend(record: TokenUsageRecord): Promise<void> {
    // 若近期检测到501，则直接跳过同步，避免重复报错
    if (Date.now() < backendDisabledUntil) {
      logger.debug('⏭️ 跳过后端同步（上次501，短期禁用中）');
      return;
    }
    try {
      await request.post(`${this.API_ENDPOINT}/record`, record);
    } catch (error: any) {
      const status = (error?.response && error.response.status) ? error.response.status : undefined;
      const message = error?.message || '';
      // 501 Not Implemented：后端未实现，设置10分钟熔断
      if (status === 501 || /501|Not Implemented/i.test(message)) {
        backendDisabledUntil = Date.now() + 10 * 60 * 1000;
        logger.warn('🚫 后端记录API未实现(501)，已在10分钟内禁用重复同步');
        return; // 不抛出，避免噪声
      }
      logger.warn('⚠️ 同步Token使用记录到后端失败:', { status, message, error });
      // 其他错误保留抛出，由上层转为非阻断告警
      throw new Error(`Token使用记录同步失败: ${message || '未知错误'}`);
    }
  }

  /**
   * 获取用户token使用统计
   */
  async getUserTokenStats(userId: string, userTier: SubscriptionTier): Promise<TokenUsageStats> {
    try {
      logger.debug('🔍 开始获取用户Token统计:', { userId, userTier });

      // 🔧 FIX: 开发环境也从Supabase读取真实数据，确保Token统计准确
      // ⚠️ 已禁用模拟数据，所有环境统一从Supabase读取
      /*
      if (import.meta.env.DEV) {
        console.log('🔧 开发环境：使用模拟Token使用统计');

        const monthlyLimit = getTokenLimitForTier(userTier);
        const monthlyUsed = Math.floor(monthlyLimit * 0.25); // 模拟使用25%
        const dailyUsed = Math.floor(monthlyUsed * 0.1); // 模拟今日使用

        return {
          userId,
          userTier,
          monthlyLimit,
          monthlyUsed,
          monthlyRemaining: monthlyLimit - monthlyUsed,
          dailyUsed,
          usagePercentage: (monthlyUsed / monthlyLimit) * 100,
          needUpgrade: false,
          lastUpdated: new Date().toISOString()
        };
      }
      */

      // const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const monthKey = this.getCurrentMonthKey();
      const dateKey = this.getCurrentDateKey();

      logger.debug('📅 时间范围:', { monthKey, dateKey });

      // 查询当月使用记录 - 使用直接Supabase客户端调用
      const client = await getSupabaseClient();

      // 🔧 修复：使用正确的字段名和时间范围
      const monthStartTime = `${monthKey}-01T00:00:00.000Z`;
      const dayStartTime = `${dateKey}T00:00:00.000Z`;

      logger.debug('🔍 查询月度记录...', {
        table: TABLE_NAMES.USER_USAGE_LOGS,
        userId,
        monthStartTime
      });

      // 🔧 FIX: 使用 created_at 字段（timestamp 已删除）
      const usageTable = await this.getUsageTableName();
      let { data: monthlyData, error: monthlyError } = await client
        .from(usageTable)
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', monthStartTime); // 🔧 FIX: 使用 created_at

      if (monthlyError) {
        logger.error('❌ 月度查询失败:', monthlyError);
        throw new Error(`查询月度记录失败: ${monthlyError.message}`);
      }

      // 移除所有回退逻辑，直接使用 token_usage_records 表和 created_at 字段
      if (!monthlyData || monthlyData.length === 0) {
        logger.warn('⚠️ 月度查询为空，用户可能没有使用记录');
        monthlyData = [];
      }

      logger.debug('📊 月度查询结果:', {
        recordCount: monthlyData?.length || 0,
        sampleRecord: monthlyData?.[0] || null
      });

      const monthlyRecords = { data: monthlyData || [] };

      // 查询当日使用记录 - 使用直接Supabase客户端调用
      logger.debug('🔍 查询日度记录...', {
        table: TABLE_NAMES.USER_USAGE_LOGS,
        userId,
        dayStartTime
      });

      // 日度：同样提供 created_at 回退 + 旧表名回退
      const usageTableDaily = usageTable; //   复用解析结果
      let { data: dailyData, error: dailyError } = await client
        .from(usageTableDaily)
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dayStartTime);

      if (dailyError) {
        logger.error('❌ 日度查询失败:', dailyError);
        throw new Error(`查询日度记录失败: ${dailyError.message}`);
      }

      // 🔧 FIX: 移除所有回退查询，直接使用 token_usage_records 表
      if (!dailyData || dailyData.length === 0) {
        logger.warn('⚠️ 日度查询为空，用户可能没有今日使用记录');
        dailyData = [];
      }

      logger.debug('📊 日度查询结果(含回退兼容):', {
        recordCount: dailyData?.length || 0,
        sampleRecord: dailyData?.[0] || null
      });

      const dailyRecords = { data: dailyData || [] };

      const monthlyLimit = this.getTokenLimitByTier(userTier);

      // 🔍 详细日志：记录Token限额获取
      logger.info('📊 Token限额获取:', {
        userId,
        userTier,
        monthlyLimit,
        source: 'getTokenLimitByTier'
      });

      // 🔧 修复：正确处理字段名与历史记录（可能缺少 total_tokens，仅有 input_tokens/output_tokens）
      const monthlyUsed = monthlyRecords.data.reduce((sum, record: any) => {
        const tokensRaw = (record.total_tokens ?? record.totalTokens) ?? ((record.input_tokens ?? 0) + (record.output_tokens ?? 0));
        const tokensNum = Number(tokensRaw);
        return sum + (Number.isFinite(tokensNum) ? tokensNum : 0);
      }, 0);

      const dailyUsed = dailyRecords.data.reduce((sum, record: any) => {
        const tokensRaw = (record.total_tokens ?? record.totalTokens) ?? ((record.input_tokens ?? 0) + (record.output_tokens ?? 0));
        const tokensNum = Number(tokensRaw);
        return sum + (Number.isFinite(tokensNum) ? tokensNum : 0);
      }, 0);

      logger.info('🔎 TokenUsageService 聚合结果', {
        userId,
        monthStartTime,
        dayStartTime,
        monthlyCount: monthlyRecords.data.length,
        dailyCount: dailyRecords.data.length,
        monthlyUsed,
        dailyUsed,
        monthlySample: monthlyRecords.data[0] || null
      });
      // 直接输出到浏览器控制台，便于前端诊断
      console.log('[tokenUsageService] aggregation', {
        userId,
        monthlyCount: monthlyRecords.data.length,
        monthlyUsed,
        sample: monthlyRecords.data[0] || null
      });

      const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
      const usagePercentage = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
      const needUpgrade = usagePercentage >= 80;

      const result = {
        userId,
        userTier,
        monthlyLimit,
        monthlyUsed,
        monthlyRemaining,
        dailyUsed,
        usagePercentage,
        needUpgrade,
        lastUpdated: new Date().toISOString()
      };

      logger.debug('✅ Token统计计算完成:', result);

      return result;
    } catch (error) {
      logger.error('❌ 从Supabase获取用户Token统计失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能使用本地数据
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取Token使用的警告级别
   */
  private getWarningLevel(usagePercentage: number): TokenWarningLevel {
    if (usagePercentage >= 100) return 'exceeded';
    if (usagePercentage >= 95) return 'approaching';
    if (usagePercentage >= 80) return 'warning';
    return 'safe';
  }

  /**
   * 检查token使用限额
   */
  async checkTokenLimit(userId: string, userTier: SubscriptionTier, estimatedTokens: number): Promise<TokenLimitCheckResult> {
    const stats = await this.getUserTokenStats(userId, userTier);

    // 计算使用后的百分比
    const projectedUsed = stats.monthlyUsed + estimatedTokens;
    const projectedPercentage = (projectedUsed / stats.monthlyLimit) * 100;
    const warningLevel = this.getWarningLevel(projectedPercentage);

    // 🔍 详细日志：记录Token限额检查
    logger.info('🔍 Token限额检查:', {
      userId,
      userTier,
      estimatedTokens,
      monthlyUsed: stats.monthlyUsed,
      monthlyLimit: stats.monthlyLimit,
      monthlyRemaining: stats.monthlyRemaining,
      projectedPercentage: projectedPercentage.toFixed(2) + '%',
      warningLevel,
      willExceed: projectedUsed > stats.monthlyLimit
    });

    // 检查是否超过月度限额
    if (projectedUsed > stats.monthlyLimit) {
      logger.warn('⚠️ Token限额即将超过:', {
        userId,
        userTier,
        monthlyUsed: stats.monthlyUsed,
        monthlyLimit: stats.monthlyLimit,
        estimatedTokens,
        warningLevel
      });

      return {
        allowed: false,
        reason: `本月Token使用量即将超过限额。当前已使用 ${stats.monthlyUsed.toLocaleString()}，限额 ${stats.monthlyLimit.toLocaleString()}`,
        warningLevel,
        stats,
        suggestedAction: 'upgrade'
      };
    }

    // 阶梯式预警：即使允许使用，也返回警告级别
    if (warningLevel !== 'safe') {
      logger.warn(`⚠️ Token使用量预警 [${warningLevel}]:`, {
        userId,
        usagePercentage: projectedPercentage.toFixed(2) + '%',
        monthlyUsed: stats.monthlyUsed,
        monthlyLimit: stats.monthlyLimit
      });
    }

    // 正常情况，返回警告级别
    return {
      allowed: true,
      warningLevel,
      stats,
      ...(warningLevel !== 'safe' && {
        reason: `Token使用量已达 ${projectedPercentage.toFixed(1)}%，建议关注剩余额度`,
        suggestedAction: 'upgrade' as const
      })
    };
  }

  /**
   * 获取用户token使用历史记录
   */
  async getUserTokenHistory(userId: string, limit: number = 50): Promise<TokenUsageRecord[]> {
    try {
      const usageTable = await this.getUsageTableName();
      const dataService = createDataService(userId, usageTable);
      const result = await dataService.findMany({
        limit,
        orderBy: 'created_at',
        orderDirection: 'desc'
      });

      return result.data as TokenUsageRecord[];
    } catch (error) {
      console.error('从SupabasegettinguserToken历史failed:', error);
      // 🚨 数据库失败时必须抛出错误，不能返回空数组
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户按功能分类的token使用统计
   */
  async getUserTokenStatsByFeature(userId: string): Promise<Record<string, { totalTokens: number; requestCount: number; percentage: number }>> {
    try {
      logger.debug('🔍 开始获取用户功能统计:', { userId });

      // const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const monthKey = this.getCurrentMonthKey();
      const monthStartTime = `${monthKey}-01T00:00:00.000Z`;

      logger.debug('📅 查询月度范围:', { monthKey, monthStartTime });

      // 查询当月记录 - 直接使用Supabase客户端进行时间范围查询
      const client = await getSupabaseClient();
      const usageTable = await this.getUsageTableName();
      const { data: records, error } = await client
        .from(usageTable)
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', monthStartTime);

      if (error) {
        logger.error('❌ 查询功能统计记录失败:', error);
        throw new Error(`查询记录失败: ${error.message}`);
      }

      logger.debug('📊 功能统计查询结果:', {
        recordCount: records?.length || 0,
        sampleRecord: records?.[0] || null
      });

      const monthlyRecords = { data: records || [] };
      const result: Record<string, { totalTokens: number; requestCount: number; percentage: number }> = {};

      // 🔧 修复：正确处理字段名（数据库中可能是snake_case）
      const tokenRecords = monthlyRecords.data.map((record: any) => ({
        ...record,
        totalTokens: record.total_tokens || record.totalTokens || 0,
        feature: record.feature || '未知功能'
      }));

      // 计算总tokens
      const totalTokens = tokenRecords.reduce((sum, record) => sum + record.totalTokens, 0);

      logger.debug('📊 总tokens计算:', { totalTokens, recordCount: tokenRecords.length });

      // 按功能分组统计
      tokenRecords.forEach(record => {
        if (!result[record.feature]) {
          result[record.feature] = {
            totalTokens: 0,
            requestCount: 0,
            percentage: 0
          };
        }
        result[record.feature].totalTokens += record.totalTokens;
        result[record.feature].requestCount += 1;
      });

      // 计算百分比
      Object.values(result).forEach(stats => {
        stats.percentage = totalTokens > 0 ? (stats.totalTokens / totalTokens) * 100 : 0;
      });

      logger.debug('✅ 功能统计计算完成:', result);

      return result;
    } catch (error) {
      logger.error('❌ 从Supabase获取功能统计失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能返回空对象
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 清理过期的token使用记录
   */
  async cleanupExpiredRecords(userId: string, retentionMonths: number = 6): Promise<void> {
    try {
      const usageTable = await this.getUsageTableName();
      const dataService = createDataService(userId, usageTable);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

      // 查询过期记录 - 使用直接Supabase客户端调用
      const client = await getSupabaseClient();

      const { data: expiredData, error: expiredError } = await client
        .from(usageTable)
        .select('*')
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString());

      if (expiredError) {
        throw new Error(`查询过期记录失败: ${expiredError.message}`);
      }
      const expiredRecords = { data: expiredData || [] };

      // 批量删除过期记录
      if (expiredRecords.data.length > 0) {
        const expiredIds = expiredRecords.data.map(record => record.id!);
        await dataService.deleteMany(expiredIds);

        logger.debug('✅ 清理过期Token记录成功:', {
          userId,
          deletedCount: expiredIds.length,
          cutoffDate: cutoffDate.toISOString()
        });
      }
    } catch (error) {
      console.error('cleaningexpiredToken记录failed:', error);
      // 🚨 数据库失败时必须抛出错误
      throw new Error(`Supabase清理操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出用户token使用数据
   */
  async exportUserTokenData(userId: string): Promise<string> {
    try {
      const usageTable = await this.getUsageTableName();
      const dataService = createDataService(userId, usageTable);

      // 获取所有用户记录
      const allRecords = await dataService.findMany({
        orderBy: 'created_at',
        orderDirection: 'desc'
      });

      // 计算统计信息
      const records = allRecords.data as TokenUsageRecord[];
      const totalTokens = records.reduce((sum, record) => sum + record.totalTokens, 0);
      const totalRequests = records.length;

      const exportData = {
        userId,
        exportTime: new Date().toISOString(),
        summary: {
          totalRecords: totalRequests,
          totalTokensUsed: totalTokens,
          dateRange: {
            earliest: records[records.length - 1]?.created_at,
            latest: records[0]?.created_at
          }
        },
        records
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('从Supabaseexportinguserdatafailed:', error);
      // 🚨 数据库失败时必须抛出错误
      throw new Error(`Supabase导出操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 导出单例实例
export const tokenUsageService = new TokenUsageService();
export default tokenUsageService;