/**
 * Token使用量管理API
 * @description 处理Token使用量的记录、查询和管理
 */

const { createClient } = require('@supabase/supabase-js');
const { 
  createPermissionMiddleware, 
  handlePermissionError 
} = require('../lib/permission-middleware');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 创建权限中间件 - 需要登录和token使用权限
const permissionCheck = createPermissionMiddleware(['auth:required', 'feature:token-usage'], {
  checkDataAccess: true // 启用数据访问检查，防止水平越权
});

/**
 * 获取用户套餐信息
 */
async function getUserSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('tier, monthly_token_limit')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      // 默认套餐信息
      return {
        tier: 'trial',
        monthly_token_limit: 100000
      };
    }
    
    return data;
  } catch (error) {
    console.error('获取用户套餐信息失败:', error);
    return {
      tier: 'trial',
      monthly_token_limit: 100000
    };
  }
}

/**
 * 记录Token使用量
 */
async function recordTokenUsage(record) {
  try {
    const { data, error } = await supabase
      .from('token_usage_records')
      .insert([{
        id: record.id,
        user_id: record.userId,
        feature: record.feature,
        task_type: record.taskType,
        input_tokens: record.inputTokens,
        output_tokens: record.outputTokens,
        total_tokens: record.totalTokens,
        model: record.model,
        content_summary: record.contentSummary,
        success: record.success,
        error_message: record.error,
        created_at: record.timestamp
      }]);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('记录Token使用量失败:', error);
    throw error;
  }
}

/**
 * 获取用户Token使用统计
 */
async function getUserTokenStats(userId) {
  try {
    // 获取当前月份的开始和结束时间
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // 获取本月使用量
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('token_usage_records')
      .select('total_tokens')
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());
    
    if (monthlyError) {
      throw monthlyError;
    }
    
    const monthlyUsed = monthlyData.reduce((sum, record) => sum + (record.total_tokens || 0), 0);
    
    // 获取今日使用量
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const { data: dailyData, error: dailyError } = await supabase
      .from('token_usage_records')
      .select('total_tokens')
      .eq('user_id', userId)
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());
    
    if (dailyError) {
      throw dailyError;
    }
    
    const dailyUsed = dailyData.reduce((sum, record) => sum + (record.total_tokens || 0), 0);
    
    // 获取用户套餐信息
    const subscription = await getUserSubscription(userId);
    
    const monthlyLimit = subscription.monthly_token_limit;
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
    const usagePercentage = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
    const needUpgrade = usagePercentage >= 80;
    
    return {
      userId,
      userTier: subscription.tier,
      monthlyLimit,
      monthlyUsed,
      monthlyRemaining,
      dailyUsed,
      usagePercentage,
      needUpgrade,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('获取用户Token统计失败:', error);
    throw error;
  }
}

/**
 * 获取用户Token使用历史
 */
async function getUserTokenHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('token_usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data.map(record => ({
      id: record.id,
      userId: record.user_id,
      feature: record.feature,
      taskType: record.task_type,
      inputTokens: record.input_tokens,
      outputTokens: record.output_tokens,
      totalTokens: record.total_tokens,
      model: record.model,
      timestamp: record.created_at,
      contentSummary: record.content_summary,
      success: record.success,
      error: record.error_message
    }));
    
  } catch (error) {
    console.error('获取用户Token历史失败:', error);
    throw error;
  }
}

/**
 * 获取用户按功能分类的Token统计
 */
async function getUserTokenStatsByFeature(userId) {
  try {
    // 获取当前月份的开始和结束时间
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const { data, error } = await supabase
      .from('token_usage_records')
      .select('feature, total_tokens')
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());
    
    if (error) {
      throw error;
    }
    
    // 按功能分组统计
    const featureStats = {};
    let totalTokens = 0;
    
    data.forEach(record => {
      const feature = record.feature || 'unknown';
      const tokens = record.total_tokens || 0;
      
      if (!featureStats[feature]) {
        featureStats[feature] = {
          totalTokens: 0,
          requestCount: 0
        };
      }
      
      featureStats[feature].totalTokens += tokens;
      featureStats[feature].requestCount += 1;
      totalTokens += tokens;
    });
    
    // 计算百分比
    Object.keys(featureStats).forEach(feature => {
      featureStats[feature].percentage = totalTokens > 0 
        ? (featureStats[feature].totalTokens / totalTokens) * 100 
        : 0;
    });
    
    return featureStats;
    
  } catch (error) {
    console.error('获取功能统计失败:', error);
    throw error;
  }
}

/**
 * 主处理函数
 */
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    // 🔒 安全修复：使用权限中间件进行统一验证
    const { user } = await permissionCheck(event);
    const userId = user.id;
    
    const path = event.path.replace('/.netlify/functions/api/token-usage', '');
    const method = event.httpMethod;
    
    let result;
    
    switch (`${method}:${path}`) {
      case 'POST:/record':
        // 记录Token使用量
        const record = JSON.parse(event.body);
        result = await recordTokenUsage(record);
        break;
        
      case 'GET:/stats':
        // 获取用户Token统计
        result = await getUserTokenStats(userId);
        break;
        
      case 'GET:/history':
        // 获取使用历史
        const limit = parseInt(event.queryStringParameters?.limit) || 50;
        result = await getUserTokenHistory(userId, limit);
        break;
        
      case 'GET:/features':
        // 获取功能统计
        result = await getUserTokenStatsByFeature(userId);
        break;
        
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '接口不存在' })
        };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result
      })
    };
    
  } catch (error) {
    console.error('Token使用量API错误:', error);
    
    // 🔒 安全修复：使用统一的权限错误处理
    if (error.message.includes('PERMISSION') || error.message.includes('UNAUTHORIZED') || error.message.includes('ACCESS_DENIED')) {
      return handlePermissionError(error, headers);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || '服务器内部错误'
      })
    };
  }
};
